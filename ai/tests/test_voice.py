"""푸시투토크 캡처 → WAV → Gemini inlineData 경로."""
import asyncio
import io
import json
import wave
from fractions import Fraction

import httpx
import pytest
from aiortc.mediastreams import MediaStreamTrack
from av import AudioFrame

from app.bot.llm import GeminiBackend, LlmError, OpenAIBackend, Turn
from app.bot.manager import BotManager
from app.bot.voice import TARGET_SAMPLE_RATE, VoiceCapture
from app.config import Settings
from app.rooms.manager import RoomManager

FRAME_SAMPLES = 960  # 48kHz 에서 20ms


class FakeAudioTrack(MediaStreamTrack):
    """48kHz 스테레오 s16 프레임을 내보내는 가짜 업스트림 트랙.

    `frames` 를 주면 그만큼만 내보내고 이후로는 블록합니다. 실시간 페이싱이
    없으므로 "몇 초 동안" 이 아니라 "몇 프레임" 으로 길이를 통제해야 합니다.
    (프레임당 20ms)
    """

    kind = "audio"

    def __init__(self, frames: int | None = None, amplitude: int = 3000) -> None:
        super().__init__()
        self._pts = 0
        self._amplitude = amplitude
        self._budget = frames
        self.recv_count = 0

    async def recv(self) -> AudioFrame:
        if self._budget is not None:
            if self._budget <= 0:
                await asyncio.Event().wait()   # 더 내보내지 않고 대기
            self._budget -= 1
        self.recv_count += 1
        # numpy 없이 프레임을 만듭니다 — 런타임 경로와 동일한 조건으로 검증하기 위함.
        frame = AudioFrame(format="s16p", layout="stereo", samples=FRAME_SAMPLES)
        tone = self._amplitude.to_bytes(2, "little", signed=True) * FRAME_SAMPLES
        for plane in frame.planes:
            plane.update(tone)
        frame.sample_rate = 48_000
        frame.pts = self._pts
        frame.time_base = Fraction(1, 48_000)
        self._pts += FRAME_SAMPLES
        await asyncio.sleep(0)  # 이벤트 루프 양보
        return frame


def make_settings(**overrides) -> Settings:
    base = dict(bot_enabled=True, bot_provider="echo", bot_voice_max_seconds=60.0)
    base.update(overrides)
    return Settings(_env_file=None, **base)


async def _drain(capture: VoiceCapture) -> None:
    """유한 길이 트랙이 프레임을 모두 흘려보낼 때까지 잠깐 양보합니다."""
    capture.start()
    await asyncio.sleep(0.1)


# ── VoiceCapture ──────────────────────────────────────────────────────
async def test_capture_produces_16khz_mono_wav():
    capture = VoiceCapture(FakeAudioTrack(frames=30), max_seconds=60.0)  # 600ms
    await _drain(capture)
    wav_bytes = await capture.stop()

    assert wav_bytes is not None
    with wave.open(io.BytesIO(wav_bytes), "rb") as wav:
        # 48kHz 스테레오로 들어온 것을 16kHz 모노로 리샘플했는지 확인
        assert wav.getnchannels() == 1
        assert wav.getsampwidth() == 2
        assert wav.getframerate() == TARGET_SAMPLE_RATE
        assert wav.getnframes() > 0
        assert wav.getnframes() == len(wav_bytes[44:]) // 2


async def test_capture_shorter_than_the_floor_is_dropped():
    capture = VoiceCapture(FakeAudioTrack(frames=2), max_seconds=60.0)  # 40ms
    await _drain(capture)
    assert await capture.stop() is None


async def test_capture_stops_itself_at_the_cap():
    fired = asyncio.Event()

    async def on_limit() -> None:
        fired.set()

    # MIN_SECONDS(0.3s) 보다 큰 캡을 써야 결과가 버려지지 않습니다.
    capture = VoiceCapture(FakeAudioTrack(), max_seconds=0.5, on_limit=on_limit)
    capture.start()
    await asyncio.wait_for(fired.wait(), timeout=10)

    assert capture.seconds >= 0.5
    wav_bytes = await capture.stop()
    assert wav_bytes is not None


