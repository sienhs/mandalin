"""STT 배선 — 오디오·네트워크 없이 검사할 수 있는 부분.

`TrackListener.run()` 은 실제 트랙과 Deepgram 연결이 필요해서 여기서 다루지 않습니다.
대신 **그 위아래**를 봅니다 — 키가 없을 때의 동작과, 이벤트를 전사문으로 바꾸는 부분.
둘 다 실제로 버그가 났던 종류입니다.
"""
from __future__ import annotations

import ast
from contextlib import suppress
from dataclasses import dataclass
from pathlib import Path

import pytest

import agent.listen
from agent.listen import _first_text, build_stt

LISTEN_PY = Path(agent.listen.__file__)


def test_the_plugin_is_imported_at_module_level_not_inside_a_function():
    """**플러그인 import 가 함수 안으로 들어가면 job 배정 시점에 터집니다.**

    `livekit.plugins.deepgram` 은 import 되는 순간 `Plugin.register_plugin()` 을 부르고,
    LiveKit 은 그 등록을 메인 스레드에서만 허용합니다. `entrypoint()` 는 job runner
    스레드에서 도니까, 그 안에서 import 하면 이렇게 죽습니다 —

        RuntimeError: Plugins must be registered on the main thread

    실제로 이렇게 터졌고, **그때 40개 테스트가 전부 통과했습니다.** worker 기동도
    정상이고 `registered worker` 까지 찍힌 뒤, 누가 방에 들어와야 처음 드러납니다.
    단위 테스트로 스레드 조건을 재현하긴 어려우니 **import 위치를 직접 못 박습니다.**
    """
    tree = ast.parse(LISTEN_PY.read_text(encoding="utf-8"))

    offenders: list[str] = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef):
            continue
        for inner in ast.walk(node):
            if isinstance(inner, ast.ImportFrom) and (inner.module or "").startswith(
                "livekit.plugins"
            ):
                offenders.append(f"{node.name}() 안에서 {inner.module}")
            elif isinstance(inner, ast.Import):
                offenders += [
                    f"{node.name}() 안에서 {a.name}"
                    for a in inner.names
                    if a.name.startswith("livekit.plugins")
                ]

    assert not offenders, (
        "플러그인 import 가 함수 안에 있습니다 — 메인 스레드에서 등록되지 않습니다: "
        f"{offenders}"
    )


def test_the_default_language_is_not_the_multilingual_mode():
    """**`multi` 에는 한국어가 없습니다.** 기본값을 그쪽으로 되돌리지 못하게 막습니다.

    Nova-3 multilingual 은 영어·스페인어·프랑스어·독일어·힌디어·이탈리아어·일본어·
    네덜란드어·러시아어·포르투갈어 10개입니다. 한국어 발화를 넣으면 그 중 하나로
    알아들으려 해서 실측에서 이렇게 나왔습니다 —

        "매일 알고리즘 문제 풀고 싶어요" -> 'Beiil algori ズム 문제트히 트히.'

    **에러가 아니라 품질 저하로만 드러납니다.** 카타카나·한자가 섞이면 이 설정을
    먼저 의심하세요.
    """
    from agent.listen import DEFAULT_LANGUAGE, MULTI_LANGUAGES

    assert DEFAULT_LANGUAGE != "multi"
    assert DEFAULT_LANGUAGE.startswith("ko")
    assert "ko" not in MULTI_LANGUAGES, "multi 목록에 ko 가 추가됐다면 이 테스트를 다시 판단하세요"


def test_the_module_imports_even_without_the_plugin_installed():
    """플러그인이 없어도 `agent.listen` 은 import 돼야 합니다.

    최상위 import 로 옮기면서 생긴 위험입니다 — `try/except ImportError` 를 빼면 플러그인
    미설치 환경에서 **텍스트 대화까지 못 하게** 됩니다. STT 만 빠지는 것이 이 파일의
    계약입니다.
    """
    source = LISTEN_PY.read_text(encoding="utf-8")
    assert "except ImportError" in source, (
        "최상위 플러그인 import 를 try/except ImportError 로 감싸야 합니다"
    )


@dataclass
class FakeData:
    text: str


@dataclass
class FakeEvent:
    alternatives: list


