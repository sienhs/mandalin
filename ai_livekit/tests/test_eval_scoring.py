"""429 가 **오답으로 채점되지 않는가.**

이 파일이 존재하는 이유는 예전 동작입니다. 호출이 실패하면 러너가 `action=None` 으로
기록했고, 채점이 `None in ["generate"]` → `False` 로 접어 **오답 한 건**을 세었습니다.
429 를 여섯 번 맞으면 정확도가 여섯 건만큼 내려갔고, 프롬프트는 멀쩡한데 게이트웨이가
붐볐다는 이유로 점수가 깎였습니다.

증상이 없는 종류라 테스트가 필요합니다 — 에러도 경고도 없고, 그냥 그날 점수가 낮게
나옵니다. 재현도 안 됩니다(다음날 한도가 여유로우면 점수가 올라갑니다).

**API 를 부르지 않습니다.** 백엔드가 429 를 던지게 해서 같은 경로를 태웁니다.
"""
from __future__ import annotations

import pytest

from evals.runner import RETRY_WAITS
from mandarin_goal.bot.llm import LlmRateLimitedError, LlmTruncatedError


class AlwaysRateLimited:
    """모든 호출이 429. `_with_backoff` 가 다 쓰고 포기하는 경로를 봅니다."""

    name = "429"

    def __init__(self) -> None:
        self.calls = 0

    async def reply_json(self, system, history, schema, *, max_output_tokens=None):
        self.calls += 1
        raise LlmRateLimitedError("429: quota", retry_after=None)

    async def aclose(self) -> None:
        return None


class RateLimitedOnce:
    """첫 호출만 429, 그 뒤로는 정상. 재시도가 실제로 복구하는지 봅니다."""

    name = "429-once"

    def __init__(self) -> None:
        self.calls = 0

    async def reply_json(self, system, history, schema, *, max_output_tokens=None):
        self.calls += 1
        if self.calls == 1:
            raise LlmRateLimitedError("429: burst", retry_after=None)
        if "intent" in schema.get("properties", {}):
            return {"intent": "goal", "domain": "건강", "what": "물 마시기"}
        return {"action": "generate", "domain": "건강",
                "generated_tasks": [{"title": "매일 물 한 잔", "frequency": "daily",
                                     "description": "설명"}]}

    async def aclose(self) -> None:
        return None


@pytest.fixture(autouse=True)
def _no_waiting(monkeypatch):
    """대기를 0 으로. **두 군데**를 다 꺼야 합니다.

    러너의 백오프뿐 아니라 `_step` 안에도 429 대기(1초)가 따로 있습니다. 그쪽을 안
    끄면 이 파일 하나가 10초 넘게 잡힙니다.
    """
    import evals.runner as runner
    import mandarin_goal.bot.goal as goal

    monkeypatch.setattr(runner, "RETRY_WAITS", tuple(0.0 for _ in RETRY_WAITS))
    monkeypatch.setattr(goal, "RATE_LIMIT_WAIT_SECONDS", 0.0)


def _run(backend, monkeypatch, case_ids=("g01",)):
    import evals.runner as runner

    monkeypatch.setattr(runner, "build_backend", lambda _settings: backend)

    # **단계 모델을 비워야 주입한 백엔드가 두 단계 모두에 쓰입니다.** `.env` 에
    # `BOT_DECIDE_MODEL` 이 있으면 `GoalPipeline._stage_backend()` 가 그 단계용
    # 백엔드를 **직접 만들어** 우리가 넣은 것을 무시합니다 — 3단계만 조용히 다른
    # 백엔드로 돌아 테스트가 개발자의 `.env` 에 따라 흔들립니다.
    real = runner.build_settings
    monkeypatch.setattr(
        runner,
        "build_settings",
        lambda **kw: real(**kw).model_copy(
            update={"bot_classify_model": None, "bot_decide_model": None}
        ),
    )
    return runner.run_eval(provider="echo", only=list(case_ids))


def test_a_rate_limited_case_is_not_counted_as_a_wrong_answer(monkeypatch):
    """**핵심 회귀 테스트.** 429 는 오답이 아니라 미측정이다."""
    report = _run(AlwaysRateLimited(), monkeypatch)
    case = report["results"][0]

    assert case["measured"] is False
    assert case["intent_ok"] is None, "429 를 오답(False)으로 접으면 안 됩니다"
    assert case["action_ok"] is None

    summary = report["summary"]
    # 분모에서 빠져야 합니다. `n=1, k=0` 이면 정확도 0% 로 보고되는데, 그건
    # "틀렸다" 는 뜻이라 429 에 붙일 말이 아닙니다.
    assert summary["action_accuracy"]["n"] == 0
    assert summary["measurement"]["failed_runs"] == 1
    assert summary["measurement"]["unmeasured_cases"] == ["g01"]


