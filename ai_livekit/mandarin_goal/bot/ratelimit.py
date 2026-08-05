"""모델별 요청 큐 — **429 를 맞고 물러나는 대신 애초에 넘치지 않게 보냅니다.**

백오프만으로는 부족했습니다. 한도를 계속 넘기는 상황에서는 요청이 거의 전부 429 로
튕기고, 물러났다가 다시 밀어붙이기를 반복합니다. 게다가 `_step` 이 자체 재시도를
한 번 더 하므로 **한 케이스가 태우는 요청이 두 배**가 됩니다(`tests/test_eval_scoring.py`
의 `test_the_backoff_actually_retries` 가 12회로 못 박아 둔 값).

    호출부 ──put──▶ [ 모델별 FIFO ] ──worker(간격 유지)──▶ 실제 HTTP

**모델별로 나눕니다.** 한도는 모델마다 걸리는데, `classify` 는 `gemini-2.5-flash`,
`decide` 는 `gemini-2.5-flash-lite` 로 서로 다른 예산을 씁니다. 하나로 묶으면 둘을
합친 속도로 조이게 되어 멀쩡한 쪽까지 느려집니다.

**적응형입니다.** 등급마다 한도가 다르고 바뀌기도 해서, 고정 간격은 무료 등급에
맞추면 유료 등급에서 5배 느려지고 유료에 맞추면 무료에서 계속 튕깁니다. 429 를
만나면 간격을 벌리고, 429 가 잠잠해지면 시간에 따라 좁힙니다 — **두 방향의 시계가
다릅니다**(`WIDEN`·`HALF_LIFE` 주석). 벌리는 쪽은 429 라는 사건이 신호이고, 좁히는
쪽은 요청 수로 재면 요청이 드문 실행에서 영원히 복구되지 않습니다.

**기본은 꺼져 있습니다**(`BOT_MAX_RPM=0`). 실사용 경로는 방 하나에 사용자 한 명이라
요청이 몰리지 않고, 큐를 끼우면 방들이 서로의 대기에 묶입니다. 켜는 것은 명시적
선택이어야 합니다 — eval 처럼 한 번에 수십 건을 밀어 넣는 쪽만 켭니다.
"""
from __future__ import annotations

import asyncio
import logging
import time
from collections.abc import Awaitable, Callable
from typing import Any

logger = logging.getLogger(__name__)

#: 429 를 맞을 때마다 간격에 곱하는 값. 두 배씩 벌립니다.
WIDEN = 2.0

#: 벌어진 간격이 절반으로 줄어드는 데 걸리는 시간(초). **요청 수가 아니라 시계로
#: 좁힙니다.**
#:
#: 예전에는 성공 한 건당 5% 씩(`NARROW=0.95`) 좁혔습니다. 그 값이 틀렸다기보다
#: **시계를 잘못 골랐습니다** — 좁히는 속도가 "성공한 요청 수" 에 매여 있는데,
#: eval 은 케이스 하나가 모델당 요청을 **딱 1건** 냅니다. 상한(30초)에서 기준(6초)
#: 으로 돌아오려면
#:
#:     log(6/30) / log(0.95) ≈ 31건
#:
#: 즉 골든셋 52건 중 31건이 필요하고, 그 31건이 30초 간격으로 나가므로 **15분**입니다.
#: 사실상 한 번 벌어지면 그 실행이 끝날 때까지 안 좁혀졌습니다. 관측된 증상이
#: "429 는 잠깐인데 실행이 30분씩 걸린다" 였고, 원인이 이것입니다.
#:
#: 시간 기반이면 복구가 요청 수와 무관합니다. 30초 → 6초가 `60 × log2(5) ≈ 139초`,
#: 요청 7건이면 끝납니다. **진동 방지 성질은 그대로입니다** — 기준으로 점프하지 않고
#: 여전히 조금씩 내려가며 재봅니다.
HALF_LIFE = 60.0

