"""모델별 요청 큐 — **한도를 넘기기 전에 조입니다.**

429 를 맞고 물러나는 것만으로는 부족했습니다(실사용 관측). 한도를 계속 넘기는
상황에서는 요청이 거의 전부 튕기고, 게다가 `_step` 의 자체 재시도가 붙어 한 케이스가
태우는 요청이 두 배가 됩니다.
"""
from __future__ import annotations

import asyncio

import pytest

from mandarin_goal.bot.llm import LlmRateLimitedError
from mandarin_goal.bot.ratelimit import (
    HALF_LIFE,
    MAX_INTERVAL,
    ModelQueue,
    paced,
    queue_for,
    reset,
)


@pytest.fixture(autouse=True)
def _clean():
    reset()
    yield
    reset()


async def test_requests_leave_one_at_a_time_in_order():
    """FIFO 이고 **동시에 두 건이 나가지 않는다.**

    순서가 섞이면 골든셋의 진행률 로그와 실제 실행 순서가 갈려서, 어디서 멈췄는지
    읽을 수 없게 됩니다.
    """
    queue = ModelQueue("m", rpm=0)          # 간격 0 — 직렬화만 봅니다
    running = 0
    peak = 0
    order: list[int] = []

    async def job(n: int) -> int:
        nonlocal running, peak
        running += 1
        peak = max(peak, running)
        await asyncio.sleep(0.01)
        order.append(n)
        running -= 1
        return n

    results = await asyncio.gather(*(queue.run(lambda n=n: job(n)) for n in range(5)))

    assert results == [0, 1, 2, 3, 4]
    assert order == [0, 1, 2, 3, 4], "순서가 섞였습니다"
    assert peak == 1, f"동시에 {peak}건이 나갔습니다 — 직렬화가 안 됩니다"


async def test_the_interval_is_actually_waited():
    """분당 건수가 실제 대기로 이어지는가."""
    queue = ModelQueue("m", rpm=600)        # 0.1초 간격
    assert queue.interval == pytest.approx(0.1)

    started = asyncio.get_running_loop().time()
    await asyncio.gather(*(queue.run(_ok) for _ in range(3)))
    elapsed = asyncio.get_running_loop().time() - started

    # 3건이면 간격이 두 번 이상 들어갑니다(첫 건은 즉시 나갈 수 있음).
    assert elapsed >= 0.2, f"{elapsed:.3f}초 만에 3건이 나갔습니다 — 간격이 안 걸렸습니다"


async def _ok() -> str:
    return "ok"


#: 간격 조절은 `_observe()` 를 **직접 불러** 검사합니다.
#:
#: `run()` 으로 돌리면 벌어진 간격만큼 테스트가 실제로 잡니다 — 상한(30초)까지 가는
#: 경로를 그렇게 재면 이 파일 하나가 몇 분씩 걸립니다. 조절 규칙은 순수 계산이라
#: 큐를 돌리지 않고도 그대로 검증됩니다.
def _rate_limited() -> LlmRateLimitedError:
    return LlmRateLimitedError("429")


def test_a_429_widens_the_interval_and_time_narrows_it():
    """**적응형.** 등급마다 한도가 달라 고정 간격으로는 맞출 수 없습니다."""
    queue = ModelQueue("m", rpm=60)         # 기준 1초
    base = queue.interval

    queue._observe(_rate_limited(), now=0.0)
    widened = queue.interval
    assert widened > base, "429 를 맞고도 간격이 그대로입니다"

    # 반감기만큼 지나면 절반입니다.
    queue._observe(None, now=HALF_LIFE)
    assert queue.interval == pytest.approx(widened / 2)

    # 충분히 지나면 기준으로 돌아옵니다 — 기준 아래로는 안 내려갑니다.
    queue._observe(None, now=HALF_LIFE * 20)
    assert queue.interval == base, "기준 아래로 내려가면 한도를 다시 넘깁니다"