async def test_stop_is_safe_to_call_twice():
    capture = VoiceCapture(FakeAudioTrack(frames=30), max_seconds=60.0)
    await _drain(capture)
    assert await capture.stop() is not None
    assert await capture.stop() is not None  # 버퍼는 그대로 남습니다


# ── Gemini inlineData ─────────────────────────────────────────────────
async def test_audio_turn_is_sent_as_inline_data():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["json"] = json.loads(request.content)
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": "네"}]}}]})

    backend = GeminiBackend(make_settings(bot_provider="gemini", bot_api_key="k"))
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    reply = await backend.reply(
        "sys",
        [Turn(role="user", text="(음성 메시지)", speaker="우찬", audio=b"RIFFfake")],
    )
    await backend.aclose()

    assert reply == "네"
    parts = captured["json"]["contents"][0]["parts"]
    inline = next(p for p in parts if "inlineData" in p)
    assert inline["inlineData"]["mimeType"] == "audio/wav"
    import base64
    assert base64.b64decode(inline["inlineData"]["data"]) == b"RIFFfake"
    # 화자 표기 텍스트도 함께 붙습니다.
    assert any(p.get("text") == "우찬: (음성 메시지)" for p in parts)


async def test_text_only_turn_has_no_inline_data():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["json"] = json.loads(request.content)
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": "네"}]}}]})

    backend = GeminiBackend(make_settings(bot_provider="gemini", bot_api_key="k"))
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    await backend.reply("sys", [Turn(role="user", text="안녕")])
    await backend.aclose()

    assert all("inlineData" not in p for p in captured["json"]["contents"][0]["parts"])


async def test_openai_backend_rejects_audio_clearly():
    backend = OpenAIBackend(make_settings(bot_provider="openai", bot_api_key="k"))
    with pytest.raises(LlmError) as exc:
        await backend.reply("sys", [Turn(role="user", audio=b"x")])
    await backend.aclose()
    assert "음성 입력을 지원하지 않습니다" in str(exc.value)


# ── BotManager 연동 ───────────────────────────────────────────────────
class _StubPublisher:
    def __init__(self, track=None) -> None:
        self.tracks = {"audio": track} if track is not None else {}
        self.has_media = track is not None

    def send_chat(self, _payload: str) -> bool:
        return False


class RecordingBackend:
    name = "recording"

    def __init__(self) -> None:
        self.calls: list[list[Turn]] = []

    async def reply(self, system: str, history: list[Turn]) -> str:
        # 호출 시점의 오디오 유무를 보존해 둡니다.
        self.calls.append(
            [
                Turn(role=t.role, text=t.text, audio=t.audio, audio_mime=t.audio_mime)
                for t in history
            ]
        )
        return "잘 들었습니다"

    async def aclose(self) -> None:
        return None


async def _room_with_bot(settings, backend):
    rooms = RoomManager(settings)
    bots = BotManager(settings, rooms, backend)
    inbox: list[dict] = []

    async def send(message: dict) -> None:
        inbox.append(message)

    human = await rooms.join("demo", "우찬", send)
    await bots.ensure("demo")
    return rooms, bots, human, inbox


async def test_start_listening_requires_an_audio_track():
    settings = make_settings()
    _, bots, human, _ = await _room_with_bot(settings, RecordingBackend())

    assert await bots.start_listening("demo", human) == "NO_AUDIO_TRACK"

    human.publisher = _StubPublisher()  # 발행 중이지만 오디오 없음
    assert await bots.start_listening("demo", human) == "NO_AUDIO_TRACK"


async def test_voice_disabled_is_reported():
    settings = make_settings(bot_voice_enabled=False)
    _, bots, human, _ = await _room_with_bot(settings, RecordingBackend())
    human.publisher = _StubPublisher(FakeAudioTrack(frames=30))
    assert await bots.start_listening("demo", human) == "BOT_VOICE_DISABLED"


