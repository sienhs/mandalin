"""오디오 트랙 → 텍스트. Deepgram 스트리밍 STT.

**"언제 말이 끝났는가" 는 Deepgram 이 정합니다** — 스트리밍이라 그 판단을 자기가
합니다(`endpointing_ms`). 그래서 silero VAD 를 따로 붙이지 않습니다. 배치
STT(Whisper 계열)를 골랐다면 VAD 가 필수였을 자리입니다.

푸시투토크(`web/app.js` 의 10초 창)와 **다른 층입니다.** 창은 *듣는 구간*을 정해 침묵
과금을 막고, 발화 경계는 그 안에서 Deepgram 이 나눕니다 — 창 하나에 문장이 둘이면
FINAL 도 두 번 옵니다. 창이 생겼다고 이 파일이 할 일이 줄지 않습니다.

```
오디오 트랙 ─rtc.AudioStream─▶ push_frame ─▶ Deepgram ─▶ SpeechEvent
                                                          ├─ INTERIM  → 실시간 캡션
                                                          └─ FINAL    → Conversation.respond()
```

## STT 는 선택 기능입니다

`DEEPGRAM_API_KEY` 가 없으면 **음성만 조용히 빠지고 텍스트 대화는 그대로 됩니다.**
fail-open 인 이유는 키 하나 때문에 세션 전체가 죽으면 안 되기 때문입니다 — 다만
**경고를 크게 남깁니다.** 프롬프트 로더와 같은 판단입니다 — 기본값으로 내려가되
조용히 넘어가지 않습니다.

## 왜 `Conversation` 을 고치지 않았는가

STT 가 주는 것은 텍스트이고 `Conversation.respond(text)` 가 받는 것도 텍스트입니다.
그래서 이 파일은 **`Conversation` 을 전혀 모르는 채로** 전사문을 콜백으로 넘깁니다.
음성이 붙어도 대화 규율(히스토리 · 생성 중 버리기 · 실패 복구)이 그대로인 이유입니다.
"""
from __future__ import annotations

import asyncio
import logging
import os
from collections.abc import Awaitable, Callable, Coroutine
from contextlib import suppress
from typing import Any

from livekit import rtc
from livekit.agents import stt as stt_api

logger = logging.getLogger("mandarin.listen")

#: **플러그인 import 는 반드시 모듈 최상위입니다.** 함수 안으로 옮기지 마세요.
#:
#: `livekit.plugins.deepgram` 은 import 되는 순간 `Plugin.register_plugin()` 을 부르고,
#: LiveKit 은 그 등록을 **메인 스레드에서만** 허용합니다. `build_stt()` 안에 두었더니
#: 이렇게 터졌습니다 —
#:
#:     File "agent/listen.py", in build_stt
#:         from livekit.plugins import deepgram
#:     RuntimeError: Plugins must be registered on the main thread
#:
#: `entrypoint()` 가 job runner 스레드에서 돌기 때문입니다(로그의 `tid`). 최상위에 두면
#: `agent/__main__.py` 가 `agent.entrypoint` 를 import 할 때 메인 스레드에서 등록됩니다.
#:
#: **증상이 늦게 드러납니다** — worker 는 정상 기동하고 `registered worker` 까지 찍힌 뒤,
#: 누가 방에 들어와 job 이 배정될 때 처음 죽습니다. 그때 서버 로그에는 `assigned job` 만
#: 있고 에러가 없어서 worker 쪽 traceback 을 봐야 압니다.
#:
#: 플러그인이 설치돼 있지 않아도 이 모듈은 import 돼야 합니다 — STT 만 빠지고 텍스트
#: 대화는 도는 것이 이 파일의 계약입니다.
try:
    from livekit.plugins import deepgram
except ImportError:  # pragma: no cover - 플러그인 미설치 환경
    # 타입 검사기에게는 모듈 자리에 `None` 을 넣는 것이라 알려 둡니다. 아래 코드는
    # `deepgram is None` 으로 갈라지므로 런타임 계약은 이것이 맞습니다.
    deepgram = None  # type: ignore[assignment]