def test_recovery_is_bound_by_the_clock_not_the_request_count():
    """**이 파일에서 가장 중요한 검사입니다.**

    예전에는 성공 한 건당 5%(`NARROW=0.95`)씩 좁혔습니다. 그 규칙이면 상한(30초)에서
    기준(6초)으로 돌아오는 데 `log(6/30)/log(0.95) ≈ 31건`이 필요한데, eval 은
    **케이스 하나가 모델당 요청을 1건**만 냅니다 — 골든셋 52건 중 31건, 그것도 30초
    간격이라 15분입니다. 사실상 한 번 벌어지면 실행이 끝날 때까지 안 좁혀졌고,
    증상은 "429 는 잠깐인데 실행이 30분 걸린다" 였습니다.

    그래서 **요청 수가 적어도 시간이 지나면 복구돼야** 합니다. 실측(이 검사)으로
    관측 11건 · 141초입니다.
    """
    #: 예전 규칙(`NARROW=0.95`)이 같은 구간을 복구하는 데 필요했던 관측 수.
    #: `log(6/30) / log(0.95)`. 새 규칙은 이보다 **훨씬** 적어야 의미가 있습니다.
    old_rule = 32

    queue = ModelQueue("m", rpm=10)         # 기준 6초 (eval 기본값)

    now = 0.0
    while queue.interval < MAX_INTERVAL:    # 429 를 맞아 상한까지 벌어진 상태
        queue._observe(_rate_limited(), now=now)
    assert queue.interval == MAX_INTERVAL

    observations = 0
    while queue.interval > queue._base:
        now += queue.interval               # 다음 요청은 벌어진 간격만큼 뒤에 나갑니다
        queue._observe(None, now=now)
        observations += 1

    assert observations < old_rule / 2, (
        f"복구에 관측 {observations}건 — 예전 규칙({old_rule}건)과 크게 다르지 않습니다. "
        "여전히 요청 수에 매여 있습니다"
    )
    # 상한을 반감기의 배수로 답니다. `HALF_LIFE` 를 고치면 이 기대도 같이 움직여야
    # 하는 값이라, 숫자를 따로 적으면 다음 편집자가 둘을 갈라 놓습니다.
    assert now <= 3 * HALF_LIFE, f"복구에 {now:.0f}초 — 실행 시간을 통째로 먹습니다"


def test_narrowing_does_not_depend_on_how_many_successes_were_seen():
    """같은 시각이면 관측을 몇 번 했든 같은 간격.

    누적 방식(직전 값에 계수를 곱하기)이면 관측이 잦은 구간에서 더 빨리 좁혀져,
    복구 속도가 요청 빈도에 따라 달라집니다. 고정점에서 다시 계산하기 때문에
    간격은 **경과 시간만의 함수**입니다.
    """
    once = ModelQueue("m", rpm=60)
    many = ModelQueue("m", rpm=60)

    for queue in (once, many):
        queue._observe(_rate_limited(), now=0.0)

    once._observe(None, now=30.0)
    for tick in range(1, 31):               # 같은 30초 동안 관측만 30배
        many._observe(None, now=float(tick))

    assert many.interval == pytest.approx(once.interval)


def test_other_errors_do_not_widen_the_interval():
    """키 오류·잘림은 속도와 무관합니다. 그것까지 세면 키가 틀린 날 30초까지 벌어집니다."""
    from mandarin_goal.bot.llm import LlmError

    queue = ModelQueue("m", rpm=60)
    base = queue.interval

    for _ in range(3):
        queue._observe(LlmError("BOT_API_KEY 가 비어 있습니다"))

    assert queue.interval == base


def test_the_interval_is_capped():
    """아무리 맞아도 상한을 넘지 않습니다 — 넘어가면 큐가 아니라 설정 문제입니다."""
    queue = ModelQueue("m", rpm=60)

    for _ in range(20):
        queue._observe(_rate_limited())

    assert queue.interval <= MAX_INTERVAL


def test_a_queue_with_no_limit_still_reacts_to_a_429():
    """`rpm=0`(제한 없음)이어도 429 를 맞으면 간격이 생겨야 합니다.

    한도를 모른 채 시작하는 경우가 정상입니다 — 맞아 보고 배우는 것이 이 큐의 요점입니다.
    """
    queue = ModelQueue("m", rpm=0)
    assert queue.interval == 0.0

    queue._observe(_rate_limited())
    assert queue.interval > 0.0


def test_a_queue_with_no_limit_settles_back_to_no_limit():
    """`rpm=0` 에서 벌어진 간격은 **정확히 0 으로** 돌아옵니다.

    지수 감쇠는 목표에 영원히 도달하지 않아서, 그냥 두면 0.0001초처럼 의미 없는 값이
    남습니다. "제한 없음" 이 아니라 "아주 조금 제한됨" 상태로 굳는 것이라
    `SETTLE` 이 붙여 줍니다.
    """
    queue = ModelQueue("m", rpm=0)
    queue._observe(_rate_limited(), now=0.0)
    assert queue.interval > 0

    queue._observe(None, now=HALF_LIFE * 20)
    assert queue.interval == 0.0


async def test_paced_reports_whether_anything_is_actually_throttling():
    """`paced()` 는 **설정이 켜졌는가가 아니라 지금 조이고 있는가**를 답합니다.

    `evals/runner.py` 의 `_with_backoff` 가 자기 백오프를 얹을지 이 값으로 정합니다.
    `rpm=0` 이어도 429 를 맞으면 간격이 생기므로(위 검사), 설정만 보면 그 상태를
    놓치고 큐 대기 위에 백오프를 또 쌓습니다.
    """
    assert paced() is False, "큐가 없는데 조이고 있다고 답했습니다"

    queue = queue_for("gemini-2.5-flash", 0)    # 제한 없음으로 시작
    assert paced() is False

    queue._observe(_rate_limited(), now=0.0)    # 맞아 보고 배운 뒤
    assert paced() is True