def test_the_backoff_actually_retries(monkeypatch):
    """429 를 만나면 케이스를 다시 돈다 — 한 번 튕겼다고 포기하지 않는다.

    **호출 수가 시도 수의 두 배인 것이 정상입니다.** `_step` 안에도 429 재시도가
    한 번 있어서(`goal.py` 의 `RATE_LIMIT_WAIT_SECONDS`), 러너가 케이스를 한 번 돌릴
    때마다 백엔드는 두 번 맞습니다. 즉 한도에 계속 걸리는 상황에서 한 케이스가
    태우는 요청은 12회입니다 — 러너의 백오프만 세면 절반으로 잘못 잡습니다.
    """
    backend = AlwaysRateLimited()
    _run(backend, monkeypatch)

    outer = len(RETRY_WAITS) + 1          # 백오프 5회 + 마지막 재던지기
    assert backend.calls == outer * 2, (
        f"{backend.calls}회 호출됐습니다 (예상 {outer * 2}회 = 러너 {outer}회 × _step 2회)"
    )


# -- 백오프를 두 번 내지 않는가 ---------------------------------------------
#
# `RETRY_WAITS` 는 큐가 없던 시절의 간격 제어였습니다. `ratelimit.ModelQueue` 가
# 들어온 뒤로는 **같은 429 를 두 곳이 보고 각자 기다립니다** — 큐가 간격을 30초로
# 벌리고, 그 위에 러너가 32초를 더 잽니다. 케이스 하나에 62초, 그것도 재시도마다.


class _AlwaysBusy:
    """`_with_backoff` 가 받는 파이프라인 모양. 항상 429."""

    async def run(self, turns, domains):
        raise LlmRateLimitedError("429: quota", retry_after=None)


async def _backoff_waits(monkeypatch, *, is_paced: bool, retry_after=None) -> list[float]:
    """`_with_backoff` 가 **얼마를 기다리기로 했는지** 기록해 돌려줍니다."""
    import evals.runner as runner

    waits: list[float] = []

    async def record(seconds: float, stop) -> None:
        waits.append(seconds)

    monkeypatch.setattr(runner, "_sleep_or_stop", record)
    monkeypatch.setattr(runner, "paced", lambda: is_paced)
    # 자체 값을 씁니다 — autouse 픽스처가 `RETRY_WAITS` 를 0 으로 덮어 두면
    # 사다리를 쓰는 경로와 안 쓰는 경로가 구분되지 않아 검사가 무의미해집니다.
    monkeypatch.setattr(runner, "RETRY_WAITS", (1.0, 2.0))

    class Busy(_AlwaysBusy):
        async def run(self, turns, domains):
            raise LlmRateLimitedError("429: quota", retry_after=retry_after)

    with pytest.raises(LlmRateLimitedError):
        await runner._with_backoff(Busy(), {"id": "g01", "utterance": "x"}, {"default": []})
    return waits


async def test_the_backoff_is_not_paid_twice_when_the_queue_is_pacing(monkeypatch):
    """큐가 조이고 있으면 러너는 **자지 않습니다.**

    재시도는 큐에서 대기합니다 — 그쪽 대기는 적응형이라 몰림이 풀리면 알아서
    짧아지고, `_attempt` 의 예산이 이미 그만큼 감당합니다(`+MAX_INTERVAL`).
    """
    waits = await _backoff_waits(monkeypatch, is_paced=True)
    assert waits == [0.0, 0.0], f"큐 대기 위에 {waits} 를 더 얹었습니다"


async def test_the_ladder_still_applies_without_the_queue(monkeypatch):
    """`--rpm 0` 실행에는 조여 주는 것이 없으니 사다리가 그대로 필요합니다."""
    waits = await _backoff_waits(monkeypatch, is_paced=False)
    assert waits == [1.0, 2.0]