#: 기준과 이만큼 이내로 가까워지면 그냥 기준에 붙입니다.
#:
#: 지수 감쇠는 목표에 영원히 도달하지 않습니다. `rpm=0`(기준 0초)일 때 특히 고약해서,
#: 간격이 0.0001초처럼 의미 없는 값으로 남아 "제한 없음" 상태로 안 돌아갑니다.
SETTLE = 0.05

#: 아무리 벌려도 이 이상은 기다리지 않습니다. 넘어가면 큐가 아니라 한도 설정 문제입니다.
MAX_INTERVAL = 30.0


class ModelQueue:
    """모델 하나에 대한 요청 큐. **호출 순서를 지킵니다**(FIFO).

    워커 하나가 꺼내서 실행하므로 동시에 두 요청이 나가지 않습니다. 호출부는 자기
    차례가 올 때까지 `await` 로 기다립니다 — 큐에 넣고 잊는 방식이 아닙니다.
    응답을 받아야 다음 단계로 갈 수 있어서, 결과를 돌려주지 않으면 쓸 수 없습니다.
    """

    def __init__(self, model: str, rpm: float) -> None:
        self.model = model
        #: 기준 간격. 여기서 아래로는 내려가지 않습니다.
        self._base = 60.0 / rpm if rpm > 0 else 0.0
        self._interval = self._base
        self._queue: asyncio.Queue = asyncio.Queue()
        self._worker: asyncio.Task | None = None
        self._last_sent = 0.0
        #: 마지막 429 직후의 간격과 그 시각. 감쇠를 **이 고정점에서 다시 계산**합니다.
        #:
        #: 직전 값에 계수를 곱해 나가는 방식(누적)과 다릅니다. 누적이면 성공을 몇 번
        #: 관측했는지에 결과가 매여서, 요청이 드문 구간과 잦은 구간의 복구 속도가
        #: 달라집니다. 고정점에서 다시 계산하면 값이 **경과 시간만의 함수**라
        #: 관측 횟수와 무관하고 재현도 됩니다.
        self._peak = self._base
        self._widened_at = 0.0

    @property
    def interval(self) -> float:
        return self._interval

    def depth(self) -> int:
        return self._queue.qsize()

    async def run(self, factory: Callable[[], Awaitable[Any]]) -> Any:
        """`factory()` 가 만드는 코루틴을 차례가 오면 실행하고 결과를 돌려줍니다.

        코루틴이 아니라 **만드는 함수**를 받는 이유는 `_step` 과 같습니다 — 코루틴은
        두 번 await 할 수 없어서, 큐에 담아 두었다가 실행하려면 그 자리에서 만들어야
        합니다.
        """
        loop = asyncio.get_running_loop()
        future: asyncio.Future = loop.create_future()
        await self._queue.put((factory, future))
        if self._worker is None or self._worker.done():
            self._worker = loop.create_task(self._pump(), name=f"ratelimit-{self.model}")
        return await future

    async def _pump(self) -> None:
        while True:
            try:
                factory, future = self._queue.get_nowait()
            except asyncio.QueueEmpty:
                return  # 할 일이 없으면 워커를 끝냅니다. 다음 `run()` 이 다시 띄웁니다.

            await self._wait_turn()

            if future.cancelled():
                # 호출부가 이미 포기했습니다(타임아웃 등). 요청을 보내지 않습니다 —
                # 아무도 안 읽는 응답에 한도를 태울 이유가 없습니다.
                self._queue.task_done()
                continue

            try:
                result = await factory()
            except Exception as exc:  # noqa: BLE001 - 호출부에 그대로 전달합니다
                self._observe(exc)
                if not future.cancelled():
                    future.set_exception(exc)
            else:
                self._observe(None)
                if not future.cancelled():
                    future.set_result(result)
            finally:
                self._queue.task_done()

    async def _wait_turn(self) -> None:
        if self._interval <= 0:
            return
        wait = self._last_sent + self._interval - time.monotonic()
        if wait > 0:
            await asyncio.sleep(wait)
        self._last_sent = time.monotonic()

    def _observe(self, exc: Exception | None, *, now: float | None = None) -> None:
        """결과를 보고 간격을 조절합니다.

        `LlmRateLimitedError` 만 봅니다. 다른 실패(키 오류·잘림)는 속도와 무관해서,
        그것까지 세면 키가 틀린 날 간격이 30초까지 벌어집니다.

        **벌리는 것은 사건 기준, 좁히는 것은 시계 기준입니다**(`HALF_LIFE` 주석).
        429 는 그 자체가 신호라 즉시 두 배로 벌리고, 복구는 마지막 429 로부터 얼마나
        지났는지로만 정합니다 — 성공을 몇 건 관측했는지는 보지 않습니다.

        `now` 는 테스트용입니다. 감쇠가 시간의 함수가 된 뒤로는 값을 주입하지 않으면
        실제로 몇 분을 자야 검증되는데, 규칙 자체는 순수 계산이라 그럴 이유가 없습니다.
        """
        from mandarin_goal.bot.llm import LlmRateLimitedError

        now = time.monotonic() if now is None else now

        if isinstance(exc, LlmRateLimitedError):
            before = self._interval
            # `_base` 가 0(=제한 없음)이어도 429 를 맞으면 간격이 생겨야 합니다.
            self._interval = min(MAX_INTERVAL, max(self._interval, 0.5) * WIDEN)
            self._peak = self._interval
            self._widened_at = now
            logger.warning(
                "%s 429 — 요청 간격을 %.2f초 → %.2f초 로 벌립니다 (대기 %d건)",
                self.model, before, self._interval, self.depth(),
            )
        elif exc is None and self._interval > self._base:
            elapsed = max(0.0, now - self._widened_at)
            relaxed = max(self._base, self._peak * 0.5 ** (elapsed / HALF_LIFE))
            if relaxed - self._base < SETTLE:
                relaxed = self._base
            if relaxed < self._interval:
                logger.info(
                    "%s 간격을 %.2f초 → %.2f초 로 좁힙니다 (429 이후 %.0f초)",
                    self.model, self._interval, relaxed, elapsed,
                )
            self._interval = relaxed


