"""서버 쪽 PeerConnection 래퍼.

이 파일이 SFU 의 심장입니다. Mesh(P2P) 와 달리 **미디어가 서버를 통과**하며,
참가자 한 명당 두 종류의 연결이 만들어집니다.

    브라우저 ──(publisher PC, sendonly)──▶ SFU ──(subscriber PC, recvonly)──▶ 브라우저
      내 카메라/마이크를 올려보냄            여기서 팬아웃        남의 화면을 받아봄

핵심 성질 두 가지를 기억하면 나머지는 따라옵니다.

1. **재인코딩을 하지 않습니다.** `MediaRelay` 가 업스트림 트랙 하나에서 나온
   프레임을 여러 다운스트림 sender 에게 그대로 나눠줍니다. CPU 비용이 낮은
   대신, 수신자별 화질 조절(Simulcast/SVC)은 불가능합니다.

2. **업링크는 참가자 수와 무관하게 1개입니다.** Mesh 라면 N-1 개의 연결에
   각각 인코딩해서 올려야 하지만, 여기서는 서버에 한 번만 올리면 됩니다.
   참가자가 늘어날 때 클라이언트가 아니라 서버가 부담을 집니다.

또 하나 중요한 비대칭이 있습니다. **업스트림은 브라우저가 offer 를 만들고,
다운스트림은 서버가 offer 를 만듭니다.** 어떤 트랙이 존재하는지 아는 쪽이
offer 를 만들어야 협상이 단순해지기 때문입니다.
"""
from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable

from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.contrib.media import MediaRelay
from aiortc.mediastreams import MediaStreamTrack

from app.media.ice import parse_ice_candidate
from app.schemas import IceCandidatePayload, SessionDescription

logger = logging.getLogger(__name__)

#: 전역 팬아웃 헬퍼. 업스트림 트랙 1개 -> 다운스트림 N개.
#:
#: `relay.subscribe(track)` 는 원본 트랙을 감싼 프록시 트랙을 돌려줍니다.
#: 원본에서 프레임을 당기는 워커는 relay 가 하나만 돌리고, 그 결과를 모든
#: 프록시에 배포합니다. 그래서 구독자가 몇 명이든 디코딩은 한 번뿐입니다.
relay = MediaRelay()

# 콜백 시그니처. 미디어 계층이 상위 계층(봇/채팅)을 직접 import 하지 않도록
# 함수로 주입받습니다.
ChatHandler = Callable[[str, str], Awaitable[None]]  # (participant_id, text)
CloseHandler = Callable[[str], Awaitable[None]]  # (participant_id)


def chat_text(raw: str) -> str | None:
    """DataChannel 프레임에서 채팅 본문만 꺼냅니다.

    브라우저는 시그널링과 **같은 봉투**를 DataChannel 로도 보냅니다
    (`static/js/rtc.js` 의 `sendChat`).

        {"type": "chat", "text": "안녕하세요"}

    이걸 파싱하지 않으면 봉투 문자열 전체가 채팅 본문이 되어, 화면에 raw JSON
    이 뜨고 AI 에게도 그대로 전달됩니다. 접속 직후에는 채널이 아직 열리지 않아
    WebSocket 폴백(pydantic 이 파싱)을 타기 때문에 멀쩡해 보이다가, 채널이
    열리는 순간부터 증상이 나타납니다.

    JSON 이 아니면 평문으로 봅니다. 다른 클라이언트가 그냥 문자열을 보내는
    경우를 버리지 않기 위해서입니다 — 봉투는 항상 JSON 으로 파싱되므로 이
    관대함 때문에 위 버그가 되살아나지는 않습니다.
    """
    import json

    try:
        payload = json.loads(raw)
    except (TypeError, ValueError):
        return raw.strip() or None

    if not isinstance(payload, dict) or payload.get("type") != "chat":
        return None  # 알 수 없는 봉투는 조용히 버립니다.
    text = payload.get("text")
    if not isinstance(text, str):
        return None
    return text.strip() or None