async def test_the_servers_own_number_beats_our_guess(monkeypatch):
    """게이트웨이가 대기 시간을 알려주면 그쪽이 우선입니다(사다리보다 길 때).

    이 값이 실제로 채워지려면 본문의 `RetryInfo.retryDelay` 를 읽어야 합니다 —
    Gemini 는 `Retry-After` 헤더를 주지 않습니다(`llm.py` 의 `_retry_delay`).
    """
    waits = await _backoff_waits(monkeypatch, is_paced=False, retry_after=5.0)
    assert waits == [5.0, 5.0], "서버가 5초라고 했는데 우리 추측값을 썼습니다"


def test_a_transient_429_recovers_and_scores_normally(monkeypatch):
    """몰림 한 파가 지나가면 정상 채점된다. 이게 재시도를 넣는 이유입니다."""
    report = _run(RateLimitedOnce(), monkeypatch)
    case = report["results"][0]

    assert case["measured"] is True
    assert case["action"] == "generate"
    assert case["action_ok"] is True
    assert report["summary"]["measurement"]["failed_runs"] == 0


#: **실관측입니다** (2026-08-04, g33 "담배를 매일 한 개비씩 줄여나가고 싶어").
#: 모델이 제목을 쓰다 문자열을 닫지 않고 나머지 객체를 이어 썼습니다.
LEAKED_TITLE = (
    "매일 담배 1개비 줄이기 (금연 1단계, n-1/n-10, n=10)', 'frequency': 'daily', "
    "'description': '점진적으로 흡연량을 줄여 나갑니다.'}], "
)


def test_the_real_leaked_output_is_caught():
    """**핵심 회귀 테스트.** 실제로 새어 나갔던 문자열을 잡는가.

    이 응답은 `responseSchema` 를 통과하고(JSON 모양은 맞음), `finishReason` 도 `STOP`
    이라 잘림도 아닙니다 — 기존 방어를 전부 지나 사용자 말풍선까지 갔습니다. 그리고
    `action=generate` 가 라벨과 맞아 **골든셋에서 정답으로 집계됐습니다.**
    """
    from evals.runner import inspect_output

    defects = inspect_output({
        "action": "generate",
        "domain": "건강",
        "generated_tasks": [{"title": LEAKED_TITLE, "frequency": "daily",
                             "description": "점진적으로 줄입니다"}],
    })

    assert "leak:title" in defects, "스키마 조각이 샌 제목을 못 잡았습니다"
    assert "too_long:title" in defects


def test_the_server_drops_the_polluted_task_and_keeps_the_rest():
    """②의 회귀 테스트 — 서버가 오염된 과제만 버리고 나머지는 살린다.

    **되묻기로 돌리지 않습니다.** 셋 중 하나가 깨졌다고 턴을 통째로 잃으면 멀쩡한
    둘까지 사라져 사용자가 다시 말해야 합니다.
    """
    from mandarin_goal.bot.goal import drop_polluted

    decided = {
        "action": "generate",
        "domain": "건강",
        "generated_tasks": [
            {"title": "매일 물 한 잔 마시기", "frequency": "daily", "description": "정상"},
            {"title": LEAKED_TITLE, "frequency": "daily", "description": "오염"},
            {"title": "잠들기 3시간 전 금식", "frequency": "daily", "description": "정상"},
        ],
    }
    drop_polluted(decided)

    titles = [t["title"] for t in decided["generated_tasks"]]
    assert titles == ["매일 물 한 잔 마시기", "잠들기 3시간 전 금식"]


def test_dropping_everything_falls_through_to_the_failure_message():
    """전부 오염되면 `render()` 의 기존 실패 문구로 떨어진다 — raw JSON 이 나가지 않는다."""
    from mandarin_goal.bot.goal import drop_polluted, render

    decided = {"action": "generate", "domain": "건강",
               "generated_tasks": [{"title": LEAKED_TITLE, "description": "x"}]}
    drop_polluted(decided)

    assert decided["generated_tasks"] == []
    text = render(decided)
    assert "제목을 정하지 못했습니다" in text
    assert "frequency" not in text, "오염된 문자열이 말풍선까지 갔습니다"


def test_the_eval_and_the_server_agree_on_what_is_polluted():
    """평가와 서버가 **같은 정규식**을 쓴다.

    따로 두면 "서버는 통과시켰는데 평가는 오염이라고 한다" 가 되고, 어느 쪽이 맞는지
    알 방법이 없습니다.
    """
    from evals.runner import LEAK_RE
    from mandarin_goal.bot.goal import SCHEMA_LEAK_RE

    assert LEAK_RE is SCHEMA_LEAK_RE


