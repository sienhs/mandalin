"""이미 담은 과제를 다시 제안하지 않는다.

프롬프트 규칙 4가 같은 말을 하지만 프롬프트는 어겨도 조용히 통과한다. 여기가 서버가
한 번 더 보는 층이다(`_settle_counts`·`_settle_capacity` 와 같은 이유).
"""
from __future__ import annotations

from mandarin_goal.bot.goal import GoalPipeline
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


# -- 겹친 것을 **전부** 알려준다 ----------------------------------------------
#
# 한 건만 보여주면 사용자는 AI 가 그것밖에 모른다고 읽습니다.


def test_every_overlap_is_reported_not_just_the_first():
    """`matched_task` 는 한 건이어야 하지만(프론트의 지목 자리) **문장은 전부 말한다.**"""
    decided = generated("조깅하기", "자전거 타기", "수영 배우기")
    GoalPipeline._settle_duplicates(
        decided, domain("조깅하기", "자전거 타기", "수영 배우기")
    )
    assert decided["action"] == "recommend"
    # 프론트 계약은 그대로 — 지목은 한 건이다.
    assert decided["matched_task"]["title"] == "조깅하기"
    assert [t["title"] for t in decided["duplicate_matches"]] == [
        "조깅하기", "자전거 타기", "수영 배우기"
    ]

    from mandarin_goal.bot.goal import render

    text = render(decided)
    for title in ("조깅하기", "자전거 타기", "수영 배우기"):
        assert title in text, title


def test_the_overlap_list_never_reaches_the_browser():
    """담기지 않는 값이라 payload 에 실리면 안 됩니다."""
    from mandarin_goal.bot.goal import public_data

    decided = generated("조깅하기", "자전거 타기")
    GoalPipeline._settle_duplicates(decided, domain("조깅하기", "자전거 타기"))
    sent = public_data(decided)
    assert "duplicate_matches" not in sent
    assert "capacity_note" not in sent
    # 지목에 필요한 것은 남는다.
    assert sent["matched_task"]["title"] == "조깅하기"


def test_a_full_cell_is_mentioned_in_the_same_breath():
    """`recommend` 는 정원 검사를 지나가지 않아(`_STORABLE_ACTIONS`) 같은 상태인데도
    턴마다 다른 이유가 나갑니다."""
    from mandarin_goal.sheet import MAX_SUBJECTS_PER_DOMAIN

    full = domain(*[f"과제{i}" for i in range(MAX_SUBJECTS_PER_DOMAIN)])
    decided = generated("과제0")
    GoalPipeline._settle_duplicates(decided, full)

    assert "다 차서" in decided["capacity_note"]


def test_a_cell_with_room_says_nothing_about_capacity():
    """자리가 남았으면 붙이지 않습니다 — 안 붙는 것이 기본입니다."""
    decided = generated("매일 알고리즘 1문제 풀기")
    GoalPipeline._settle_duplicates(decided, domain("매일 알고리즘 1문제 풀기"))
    assert "capacity_note" not in decided
