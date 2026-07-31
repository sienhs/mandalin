"""인메모리 방 레지스트리.

**단일 프로세스 전용**입니다. 방 목록이 이 객체의 dict 에만 있으므로
`uvicorn --workers 2` 로 띄우면 같은 방 이름으로 들어온 두 사람이 서로 다른
프로세스에 배정되어 영영 만나지 못합니다.

수평 확장하려면 세 가지가 필요합니다.

1. 방 상태를 공유 저장소(Redis 등)로 이동
2. 방 하나는 반드시 한 노드에 고정(sticky) — 미디어 파이프라인이 프로세스
   메모리에 있으므로 방이 노드를 넘나들 수 없습니다
3. 노드 간 시그널링 팬아웃(pub/sub)

정원 제한이 두 겹인 것도 의도된 설계입니다. `max_participants_per_room` 은
품질(aiortc 는 GIL 위에서 돕니다)을, `max_rooms` 는 서버 전체 메모리를
지키기 위한 것입니다.
"""
from __future__ import annotations

import asyncio
import logging

from app.config import Settings
from app.rooms.models import Participant, Room, SendFn

logger = logging.getLogger(__name__)


class RoomError(Exception):
    """입장 거부. `code` 는 그대로 클라이언트 에러 메시지로 전달됩니다."""

    def __init__(self, code: str, message: str) -> None:
        super().__init__(message)
        self.code = code
        self.message = message


class RoomManager:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._rooms: dict[str, Room] = {}
        self._lock = asyncio.Lock()

    # -- 조회 ---------------------------------------------------------------
    def get(self, room_id: str) -> Room | None:
        return self._rooms.get(room_id)

    def snapshot(self) -> list[dict]:
        """`GET /api/rooms` 용 요약. 디버깅할 때 제일 먼저 보는 곳입니다."""
        return [
            {
                "id": room.id,
                "participants": len(room.participants),
                "capacity": self._settings.max_participants_per_room,
            }
            for room in self._rooms.values()
        ]

    # -- 변경 ---------------------------------------------------------------
    async def join(self, room_id: str, display_name: str, send: SendFn) -> Participant:
        """방이 없으면 만들고 참가자를 넣습니다.

        락으로 감싸는 이유는 "정원 확인 -> 추가" 사이에 다른 코루틴이 끼어들면
        정원을 넘길 수 있기 때문입니다. 방 생성도 마찬가지로, 동시에 들어온
        두 사람이 같은 이름의 방을 각각 만들어 버릴 수 있습니다.
        """
        async with self._lock:
            room = self._rooms.get(room_id)
            if room is None:
                if len(self._rooms) >= self._settings.max_rooms:
                    raise RoomError("ROOM_LIMIT", "server room limit reached")
                room = Room(id=room_id)
                self._rooms[room_id] = room
                logger.info("room created id=%s", room_id)

            if len(room.participants) >= self._settings.max_participants_per_room:
                raise RoomError("ROOM_FULL", f"room {room_id} is full")

            participant = Participant(
                display_name=display_name[: self._settings.display_name_max_length],
                send=send,
                room_id=room_id,
            )
            room.participants[participant.id] = participant
            logger.info(
                "participant joined room=%s id=%s name=%s",
                room_id,
                participant.id,
                participant.display_name,
            )
            return participant

    async def leave(self, participant: Participant) -> Room | None:
        """참가자를 빼고, 방이 비면 폐기합니다.

        반환값이 `None` 이면 방이 사라졌다는 뜻이라 더 이상 브로드캐스트할
        대상이 없습니다. 호출하는 쪽이 이 값으로 분기합니다.
        """
        async with self._lock:
            room = self._rooms.get(participant.room_id)
            if room is None:
                return None
            room.participants.pop(participant.id, None)
            logger.info(
                "participant left room=%s id=%s", room.id, participant.id
            )
            if not room.participants:
                self._rooms.pop(room.id, None)
                logger.info("room disposed id=%s", room.id)
                return None
            return room
