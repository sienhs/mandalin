"""429(몰림) 경로 — 세 층이 각자 다르게 반응해야 한다.

    _post          429 만 `LlmRateLimitedError` 로 갈라낸다 (400·500·503 은 그대로)
    _step          백오프 후 **한 번만** 재시도한다. 긴 `Retry-After` 는 따르지 않는다
    Conversation   재시도까지 실패하면 원문 대신 `BUSY_REPLY` 를 준다

가운데 층이 없으면 몰림 한 파에 사용자가 실패를 봅니다. 마지막 층이 없으면 게이트웨이
JSON 이 채팅에 그대로 나갑니다.
"""
from __future__ import annotations

import asyncio

import httpx
import pytest

from agent.conversation import BUSY_REPLY, Conversation
from mandarin_goal.bot.goal import (
    MAX_RATE_LIMIT_WAIT_SECONDS,
    RATE_LIMIT_WAIT_SECONDS,
    GoalPipeline,
)
from mandarin_goal.bot.llm import (
    GeminiBackend,
    LlmError,
    LlmRateLimitedError,
    LlmTruncatedError,
    Turn,
)
from mandarin_goal.config import Settings
from mandarin_goal.sheet import DomainRef

#: **단계 모델을 비워 둡니다.** `.env` 에 `BOT_DECIDE_MODEL` 이 있으면
#: `_stage_backend()` 가 백엔드를 새로 만들어 주입한 가짜를 조용히 버립니다
#: (`test_domain_authority.py` 의 같은 주석 참고).
SETTINGS = Settings(
    bot_mode="goal",
    bot_provider="echo",
    bot_classify_model=None,
    bot_decide_model=None,
)

SHEET = [DomainRef(id=7, title="학습", subjectCount=0, subjects=[])]
UTTERANCE = "매일 알고리즘 문제 풀고 싶어"


class FlakyBackend:
    """앞의 `fail_times` 번은 429 를 내고 그 뒤에는 정상 응답을 준다."""

    name = "flaky"

    def __init__(self, fail_times: int, *, retry_after: float | None = None) -> None:
        self._left = fail_times
        self._retry_after = retry_after
        self.calls = 0

    async def reply_json(
        self,
        system: str,
        history: list[Turn],
        schema: dict,
        *,
        max_output_tokens: int | None = None,
    ) -> dict:
        self.calls += 1
        if self._left > 0:
            self._left -= 1
            raise LlmRateLimitedError("flaky 429: quota", retry_after=self._retry_after)
        if "intent" in schema.get("properties", {}):
            return {"intent": "goal", "domain": "학습", "what": "알고리즘 문제 풀기"}
        return {"action": "clarify", "clarify_question": "어느 칸에 담을까요?"}


@pytest.fixture
def no_sleep(monkeypatch: pytest.MonkeyPatch) -> list[float]:
    """`asyncio.sleep` 을 기록으로 바꿉니다.

    실제로 재우면 테스트가 대기 시간만큼 느려지는데, 확인하려는 것은 **얼마를
    기다리기로 했는지**입니다. 값을 기록하면 상수를 낮추지 않고도 검증됩니다.
    """
    waits: list[float] = []

    async def fake(seconds: float) -> None:
        waits.append(seconds)

    monkeypatch.setattr(asyncio, "sleep", fake)
    return waits


# -- _post 층 ---------------------------------------------------------------


def _backend(handler) -> GeminiBackend:
    backend = GeminiBackend(
        Settings(bot_provider="gemini", bot_api_key="k", bot_default_model="m")
    )
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return backend


@pytest.mark.parametrize(
    ("status", "expected"),
    [
        (429, LlmRateLimitedError),
        (400, LlmError),
        (401, LlmError),
        (500, LlmError),
        # 503 은 일부러 갈라내지 않았습니다 — 원인이 "몰림" 이 아니라 "내려감" 이라
        # 사용자에게 할 말이 다릅니다(`LlmRateLimitedError` docstring).
        (503, LlmError),
    ],
)
async def test_only_429_becomes_a_rate_limit_error(status: int, expected: type) -> None:
    backend = _backend(lambda r: httpx.Response(status, json={"message": "boom"}))
    try:
        with pytest.raises(expected) as caught:
            await backend.reply_json("s", [], {"properties": {}})
        if expected is LlmError:
            # 갈라내지 않은 코드는 원문을 그대로 실어야 한다 — 키 오류·할당량은
            # 사용자가 원인을 봐야 합니다(`LLM_FAILURE_PREFIX` 주석).
            assert not isinstance(caught.value, LlmRateLimitedError)
            assert str(status) in str(caught.value)
    finally:
        await backend.aclose()


@pytest.mark.parametrize(
    ("header", "expected"),
    [
        (None, None),
        ("2", 2.0),
        ("0", 0.0),
        # 규격에 있는 HTTP 날짜 형식은 읽지 않습니다. 못 읽으면 호출부 기본값으로.
        ("Wed, 21 Oct 2026 07:28:00 GMT", None),
        ("-5", None),
        ("", None),
    ],
)
async def test_retry_after_header_is_read_as_seconds(
    header: str | None, expected: float | None
) -> None:
    headers = {} if header is None else {"Retry-After": header}
    backend = _backend(lambda r: httpx.Response(429, json={}, headers=headers))
    try:
        with pytest.raises(LlmRateLimitedError) as caught:
            await backend.reply_json("s", [], {"properties": {}})
        assert caught.value.retry_after == expected
    finally:
        await backend.aclose()