class _BaseSession:
    """publisher/subscriber 가 공유하는 부분 — ICE 후보 수신과 정리."""

    def __init__(self, pc: RTCPeerConnection) -> None:
        self.pc = pc
        self.closed = False

    async def add_ice_candidate(self, payload: IceCandidatePayload) -> None:
        """브라우저가 trickle 로 보내오는 ICE 후보를 반영합니다.

        방향이 한쪽뿐이라는 점이 중요합니다. 브라우저는 후보를 찾는 족족
        보내지만(trickle ICE), aiortc 는 `setLocalDescription` 안에서 후보를
        전부 모은 뒤 SDP 에 담아 보냅니다(vanilla ICE). 그래서 서버는 후보를
        **받기만** 하고 보내지는 않습니다.
        """
        candidate = parse_ice_candidate(payload)
        if candidate is None:
            return  # 빈 문자열 = 후보 종료 신호. aiortc 는 별도 처리가 필요 없습니다.
        await self.pc.addIceCandidate(candidate)

    async def close(self) -> None:
        # 퇴장·연결 실패·재발행 등 여러 경로에서 불릴 수 있어 멱등하게 만듭니다.
        if self.closed:
            return
        self.closed = True
        try:
            await self.pc.close()
        except Exception:  # noqa: BLE001
            # 이미 죽은 연결을 닫는 건 흔한 일이라 로그만 남기고 넘어갑니다.
            logger.debug("pc close failed", exc_info=True)


class PublisherSession(_BaseSession):
    """업스트림 — 참가자의 오디오/비디오와 채팅 DataChannel 을 받습니다.

    브라우저가 offer 를 만들어 보내고 서버가 answer 를 돌려줍니다.
    이 연결 하나로 미디어와 채팅이 함께 올라옵니다.
    """

    def __init__(
        self,
        participant_id: str,
        pc: RTCPeerConnection,
        on_chat: ChatHandler,
        on_disconnect: CloseHandler,
    ) -> None:
        super().__init__(pc)
        self.participant_id = participant_id
        #: kind("audio"/"video") -> 원본 트랙. 다운스트림이 여기서 파생됩니다.
        self.tracks: dict[str, MediaStreamTrack] = {}
        self.channel = None  # 브라우저가 채널을 열면 RTCDataChannel 이 들어옵니다.
        self._on_chat = on_chat

        @pc.on("track")
        def _on_track(track: MediaStreamTrack) -> None:
            # aiortc 는 이 이벤트를 `setRemoteDescription` 안에서 **동기적으로**
            # 발생시킵니다. 덕분에 answer 를 만들 시점에는 이미 어떤 트랙이
            # 올라올지 알 수 있고, 다른 참가자에게 "발행 시작" 을 바로 알릴 수
            # 있습니다. (단, 트랙 객체가 생겼다는 것이지 RTP 가 흐르기 시작했다는
            # 뜻은 아닙니다. 실제 프레임은 ICE/DTLS 가 끝나야 들어옵니다.)
            logger.info("track received participant=%s kind=%s", participant_id, track.kind)
            self.tracks[track.kind] = track

            @track.on("ended")
            def _on_ended() -> None:
                self.tracks.pop(track.kind, None)

        @pc.on("datachannel")
        def _on_datachannel(channel) -> None:
            # 채팅은 시그널링 WebSocket 이 아니라 미디어 경로를 재사용합니다.
            # 서버가 채널을 종단하고, 받은 메시지를 다른 참가자에게 뿌립니다.
            if channel.label != "chat":
                return
            self.channel = channel

            @channel.on("message")
            def _on_message(message) -> None:
                if isinstance(message, bytes):
                    return  # 바이너리 프레임은 쓰지 않습니다.
                text = chat_text(message)
                if text is None:
                    return
                import asyncio

                # 콜백은 동기 함수라 코루틴을 직접 await 할 수 없습니다.
                asyncio.ensure_future(self._on_chat(participant_id, text))

        @pc.on("connectionstatechange")
        def _on_state() -> None:
            logger.info(
                "publisher state participant=%s state=%s",
                participant_id,
                pc.connectionState,
            )
            # WebSocket 은 살아 있는데 미디어만 죽는 경우가 있습니다. 그때도
            # 방에서 정리되도록 상위 계층에 알려줍니다.
            if pc.connectionState in ("failed", "closed"):
                import asyncio

                asyncio.ensure_future(on_disconnect(participant_id))

    @property
    def has_media(self) -> bool:
        """구독 가능한 상태인지. `Participant.publishing` 의 근거가 됩니다."""
        return bool(self.tracks)

    def subscribable_tracks(self) -> list[MediaStreamTrack]:
        """다운스트림 offer 에 넣을 트랙 목록.

        dict 순서에 맡기지 않고 audio -> video 로 고정합니다. 구독자마다
        m-line 순서가 달라지면 디버깅할 때 SDP 비교가 어려워집니다.
        """
        order = {"audio": 0, "video": 1}
        return [t for _, t in sorted(self.tracks.items(), key=lambda kv: order.get(kv[0], 9))]

    async def accept_offer(self, sdp: SessionDescription) -> RTCSessionDescription:
        """브라우저 offer 를 받아 answer 를 만듭니다 (업스트림 협상)."""
        await self.pc.setRemoteDescription(
            RTCSessionDescription(sdp=sdp.sdp, type=sdp.type)
        )
        answer = await self.pc.createAnswer()
        # 여기서 ICE 후보 수집이 전부 끝나고, 그 결과가 SDP 에 박힙니다.
        await self.pc.setLocalDescription(answer)
        return self.pc.localDescription

    def send_chat(self, payload: str) -> bool:
        """DataChannel 로 채팅을 내려보냅니다.

        아직 채널이 안 열렸으면 `False` 를 돌려주고, 호출한 쪽이 시그널링
        WebSocket 으로 폴백합니다. AI 봇처럼 PeerConnection 자체가 없는
        참가자도 이 폴백 덕분에 채팅을 받을 수 있습니다.
        """
        channel = self.channel
        if channel is None or channel.readyState != "open":
            return False
        channel.send(payload)
        return True