#: Deepgram 에 넘길 언어. **`multi` 로 두지 마세요 — 한국어가 그 목록에 없습니다.**
#:
#: 예전 기본값이 `multi` 였고 "개발 용어가 영어로 섞이니 코드 스위칭이 낫다" 는 추측이
#: 근거였습니다. 틀렸습니다. Nova-3 multilingual 은 영어·스페인어·프랑스어·독일어·
#: 힌디어·이탈리아어·**일본어**·네덜란드어·러시아어·포르투갈어 10개이고 **한국어는
#: 빠져 있습니다.** 한국어 음성을 그 10개에 맞추려다 이렇게 나왔습니다 —
#:
#:     "매일 알고리즘 문제 풀고 싶어요"
#:       -> '내이 algorithms 문적트고 한시고 한요.'
#:       -> 'Beiil algori ズム 문제트히 트히.'
#:       -> 'Bei 以 来 书borism muncie flu gossip 회.'
#:
#: 카타카나와 한자가 섞인 것이 단서입니다 — 모델이 일본어·중국어로 알아들으려 했습니다.
#: 한국어는 `ko`(또는 `ko-KR`)로 **명시**해야 하고, nova-3·nova-2 둘 다 지원합니다.
DEFAULT_LANGUAGE = "ko"

#: `multi` 가 지원하는 언어 목록. `DEFAULT_LANGUAGE` 를 되돌리지 못하게 테스트가
#: 이 값을 봅니다.
MULTI_LANGUAGES = (
    "en", "es", "fr", "de", "hi", "it", "ja", "nl", "ru", "pt",
)

#: 스트리밍 STT 에 넘길 샘플레이트. Deepgram 플러그인 기본값과 같습니다.
#: 사람 음성의 주요 성분이 4kHz 아래라 16kHz 면 충분합니다.
SAMPLE_RATE = 16_000


def build_stt() -> stt_api.STT | None:
    """설정이 갖춰졌을 때만 STT 를 만듭니다. 없으면 `None` (음성 비활성).

    **키를 코드에서 확인합니다.** 플러그인에 맡기면 없을 때 첫 프레임에서야 터지고,
    그 시점의 예외는 "왜 음성이 안 되지" 를 알려주지 않습니다.

    `entrypoint()` 안에서 불리므로 **여기서 import 를 하지 마세요.** 이 함수는 job
    runner 스레드에서 돕니다(위 최상위 import 주석 참고).
    """
    if deepgram is None:
        logger.warning(
            "livekit-plugins-deepgram 이 설치되지 않았습니다 — 음성 입력이 비활성됩니다 "
            "(pip install -r requirements.txt)"
        )
        return None
    if not os.environ.get("DEEPGRAM_API_KEY"):
        logger.warning(
            "DEEPGRAM_API_KEY 가 없습니다 — 음성 입력이 비활성됩니다 "
            "(텍스트 대화는 그대로 동작합니다)"
        )
        return None

    language = os.environ.get("STT_LANGUAGE", DEFAULT_LANGUAGE)
    model = os.environ.get("STT_MODEL", "nova-3")
    logger.info("STT 활성 model=%s language=%s", model, language)
    return deepgram.STT(
        model=model,
        language=language,
        # 실시간 캡션을 그리려면 필요합니다. 최종 전사만 쓸 거면 꺼도 됩니다.
        interim_results=True,
        sample_rate=SAMPLE_RATE,
        # 문장부호를 넣습니다. LLM 이 문장 경계를 읽는 데 도움이 되고, 화면 캡션도
        # 읽기 쉬워집니다.
        punctuate=True,
    )