# -- _step 층 ---------------------------------------------------------------


async def test_a_burst_is_survived_by_retrying_once(no_sleep: list[float]) -> None:
    """1단계가 429 를 한 번 맞아도 파이프라인은 끝까지 간다."""
    backend = FlakyBackend(fail_times=1)
    pipeline = GoalPipeline(SETTINGS, backend)

    result = await pipeline.run([Turn(role="user", text=UTTERANCE)], SHEET)

    assert result.stages == ["classify", "retrieve", "decide"]
    # 1단계 429 -> 재시도 성공(2회) + 3단계 1회.
    assert backend.calls == 3
    assert no_sleep == [RATE_LIMIT_WAIT_SECONDS]


async def test_retrying_is_not_repeated_forever(no_sleep: list[float]) -> None:
    """**재시도는 한 번뿐입니다.** 두 번 연속 429 면 올려서 사용자에게 알립니다.

    무한 재시도로 두면 몰릴 때 우리가 몰림을 키웁니다 — 게이트웨이가 이미
    "그만" 이라고 말한 상태입니다.
    """
    backend = FlakyBackend(fail_times=2)
    pipeline = GoalPipeline(SETTINGS, backend)

    with pytest.raises(LlmRateLimitedError):
        await pipeline.run([Turn(role="user", text=UTTERANCE)], SHEET)

    assert backend.calls == 2
    assert no_sleep == [RATE_LIMIT_WAIT_SECONDS]


async def test_the_servers_own_wait_is_honoured(no_sleep: list[float]) -> None:
    """`Retry-After` 가 오면 우리 기본값 대신 그 값을 기다린다."""
    wait = MAX_RATE_LIMIT_WAIT_SECONDS - 0.5
    backend = FlakyBackend(fail_times=1, retry_after=wait)
    pipeline = GoalPipeline(SETTINGS, backend)

    await pipeline.run([Turn(role="user", text=UTTERANCE)], SHEET)

    assert no_sleep == [wait]


async def test_a_long_wait_is_refused_instead_of_slept(no_sleep: list[float]) -> None:
    """긴 `Retry-After` 는 따르지 않고 즉시 올린다.

    기다리면 `BOT_TIMEOUT_SECONDS` 가 먼저 터져 사용자는 타임아웃 문구를 보게 되고,
    **"몰렸다" 는 원인이 사라집니다.** 빨리 실패해서 원인을 남기는 편이 낫습니다.
    """
    backend = FlakyBackend(
        fail_times=1, retry_after=MAX_RATE_LIMIT_WAIT_SECONDS + 1
    )
    pipeline = GoalPipeline(SETTINGS, backend)

    with pytest.raises(LlmRateLimitedError):
        await pipeline.run([Turn(role="user", text=UTTERANCE)], SHEET)

    assert backend.calls == 1, "재시도하지 않아야 한다"
    assert no_sleep == [], "기다리지도 않아야 한다"


async def test_truncation_retry_still_does_not_sleep(no_sleep: list[float]) -> None:
    """잘림 재시도는 **기다리지 않습니다** — 429 와 성격이 달라 즉시 다시 부릅니다."""

    class TruncatedOnce:
        name = "truncated"

        def __init__(self) -> None:
            self.calls = 0

        async def reply_json(self, system, history, schema, *, max_output_tokens=None):
            self.calls += 1
            if self.calls == 1:
                raise LlmTruncatedError("잘렸습니다")
            if "intent" in schema.get("properties", {}):
                return {"intent": "goal", "domain": "학습", "what": "알고리즘"}
            return {"action": "clarify", "clarify_question": "q"}

    backend = TruncatedOnce()
    await GoalPipeline(SETTINGS, backend).run([Turn(role="user", text=UTTERANCE)], SHEET)

    assert backend.calls == 3
    assert no_sleep == []


# -- Conversation 층 --------------------------------------------------------


async def test_the_user_is_told_it_is_busy_not_shown_the_json(
    no_sleep: list[float],
) -> None:
    """**게이트웨이 응답 본문이 채팅으로 나가면 안 된다.**

    다른 `LlmError` 는 원문을 그대로 보여줍니다 — 키 오류·할당량은 사용자가 원인을
    봐야 하기 때문입니다. 혼잡은 예외입니다: 할 수 있는 일이 기다리는 것뿐이라
    JSON 을 보여줘도 도움이 안 됩니다.
    """
    backend = FlakyBackend(fail_times=99)
    conv = Conversation(
        GoalPipeline(SETTINGS, backend), timeout_seconds=20.0
    )
    conv.set_domains(SHEET)

    reply, result = await conv.respond(UTTERANCE)

    assert reply == BUSY_REPLY
    assert result is None
    assert "quota" not in reply and "429" not in reply


async def test_a_burst_does_not_poison_the_next_turn(no_sleep: list[float]) -> None:
    """혼잡으로 실패한 턴이 히스토리에 그대로 남으면 다음 턴 맥락이 오염된다."""
    backend = FlakyBackend(fail_times=99)
    conv = Conversation(
        GoalPipeline(SETTINGS, backend), timeout_seconds=20.0
    )
    conv.set_domains(SHEET)

    await conv.respond(UTTERANCE)

    assert not any("quota" in turn.text for turn in conv._history)