def test_normal_output_is_not_flagged():
    """**오탐이 없어야 합니다.** 괄호·따옴표가 든 정상 제목을 잡으면 지표가 죽습니다."""
    from evals.runner import inspect_output

    clean = inspect_output({
        "action": "generate",
        "domain": "건강",
        "generated_tasks": [
            {"title": "매일 스쿼트 50개 하기", "frequency": "daily",
             "description": "하체 근력을 기르는 기본 운동입니다"},
            {"title": "주 3회 30분 걷기 (퇴근길)", "frequency": "weekly",
             "description": "따로 시간을 내지 않고 활동량을 올립니다"},
        ],
    })
    assert clean == [], f"정상 출력을 오염으로 잡았습니다: {clean}"

    # 되묻기도 마찬가지 — 물음표·슬래시가 들어갑니다.
    assert inspect_output({
        "action": "clarify",
        "domain": "학습",
        "clarify_question": "운동 / 식단 / 학습 중 어느 칸에 담을까요?",
    }) == []


def test_length_caps_are_checked():
    """길이 상한은 프롬프트에만 있고 서버가 강제하지 않습니다 — 그래서 여기서 셉니다."""
    from evals.runner import LIMITS, inspect_output

    over = inspect_output({
        "action": "generate",
        "domain": "가" * (LIMITS["domain"] + 1),
        "generated_tasks": [{"title": "가" * (LIMITS["title"] + 1),
                             "description": "나" * (LIMITS["description"] + 1)}],
    })
    assert set(over) == {"too_long:domain", "too_long:title", "too_long:description"}


def test_a_dirty_case_still_reports_its_action_verdict():
    """오염돼도 `verdict` 는 라벨 판정 그대로다 — 두 축을 섞지 않는다.

    `verdict` 를 실패로 바꾸면 "라벨이 틀렸다" 와 "텍스트가 깨졌다" 가 한 숫자가 되어
    어느 쪽을 고쳐야 하는지 알 수 없습니다. 대신 `clean` 을 따로 둡니다.
    """
    from evals.runner import _score_case

    run = {"intent": "goal", "action": "generate", "domain": "건강", "subject_id": None,
           "error": None, "violations": [], "usage": [], "latency_ms": 1,
           "defects": ["leak:title"]}
    scored = _score_case(
        {"id": "x", "utterance": "테스트", "intent": "goal", "action": "generate"}, [run]
    )

    assert scored["verdict"] == "통과", "라벨은 맞았으므로 통과입니다"
    assert scored["clean"] is False, "출력은 오염됐으므로 clean 이 아닙니다"
    assert scored["defects"] == ["leak:title"]


class AlwaysTruncated:
    """모든 응답이 `maxOutputTokens` 에서 잘림. `_step` 이 한 번 재시도하고 포기합니다."""

    name = "truncated"

    async def reply_json(self, system, history, schema, *, max_output_tokens=None):
        raise LlmTruncatedError("응답이 토큰 상한(512)에서 잘렸습니다")

    async def aclose(self) -> None:
        return None


def test_a_truncated_response_is_not_reported_as_a_pass(monkeypatch):
    """**핵심 회귀 테스트.** 잘린 응답은 통과가 아니다.

    화면이 `intent_ok !== false && action_ok !== false` 로 판정하던 때, 미측정은 두
    값이 `None` 이라 그 식이 참이 되어 **`LlmTruncatedError` 로 한 번도 못 잰 케이스가
    "통과" 로 그려졌습니다.** 측정하지 못한 것을 통과로 보여 주는 것이 이 도구가 할 수
    있는 최악입니다 — 프롬프트가 멀쩡하다고 믿고 넘어가게 됩니다.

    그래서 판정을 러너가 냅니다(`verdict_of`). 화면은 그 값을 그리기만 합니다.
    """
    report = _run(AlwaysTruncated(), monkeypatch)
    case = report["results"][0]

    assert case["verdict"] == "미측정", "잘린 응답이 통과/실패로 잡혔습니다"
    assert case["measured"] is False
    assert case["intent_ok"] is None and case["action_ok"] is None
    assert "LlmTruncatedError" in case["runs"][0]["error"]

    # 정확도 분모에서도 빠져야 합니다 — 오답으로 세도 안 됩니다.
    assert report["summary"]["action_accuracy"]["n"] == 0
    assert report["summary"]["measurement"]["failed_runs"] == 1


