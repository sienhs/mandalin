"""후보 검색의 순위 — 특히 **횟수**.

주기가 1~7회로 갈라진 뒤, 주기만 보던 랭커에서는 이런 일이 났다:

    발화 "주 5회 러닝하고 싶어"  (frequency=weekly)
    후보 [주 1회 러닝, 주 5회 러닝, ...]
      -> 제목 바이그램 같음, 주기 가점 같음  =>  **점수가 완전히 동일**
      -> 순서가 임의로 정해지고 `BOT_CANDIDATE_COUNT`(5) 상한에서 맞는 쪽이 잘려 나간다

프롬프트는 그 사이 "행동과 빈도가 둘 다 같아야 겹친다 … 횟수도 빈도의 일부" 라고
말하고 있었다(`prompts/system.md` 규칙 4) — 규칙과 검색이 어긋나 있었다.

**가점이고 필터가 아니다.** 이 파일은 그 성질도 같이 지킨다 — 빈도가 다른 후보를
검색이 미리 지우면, 모델이 "비슷하지만 빈도가 다른 것이 있다" 를 알 수 없다.
"""
from __future__ import annotations

from mandarin_goal.bot.subjects import (
    DOMAIN_BONUS,
    FREQUENCY_BONUS,
    FREQUENCY_PARTIAL_BONUS,
    Candidate,
    frequency_score,
    search,
)
from mandarin_goal.sheet import DomainRef


def sheet(*subjects: dict, title: str = "건강") -> list[DomainRef]:
    return [
        DomainRef(
            id=7,
            title=title,
            subjectCount=len(subjects),
            subjects=[{"id": 100 + i, **s} for i, s in enumerate(subjects)],
        )
    ]


def running(count: int) -> dict:
    return {"title": "러닝하기", "period": "weekly", "countPerPeriod": count}


def titles(found: list[Candidate]) -> list[tuple[str, int | None]]:
    return [(c.title, c.count) for c in found]


# -- 횟수가 순위를 가른다 -------------------------------------------------------

def test_the_matching_count_ranks_first():
    """**이 파일의 핵심.** 제목·주기가 같고 횟수만 다르면 맞는 쪽이 위로 온다."""
    domains = sheet(running(1), running(5), running(3))
    found = search(domains, "건강", "러닝하기", 3, frequency="weekly", count=5)
    assert found[0].count == 5, titles(found)


def test_a_different_count_is_kept_not_filtered():
    """가점이고 필터가 아니다 — 횟수가 다른 후보도 목록에 남아야 한다."""
    domains = sheet(running(1), running(5))
    found = search(domains, "건강", "러닝하기", 5, frequency="weekly", count=5)
    assert len(found) == 2
    assert {c.count for c in found} == {1, 5}


def test_the_matching_count_survives_the_limit():
    """상한에서 잘려 나가는 것이 원래 증상이다. 자리가 하나여도 맞는 쪽이 남아야 한다."""
    domains = sheet(running(1), running(2), running(4), running(7), running(5))
    found = search(domains, "건강", "러닝하기", 1, frequency="weekly", count=5)
    assert titles(found) == [("러닝하기", 5)]


def test_an_unsaid_count_does_not_demote_anything():
    """**`None`(안 말했다)과 1(한 번이라고 말했다)은 다르다.**

    말하지 않은 것을 1 로 단정하면 `"러닝하고 싶어"` 가 이미 담아 둔 주 5회 러닝을
    강등시킨다 — 그게 `normalise_count` 를 그냥 통과시키면 안 되는 이유다.
    """
    domains = sheet(running(5))
    only = search(domains, "건강", "러닝하기", 5, frequency="weekly", count=None)[0]
    assert frequency_score(only, "weekly", None) == FREQUENCY_BONUS


def test_saying_one_does_demote_a_different_count():
    """반대로 1 이라고 **말했으면** 주 5회는 등급이 내려간다."""
    five = Candidate(id=1, domain="건강", title="러닝하기", frequency="weekly", count=5)
    assert frequency_score(five, "weekly", 1) == FREQUENCY_PARTIAL_BONUS


# -- 가점 사이의 크기 관계 -----------------------------------------------------

def test_the_period_still_outranks_the_count():
    """횟수는 주기가 맞은 **뒤의** 미세 조정이다. 주기가 다르면 가점이 0 이고,
    횟수가 우연히 같아도 주기가 맞은 후보를 넘지 못한다."""
    monthly_five = Candidate(
        id=1, domain="건강", title="러닝하기", frequency="monthly", count=5
    )
    weekly_one = Candidate(
        id=2, domain="건강", title="러닝하기", frequency="weekly", count=1
    )
    assert frequency_score(monthly_five, "weekly", 5) == 0.0
    assert frequency_score(weekly_one, "weekly", 5) == FREQUENCY_PARTIAL_BONUS


