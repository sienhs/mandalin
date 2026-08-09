"""`VIOLATION_PATTERNS` 가 **실제로 나가는 로그 줄**과 맞는지.

eval 러너는 파이프라인에 계측을 넣지 않고 이미 있는 로그를 정규식으로 읽는다
(`LogCapture.violations`). 값이 싸고 프로덕션과 eval 이 같은 것을 세는 좋은 설계인데,
**로그 문구를 고치면 지표가 조용히 0 이 된다** — 그 결합을 `VIOLATION_PATTERNS` 주석이
경고하고 있지만 지켜 주는 것이 없었다. 실제로 이번에 `_resolve_match` 의 문구를 바꾸며
패턴 하나를 같이 고쳐야 했다.

**소스에서 문자열을 찾는 방식으로는 검증할 수 없다.** 로그는 여러 문자열 리터럴로
쪼개져 있고 `%d` 는 소스에 숫자로 존재하지 않는다 — `LogCapture` 가 보는 것은
`record.getMessage()`, 즉 **포맷된 줄**이다. 그래서 실제 경로를 태우고 그 줄을 잡는다.
"""
from __future__ import annotations

import logging
import re

import pytest

from evals.runner import VIOLATION_PATTERNS
from mandarin_goal.bot.goal import GoalPipeline
from mandarin_goal.bot.subjects import Candidate
from mandarin_goal.sheet import DomainRef

GOAL_LOGGER = "mandarin_goal.bot.goal"

SHEET = [
    DomainRef(
        id=7,
        title="학습",
        subjectCount=2,
        subjects=[
            {"id": 3, "title": "알고리즘 문제 풀기", "period": "daily", "countPerPeriod": 1},
            {"id": 7, "title": "코테 준비하기", "period": "weekly", "countPerPeriod": 3},
        ],
    )
]

#: 랭커가 보낸 상위 N건 — id 7 이 빠져 있다.
CANDIDATES = [
    Candidate(id=3, domain="학습", title="알고리즘 문제 풀기", frequency="daily", count=1)
]


def matched(caplog: pytest.LogCaptureFixture, name: str) -> bool:
    """`LogCapture.violations()` 와 **같은 방식**으로 판정한다(포맷된 줄 + re.search)."""
    pattern = VIOLATION_PATTERNS[name]
    return any(re.search(pattern, record.getMessage()) for record in caplog.records)


def test_every_pattern_is_a_valid_regex():
    """오타 난 정규식은 컴파일 시점에 터지지 않고 **매칭이 안 될 뿐**이다."""
    for name, pattern in VIOLATION_PATTERNS.items():
        re.compile(pattern)  # 터지면 그 자리에서 실패
        assert pattern.strip() == pattern, f"{name}: 앞뒤 공백이 있습니다"


def test_unknown_subject_matches_the_real_log_line(caplog: pytest.LogCaptureFixture):
    """시트에도 없는 id — 모델이 번호를 지어낸 경우."""
    decided = {"action": "recommend", "matched_task": {"subject_id": 999}}
    with caplog.at_level(logging.WARNING, logger=GOAL_LOGGER):
        GoalPipeline._resolve_match(decided, CANDIDATES, SHEET)
    assert matched(caplog, "unknown_subject"), [r.getMessage() for r in caplog.records]


def test_match_outside_candidates_matches_the_real_log_line(
    caplog: pytest.LogCaptureFixture,
):
    """후보 밖이지만 시트에 있는 id — **지목은 맞고 랭커가 놓친** 경우.

    `unknown_subject` 와 갈라 세는 이유는 고칠 곳이 다르기 때문이다 — 이쪽은
    프롬프트가 아니라 검색(`subjects.py`)이다.
    """
    decided = {"action": "recommend", "matched_task": {"subject_id": 7}}
    with caplog.at_level(logging.INFO, logger=GOAL_LOGGER):
        GoalPipeline._resolve_match(decided, CANDIDATES, SHEET)
    assert matched(caplog, "match_outside_candidates"), [
        r.getMessage() for r in caplog.records
    ]
    # 지목이 성공했으므로 지어낸 쪽 지표는 올라가지 않아야 한다.
    assert not matched(caplog, "unknown_subject")


def test_a_resolvable_candidate_raises_no_violation(caplog: pytest.LogCaptureFixture):
    """정상 경로에서 지표가 오르면 그 지표는 읽을 수 없는 값이 된다."""
    decided = {"action": "recommend", "matched_task": {"subject_id": 3}}
    with caplog.at_level(logging.INFO, logger=GOAL_LOGGER):
        GoalPipeline._resolve_match(decided, CANDIDATES, SHEET)
    assert not matched(caplog, "unknown_subject")
    assert not matched(caplog, "match_outside_candidates")


def test_the_capacity_slot_warning_is_not_counted_as_a_violation():
    """제목 줄임은 위반이 아니다 — 과제를 **지키기 위해** 하는 일이다.

    (`goal/capacity_slot` 이 실려 있다면 그건 지표 설계가 바뀐 것이므로 여기서 안다.)
    """
    assert not any("capacity_slot" in p for p in VIOLATION_PATTERNS.values())
