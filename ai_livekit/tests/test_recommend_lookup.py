"""`recommend` 가 지목한 `subject_id` 를 **어디서** 찾는가.

프롬프트 규칙 4는 두 목록으로 지목하라고 시킨다 —

    <existing_subjects>       발화와 비슷한 상위 N건(`bot_candidate_count`, 기본 5)
    <existing_domain_tasks>   칸별 **전체 목록** (id 가 64~128건 보인다)

그런데 `_resolve_match` 는 앞의 것 안에서만 찾고 있었다. 뒤의 목록에서 고른 id 는
제목을 못 채워 `render()` 가 **"비슷한 과제를 찾았는데 제목을 읽지 못했습니다"** 로
끝났다 — 규칙이 시킨 일을 서버가 막고 있던 셈이다.

그 규칙에는 이유가 있다: 상위 N건은 글자 바이그램으로 뽑아서(`subjects.py` 모듈 주석)
"코테 준비" 와 "알고리즘 풀기" 를 잇지 못하고, 그래서 전체 목록을 함께 싣는다. 범위를
넓혀도 안전한 것은 **둘이 같은 출처**라서다 — 둘 다 `join` 으로 받은 사용자 시트다.
"""
from __future__ import annotations

from mandarin_goal.bot.goal import GoalPipeline, render
from mandarin_goal.bot.subjects import Candidate
from mandarin_goal.sheet import DomainRef

SHEET = [
    DomainRef(
        id=7,
        title="학습",
        subjectCount=2,
        subjects=[
            {"id": 3, "title": "알고리즘 문제 풀기", "period": "daily", "countPerPeriod": 1},
            {"id": 7, "title": "코테 준비하기", "period": "weekly", "countPerPeriod": 3},
        ],
    ),
    DomainRef(
        id=9,
        title="커리어",
        subjectCount=1,
        subjects=[{"id": 11, "title": "이력서 갱신하기", "period": "none"}],
    ),
]

#: 랭커가 뽑아 보낸 상위 N건. **`코테 준비하기`(id 7)가 빠져 있는 것이 요점이다** —
#: "코테" 와 "알고리즘" 은 바이그램이 겹치지 않아 실제로 이렇게 빠진다.
CANDIDATES = [
    Candidate(id=3, domain="학습", title="알고리즘 문제 풀기", frequency="daily", count=1)
]


def recommend(subject_id: int, domain: str | None = None) -> dict:
    return {
        "action": "recommend",
        "domain": domain,
        "matched_task": {"subject_id": subject_id},
    }


def test_an_id_from_the_candidate_list_still_resolves():
    """예전 경로. 넓히면서 좁은 쪽이 깨지지 않았는지."""
    decided = recommend(3)
    GoalPipeline._resolve_match(decided, CANDIDATES, SHEET)
    assert decided["matched_task"]["title"] == "알고리즘 문제 풀기"


def test_an_id_outside_the_candidates_but_in_the_sheet_resolves():
    """**이 파일의 핵심.** 상위 N건에 없어도 시트에 있으면 지목이 맞다."""
    decided = recommend(7)
    GoalPipeline._resolve_match(decided, CANDIDATES, SHEET)
    assert decided["matched_task"] == {
        "subject_id": 7,
        "title": "코테 준비하기",
        "frequency": "weekly",
        "count": 3,
    }
    # 그 턴이 막다른 문구로 끝나지 않는다.
    assert "제목을 읽지 못했습니다" not in render(decided)


def test_the_domain_comes_from_the_sheet_even_across_cells():
    """도메인도 시트가 정본이다 — 3단계가 다른 칸을 적었어도 덮는다.

    덮어써도 없는 칸이 생기지 않는 것은 **후보와 전체 목록이 같은 출처**라서다.
    """
    decided = recommend(11, domain="학습")
    GoalPipeline._resolve_match(decided, CANDIDATES, SHEET)
    assert decided["domain"] == "커리어"
    assert decided["matched_task"]["title"] == "이력서 갱신하기"


def test_an_id_in_neither_place_is_not_invented():
    """시트에도 없는 번호는 채우지 않는다 — `render()` 가 정직하게 끝낸다."""
    decided = recommend(999)
    GoalPipeline._resolve_match(decided, CANDIDATES, SHEET)
    assert "title" not in decided["matched_task"]
    assert "제목을 읽지 못했습니다" in render(decided)


def test_a_subject_without_an_id_cannot_be_pointed_at():
    """id 없는 과제는 지목할 방법이 없다(`to_candidates` 가 뺍니다).
    제목으로 지목하게 두면 그 필드에서 생성이 무너지는 사고를 다시 부른다."""
    sheet = [
        DomainRef(
            id=7, title="학습", subjectCount=1,
            subjects=[{"title": "id 없는 과제", "period": "daily"}],
        )
    ]
    decided = recommend(3)
    GoalPipeline._resolve_match(decided, [], sheet)
    assert "title" not in decided["matched_task"]


def test_only_recommend_is_touched():
    """`generate` 의 과제 목록을 건드리면 안 된다."""
    decided = {
        "action": "generate",
        "domain": "학습",
        "generated_tasks": [{"title": "새 과제", "frequency": "daily", "count": 1}],
    }
    GoalPipeline._resolve_match(decided, CANDIDATES, SHEET)
    assert decided["generated_tasks"] == [
        {"title": "새 과제", "frequency": "daily", "count": 1}
    ]


def test_an_empty_sheet_falls_back_to_the_honest_message():
    """시트를 안 넘긴 호출(기본값)도 터지지 않아야 한다 — 예전 시그니처와의 호환."""
    decided = recommend(7)
    GoalPipeline._resolve_match(decided, CANDIDATES)
    assert "title" not in decided["matched_task"]