class TranscriptionRegistry:
    """트랙 sid → 전사 태스크. **mute/unmute 반복을 견디는 것이 존재 이유입니다.**

    엔트리포인트의 dict 로 두었더니 두 가지가 조용히 어긋났습니다.

    **① 완료 콜백이 새 태스크를 지웁니다.** mute 로 취소한 태스크의 콜백은 취소가 실제로
    끝난 뒤에 불립니다. 그 사이에 unmute 로 같은 sid 의 새 태스크가 등록되면, 옛 콜백이
    무조건 `pop` 해서 **새 태스크를 추적 목록에서 지웁니다.** 그러면 다음 mute 가 대상을
    못 찾고 전사가 계속 돌아 — 과금이 멈추지 않습니다. `_forget` 이 **자기 태스크인지
    확인하고** 지우는 이유입니다(compare-and-remove).

    **② dict 를 클로저에 두면 테스트할 수 없습니다.** 위 경합은 이벤트 순서를 조작해야
    재현되는데, 엔트리포인트 안에 갇혀 있으면 그럴 방법이 없습니다. 이 영역에서 버그가
    반복돼서(플러그인 import 위치, 이벤트 인자 순서, 완료 콜백) 밖으로 뺐습니다.
    """

    def __init__(self) -> None:
        self._tasks: dict[str, asyncio.Task[None]] = {}

    @property
    def tracked(self) -> list[str]:
        return list(self._tasks)

    def start(self, sid: str, make_coro: Callable[[], Coroutine[Any, Any, None]]) -> bool:
        """전사를 시작합니다. **이미 돌고 있으면 `False`** (중복 시작 방지).

        **`Awaitable` 이 아니라 `Coroutine` 을 받습니다.** `asyncio.create_task` 는
        코루틴만 받는데 `Awaitable` 은 Future 나 커스텀 awaitable 도 포함해서, 타입
        검사를 통과하는 값이 런타임 `TypeError` 로 떨어집니다. 지금 호출부
        (`entrypoint.py` 의 `lambda: listener.run(track)`)는 코루틴이라 좁혀도
        잃는 것이 없습니다.
        """
        if sid in self._tasks:
            return False
        task = asyncio.create_task(make_coro())
        self._tasks[sid] = task
        # 강한 참조를 여기 보관합니다. 안 하면 GC 가 실행 중인 태스크를 수거해 전사가
        # 조용히 멈춥니다.
        task.add_done_callback(lambda finished: self._forget(sid, finished))
        return True

    def _forget(self, sid: str, finished: asyncio.Task[None]) -> None:
        if self._tasks.get(sid) is finished:
            del self._tasks[sid]

    def stop(self, sid: str) -> bool:
        """전사를 취소합니다. **대상이 없으면 `False`** — 호출하는 쪽이 경고를 남깁니다."""
        task = self._tasks.pop(sid, None)
        if task is None:
            return False
        task.cancel()
        return True

    async def aclose(self) -> None:
        """전부 취소하고 **끝날 때까지 기다립니다.**

        job 이 끝날 때 부릅니다(`ctx.add_shutdown_callback`). 기다리지 않으면 Deepgram
        WebSocket 이 정리되기 전에 프로세스가 내려가고, 파이썬은
        `Task was destroyed but it is pending` 경고를 남깁니다 — 그 경고가 진짜 누수와
        구분되지 않아서 다음 진단을 방해합니다.
        """
        tasks = list(self._tasks.values())
        self._tasks.clear()
        for task in tasks:
            task.cancel()
        for task in tasks:
            with suppress(Exception, asyncio.CancelledError):
                await task


