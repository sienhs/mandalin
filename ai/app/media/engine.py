"""참가자별 PeerConnection 의 생성·구독·해제를 총괄합니다.

`peer.py` 가 "연결 하나를 어떻게 다루는가" 라면, 이 파일은 "누가 누구를
구독하는가" 를 관리합니다. 시그널링 계층은 여기만 호출하고 aiortc 를 직접
만지지 않습니다.

**교체 지점이기도 합니다.** 나중에 aiortc 대신 mediasoup/Janus 같은 네이티브
SFU 로 옮긴다면 바꿔야 할 파일은 사실상 이 클래스 하나입니다. 시그널링과
프론트엔드는 그대로 둘 수 있습니다.
"""
from __future__ import annotations

import asyncio
import logging

from aiortc import RTCPeerConnection, RTCSessionDescription

from app.config import Settings
from app.media.ice import server_rtc_configuration
from app.media.peer import ChatHandler, CloseHandler, PublisherSession, SubscriberSession
from app.rooms.models import Participant
from app.schemas import SessionDescription

logger = logging.getLogger(__name__)


class MediaEngine:
    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    def _new_pc(self) -> RTCPeerConnection:
        return RTCPeerConnection(server_rtc_configuration(self._settings))

    # -- 업스트림 (브라우저 -> SFU) ----------------------------------------
    async def publish(
        self,
        participant: Participant,
        sdp: SessionDescription,
        on_chat: ChatHandler,
        on_disconnect: CloseHandler,
    ) -> RTCSessionDescription:
        """참가자의 발행 연결을 만들고 answer 를 돌려줍니다.

        새로고침·재발행처럼 같은 참가자가 다시 publish 하는 경우가 있어서,
        이전 연결이 있으면 먼저 닫습니다. 안 그러면 죽은 PeerConnection 이
        쌓이고 트랙 참조도 꼬입니다.
        """
        if participant.publisher is not None:
            await participant.publisher.close()
            participant.publisher = None

        session = PublisherSession(
            participant_id=participant.id,
            pc=self._new_pc(),
            on_chat=on_chat,
            on_disconnect=on_disconnect,
        )
        participant.publisher = session

        # aiortc 는 `setRemoteDescription` 안에서 track 이벤트를 동기적으로
        # 쏘기 때문에, answer 가 만들어진 시점에는 `session.tracks` 가 이미
        # 채워져 있습니다. 덕분에 곧바로 "이 사람 발행 시작했음" 을 다른
        # 참가자에게 알릴 수 있습니다.
        return await session.accept_offer(sdp)

    # -- 다운스트림 (SFU -> 브라우저) --------------------------------------
    async def subscribe(
        self, subscriber: Participant, source: Participant
    ) -> RTCSessionDescription | None:
        """`subscriber` 가 `source` 의 미디어를 받도록 연결을 만듭니다.

        아직 발행하지 않은 상대를 구독하려 하면 `None` 을 돌려줍니다. 흔한
        경쟁 상황입니다 — 방에는 들어왔지만 publish 가 끝나지 않은 순간에
        구독 요청이 먼저 도착할 수 있습니다. 이때는 실패가 아니라 "나중에
        peer-updated 를 받고 다시 시도" 가 정답입니다.
        """
        publisher = source.publisher
        if publisher is None or not publisher.has_media:
            logger.info("subscribe skipped: %s has no media yet", source.id)
            return None

        # 재구독 요청이면 기존 연결을 정리하고 새로 만듭니다. 그대로 두면
        # 브라우저에 고아 PeerConnection 이 남습니다.
        existing = subscriber.subscriptions.pop(source.id, None)
        if existing is not None:
            await existing.close()

        session = SubscriberSession(subscriber.id, source.id, self._new_pc())
        subscriber.subscriptions[source.id] = session
        return await session.create_offer(publisher.subscribable_tracks())

    async def unsubscribe(self, subscriber: Participant, source_id: str) -> None:
        """다운스트림 하나만 끊습니다. 상대가 퇴장했을 때 주로 쓰입니다."""
        session = subscriber.subscriptions.pop(source_id, None)
        if session is not None:
            await session.close()

    # -- 정리 ---------------------------------------------------------------
    async def teardown(self, participant: Participant) -> None:
        """참가자가 가진 모든 연결을 닫습니다.

        `return_exceptions=True` 로 모아서 기다립니다. 하나가 예외를 던져도
        나머지는 반드시 닫혀야 하기 때문입니다. 여기서 새는 연결은 그대로
        메모리 누수가 됩니다.

        주의: 이 참가자를 **구독하고 있던 다른 사람들의** 연결은 여기서
        정리되지 않습니다. 그건 방 전체를 아는 시그널링 계층의 몫입니다.
        """
        tasks = [s.close() for s in participant.subscriptions.values()]
        participant.subscriptions.clear()
        if participant.publisher is not None:
            tasks.append(participant.publisher.close())
            participant.publisher = None
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)
