"""방 / 참가자 도메인 모델.

**aiortc 와 FastAPI 를 일부러 import 하지 않습니다.** 미디어 계층은
`publisher` / `subscriptions` 슬롯에, 전송 계층은 `send` 콜백에 스스로를
꽂아 넣습니다. 이 방향성 덕분에 두 가지가 가능해집니다.

1. 테스트에서 실제 WebSocket 이나 PeerConnection 없이 방 로직만 검증
2. **AI 봇을 일반 참가자로 취급** — 봇은 WebSocket 이 없고 `send` 콜백이
   LLM 호출로 이어질 뿐, 방 입장에서는 사람과 구별되지 않습니다
"""
from __future__ import annotations

import asyncio
import uuid
from collections.abc import Awaitable, Callable
from dataclasses import dataclass, field
from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:  # pragma: no cover
    # 런타임 import 를 피해 media -> rooms 단방향 의존을 유지합니다.
    from app.media.peer import PublisherSession, SubscriberSession

#: 이 참가자에게 메시지를 보내는 방법. 사람이면 WebSocket 전송, 봇이면
#: LLM 처리기가 들어옵니다.
SendFn = Callable[[dict], Awaitable[None]]


@dataclass
class Participant:
    display_name: str
    send: SendFn
    room_id: str
    #: uuid 앞 12자리. 짧아야 로그에서 눈으로 추적하기 편합니다.
    id: str = field(default_factory=lambda: uuid.uuid4().hex[:12])

    # 마이크/카메라 on-off. 트랙을 끊는 게 아니라 표시용 상태입니다.
    audio: bool = True
    video: bool = True

    #: 업스트림(브라우저 -> SFU). `publish` 시점에 생깁니다.
    publisher: PublisherSession | None = None
    #: 다운스트림(SFU -> 브라우저). 키는 **미디어를 제공하는 쪽**의 peerId.
    subscriptions: dict[str, SubscriberSession] = field(default_factory=dict)

    @property
    def publishing(self) -> bool:
        """서버가 이 사람의 트랙을 실제로 쥐고 있는지.

        "방에 있다" 와 "미디어를 보내고 있다" 는 다릅니다. 다른 참가자는 이
        값이 참이 된 뒤에야 구독을 시도해야 합니다.
        """
        return self.publisher is not None and self.publisher.has_media

    def info(self) -> dict[str, Any]:
        """클라이언트로 나가는 요약. 카멜케이스는 JS 관례에 맞춘 것입니다."""
        return {
            "id": self.id,
            "displayName": self.display_name,
            "audio": self.audio,
            "video": self.video,
            "publishing": self.publishing,
        }

    async def send_safe(self, message: dict) -> None:
        """죽은 소켓 하나가 방 전체 브로드캐스트를 깨뜨리지 않게 합니다.

        브라우저가 이미 닫혔는데 서버가 아직 모르는 순간이 항상 존재합니다.
        그 참가자는 어차피 곧 정리되므로 여기서는 조용히 넘어갑니다.
        """
        try:
            await self.send(message)
        except Exception:  # noqa: BLE001
            pass


@dataclass
class Room:
    id: str
    participants: dict[str, Participant] = field(default_factory=dict)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)

    def others(self, participant_id: str) -> list[Participant]:
        """나를 뺀 나머지. `welcome.peers` 와 팬아웃의 기준이 됩니다."""
        return [p for pid, p in self.participants.items() if pid != participant_id]

    async def broadcast(self, message: dict, exclude: str | None = None) -> None:
        """방 전체에 동시 전송.

        순차 전송하면 참가자가 늘어날수록 마지막 사람의 지연이 누적됩니다.
        `gather` 로 한 번에 보냅니다.
        """
        targets = [p for pid, p in self.participants.items() if pid != exclude]
        if targets:
            await asyncio.gather(*(p.send_safe(message) for p in targets))