class TrackListener:
    """오디오 트랙 하나를 받아 전사문을 콜백으로 흘려보냅니다.

    **인스턴스는 상태를 들고 있지 않습니다.** 스트림도 오디오도 `run()` 안에서 만들고
    닫으므로 인스턴스 하나로 트랙 여러 개를 돌려도 됩니다 — `entrypoint.py` 가 실제로
    하나를 만들어 재사용합니다. 이 방에는 사용자 마이크 트랙 하나뿐이라 지금은 겹칠
    일이 없지만, 그 사실에 기대고 있는 코드는 없습니다.

    스트림은 발화가 끝나도 계속 살아 있습니다 — Deepgram 이 발화 경계를 알아서
    나눕니다. 닫히는 것은 mute(취소)와 job 종료 때뿐입니다.
    """

    def __init__(
        self,
        stt: stt_api.STT,
        *,
        on_final: Callable[[str], Awaitable[None]],
        on_interim: Callable[[str], Awaitable[None]] | None = None,
        on_started: Callable[[], Awaitable[None]] | None = None,
    ) -> None:
        self._stt = stt
        self._on_final = on_final
        self._on_interim = on_interim
        #: 전사 배선이 끝났음을 알립니다. **오디오 유실 방지와 무관합니다** —
        #: `push_frame` 은 무제한 채널에 넣고 Deepgram WebSocket 이 열린 뒤
        #: `send_task` 가 비우므로, 연결 전에 말해도 잘리지 않습니다(지연만 생깁니다).
        #:
        #: 이 콜백의 목적은 **에이전트 쪽 상태를 화면에서 확인**하는 것입니다. 앞서
        #: `track_muted` 인자 순서 버그가 여러 번 숨었던 이유가 "에이전트가 듣고 있는지"
        #: 를 브라우저에서 알 방법이 없었기 때문입니다.
        self._on_started = on_started

    async def run(self, track: rtc.Track) -> None:
        """트랙이 끝날 때까지 돕니다. 태스크로 띄우고 강한 참조를 보관하세요.

        **취소가 정상 종료 경로입니다.** 마이크가 mute 되면 호출하는 쪽이 이 태스크를
        취소하고, 그때 아래 `finally` 가 STT 스트림과 오디오 스트림을 닫습니다 —
        열어둔 채 프레임만 건너뛰면 Deepgram 이 유휴 연결을 끊어 버립니다.
        """
        audio = rtc.AudioStream(track, sample_rate=SAMPLE_RATE, num_channels=1)
        stream = self._stt.stream()

        async def pump() -> None:
            """오디오 프레임을 STT 로 밀어 넣습니다."""
            try:
                async for event in audio:
                    stream.push_frame(event.frame)
            finally:
                # 이걸 빠뜨리면 마지막 발화의 최종 전사가 오지 않습니다 — Deepgram 이
                # 입력이 더 올 것으로 보고 기다립니다.
                with suppress(Exception):
                    stream.end_input()

        pump_task = asyncio.create_task(pump())
        if self._on_started is not None:
            # 실패해도 전사를 막지 않습니다 — 확인 신호일 뿐입니다.
            with suppress(Exception):
                await self._on_started()
        try:
            async for event in stream:
                await self._handle(event)
        finally:
            pump_task.cancel()
            # **취소 중에도 반드시 닫습니다.** `finally` 안의 `await` 는 이미 취소된
            # 태스크에서 즉시 `CancelledError` 를 다시 낼 수 있는데, 그러면 뒤쪽 정리가
            # 건너뛰어져 STT 연결이 새어 나갑니다 — mute/unmute 를 반복하면 연결이
            # 쌓입니다. 정리 경로는 멱등해야 합니다.
            #
            # `BaseException` 을 삼키지는 않습니다. `KeyboardInterrupt`·`SystemExit` 까지
            # 먹으면 Ctrl+C 가 안 듣습니다 — 필요한 것은 `CancelledError` 뿐입니다.
            with suppress(Exception, asyncio.CancelledError):
                await pump_task
            with suppress(Exception, asyncio.CancelledError):
                await stream.aclose()
            with suppress(Exception, asyncio.CancelledError):
                await audio.aclose()

    async def _handle(self, event: stt_api.SpeechEvent) -> None:
        text = _first_text(event)
        if event.type == stt_api.SpeechEventType.FINAL_TRANSCRIPT:
            if text:
                logger.info("전사(최종): %r", text[:80])
                await self._on_final(text)
        elif event.type == stt_api.SpeechEventType.INTERIM_TRANSCRIPT:
            if text and self._on_interim is not None:
                await self._on_interim(text)
        elif event.type == stt_api.SpeechEventType.RECOGNITION_USAGE:
            # STT 는 LLM 토큰이 아니라 **오디오 시간**으로 과금됩니다. 그 값이
            # `gemini usage` 로그에 안 나오므로 여기서 따로 남깁니다 — 합계만으로는
            # "어디가" 를 알 수 없습니다.
            usage = event.recognition_usage
            if usage is not None:
                logger.info("stt usage %s", usage)


def _first_text(event: stt_api.SpeechEvent) -> str:
    """가장 그럴듯한 후보의 텍스트. 없으면 빈 문자열.

    `alternatives` 가 비어 오는 이벤트가 있습니다(`START_OF_SPEECH` 등). 인덱스로
    바로 접근하면 그때 `IndexError` 로 스트림 루프가 죽습니다.
    """
    if not event.alternatives:
        return ""
    return (event.alternatives[0].text or "").strip()