async def test_models_get_separate_queues():
    """**모델별로 나눕니다.** 한도가 모델마다 걸리는데 하나로 묶으면 둘을 합친
    속도로 조여져, `classify` 가 `decide` 의 대기에 묶입니다."""
    fast = queue_for("gemini-2.5-flash", 60)
    lite = queue_for("gemini-2.5-flash-lite", 60)

    assert fast is not lite
    assert fast is queue_for("gemini-2.5-flash", 60), "같은 모델은 큐를 공유해야 합니다"

    fast._observe(_rate_limited())
    assert lite.interval < fast.interval, "한 모델의 429 가 다른 모델을 조였습니다"


async def test_a_cancelled_caller_does_not_burn_quota():
    """호출부가 포기했으면 요청을 보내지 않습니다.

    아무도 안 읽는 응답에 한도를 태우면, 타임아웃이 난 뒤 오히려 더 밀립니다.
    """
    queue = ModelQueue("m", rpm=300)        # 0.2초 간격 — 두 번째는 대기에 걸립니다
    sent = 0

    async def job():
        nonlocal sent
        sent += 1
        return "ok"

    first = asyncio.create_task(queue.run(job))
    second = asyncio.create_task(queue.run(job))
    await asyncio.sleep(0.05)               # 첫 건이 나가고 둘째가 대기에 걸릴 만큼
    second.cancel()

    await first
    with pytest.raises(asyncio.CancelledError):
        await second

    await asyncio.sleep(0.4)                # 둘째 차례가 지나가도록
    assert sent == 1, f"취소된 요청이 {sent - 1}건 나갔습니다"


# -- 큐 대기 ↔ 단계 타임아웃 ------------------------------------------------
#
# 위 검사들은 큐 하나만 봅니다. 아래는 **큐와 `_step` 의 타임아웃이 만나는 자리**로,
# 2026-08-04 에 골든셋 실행이 26건에서 통째로 죽은 원인입니다.


def _pipeline(rpm: float, step_timeout: float, delay: float):
    """`reply_json` 이 `delay` 초 걸리는 파이프라인. 그 지연이 큐 대기를 흉내냅니다."""
    from mandarin_goal.bot.goal import GoalPipeline
    from mandarin_goal.config import Settings

    class Slow:
        name = "slow"

        async def reply_json(self, system, history, schema, *, max_output_tokens=None, **_):
            await asyncio.sleep(delay)
            return {"intent": "goal"}

        async def aclose(self) -> None:
            return None

    settings = Settings(
        bot_mode="goal",
        bot_provider="echo",
        bot_classify_model=None,
        bot_decide_model=None,
        bot_max_rpm=rpm,
        bot_step_timeout_seconds=step_timeout,
    )
    return GoalPipeline(settings, Slow())


async def test_the_queue_wait_does_not_eat_the_step_budget():
    """큐가 켜져 있으면 단계 예산에 **송신 대기만큼 여유**가 붙는다.

    붙지 않으면 이렇게 됩니다 — 429 로 간격이 벌어져 단계 타임아웃을 넘기는 순간,
    요청은 보내지기도 전에 취소되고(`_pump` 가 취소된 건은 보내지 않습니다) 성공을
    관측할 일이 없어 간격이 좁혀지지 않습니다. 한 방향 톱니바퀴라 그 뒤의 모든
    호출이 같은 자리에서 죽고, 재실행으로도 풀리지 않습니다.
    """
    pipeline = _pipeline(rpm=10, step_timeout=0.2, delay=0.5)
    # 0.5초는 단계 타임아웃(0.2초)보다 길지만 `MAX_INTERVAL` 여유 안이라 통과해야 한다.
    out = await pipeline._attempt("classify", lambda: _call(pipeline))
    assert out == {"intent": "goal"}


async def test_without_the_queue_the_budget_is_unchanged():
    """큐가 꺼져 있으면(실사용 경로의 기본값) 예전과 똑같이 단계 타임아웃에서 끊는다."""
    from mandarin_goal.bot.llm import LlmError

    pipeline = _pipeline(rpm=0, step_timeout=0.2, delay=0.5)
    with pytest.raises(LlmError, match="넘겼습니다"):
        await pipeline._attempt("classify", lambda: _call(pipeline))


def _call(pipeline):
    """`_attempt` 가 받는 모양(코루틴을 만드는 함수)으로 감쌉니다."""
    return pipeline._classify_backend.reply_json("sys", [], {"type": "object"})


def test_the_queue_ceiling_is_visible_to_the_pipeline():
    """`MAX_INTERVAL` 을 `goal.py` 가 **직접 읽습니다.**

    두 값을 따로 적어 두면 한쪽만 고치는 날 다시 같은 교착이 생깁니다.
    """
    from mandarin_goal.bot.goal import QUEUE_MAX_INTERVAL

    assert QUEUE_MAX_INTERVAL == MAX_INTERVAL
