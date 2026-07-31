"""SFU media plumbing, exercised with real aiortc peers standing in for browsers.

`test_video_frame_is_relayed` needs at least one non-loopback network interface
(ICE never gathers loopback candidates); it self-skips in sandboxes that only
expose `lo`.
"""
import asyncio
import json

import pytest
from aiortc import RTCPeerConnection, RTCSessionDescription
from aiortc.mediastreams import VideoStreamTrack
from aiortc.rtcicetransport import RTCIceGatherer

from app.config import Settings
from app.media.engine import MediaEngine
from app.media.peer import chat_text
from app.rooms.models import Participant
from app.schemas import SessionDescription


async def _noop(*_args) -> None:
    return None


def _local_settings() -> Settings:
    # No STUN/TURN: host candidates are enough for an in-process round trip.
    return Settings(_env_file=None, stun_urls=[], turn_urls=[])


def _participant(name: str) -> Participant:
    return Participant(display_name=name, send=_noop, room_id="demo")


async def _publish(engine: MediaEngine, participant: Participant, browser: RTCPeerConnection):
    browser.addTrack(VideoStreamTrack())
    await browser.setLocalDescription(await browser.createOffer())
    answer = await engine.publish(
        participant,
        SessionDescription(type="offer", sdp=browser.localDescription.sdp),
        on_chat=_noop,
        on_disconnect=_noop,
    )
    await browser.setRemoteDescription(
        RTCSessionDescription(sdp=answer.sdp, type=answer.type)
    )
    return answer


@pytest.fixture(scope="session")
async def ice_available() -> bool:
    gatherer = RTCIceGatherer()
    await gatherer.gather()
    return bool(gatherer.getLocalCandidates())


async def test_publish_registers_tracks_and_returns_an_answer():
    engine = MediaEngine(_local_settings())
    alice = _participant("alice")
    browser = RTCPeerConnection()
    try:
        answer = await _publish(engine, alice, browser)
        assert answer.type == "answer"
        assert alice.publisher is not None
        assert set(alice.publisher.tracks) == {"video"}
        assert alice.publishing is True
    finally:
        await engine.teardown(alice)
        await browser.close()


async def test_subscribe_is_skipped_when_the_source_has_no_media():
    engine = MediaEngine(_local_settings())
    alice, bob = _participant("alice"), _participant("bob")
    assert await engine.subscribe(bob, alice) is None
    assert bob.subscriptions == {}


async def test_subscribe_offer_mirrors_the_publisher_tracks():
    engine = MediaEngine(_local_settings())
    alice, bob = _participant("alice"), _participant("bob")
    browser = RTCPeerConnection()
    try:
        await _publish(engine, alice, browser)
        offer = await engine.subscribe(bob, alice)
        assert offer is not None and offer.type == "offer"
        assert offer.sdp.count("m=video") == 1
        assert "a=sendonly" in offer.sdp
        assert alice.id in bob.subscriptions
    finally:
        await engine.teardown(alice)
        await engine.teardown(bob)
        await browser.close()


async def test_teardown_closes_every_peer_connection():
    engine = MediaEngine(_local_settings())
    alice, bob = _participant("alice"), _participant("bob")
    browser = RTCPeerConnection()
    try:
        await _publish(engine, alice, browser)
        await engine.subscribe(bob, alice)
        session = bob.subscriptions[alice.id]

        await engine.teardown(bob)
        assert bob.subscriptions == {}
        assert session.closed is True

        await engine.teardown(alice)
        assert alice.publisher is None
    finally:
        await browser.close()


@pytest.mark.timeout(60)
async def test_video_frame_is_relayed_from_publisher_to_subscriber(ice_available):
    if not ice_available:
        pytest.skip("no non-loopback interface: ICE cannot gather host candidates here")

    engine = MediaEngine(_local_settings())
    alice, bob = _participant("alice"), _participant("bob")
    alice_browser, bob_browser = RTCPeerConnection(), RTCPeerConnection()

    try:
        await _publish(engine, alice, alice_browser)

        received: asyncio.Future = asyncio.get_running_loop().create_future()

        @bob_browser.on("track")
        def _on_track(track):
            async def _pump():
                frame = await track.recv()
                if not received.done():
                    received.set_result(frame)

            asyncio.ensure_future(_pump())

        offer = await engine.subscribe(bob, alice)
        assert offer is not None
        # aiortc uses vanilla ICE, so the offer already carries its candidates.
        assert "a=candidate:" in offer.sdp

        await bob_browser.setRemoteDescription(
            RTCSessionDescription(sdp=offer.sdp, type=offer.type)
        )
        await bob_browser.setLocalDescription(await bob_browser.createAnswer())
        await bob.subscriptions[alice.id].accept_answer(
            SessionDescription(type="answer", sdp=bob_browser.localDescription.sdp)
        )

        frame = await asyncio.wait_for(received, timeout=45)
        assert frame.width > 0 and frame.height > 0
    finally:
        await engine.teardown(alice)
        await engine.teardown(bob)
        await asyncio.gather(alice_browser.close(), bob_browser.close())


# ── DataChannel 채팅 봉투 파싱 ─────────────────────────────────────────
def test_the_chat_envelope_is_unwrapped():
    """파싱하지 않으면 화면에 raw JSON 이 뜨고 AI 도 그걸 발화로 받습니다."""
    raw = '{"type":"chat","text":"취업준비를 위한 목표 보여줘"}'
    assert chat_text(raw) == "취업준비를 위한 목표 보여줘"


def test_plain_text_still_works():
    assert chat_text("안녕하세요") == "안녕하세요"


@pytest.mark.parametrize(
    "raw",
    [
        '{"type":"ice","candidate":{}}',   # 다른 봉투
        '{"type":"chat"}',                  # text 없음
        '{"type":"chat","text":42}',        # text 가 문자열이 아님
        '{"type":"chat","text":"   "}',     # 공백뿐
        "[1,2,3]",                          # dict 가 아님
        "   ",                              # 빈 프레임
    ],
)
def test_unusable_frames_are_dropped(raw):
    assert chat_text(raw) is None


def test_unicode_survives_the_round_trip():
    text = "매일 알고리즘 1문제 풀기 🚀"
    assert chat_text(json.dumps({"type": "chat", "text": text})) == text
