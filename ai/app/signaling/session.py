"""WebSocket 연결 하나의 상태 머신.

참가자 한 명 = WebSocket 한 개 = 이 클래스의 인스턴스 한 개입니다.
생명주기는 단순합니다.

    accept  →  _handshake()  →  _dispatch() 루프  →  cleanup()

이 파일이 미디어 계층·룸 계층·봇 계층을 연결하는 조립 지점입니다. 반대로
말하면 저 세 계층은 서로를 모릅니다 — 룸 모델은 aiortc 를 모르고, 미디어
엔진은 방 전체를 모릅니다.

**입장 시퀀스** (브라우저 관점)

    join ─────────────────────────▶
       ◀───────────────────────── welcome (selfId, iceServers, peers[])
    publish(offer) ───────────────▶      기존 발행자에게는 subscribe 시작
       ◀───────────────────────── publish-answer
       ◀───────────────────────── subscribe-offer (상대 peer 마다 하나씩)
    subscribe-answer ─────────────▶
"""
from __future__ import annotations

import asyncio
import logging

from fastapi import WebSocket
from pydantic import ValidationError
from starlette.websockets import WebSocketDisconnect

from app.auth import AuthError, Identity, TicketVerifier
from app.bot.manager import BotManager
from app.chat.service import build_payload, fan_out
from app.config import Settings
from app.media.engine import MediaEngine
from app.rooms.manager import RoomError, RoomManager
from app.rooms.models import Participant
from app.schemas import (
    BotListenMessage,
    ChatMessage,
    IceMessage,
    JoinMessage,
    LeaveMessage,
    MediaStateMessage,
    PublishMessage,
    SubscribeAnswerMessage,
    SubscribeMessage,
    UnsubscribeMessage,
    parse_client_message,
)

logger = logging.getLogger(__name__)

#: `join` 을 이 시간 안에 안 보내면 끊습니다. 연결만 잡아두는 클라이언트를
#: 방치하지 않기 위한 최소한의 방어입니다.
JOIN_TIMEOUT_SECONDS = 15