async def test_push_to_talk_round_trip():
    settings = make_settings()
    backend = RecordingBackend()
    _, bots, human, inbox = await _room_with_bot(settings, backend)
    human.publisher = _StubPublisher(FakeAudioTrack(frames=30))

    assert await bots.start_listening("demo", human) is None
    await asyncio.sleep(0.1)
    await bots.stop_listening("demo", human)
    await asyncio.sleep(0.1)

    # 클라이언트는 캡처 길이를 통보받습니다.
    stopped = [m for m in inbox if m.get("type") == "bot-listen"]
    assert stopped and stopped[-1]["state"] == "stopped"
    assert stopped[-1]["seconds"] > 0

    # 모델에는 WAV 가 실려 나갑니다.
    assert len(backend.calls) == 1
    audio_turn = backend.calls[0][-1]
    assert audio_turn.audio is not None
    assert audio_turn.audio[:4] == b"OggS"          # 기본 코덱은 opus
    assert audio_turn.audio_mime == "audio/ogg"

    replies = [m for m in inbox if m.get("type") == "chat"]
    assert replies and replies[-1]["text"] == "잘 들었습니다"


async def test_audio_is_not_resent_on_the_next_turn():
    settings = make_settings()
    backend = RecordingBackend()
    _, bots, human, _ = await _room_with_bot(settings, backend)
    human.publisher = _StubPublisher(FakeAudioTrack(frames=30))

    for _ in range(2):
        human.publisher = _StubPublisher(FakeAudioTrack(frames=30))
        await bots.start_listening("demo", human)
        await asyncio.sleep(0.1)
        await bots.stop_listening("demo", human)
        await asyncio.sleep(0.1)

    assert len(backend.calls) == 2
    # 두 번째 호출에서 이전 턴의 오디오는 이미 비워져 있어야 합니다.
    second = backend.calls[1]
    assert sum(1 for t in second if t.audio is not None) == 1
    assert second[-1].audio is not None


async def test_disconnect_cancels_capture_without_calling_the_model():
    settings = make_settings()
    backend = RecordingBackend()
    _, bots, human, _ = await _room_with_bot(settings, backend)
    human.publisher = _StubPublisher(FakeAudioTrack(frames=30))

    await bots.start_listening("demo", human)
    await asyncio.sleep(0.1)
    await bots.cancel_listening(human)
    await asyncio.sleep(0.1)

    assert backend.calls == []


async def test_duplicate_start_is_ignored():
    settings = make_settings()
    _, bots, human, _ = await _room_with_bot(settings, RecordingBackend())
    human.publisher = _StubPublisher(FakeAudioTrack(frames=30))

    assert await bots.start_listening("demo", human) is None
    assert await bots.start_listening("demo", human) is None
    await bots.cancel_listening(human)


def test_pcm_extraction_needs_no_numpy():
    """numpy 미설치 환경에서도 동작해야 합니다 (to_ndarray 는 numpy 를 요구)."""
    from app.bot.voice import pcm_bytes

    frame = AudioFrame(format="s16", layout="mono", samples=320)
    payload = (1234).to_bytes(2, "little", signed=True) * 320
    frame.planes[0].update(payload)

    extracted = pcm_bytes(frame)
    assert len(extracted) == 320 * 2
    assert extracted == payload


def test_opus_encoding_shrinks_the_upload_and_stays_decodable():
    """게이트웨이 본문 크기 제한을 피하려면 압축이 필요합니다."""
    import io
    import math
    import struct
    import wave as wave_mod

    import av

    from app.bot.voice import to_upload_format

    rate, seconds = 16_000, 5
    pcm = b"".join(
        struct.pack("<h", int(8000 * math.sin(2 * math.pi * 440 * i / rate)))
        for i in range(rate * seconds)
    )
    buffer = io.BytesIO()
    with wave_mod.open(buffer, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        wav.writeframes(pcm)
    wav_bytes = buffer.getvalue()

    encoded, mime = to_upload_format(wav_bytes)
    assert mime == "audio/ogg"
    assert encoded[:4] == b"OggS"
    assert len(encoded) < len(wav_bytes) / 4  # 최소 4배 이상 절감

    decoded = sum(f.samples for f in av.open(io.BytesIO(encoded)).decode(audio=0))
    assert abs(decoded / 48_000 - seconds) < 0.1  # 길이 보존


def test_upload_format_falls_back_to_wav_on_bad_input():
    from app.bot.voice import to_upload_format

    data, mime = to_upload_format(b"not a wav file")
    assert (data, mime) == (b"not a wav file", "audio/wav")
