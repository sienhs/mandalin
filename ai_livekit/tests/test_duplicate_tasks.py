"""이미 담은 과제를 다시 제안하지 않는다.

프롬프트 규칙 4가 같은 말을 하지만 프롬프트는 어겨도 조용히 통과한다. 여기가 서버가
한 번 더 보는 층이다(`_settle_counts`·`_settle_capacity` 와 같은 이유).
"""
from __future__ import annotations

from mandarin_goal.bot.goal import ACTION_EXHAUSTED, GoalPipeline
from mandarin_goal.sheet import DomainRef


def domain(*titles: str) -> list[DomainRef]:
    return [
        DomainRef(
            id=7,
            title="학습",
            subjectCount=len(titles),
            subjects=[
                {"id": 100 + i, "title": t, "period": "daily", "countPerPeriod": 1}
                for i, t in enumerate(titles)
            ],
        )
    ]


def generated(*titles: str) -> dict:
    return {
        "action": "generate",
        "domain": "학습",
        "generated_tasks": [{"title": t, "frequency": "daily", "count": 1} for t in titles],
    }


def test_a_duplicate_is_dropped_and_the_rest_survive():
    decided = generated("매일 알고리즘 1문제 풀기", "기술 블로그 읽기")
    GoalPipeline._settle_duplicates(decided, domain("매일 알고리즘 1문제 풀기"))
    assert [t["title"] for t in decided["generated_tasks"]] == ["기술 블로그 읽기"]
    assert decided["action"] == "generate"


def test_whitespace_and_case_do_not_hide_a_duplicate():
    decided = generated("매일  알고리즘 1문제  풀기")
    GoalPipeline._settle_duplicates(decided, domain("매일 알고리즘 1문제 풀기"))
    assert decided["action"] == "recommend"


def test_all_duplicates_becomes_recommend_with_the_sheet_value():
    """빈 목록으로 두면 `render()` 가 "제목을 정하지 못했습니다" 로 끝난다 — 사실은
    제목을 정했고 이미 있었을 뿐이라 거짓말이 된다."""
    decided = generated("매일 알고리즘 1문제 풀기")
    GoalPipeline._settle_duplicates(decided, domain("매일 알고리즘 1문제 풀기"))
    assert decided["action"] == "recommend"
    assert decided["generated_tasks"] is None
    # 제목·주기·횟수는 시트 값이다 — 모델이 베낀 값이 아니다(`_resolve_match` 와 같은 이유).
    assert decided["matched_task"] == {
        "subject_id": 100,
        "title": "매일 알고리즘 1문제 풀기",
        "frequency": "daily",
        "count": 1,
    }


def test_a_similar_but_different_task_is_kept():
    """유사도로 자르지 않는다. `"1문제"` vs `"2문제"` 가 재표현과 같은 구간(0.67)이라
    임계값을 잡으면 멀쩡한 과제가 사라진다."""
    decided = generated("매일 알고리즘 2문제 풀기")
    GoalPipeline._settle_duplicates(decided, domain("매일 알고리즘 1문제 풀기"))
    assert decided["action"] == "generate"
    assert len(decided["generated_tasks"]) == 1


def test_a_new_domain_has_nothing_to_compare():
    decided = generated("매일 알고리즘 1문제 풀기")
    decided["domain"] = "체력"
    GoalPipeline._settle_duplicates(decided, domain("매일 알고리즘 1문제 풀기"))
    assert decided["action"] == "generate"


def test_recommend_is_left_alone():
    """`recommend` 는 새로 담는 것이 아니라 이미 담긴 것을 지목한 것이다."""
    decided = {"action": "recommend", "domain": "학습", "matched_task": {"subject_id": 100}}
    GoalPipeline._settle_duplicates(decided, domain("매일 알고리즘 1문제 풀기"))
    assert decided["matched_task"] == {"subject_id": 100}


def test_a_retry_turn_does_not_become_recommend():
    """"다른 거 달라" 에 "겹쳐요" 는 답이 될 수 없다.

    재요청 턴은 모델이 소재가 떨어져 기존 제목을 그대로 다시 낼 확률이 가장 높은
    자리다(실측 2026-08-08). 그때 `recommend` 로 전환하면 사용자가 방금 거부한 것을
    다시 들이민다 — 겹친 것이 아니라 낼 것이 떨어진 것이라 `_run` 이 한 번 더 굴린다.
    """
    decided = generated("매일 알고리즘 1문제 풀기")
    GoalPipeline._settle_duplicates(decided, domain("매일 알고리즘 1문제 풀기"), retry=True)
    assert decided["action"] == ACTION_EXHAUSTED
    assert decided["generated_tasks"] is None
    # 지목할 과제를 채우지 않는다 — 지목이 목적이 아니다.
    assert "matched_task" not in decided


def test_a_retry_turn_still_keeps_the_new_ones():
    """`retry` 가 중복 검사를 끄는 것은 아니다. 새 것이 있으면 그것만 남는다."""
    decided = generated("매일 알고리즘 1문제 풀기", "기술 블로그 읽기")
    GoalPipeline._settle_duplicates(decided, domain("매일 알고리즘 1문제 풀기"), retry=True)
    assert decided["action"] == "generate"
    assert [t["title"] for t in decided["generated_tasks"]] == ["기술 블로그 읽기"]