#: 실행 중인 이벤트 루프별·모델별 큐. **루프를 키에 넣는 것이 중요합니다** — eval 은
#: `run_eval()` 마다 `asyncio.run()` 으로 새 루프를 띄우는데, 죽은 루프에 매인 `Queue`
#: 를 재사용하면 `got Future attached to a different loop` 로 죽습니다.
_QUEUES: dict[tuple[int, str], ModelQueue] = {}


def queue_for(model: str, rpm: float) -> ModelQueue:
    key = (id(asyncio.get_running_loop()), model)
    existing = _QUEUES.get(key)
    if existing is None:
        existing = ModelQueue(model, rpm)
        _QUEUES[key] = existing
        if rpm > 0:
            logger.info("%s 요청 큐: 분당 %.0f건 (간격 %.2f초)", model, rpm, existing.interval)
    return existing


def paced() -> bool:
    """지금 이 루프에서 **간격을 두고 나가는 큐가 하나라도 있는지.**

    호출부가 자기 백오프를 얹을지 말지 정하는 데 씁니다(`evals/runner.py` 의
    `_with_backoff`). 큐가 이미 429 를 보고 간격을 벌려 놓았다면 그 위에 대기를 또
    쌓는 것은 **같은 몰림에 두 번 값을 내는 것**입니다.

    `interval > 0` 을 보는 이유는 `rpm=0` 이어도 429 를 맞으면 간격이 생기기 때문입니다
    (`_observe`). "설정이 켜졌는가" 가 아니라 "지금 실제로 조이고 있는가" 를 묻습니다.
    """
    loop_id = id(asyncio.get_running_loop())
    return any(
        queue.interval > 0 for (queue_loop, _), queue in _QUEUES.items()
        if queue_loop == loop_id
    )


def reset() -> None:
    """테스트 격리용. 루프가 바뀌어도 키가 달라 섞이지는 않지만, 적응된 간격이
    다음 테스트로 새는 것을 막습니다."""
    _QUEUES.clear()