def test_no_key_disables_voice_instead_of_crashing(monkeypatch):
    """키가 없으면 `None` 을 돌려주고 텍스트 대화는 그대로 동작해야 합니다.

    fail-open 입니다. 인증은 반대로 fail-closed 인데, 기준이 다릅니다 — 인증은
    판단할 수 없으면 **막아야** 하고, 음성은 못 쓰더라도 서비스가 돌아가는 편이
    낫습니다.
    """
    monkeypatch.delenv("DEEPGRAM_API_KEY", raising=False)
    assert build_stt() is None


def test_a_blank_key_counts_as_missing(monkeypatch):
    """`.env` 에 `DEEPGRAM_API_KEY=` 만 적어둔 상태입니다 — 흔합니다.

    빈 문자열을 키로 취급하면 첫 프레임에서 인증 오류로 죽고, 그 예외는 "키를 안
    넣었다" 를 알려주지 않습니다.
    """
    monkeypatch.setenv("DEEPGRAM_API_KEY", "")
    assert build_stt() is None


def test_an_event_without_alternatives_yields_empty_string():
    """`START_OF_SPEECH` 처럼 후보가 비어 오는 이벤트가 있습니다.

    인덱스로 바로 접근하면 그때 `IndexError` 로 스트림 루프가 죽습니다 — 전사가
    조용히 멈추고 원인은 로그에만 남습니다.
    """
    assert _first_text(FakeEvent(alternatives=[])) == ""


def test_whitespace_only_transcripts_are_dropped():
    """공백만 온 전사문이 발화로 들어가면 파이프라인이 헛돌고 LLM 을 태웁니다."""
    assert _first_text(FakeEvent(alternatives=[FakeData(text="   ")])) == ""
    assert _first_text(FakeEvent(alternatives=[FakeData(text="")])) == ""


def test_the_first_alternative_wins_and_is_trimmed():
    event = FakeEvent(
        alternatives=[FakeData(text="  매일 알고리즘 풀기  "), FakeData(text="다른 후보")]
    )
    assert _first_text(event) == "매일 알고리즘 풀기"


FRAME_MS = 20


def _frame(amplitude: int, ms: int = FRAME_MS, sample_rate: int = 16_000):
    """진폭이 일정한 프레임. 0 이면 완전한 무음(mute 된 트랙)입니다."""
    import numpy as np
    from livekit import rtc

    samples = sample_rate * ms // 1000
    data = np.full(samples, amplitude, dtype=np.int16)
    return rtc.AudioFrame(data.tobytes(), sample_rate, 1, samples)