def test_every_verdict_is_one_of_three(monkeypatch):
    """판정은 세 갈래뿐이고, 모든 케이스가 하나를 갖는다.

    화면이 `MARK` 표로 색을 고르므로, 여기 없는 값이 나오면 조용히 무색으로 그려집니다.
    """
    from evals.runner import verdict_of

    report = _run(RateLimitedOnce(), monkeypatch, case_ids=("g01", "g18", "g28"))
    for r in report["results"]:
        assert r["verdict"] in {"통과", "실패", "미측정"}
        assert r["verdict"] == verdict_of(r), "저장된 판정과 다시 계산한 값이 다릅니다"


def test_rerun_picks_only_the_failed_and_ambiguous():
    """`select()` 가 무엇을 고르는가. **`failed` 와 `unmeasured` 는 갈라야 합니다** —
    둘 다 "안 됐다" 지만 고칠 곳이 프롬프트와 API 한도로 정반대입니다.
    """
    from evals.runner import select

    report = {"results": [
        {"id": "ok", "intent_ok": True, "action_ok": True, "measured": True,
         "ambiguous": False, "consistency": 1.0},
        {"id": "wrong", "intent_ok": True, "action_ok": False, "measured": True,
         "ambiguous": False, "consistency": 1.0},
        {"id": "dead", "intent_ok": None, "action_ok": None, "measured": False,
         "ambiguous": False, "consistency": 0.0},
        {"id": "amb", "intent_ok": True, "action_ok": True, "measured": True,
         "ambiguous": True, "consistency": 1.0},
        {"id": "flaky", "intent_ok": True, "action_ok": True, "measured": True,
         "ambiguous": False, "consistency": 0.67},
    ]}

    assert select(report) == ["wrong", "dead", "amb"]      # 기본 세 기준
    assert select(report, ["failed"]) == ["wrong"]
    assert select(report, ["unmeasured"]) == ["dead"]
    assert select(report, ["unstable"]) == ["flaky"]
    with pytest.raises(ValueError, match="모르는 기준"):
        select(report, ["nope"])


def test_a_rerun_report_marks_itself_as_a_subset(monkeypatch):
    """부분 실행임을 리포트가 스스로 들고 다니는가.

    없으면 실패만 모아 돌린 결과의 낮은 정확도가 **전체 성적**으로 읽힙니다.
    """
    first = _run(RateLimitedOnce(), monkeypatch, case_ids=("g01", "g18"))
    assert first["meta"]["subset"] is None

    import evals.runner as runner

    monkeypatch.setattr(runner, "build_backend", lambda _s: RateLimitedOnce())
    second = runner.run_eval(provider="echo", baseline=first, pick=["ambiguous", "failed"])

    assert second["meta"]["subset"]["of"] == len(first["results"])
    assert second["meta"]["subset"]["picked"] == len(second["results"])
    # 지난 판정이 케이스마다 붙어야 "이전 → 이번" 을 그릴 수 있습니다.
    assert all("before" in r for r in second["results"])


def test_stopping_is_not_recorded_as_a_measurement_failure(monkeypatch):
    """중지는 **재지 않은 것**이지 재다가 실패한 것이 아니다.

    섞이면 중지 한 번이 429 다발로 보고되고, 화면이 "한도를 보세요" 라고 잘못 안내합니다.
    """
    import evals.runner as runner

    monkeypatch.setattr(runner, "build_backend", lambda _s: RateLimitedOnce())
    real = runner.build_settings
    monkeypatch.setattr(
        runner, "build_settings",
        lambda **kw: real(**kw).model_copy(
            update={"bot_classify_model": None, "bot_decide_model": None}),
    )

    seen: list[str] = []

    def after_first(done, total, case):
        seen.append(case["id"])

    report = runner.run_eval(
        provider="echo",
        only=["g01", "g02", "g03", "g05"],
        on_progress=after_first,
        # 첫 케이스가 끝나자마자 중지 — 두 번째 케이스 경계에서 걸립니다.
        should_stop=lambda: len(seen) >= 1,
    )

    assert report["meta"]["stopped"] is True
    assert report["meta"]["planned_cases"] == 4
    assert len(report["results"]) == 1, "중지 뒤 케이스는 결과에 없어야 합니다"
    # 중지된 케이스가 `measured=False` 로 남으면 429 와 구분이 안 됩니다.
    assert report["summary"]["measurement"]["failed_runs"] == 0
    assert report["summary"]["measurement"]["unmeasured_cases"] == []