class SubscriberSession(_BaseSession):
    """다운스트림 — 발행자 한 명의 트랙을 구독자 한 명에게 전달합니다.

    참가자 조합마다 별도의 PeerConnection 을 만듭니다. 연결 수는 늘어나지만,
    누가 나갔을 때 해당 연결만 닫으면 끝이라 재협상이 필요 없습니다.
    (단일 다운스트림 PC + renegotiation 으로 바꾸면 연결 수는 줄지만 트랙
    추가/제거마다 협상을 다시 해야 합니다.)
    """

    def __init__(self, subscriber_id: str, source_id: str, pc: RTCPeerConnection) -> None:
        super().__init__(pc)
        self.subscriber_id = subscriber_id
        self.source_id = source_id

        @pc.on("connectionstatechange")
        def _on_state() -> None:
            logger.debug(
                "subscriber state %s<-%s state=%s",
                subscriber_id,
                source_id,
                pc.connectionState,
            )

    async def create_offer(self, tracks: list[MediaStreamTrack]) -> RTCSessionDescription:
        """서버가 offer 를 만듭니다 (다운스트림 협상).

        어떤 트랙이 존재하는지 아는 쪽은 서버입니다. 브라우저가 offer 를
        만들려면 "몇 개의 recvonly 자리를 미리 열어둘지" 를 알아야 해서
        번거로워집니다.
        """
        for track in tracks:
            # 원본이 아니라 relay 프록시를 붙입니다. 원본을 직접 addTrack 하면
            # 구독자 한 명만 프레임을 가져가고 나머지는 굶습니다.
            # buffered=False: 큐에 쌓지 않고 최신 프레임을 씁니다. 소비가
            # 느려도 지연이 누적되지 않습니다(대신 프레임이 버려질 수 있음).
            sender = self.pc.addTrack(relay.subscribe(track, buffered=False))

            # 다운스트림은 순수한 단방향입니다. 이걸 안 하면 aiortc 가
            # `sendrecv` 로 offer 를 만들고, 브라우저는 쓰지도 않을 업스트림
            # 슬롯을 할당합니다.
            for transceiver in self.pc.getTransceivers():
                if transceiver.sender is sender:
                    transceiver.direction = "sendonly"

        offer = await self.pc.createOffer()
        # aiortc 는 vanilla ICE 라 이 호출 안에서 후보 수집이 끝납니다.
        # 즉 돌려주는 SDP 에 서버 후보가 전부 들어 있어, 서버는 별도로
        # trickle 후보를 보낼 필요가 없습니다.
        await self.pc.setLocalDescription(offer)
        return self.pc.localDescription

    async def accept_answer(self, sdp: SessionDescription) -> None:
        """브라우저가 보낸 answer 를 반영하면 다운스트림 협상이 끝납니다."""
        await self.pc.setRemoteDescription(
            RTCSessionDescription(sdp=sdp.sdp, type=sdp.type)
        )