def _feed(gate, amplitude: int, ms: int):
    """`ms` 동안 같은 소리를 넣고 (보낸 프레임 수, 마지막 판정) 을 돌려줍니다."""
    sent = 0
    last = None
    for _ in range(ms // FRAME_MS):
        last = gate.feed(_frame(amplitude))
        sent += len(last.frames)
    return sent, last


def test_silence_is_not_sent_to_the_stt():
    """**이걸 놓치면 15분 창이 15분어치 과금입니다.**

    Deepgram 은 열려 있는 소켓 시간으로 과금하고, mute 되지 않은 트랙은 무음 프레임을
    계속 흘려보냅니다. 사람이 창을 닫아주던 10초 시절에는 이 층이 없어도 됐습니다.
    """
    from agent.listen import SpeechGate

    gate = SpeechGate()
    sent, _ = _feed(gate, 0, 5_000)
    assert sent == 0
    assert not gate.speaking
    assert gate.sent_seconds == 0.0
    assert gate.silence_seconds == pytest.approx(5.0, abs=0.05)


def test_speech_opens_the_gate_and_carries_the_audio_before_the_onset():
    """온셋 판정에 쓴 앞부분까지 같이 보내야 첫 음절이 안 잘립니다.

    되돌려 보내지 않으면 `ONSET_MS` + 스트림 연결 시간만큼이 통째로 사라집니다 —
    에러가 아니라 전사 품질로만 드러나는 종류입니다.
    """
    from agent.listen import ONSET_MS, PREBUFFER_MS, SpeechGate

    gate = SpeechGate()
    _feed(gate, 0, 1_000)
    sent, last = _feed(gate, 4_000, 200)

    assert gate.speaking
    # 온셋 프레임 하나가 아니라 그 앞 구간까지 나갑니다.
    carried = (PREBUFFER_MS + ONSET_MS) / FRAME_MS
    assert sent > carried
    assert last is not None and not last.ended


def test_a_short_pause_does_not_end_the_utterance():
    """문장 중간의 숨 쉬는 구간에서 스트림이 닫히면 한 문장이 둘로 쪼개집니다."""
    from agent.listen import HANGOVER_MS, SpeechGate

    gate = SpeechGate()
    _feed(gate, 4_000, 400)
    sent, last = _feed(gate, 0, int(HANGOVER_MS) - FRAME_MS)

    assert gate.speaking
    assert last is not None and not last.ended
    # hangover 구간의 무음은 **보냅니다** — Deepgram 이 문장 끝을 판정하는 근거입니다.
    assert sent > 0


def test_the_utterance_ends_once_after_the_hangover():
    """`ended` 는 한 번만 떠야 합니다 — 호출부가 그때 `flush()` 를 부릅니다."""
    from agent.listen import HANGOVER_MS, SpeechGate

    gate = SpeechGate()
    _feed(gate, 4_000, 400)

    ends = 0
    silent_sent = 0
    for _ in range(int(HANGOVER_MS) // FRAME_MS + 100):
        gated = gate.feed(_frame(0))
        ends += gated.ended
        silent_sent += len(gated.frames)

    assert ends == 1
    assert not gate.speaking
    # hangover 만큼만 보내고 그 뒤 무음은 버립니다.
    assert silent_sent == pytest.approx(HANGOVER_MS / FRAME_MS, abs=1)


def test_a_single_loud_frame_does_not_open_the_gate():
    """헛기침·문 닫는 소리로 스트림을 열면 연결 비용만 냅니다."""
    from agent.listen import SpeechGate

    gate = SpeechGate()
    _feed(gate, 0, 500)
    assert gate.feed(_frame(20_000)).frames == ()
    assert not gate.speaking


def test_the_gate_reads_its_thresholds_from_the_environment(monkeypatch):
    """운영에서 조절할 수 있어야 합니다 — 잡음이 심한 방은 임계값을 올립니다."""
    from agent.listen import SpeechGate

    monkeypatch.setenv("STT_SILENCE_DBFS", "-20")
    quiet = SpeechGate.from_env()
    # -30dBFS 쯤인 소리라 임계값(-20)보다 조용합니다.
    sent, _ = _feed(quiet, 1_000, 1_000)
    assert sent == 0


def test_a_broken_threshold_falls_back_instead_of_killing_the_session(monkeypatch):
    """`.env` 오타로 음성이 죽으면 안 됩니다. 기본값으로 내려가되 경고를 남깁니다."""
    from agent.listen import SILENCE_DBFS, _env_float

    monkeypatch.setenv("STT_SILENCE_DBFS", "아니오")
    assert _env_float("STT_SILENCE_DBFS", SILENCE_DBFS) == SILENCE_DBFS


class FakeSttStream:
    """`stt.SpeechStream` 중 `TrackListener` 가 실제로 쓰는 것만."""

    def __init__(self) -> None:
        import asyncio

        self.pushed: list = []
        self.flushes = 0
        self.input_ended = False
        self.closed = False
        self._events: asyncio.Queue = asyncio.Queue()

    def push_frame(self, frame) -> None:
        assert not self.input_ended, "end_input 뒤에 push 하면 실제 스트림은 예외를 냅니다"
        self.pushed.append(frame)

    def flush(self) -> None:
        self.flushes += 1

    def end_input(self) -> None:
        self.input_ended = True
        self._events.put_nowait(None)

    async def aclose(self) -> None:
        self.closed = True

    def __aiter__(self):
        return self

    async def __anext__(self):
        event = await self._events.get()
        if event is None:
            raise StopAsyncIteration
        return event


class FakeStt:
    def __init__(self) -> None:
        self.streams: list[FakeSttStream] = []

    def stream(self) -> FakeSttStream:
        self.streams.append(FakeSttStream())
        return self.streams[-1]


def _fake_audio(*segments: tuple[int, int]):
    """`(진폭, ms)` 목록을 `rtc.AudioStream` 자리에 끼울 수 있는 것으로 만듭니다."""

    class FakeEvent:
        def __init__(self, frame) -> None:
            self.frame = frame

    frames = [
        FakeEvent(_frame(amplitude))
        for amplitude, ms in segments
        for _ in range(ms // FRAME_MS)
    ]

    class FakeAudioStream:
        def __init__(self, *_args, **_kwargs) -> None:
            self._frames = iter(frames)

        def __aiter__(self):
            return self

        async def __anext__(self):
            try:
                return next(self._frames)
            except StopIteration:
                raise StopAsyncIteration from None

        async def aclose(self) -> None:
            pass

    return FakeAudioStream


async def _run_with(monkeypatch, *segments: tuple[int, int], is_busy=None) -> FakeStt:
    import agent.listen as listen

    monkeypatch.setattr(listen.rtc, "AudioStream", _fake_audio(*segments))
    speech = FakeStt()
    await listen.TrackListener(speech, on_final=_noop, is_busy=is_busy).run(track=object())
    return speech


async def _noop(_text: str) -> None:
    pass


async def test_a_silent_window_never_opens_a_deepgram_connection(monkeypatch):
    """**소켓이 열린 시간이 요금입니다.** 켜두고 말하지 않으면 연결이 없어야 합니다."""
    speech = await _run_with(monkeypatch, (0, 10_000))
    assert speech.streams == []


async def test_the_stream_closes_when_the_silence_outlasts_the_idle_window(monkeypatch):
    """발화가 끝나고 무음이 이어지면 스트림을 닫습니다 — 과금이 실제로 멈추는 지점."""
    import agent.listen as listen

    monkeypatch.setenv("STT_IDLE_CLOSE_SECONDS", "1")
    speech = await _run_with(monkeypatch, (0, 1_000), (4_000, 500), (0, 4_000))

    assert len(speech.streams) == 1
    stream = speech.streams[0]
    assert stream.input_ended and stream.closed
    # 발화가 끝날 때 Finalize 를 보냅니다. 무음을 더 안 보내므로 이게 없으면 마지막
    # FINAL 이 다음 발화까지 밀립니다.
    assert stream.flushes == 1
    # 보낸 것은 발화 + hangover 뿐입니다(5.5초 창 전체가 아님).
    ceiling = (500 + listen.HANGOVER_MS + listen.PREBUFFER_MS + listen.ONSET_MS) / FRAME_MS
    assert 0 < len(stream.pushed) <= ceiling


async def test_the_next_utterance_opens_a_new_stream(monkeypatch):
    """닫은 뒤에도 계속 들어야 합니다 — 창이 15분이라 발화가 여러 번 옵니다."""
    monkeypatch.setenv("STT_IDLE_CLOSE_SECONDS", "1")
    speech = await _run_with(
        monkeypatch, (4_000, 400), (0, 3_000), (4_000, 400), (0, 3_000)
    )

    assert len(speech.streams) == 2
    assert all(s.input_ended and s.closed and s.pushed for s in speech.streams)


async def test_nothing_is_transcribed_while_the_answer_is_being_generated(monkeypatch):
    """**생성 중 발화는 `Conversation` 이 버립니다** — 전사하면 요금만 나갑니다."""
    speech = await _run_with(monkeypatch, (4_000, 2_000), is_busy=lambda: True)
    assert speech.streams == []


async def test_generation_closes_the_open_stream(monkeypatch):
    """발화가 끝나면 곧 생성이 시작됩니다. 그때 열려 있는 스트림을 닫습니다.

    무음 규칙(`STT_IDLE_CLOSE_SECONDS`)을 기다리면 생성 시간만큼 소켓이 더 열려
    있습니다 — 실측으로 발화당 5초쯤입니다.
    """
    generating = False

    def is_busy() -> bool:
        return generating

    import agent.listen as listen

    monkeypatch.setattr(listen.rtc, "AudioStream", _fake_audio((4_000, 400), (0, 200)))
    speech = FakeStt()
    listener = listen.TrackListener(speech, on_final=_noop, is_busy=is_busy)

    # 발화 도중에 생성이 시작되는 상황입니다. 프레임 몇 개를 흘린 뒤 켭니다.
    original = FakeSttStream.push_frame
    pushes = 0

    def counting_push(self, frame) -> None:
        nonlocal generating, pushes
        original(self, frame)
        pushes += 1
        if pushes == 5:
            generating = True

    monkeypatch.setattr(FakeSttStream, "push_frame", counting_push)
    await listener.run(track=object())

    assert len(speech.streams) == 1
    stream = speech.streams[0]
    assert stream.input_ended and stream.closed
    # 닫기 전에 flush 합니다 — 그래야 방금 한 말의 FINAL 이 옵니다.
    assert stream.flushes == 1


async def test_listening_resumes_after_generation(monkeypatch):
    """생성이 끝나면 다시 들어야 합니다 — 안 그러면 한 턴 만에 음성이 죽습니다."""
    busy = True

    import agent.listen as listen

    monkeypatch.setattr(listen.rtc, "AudioStream", _fake_audio((4_000, 400), (4_000, 400)))
    speech = FakeStt()

    def is_busy() -> bool:
        nonlocal busy
        was, busy = busy, False  # 첫 프레임에서만 생성 중입니다
        return was

    await listen.TrackListener(speech, on_final=_noop, is_busy=is_busy).run(track=object())
    assert len(speech.streams) == 1
    assert speech.streams[0].pushed


async def test_closing_a_stream_does_not_stall_the_next_utterance(monkeypatch):
    """**정리는 오디오 루프 밖에서 합니다.**

    `end_input()` 뒤 스트림이 끝나기까지 플러그인의 keepalive 주기(5초)만큼 걸립니다.
    그동안 루프를 세우면 그 사이 시작된 발화의 첫 전사가 그만큼 늦습니다 — 실측에서
    닫을 때마다 `FINALIZE_SECONDS` 를 통째로 기다렸습니다.
    """
    import asyncio

    #: 정리에 이만큼 걸리는 상황입니다(실제로는 소켓 종료 + 마지막 전사 대기).
    teardown = 0.5

    class SlowClosingStream(FakeSttStream):
        async def aclose(self) -> None:
            await asyncio.sleep(teardown)
            self.closed = True

    class SlowStt(FakeStt):
        def stream(self) -> FakeSttStream:
            self.streams.append(SlowClosingStream())
            return self.streams[-1]

    import agent.listen as listen

    monkeypatch.setenv("STT_IDLE_CLOSE_SECONDS", "1")
    monkeypatch.setattr(
        listen.rtc,
        "AudioStream",
        _fake_audio((4_000, 400), (0, 3_000), (4_000, 400), (0, 3_000)),
    )
    speech = SlowStt()
    loop = asyncio.get_running_loop()
    started = loop.time()
    run = asyncio.create_task(listen.TrackListener(speech, on_final=_noop).run(track=object()))
    try:
        while len(speech.streams) < 2:
            assert loop.time() - started < teardown / 2, (
                "두 번째 발화가 첫 스트림의 정리를 기다렸습니다"
            )
            await asyncio.sleep(0.01)
        # 첫 스트림은 아직 닫히는 중입니다 — 루프가 기다리지 않았다는 증거입니다.
        # 기다렸다면 두 번째 스트림이 열릴 때 이미 닫혀 있습니다.
        assert not speech.streams[0].closed
    finally:
        run.cancel()
        with suppress(asyncio.CancelledError):
            await run


async def test_a_stream_that_will_not_end_is_closed_anyway(monkeypatch, caplog):
    """**스트림이 스스로 끝나기를 기다리지 않습니다.**

    플러그인 keepalive 가 소켓이 닫힌 것을 다음 전송(5초 주기)에서야 알아채서, 기다리면
    발화당 약 5초가 더 청구됐습니다(실측). 유예만 주고 직접 닫습니다.
    """
    import logging

    class NeverEndingStream(FakeSttStream):
        def end_input(self) -> None:
            self.input_ended = True  # 이벤트 채널을 안 닫습니다

    class NeverEndingStt(FakeStt):
        def stream(self) -> FakeSttStream:
            self.streams.append(NeverEndingStream())
            return self.streams[-1]

    import agent.listen as listen

    monkeypatch.setenv("STT_IDLE_CLOSE_SECONDS", "1")
    monkeypatch.setenv("STT_FINALIZE_SECONDS", "0.05")
    monkeypatch.setattr(listen.rtc, "AudioStream", _fake_audio((4_000, 400), (0, 3_000)))
    speech = NeverEndingStt()
    with caplog.at_level(logging.WARNING, logger="mandarin.listen"):
        await listen.TrackListener(speech, on_final=_noop).run(track=object())

    assert speech.streams[0].closed
    # FINAL 을 받은 적이 없으니 경고도 없어야 합니다 — 경고는 INTERIM 뒤에만 뜹니다.
    assert "FINAL" not in caplog.text


async def test_dropping_a_pending_final_is_warned_about(monkeypatch, caplog):
    """마지막 발화가 빠지는 것은 **조용히** 일어납니다. 그래서 경고를 남깁니다."""
    import logging

    from livekit.agents import stt as stt_api

    class InterimOnlyStream(FakeSttStream):
        """INTERIM 만 주고 FINAL 을 주지 않는 스트림 — 느린 네트워크의 재현입니다."""

        def push_frame(self, frame) -> None:
            super().push_frame(frame)
            if len(self.pushed) == 3:
                self._events.put_nowait(
                    stt_api.SpeechEvent(
                        type=stt_api.SpeechEventType.INTERIM_TRANSCRIPT,
                        alternatives=[stt_api.SpeechData(language="ko", text="매일 알고")],
                    )
                )

        def end_input(self) -> None:
            self.input_ended = True  # FINAL 없이 끝냅니다

    class InterimOnlyStt(FakeStt):
        def stream(self) -> FakeSttStream:
            self.streams.append(InterimOnlyStream())
            return self.streams[-1]

    import agent.listen as listen

    monkeypatch.setenv("STT_IDLE_CLOSE_SECONDS", "1")
    monkeypatch.setenv("STT_FINALIZE_SECONDS", "0.05")
    monkeypatch.setattr(listen.rtc, "AudioStream", _fake_audio((4_000, 400), (0, 3_000)))
    speech = InterimOnlyStt()
    with caplog.at_level(logging.WARNING, logger="mandarin.listen"):
        await listen.TrackListener(speech, on_final=_noop, on_interim=_noop).run(
            track=object()
        )

    assert "FINAL" in caplog.text
    assert speech.streams[0].closed


async def test_cancelling_the_run_still_closes_the_open_stream(monkeypatch):
    """mute 는 이 태스크를 취소합니다. 그때 정리를 건너뛰면 연결이 쌓입니다."""
    import asyncio

    import agent.listen as listen

    started = asyncio.Event()

    class SlowAudioStream:
        def __init__(self, *_args, **_kwargs) -> None:
            self._frames = iter([_frame(4_000) for _ in range(50)])

        def __aiter__(self):
            return self

        async def __anext__(self):
            frame = next(self._frames, None)
            if frame is None:
                started.set()
                await asyncio.sleep(3600)
            return type("E", (), {"frame": frame})()

        async def aclose(self) -> None:
            pass

    monkeypatch.setattr(listen.rtc, "AudioStream", SlowAudioStream)
    speech = FakeStt()
    task = asyncio.create_task(
        listen.TrackListener(speech, on_final=_noop).run(track=object())
    )
    await asyncio.wait_for(started.wait(), 5)
    task.cancel()
    with pytest.raises(asyncio.CancelledError):
        await task

    assert len(speech.streams) == 1
    assert speech.streams[0].closed


@pytest.mark.parametrize("language", ["ko", "multi"])
def test_the_configured_language_reaches_the_plugin(monkeypatch, language):
    """`ko`/`multi` 가 Deepgram 이 실제로 받는 값인지 확인합니다.

    오타가 나면 플러그인이 조용히 기본값(`en-US`)으로 돌 수 있고, 그러면 한국어
    발화가 이상한 영어로 전사됩니다 — 에러가 아니라 품질 저하로만 드러납니다.
    """
    pytest.importorskip("livekit.plugins.deepgram")
    import typing

    from livekit.plugins.deepgram import DeepgramLanguages

    assert language in typing.get_args(DeepgramLanguages)

    monkeypatch.setenv("DEEPGRAM_API_KEY", "test-key-not-used")
    monkeypatch.setenv("STT_LANGUAGE", language)
    stt = build_stt()
    assert stt is not None


# -- 스트림이 도중에 깨질 때 ---------------------------------------------------
#
# 위 검사들은 스트림이 **정상적으로 열리고 닫히는** 경로입니다. 아래는 그 사이에
# 무언가 터지는 경우이고, 전부 조용합니다 — HANDOFF 의 *"전사가 중간에 멈춤 — 태스크가
# GC 되면 조용히 멈춥니다"* 가 이 근처입니다. 마이크는 켜져 있고 요금도 나가는데
# 캡션만 안 나오므로, 사용자에게는 "안 들리나 보다" 로만 보입니다.
#
# 오디오 페이크가 프레임마다 제어를 넘깁니다(`asyncio.sleep(0)`). 위쪽 `_fake_audio` 는
# await 가 없어서 읽기 태스크가 `aclose` 전까지 한 번도 안 돕니다 — 그러면 "읽다가
# 터진다" 를 재현할 수 없습니다. 실제 `rtc.AudioStream` 은 프레임마다 I/O 를 기다립니다.


def _interleaving_audio(*segments: tuple[int, int]):
    base = _fake_audio(*segments)

    class Interleaving(base):  # type: ignore[misc, valid-type]
        async def __anext__(self):
            import asyncio

            await asyncio.sleep(0)
            return await base.__anext__(self)

    return Interleaving


def _speaking_stt(stream_factory):
    class Stt(FakeStt):
        def stream(self) -> FakeSttStream:
            self.streams.append(stream_factory(len(self.streams)))
            return self.streams[-1]

    return Stt()


async def _run_interleaved(monkeypatch, speech, *segments, **kwargs):
    import agent.listen as listen

    monkeypatch.setenv("STT_IDLE_CLOSE_SECONDS", "1")
    monkeypatch.setenv("STT_FINALIZE_SECONDS", "0.05")
    monkeypatch.setattr(listen.rtc, "AudioStream", _interleaving_audio(*segments))
    await listen.TrackListener(speech, **kwargs).run(track=object())
    return speech


def _final_at(nth_frame: int, text: str):
    """`nth_frame` 번째 프레임에서 INTERIM 과 FINAL 을 차례로 내는 스트림."""
    from livekit.agents import stt as stt_api

    class Talking(FakeSttStream):
        def push_frame(self, frame) -> None:
            super().push_frame(frame)
            if len(self.pushed) == nth_frame:
                for kind, said in (
                    (stt_api.SpeechEventType.INTERIM_TRANSCRIPT, text[:2]),
                    (stt_api.SpeechEventType.FINAL_TRANSCRIPT, text),
                ):
                    self._events.put_nowait(
                        stt_api.SpeechEvent(
                            type=kind,
                            alternatives=[stt_api.SpeechData(language="ko", text=said)],
                        )
                    )

    return Talking


async def test_a_final_transcript_reaches_the_callback(monkeypatch):
    """**전사문이 실제로 배달되는지.** 여기가 끊기면 파이프라인은 아무것도 못 받습니다."""
    heard: list[str] = []
    seen: list[str] = []

    async def on_final(text: str) -> None:
        heard.append(text)

    async def on_interim(text: str) -> None:
        seen.append(text)

    await _run_interleaved(
        monkeypatch,
        _speaking_stt(lambda _i: _final_at(3, "매일 알고리즘 문제 풀기")()),
        (4_000, 400),
        (0, 3_000),
        on_final=on_final,
        on_interim=on_interim,
    )

    assert heard == ["매일 알고리즘 문제 풀기"]
    # 중간 결과는 따로 갑니다 — 캡션이 말하는 동안 갱신되는 자리입니다.
    assert seen == ["매일"]


async def test_a_reader_crash_is_logged_instead_of_dying_quietly(monkeypatch, caplog):
    """읽기 태스크가 조용히 죽으면 **전사만 멈추고 로그에 아무것도 안 남습니다.**

    마이크는 켜져 있고 소켓도 열려 있어 요금은 계속 나갑니다.
    """
    import logging

    async def boom(_text: str) -> None:
        raise RuntimeError("콜백이 터졌습니다")

    with caplog.at_level(logging.ERROR, logger="mandarin.listen"):
        await _run_interleaved(
            monkeypatch,
            _speaking_stt(lambda _i: _final_at(3, "터질 발화")()),
            (4_000, 400),
            (0, 3_000),
            on_final=boom,
        )

    assert "STT 스트림 읽기가 실패했습니다" in caplog.text
    # 트레이스백이 같이 남아야 원인을 찾을 수 있습니다.
    assert "콜백이 터졌습니다" in caplog.text


async def test_usage_is_logged_because_stt_is_billed_by_audio_seconds(monkeypatch, caplog):
    """STT 는 토큰이 아니라 **오디오 시간**으로 과금됩니다.

    `gemini usage` 로그에 안 나오는 값이라 여기서 안 남기면 청구서에서 "어디가" 를
    가를 수 없습니다.
    """
    import logging

    from livekit.agents import stt as stt_api

    class Reporting(FakeSttStream):
        def push_frame(self, frame) -> None:
            super().push_frame(frame)
            if len(self.pushed) == 3:
                self._events.put_nowait(
                    stt_api.SpeechEvent(
                        type=stt_api.SpeechEventType.INTERIM_TRANSCRIPT,
                        alternatives=[stt_api.SpeechData(language="ko", text="어")],
                    )
                )
                self._events.put_nowait(
                    stt_api.SpeechEvent(
                        type=stt_api.SpeechEventType.RECOGNITION_USAGE,
                        alternatives=[],
                        recognition_usage=stt_api.RecognitionUsage(audio_duration=4.2),
                    )
                )

    with caplog.at_level(logging.INFO, logger="mandarin.listen"):
        await _run_interleaved(
            monkeypatch,
            _speaking_stt(lambda _i: Reporting()),
            (4_000, 400),
            (0, 3_000),
            on_final=_noop,
        )

    assert "stt usage" in caplog.text


async def test_a_push_failure_closes_the_stream_and_keeps_listening(monkeypatch, caplog):
    """프레임을 못 보내면 그 스트림을 버리고 **다음 발화는 새 스트림으로 받습니다.**

    안 버리면 남은 창(15분) 내내 같은 죽은 스트림에 밀어 넣게 됩니다.
    """
    import logging

    class Broken(FakeSttStream):
        def push_frame(self, frame) -> None:
            raise RuntimeError("소켓이 닫혔습니다")

    speech = _speaking_stt(lambda i: Broken() if i == 0 else FakeSttStream())
    with caplog.at_level(logging.ERROR, logger="mandarin.listen"):
        await _run_interleaved(
            monkeypatch, speech, (4_000, 400), (0, 3_000), (4_000, 400), (0, 3_000),
            on_final=_noop,
        )

    assert "프레임을 보내지 못했습니다" in caplog.text
    assert len(speech.streams) >= 2
    assert speech.streams[0].closed


async def test_a_stream_that_ended_first_is_replaced(monkeypatch, caplog):
    """재연결까지 소진한 스트림은 다시 엽니다.

    안 버리면 아래 `push` 가 프레임마다 터집니다 — 증상이 로그 도배로 바뀝니다.
    """
    import logging

    class AlreadyOver(FakeSttStream):
        def __init__(self) -> None:
            super().__init__()
            self._events.put_nowait(None)  # 읽기 태스크가 바로 끝납니다

    speech = _speaking_stt(lambda i: AlreadyOver() if i == 0 else FakeSttStream())
    with caplog.at_level(logging.WARNING, logger="mandarin.listen"):
        await _run_interleaved(
            monkeypatch, speech, (4_000, 600), (0, 3_000), on_final=_noop
        )

    assert "먼저 끝났습니다" in caplog.text
    assert len(speech.streams) >= 2


async def test_a_failing_started_callback_does_not_stop_transcription(monkeypatch):
    """시작 알림은 **확인 신호일 뿐**이라 실패해도 듣기를 막지 않습니다.

    이 콜백이 있는 이유가 "에이전트가 듣고 있는지" 를 브라우저에서 보기 위해서인데,
    그것 때문에 전사가 안 되면 주객이 바뀝니다.
    """
    async def boom() -> None:
        raise RuntimeError("데이터 채널이 아직 안 열렸습니다")

    speech = await _run_interleaved(
        monkeypatch,
        _speaking_stt(lambda _i: FakeSttStream()),
        (4_000, 400),
        (0, 3_000),
        on_final=_noop,
        on_started=boom,
    )

    assert len(speech.streams) == 1
    assert speech.streams[0].pushed


async def test_a_missing_plugin_disables_voice_instead_of_killing_the_session(
    monkeypatch, caplog
):
    """플러그인이 없으면 **음성만** 죽습니다 — 텍스트 대화와 시트는 그대로입니다.

    `test_the_module_imports_even_without_the_plugin_installed` 는 import 가 견디는지를
    소스로 봅니다. 이쪽은 그 뒤 **런타임 갈래**입니다: `build_stt()` 가 `None` 을
    돌려줘야 `entrypoint` 가 세션 알림에 `voice:false` 를 실을 수 있습니다
    (`test_hello.py`). 여기서 예외를 올리면 job 이 통째로 죽습니다.
    """
    import logging

    import agent.listen as listen

    monkeypatch.setattr(listen, "deepgram", None)
    monkeypatch.setenv("DEEPGRAM_API_KEY", "있어도-무의미")
    with caplog.at_level(logging.WARNING, logger="mandarin.listen"):
        assert listen.build_stt() is None

    assert "설치되지 않았습니다" in caplog.text


def test_an_empty_frame_is_silence_not_a_crash():
    """길이 0 프레임에 `np.mean` 을 걸면 `nan` 이 나오고, `nan` 은 어떤 비교에도
    False 라 게이트가 **무음도 발화도 아닌 상태**로 빠집니다. `-inf` 로 접습니다."""
    import math

    from agent.listen import frame_dbfs

    assert frame_dbfs(_frame(0, ms=0)) == -math.inf