def _run_row(pairs, **over):
    """`_score_case` 에 넣을 런 하나. `pairs` 는 (주기, 횟수) 목록입니다."""
    return {"intent": "goal", "action": "generate", "domain": None, "subject_id": None,
            "error": None, "violations": [], "usage": [], "latency_ms": 1, "defects": [],
            "pairs": pairs, **over}


def test_frequency_is_matched_against_every_task_not_just_the_first():
    """**회귀 테스트.** 한 턴이 과제를 셋까지 내는데 첫 번째만 보면 순서 때문에 틀린다.

    "주 3회 운동하고 싶어" 에 모델이 셋을 내고 그중 하나가 `weekly/3` 이면 정답입니다 —
    그게 첫 번째인지는 사용자에게 아무 의미가 없습니다.
    """
    from evals.runner import _score_case

    case = {"id": "x", "utterance": "주 3회 운동하고 싶어", "intent": "goal",
            "action": "generate", "frequency": "weekly", "count": 3}

    # 맞는 과제가 **세 번째**에 있습니다.
    scored = _score_case(case, [_run_row([("daily", None), ("daily", None), ("weekly", 3)])])
    assert scored["frequency_ok"] is True, "첫 과제만 보고 있습니다"
    assert scored["count_ok"] is True

    # 어디에도 없으면 실패입니다.
    missing = _score_case(case, [_run_row([("daily", None), ("monthly", 2)])])
    assert missing["frequency_ok"] is False
    assert missing["count_ok"] is False


def test_count_must_match_on_the_same_task_as_the_frequency():
    """주기와 횟수는 **한 쌍**이다 — 서로 다른 과제에서 하나씩 주워 맞추면 안 된다.

    프롬프트가 둘을 한 쌍으로 못 박은 이유가 이것입니다. 따로 세면 "주 1회 러닝" 과
    "월 3회 서점" 을 낸 응답이 "주 3회" 요청의 정답이 됩니다.
    """
    from evals.runner import _score_case

    case = {"id": "x", "utterance": "주 3회 운동", "intent": "goal", "action": "generate",
            "frequency": "weekly", "count": 3}

    scored = _score_case(case, [_run_row([("weekly", 1), ("monthly", 3)])])
    assert scored["frequency_ok"] is True, "weekly 과제는 실제로 있습니다"
    assert scored["count_ok"] is False, "weekly/3 인 과제는 없습니다 — 짝이 어긋났습니다"


def test_the_tight_sheet_leaves_no_room_for_a_hobby():
    """`full_tight` 가 실제로 좁은가 — `g42` 가 재려는 경로의 전제입니다.

    도메인은 자유 이름이라 "8/8" 만으로는 조건이 안 됩니다. `full` 에는 "취미" 가 있어
    기타 연습이 그 칸으로 가버리므로, **막히는 경로를 재려면 시트가 좁아야 합니다.**
    """
    from evals.runner import SHEETS, load_cases
    from mandarin_goal.sheet import DOMAIN_SLOTS

    tight = [d["title"] for d in SHEETS["full_tight"]["domains"]]
    assert len(tight) == DOMAIN_SLOTS, "8칸이 아니면 '자리 없음' 을 재지 못합니다"
    assert "취미" not in tight and "여가" not in tight

    g42 = next(c for c in load_cases() if c["id"] == "g42")
    assert g42["sheet"] == "full_tight", "g42 가 넓은 시트를 보면 clarify 가 나올 수 없습니다"


def test_consistency_ignores_failed_runs():
    """실패를 일관성에 섞지 않는다.

    섞으면 "429 가 났다" 가 "답이 흔들린다" 로 둔갑합니다. 고칠 곳이 한도와 프롬프트로
    완전히 갈리는데 화면에는 같은 숫자로 보입니다.
    """
    from evals.runner import _score_case

    good = {"intent": "goal", "action": "generate", "domain": None, "subject_id": None,
            "error": None, "violations": [], "usage": [], "latency_ms": 1, "defects": []}
    dead = {**good, "intent": None, "action": None, "error": "LlmRateLimitedError: 429"}

    case = {"id": "x", "utterance": "테스트", "intent": "goal", "action": "generate"}
    scored = _score_case(case, [good, dict(good), dead])

    assert scored["failed_runs"] == 1
    assert scored["consistency"] == 1.0, "성공한 2건이 일치하므로 100% 여야 합니다"
    assert scored["action_ok"] is True