def test_the_frequency_budget_never_reaches_the_domain_bonus():
    """**두 가점을 더하지 않고 나눈 이유.**

    합쳤다면 최대가 `DOMAIN_BONUS` 에 닿아, "다른 도메인의 확실한 매칭보다 같은
    도메인이 이긴다" 는 그 값의 근거가 무너진다(`DOMAIN_BONUS` 주석).
    """
    assert FREQUENCY_PARTIAL_BONUS < FREQUENCY_BONUS < DOMAIN_BONUS


def test_a_partial_match_still_beats_a_period_mismatch():
    """0 으로 두면 "주 1회 러닝" 이 주기가 다른 후보와 같은 순위가 된다."""
    assert FREQUENCY_PARTIAL_BONUS > 0.0


# -- 후보 쪽에 값이 없을 때 ----------------------------------------------------

def test_a_candidate_without_a_count_is_not_penalised():
    """시트에 주기는 있고 횟수가 없는 과제. 다르다고 볼 근거가 없다 —
    모르는 값을 1 로 단정하지 않는 `frequency_label` 과 같은 판단이다."""
    unknown = Candidate(id=1, domain="건강", title="러닝하기", frequency="weekly")
    assert frequency_score(unknown, "weekly", 5) == FREQUENCY_BONUS


def test_a_fixed_period_ignores_the_count():
    """daily·none 은 횟수가 1 로 고정이라 갈릴 것이 없다."""
    daily = Candidate(id=1, domain="건강", title="산책하기", frequency="daily", count=1)
    assert frequency_score(daily, "daily", 1) == FREQUENCY_BONUS
    # 발화가 "매일 3회" 처럼 불가능한 값을 말해도 `_run` 이 `normalise_count` 로
    # 1 로 맞춰 넘기므로, 여기 3 이 그대로 오는 경로는 없다.
    assert frequency_score(daily, "daily", None) == FREQUENCY_BONUS


def test_no_frequency_means_no_bonus_at_all():
    """발화가 주기를 말하지 않았으면 이 축은 순위에 영향을 주지 않는다."""
    weekly = Candidate(id=1, domain="건강", title="러닝하기", frequency="weekly", count=3)
    assert frequency_score(weekly, None, 3) == 0.0


# -- 파이프라인이 실제로 넘기는지 ----------------------------------------------

class _Classifier:
    """1단계만 흉내내고 3단계는 아무 것이나 돌려주는 백엔드."""

    name = "classifier"

    def __init__(self, **classified: object) -> None:
        self._classified = {"intent": "goal", "domain": "건강", "what": "러닝하기"}
        self._classified.update(classified)

    async def reply_json(self, system, history, schema, **kwargs):
        if "intent" in schema.get("properties", {}):
            return dict(self._classified)
        return {"action": "clarify", "clarify_question": "주 몇 회로 해볼까요?"}

    async def aclose(self) -> None:
        return None


async def _captured_count(monkeypatch, **classified: object) -> int | None:
    """`_run` 이 `search()` 에 넘긴 `count` 를 그대로 잡아온다."""
    from mandarin_goal.bot import goal as goal_module
    from mandarin_goal.bot.llm import Turn
    from mandarin_goal.config import Settings

    seen: dict[str, object] = {}

    def spy(domains, domain, query, limit, *, frequency=None, count=None):
        seen["frequency"], seen["count"] = frequency, count
        return []

    monkeypatch.setattr(goal_module, "search_subjects", spy)
    pipeline = goal_module.GoalPipeline(
        Settings(
            bot_mode="goal",
            bot_provider="echo",
            bot_system_prompt_file="./prompts/system.md",
            bot_classify_prompt_file="./prompts/classify.md",
        ),
        _Classifier(**classified),
    )
    await pipeline.run([Turn(role="user", text="러닝하고 싶어")], sheet(running(5)))
    return seen["count"]


async def test_the_pipeline_forwards_a_said_count(monkeypatch):
    assert await _captured_count(monkeypatch, frequency="weekly", count=3) == 3


async def test_the_pipeline_keeps_an_unsaid_count_as_none(monkeypatch):
    """**1 로 바꿔 넘기면 안 된다.** `normalise_count` 는 값이 없으면 1 을 돌려주므로
    `_run` 이 미리 가려야 한다 — 안 가리면 모든 발화가 "주 1회" 를 원한 셈이 된다."""
    assert await _captured_count(monkeypatch, frequency="weekly", count=None) is None


async def test_the_pipeline_clamps_an_impossible_count(monkeypatch):
    """주기에서 불가능한 값은 `normalise_count` 가 맞춥니다 — 매일은 1 로 고정,
    주간은 상한(7)으로 자릅니다. 그래야 후보의 정규화된 값과 비교가 성립합니다."""
    assert await _captured_count(monkeypatch, frequency="daily", count=3) == 1
    assert await _captured_count(monkeypatch, frequency="weekly", count=99) == 7


async def test_a_count_without_a_period_is_dropped(monkeypatch):
    """주기 없는 횟수는 쓸 데가 없다 — 후보의 횟수도 주기 없이는 뜻이 없다."""
    assert await _captured_count(monkeypatch, frequency=None, count=3) is None