class SignalingSession:
    def __init__(
        self,
        websocket: WebSocket,
        room_id: str,
        settings: Settings,
        rooms: RoomManager,
        media: MediaEngine,
        bots: BotManager,
    ) -> None:
        self.ws = websocket
        #: URL 이 지목한 방. **인증이 켜져 있으면 핸드셰이크에서 티켓이 정한
        #: 방으로 덮어씁니다** — 클라이언트가 고른 값은 권한의 근거가 될 수 없습니다.
        self.room_id = room_id
        self.settings = settings
        self.rooms = rooms
        self.media = media
        self.bots = bots
        self.auth = TicketVerifier(settings)
        #: 검증을 통과한 신원. 인증이 꺼져 있으면 계속 `None` 입니다.
        self.identity: Identity | None = None
        self.participant: Participant | None = None
        # 브로드캐스트와 개별 응답이 동시에 같은 소켓에 쓰는 경우가 있습니다.
        # WebSocket 프레임이 섞이면 클라이언트가 JSON 파싱에 실패합니다.
        self._send_lock = asyncio.Lock()
        self._closing = False

    # -- 전송 --------------------------------------------------------------
    async def send(self, message: dict) -> None:
        async with self._send_lock:
            await self.ws.send_json(message)

    async def _error(self, code: str, message: str, **extra) -> None:
        """에러는 예외로 끊지 않고 메시지로 알립니다.

        조용히 연결을 닫으면 브라우저에는 이유 없는 종료로만 보여서 디버깅이
        불가능해집니다. `code` 는 클라이언트가 분기할 수 있게 기계 판독용,
        `message` 는 사람이 읽는 용도입니다.
        """
        await self.send({"type": "error", "code": code, "message": message, **extra})

    # -- 생명주기 ----------------------------------------------------------
    async def run(self) -> None:
        await self.ws.accept()
        try:
            if not await self._handshake():
                return
            while True:
                raw = await self.ws.receive_json()
                if not await self._dispatch(raw):
                    break
        except WebSocketDisconnect as exc:
            # 탭을 닫거나 새로고침한 경우. 정상 흐름입니다.
            logger.info(
                "session closed room=%s participant=%s code=%s",
                self.room_id,
                self.participant.id if self.participant else "-",
                exc.code,
            )
        except Exception:  # noqa: BLE001
            # 정상 종료가 아니라면 반드시 흔적을 남깁니다. 여기를 debug 로
            # 두면 서버 버그가 클라이언트에서는 "그냥 끊김" 으로만 보입니다.
            logger.warning(
                "session crashed room=%s participant=%s",
                self.room_id,
                self.participant.id if self.participant else "-",
                exc_info=True,
            )
        finally:
            # 어떤 경로로 나가든 방 정리는 반드시 수행합니다.
            await self.cleanup()

    async def _handshake(self) -> bool:
        """첫 메시지는 반드시 `join` 이어야 하고, 여기서 인증합니다.

        방 입장을 별도 메시지로 두는 이유는, WebSocket URL 에는 방 ID 만 있고
        표시 이름과 **티켓**은 본문으로 받아야 하기 때문입니다. 브라우저의
        WebSocket API 는 커스텀 헤더를 못 붙이고, 쿼리스트링에 토큰을 담으면
        프록시 액세스 로그에 그대로 남습니다.

        **순서가 중요합니다.** 검증 → 방 배정 → `bots.ensure()` 입니다. 검증을
        뒤로 미루면 실패할 연결이 방을 만들고 봇을 깨워 LLM 비용을 태웁니다.
        """
        try:
            raw = await asyncio.wait_for(
                self.ws.receive_json(), timeout=JOIN_TIMEOUT_SECONDS
            )
            message = parse_client_message(raw)
        except (TimeoutError, ValidationError, ValueError):
            await self._error("BAD_HANDSHAKE", "expected a `join` message")
            await self.ws.close(code=4000)
            return False

        if not isinstance(message, JoinMessage):
            await self._error("BAD_HANDSHAKE", "first message must be `join`")
            await self.ws.close(code=4000)
            return False

        display_name = message.displayName
        try:
            self.identity = self.auth.verify(
                message.ticket, fallback_name=display_name
            )
        except AuthError as exc:
            logger.warning(
                "auth rejected room=%s code=%s: %s",
                self.room_id, exc.code, exc.detail,
            )
            await self._error(exc.code, exc.detail)
            await self.ws.close(code=4003)
            return False

        if self.identity is not None:
            # 클라이언트가 URL 로 지목한 방은 여기서 버립니다. 티켓이 정한 방이
            # 유일한 근거이고, 실제 방은 `welcome.room` 으로 알려줍니다.
            if self.room_id != self.identity.room_id:
                logger.info(
                    "room reassigned by ticket: %s -> %s (user=%s)",
                    self.room_id, self.identity.room_id, self.identity.user_id,
                )
            self.room_id = self.identity.room_id
            display_name = self.identity.display_name

        try:
            self.participant = await self.rooms.join(
                self.room_id, display_name, self.send
            )
        except RoomError as exc:
            # 정원 초과 등. 코드가 그대로 클라이언트로 넘어갑니다.
            await self._error(exc.code, exc.message)
            await self.ws.close(code=4001)
            return False

        # 순서가 중요합니다. `welcome` 의 peers 는 아래에서 room.others() 로
        # 만들어지므로, 그 전에 봇이 방에 들어와 있어야 목록에 포함됩니다.
        await self.bots.ensure(self.room_id)
        # 도메인 칸 목록은 `join` 에만 실려 옵니다. **`ensure()` 뒤에 넣어야 합니다** —
        # 봇이 방에 들어오면서 `_forget` 대상 상태가 초기화되므로, 앞에 두면 지워집니다.
        self.bots.set_domains(self.room_id, message.domains)

        room = self.rooms.get(self.room_id)
        assert room is not None
        # welcome 은 클라이언트가 필요한 초기 상태를 한 번에 전달합니다.
        # 특히 iceServers 를 여기서 주기 때문에 TURN 자격증명이 프론트엔드
        # 코드에 남지 않습니다.
        await self.send(
            {
                "type": "welcome",
                "selfId": self.participant.id,
                "room": self.room_id,
                "iceServers": self.settings.client_ice_servers,
                "peers": [p.info() for p in room.others(self.participant.id)],
            }
        )
        await room.broadcast(
            {"type": "peer-joined", "peer": self.participant.info()},
            exclude=self.participant.id,
        )
        return True

    # -- 메시지 처리 -------------------------------------------------------
    async def _dispatch(self, raw: dict) -> bool:
        """메시지 하나를 처리합니다. `False` 를 돌려주면 세션을 종료합니다."""
        try:
            message = parse_client_message(raw)
        except (ValidationError, ValueError):
            # 알 수 없는 메시지 하나 때문에 연결을 끊지는 않습니다.
            await self._error("BAD_MESSAGE", "unrecognised signaling message")
            return True

        me = self.participant
        room = self.rooms.get(self.room_id)
        if me is None or room is None:
            return False

        if isinstance(message, PublishMessage):
            # 업스트림 협상: 브라우저 offer -> 서버 answer.
            answer = await self.media.publish(
                me, message.sdp, self._on_chat, self._on_publisher_disconnect
            )
            await self.send(
                {
                    "type": "publish-answer",
                    "sdp": {"type": answer.type, "sdp": answer.sdp},
                }
            )
            # 이제 이 사람의 트랙이 생겼으니 다른 참가자가 구독할 수 있습니다.
            # peer-updated 를 받은 쪽이 subscribe 를 보내옵니다.
            await room.broadcast(
                {"type": "peer-updated", "peer": me.info()}, exclude=me.id
            )

        elif isinstance(message, SubscribeMessage):
            source = room.participants.get(message.targetId)
            if source is None:
                await self._error(
                    "NO_SUCH_PEER", "peer is not in this room", peerId=message.targetId
                )
                return True
            offer = await self.media.subscribe(me, source)
            if offer is None:
                # 상대가 아직 publish 를 끝내지 않은 흔한 경쟁 상황입니다.
                # 클라이언트는 peerId 를 보고 대기 상태를 풀어 재시도합니다.
                await self._error(
                    "NOT_PUBLISHING", "peer has no media yet", peerId=message.targetId
                )
                return True
            # 다운스트림은 서버가 offerer 입니다.
            await self.send(
                {
                    "type": "subscribe-offer",
                    "targetId": source.id,
                    "sdp": {"type": offer.type, "sdp": offer.sdp},
                }
            )

        elif isinstance(message, SubscribeAnswerMessage):
            # 다운스트림 협상 완료. 이 시점부터 미디어가 흐릅니다.
            session = me.subscriptions.get(message.targetId)
            if session is not None:
                await session.accept_answer(message.sdp)

        elif isinstance(message, UnsubscribeMessage):
            await self.media.unsubscribe(me, message.targetId)

        elif isinstance(message, IceMessage):
            await self._route_ice(me, message)

        elif isinstance(message, MediaStateMessage):
            # 마이크/카메라 on-off 는 트랙을 끄는 게 아니라 `enabled` 플래그만
            # 바꾸므로 서버가 알 방법이 없습니다. 그래서 별도로 알려받아
            # 다른 참가자의 UI 표시를 맞춥니다.
            me.audio, me.video = message.audio, message.video
            await room.broadcast(
                {
                    "type": "media-state",
                    "peerId": me.id,
                    "audio": me.audio,
                    "video": me.video,
                },
                exclude=me.id,
            )

        elif isinstance(message, ChatMessage):
            # DataChannel 이 아직 안 열렸을 때의 폴백 경로입니다.
            await self._on_chat(me.id, message.text)

        elif isinstance(message, BotListenMessage):
            # 푸시투토크. 버튼을 누르는 동안의 오디오만 AI 에게 보냅니다.
            logger.info(
                "bot-listen %s room=%s participant=%s",
                message.state, self.room_id, me.id,
            )
            if message.state == "start":
                error = await self.bots.start_listening(self.room_id, me)
                if error is not None:
                    logger.warning("bot-listen start rejected: %s", error)
                    await self._error(error, "음성 입력을 시작할 수 없습니다")
                else:
                    await self.send({"type": "bot-listen", "state": "listening"})
            else:
                await self.bots.stop_listening(self.room_id, me)

        elif isinstance(message, LeaveMessage):
            return False  # 정상 퇴장

        return True

    async def _route_ice(self, me: Participant, message: IceMessage) -> None:
        """ICE 후보를 어느 PeerConnection 에 넣을지 결정합니다.

        참가자 한 명이 여러 연결(업스트림 1개 + 다운스트림 N개)을 가지므로,
        후보마다 목적지를 지정해야 합니다. `target` 이 `"publisher"` 면
        업스트림, 그 외에는 해당 peerId 의 다운스트림입니다.
        """
        session = (
            me.publisher
            if message.target == "publisher"
            else me.subscriptions.get(message.target)
        )
        if session is None:
            return
        try:
            await session.add_ice_candidate(message.candidate)
        except Exception:  # noqa: BLE001
            # 후보 하나가 잘못돼도 나머지로 연결될 수 있습니다. 치명적이지 않습니다.
            logger.debug("ignored ICE candidate", exc_info=True)

    # -- 콜백 --------------------------------------------------------------
    async def _on_chat(self, sender_id: str, text: str) -> None:
        """DataChannel 과 WebSocket 양쪽에서 들어오는 채팅의 공통 처리."""
        room = self.rooms.get(self.room_id)
        if room is None:
            return
        sender = room.participants.get(sender_id)
        if sender is None or not text.strip():
            return
        payload = build_payload(sender, text, self.settings.chat_message_max_length)
        await fan_out(room, sender, payload)
        # 보낸 사람에게도 되돌려줍니다. 클라이언트가 낙관적으로 그리지 않고
        # 서버를 거친 결과만 표시하게 해서, 화면과 서버 상태를 일치시킵니다.
        await sender.send_safe({**payload, "self": True})

    async def _on_publisher_disconnect(self, participant_id: str) -> None:
        """미디어 연결이 죽었을 때 세션도 정리합니다.

        WebSocket 은 멀쩡한데 PeerConnection 만 failed 가 되는 경우가 있습니다.
        그대로 두면 다른 참가자에게는 화면이 멈춘 유령 참가자로 남습니다.
        """
        if self.participant and self.participant.id == participant_id:
            await self.cleanup()

    # -- 정리 --------------------------------------------------------------
    async def cleanup(self) -> None:
        """퇴장 처리. 여러 경로에서 불릴 수 있어 멱등해야 합니다.

        정상 퇴장, 연결 끊김, 미디어 실패, 서버 예외 — 전부 여기로 모입니다.
        """
        if self._closing:
            return
        self._closing = True
        me = self.participant
        if me is None:
            return

        # 녹음 중이었다면 버퍼를 버립니다. 모델을 호출하지 않습니다.
        await self.bots.cancel_listening(me)
        room = await self.rooms.leave(me)
        await self.media.teardown(me)

        if room is not None:
            # teardown 은 "내가 가진 연결" 만 닫습니다. **나를 구독하던**
            # 다른 사람들의 다운스트림은 방 전체를 아는 여기서 끊어야 합니다.
            await asyncio.gather(
                *(self.media.unsubscribe(peer, me.id) for peer in room.participants.values()),
                return_exceptions=True,
            )
            await room.broadcast({"type": "peer-left", "peerId": me.id})

        # 봇은 스스로 나가지 않습니다. 사람이 모두 떠났는데 이걸 빠뜨리면
        # 봇이 방을 붙잡고 있어 영원히 폐기되지 않습니다.
        await self.bots.release_if_only_bots(self.room_id)
