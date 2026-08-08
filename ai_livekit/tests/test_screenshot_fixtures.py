"""실측 화면(2026-08-08)을 재현하는 시트 픽스처를 **관측된 응답에 고정**한다.

(케이스 id 는 `sc01`~`sc04` 다 — 머지 때 `s01`~`s04` 가 저쪽의 시트 상태 케이스와
겹쳐 개명했다.)

골든셋의 `sc01`~`sc04` 는 그 화면에서 실제로 막혔던 조합을 다시 태운다. 그런데 시트
픽스처가 조용히 바뀌면 케이스는 그대로 통과하면서 **더 이상 그 화면을 재지 않는다** —
지표가 좋아지는 방향으로 픽스처를 고치는 것이 최적 전략이 되는, `test_golden_does_not_leak`
이 막는 것과 같은 종류의 사고다.

그래서 여기서는 **화면에 찍혀 있던 문장**을 기준으로 픽스처를 검사한다. 화면에서 확인된
것만 본다 — 채워 넣은 값(운동 칸의 나머지 7개 과제)은 검사하지 않는다.

한 가지 차이를 적어 둔다: 화면의 `domain_full_reply` 꼬리말은 "새 칸을 만들어 담아도
됩니다" 였고 지금 코드는 "아니면 편집기에서 정리해 주세요" 다. 배포본이 이 저장소보다
앞서 있었다는 뜻이라, 꼬리말은 검사하지 않고 **머리와 열거 목록만** 본다.
"""
from __future__ import annotations

from evals.runner import SHEETS
from mandarin_goal.bot.goal import domain_full_reply, subject_count
from mandarin_goal.bot.subjects import frequency_label
from mandarin_goal.sheet import MAX_SUBJECTS_PER_DOMAIN, DomainRef


def sheet(name: str) -> list[DomainRef]:
    return [DomainRef.model_validate(d) for d in SHEETS[name]["domains"]]


def cell(name: str, title: str) -> DomainRef:
    found = next((d for d in sheet(name) if d.title == title), None)
    assert found is not None, f"{name} 시트에 '{title}' 칸이 없습니다"
    return found


def task(name: str, cell_title: str, task_title: str):
    found = next(
        (s for s in cell(name, cell_title).subjects if s.title == task_title), None
    )
    assert found is not None, f"'{cell_title}' 칸에 '{task_title}' 과제가 없습니다"
    return found


# -- 084653 / 160635 : 운동 칸이 8/8 인데 "겹쳐요" 가 돌아간 화면 ------------------

def test_the_exercise_cell_is_actually_full():
    """화면이 `'운동' 칸은 과제 8개가 다 차서 더 담을 수 없어요` 라고 말했다."""
    assert subject_count(cell("screenshot_exercise", "운동")) == MAX_SUBJECTS_PER_DOMAIN


def test_jogging_is_in_there_with_the_frequency_shown_on_screen():
    """화면: `“조깅하기” (주간 · 주 3회)`. 빈도까지 같아야 중복 판정이 같은 조건이 된다."""
    jogging = task("screenshot_exercise", "운동", "조깅하기")
    assert frequency_label(jogging.frequency, jogging.count) == "주간 · 주 3회"


def test_only_one_other_cell_has_room():
    """화면의 되묻기가 열거한 칸은 `학습` **하나**였다 — 그래서 도메인이 둘뿐이다.

    칸을 늘리면 그 되묻기가 다른 문장이 되고, 이 케이스는 화면과 다른 것을 재게 된다.
    """
    reply = domain_full_reply("운동", sheet("screenshot_exercise"))
    assert reply.startswith(
        f"'운동' 칸은 과제 {MAX_SUBJECTS_PER_DOMAIN}개가 다 차서 더 담을 수 없어요."
    )
    assert "학습 중에 담을까요?" in reply


def test_there_is_room_for_a_new_cell():
    """`sc03`(여자친구)이 성립하는 조건 — 칸 자리가 남아 있어야 새 칸으로 담을 수 있다.

    자리가 없으면 그 케이스의 기대값이 generate 가 아니라 clarify 로 바뀐다.
    """
    assert len(sheet("screenshot_exercise")) == 2


def test_the_aerobic_filler_is_not_aerobic():
    """나머지 7개는 채운 값이지만 **유산소가 아니어야** 한다.

    사용자가 "유산소가 조깅하기밖에 없진 않잖아" 라고 한 화면이므로, 그 칸의 유산소는
    조깅하기 하나여야 `sc02` 가 그 대화를 재현한다.
    """
    titles = [s.title for s in cell("screenshot_exercise", "운동").subjects]
    aerobic = ("걷기", "달리기", "러닝", "자전거", "수영", "등산", "줄넘기", "계단")
    others = [t for t in titles if t != "조깅하기"]
    assert not [t for t in others if any(word in t for word in aerobic)], others


# -- 191657 : 재요청에 "겹쳐요" 가 두 번 돌아간 화면 ----------------------------

def test_the_cell_is_named_after_the_final_goal():
    """화면: `(건강한 몸 만들기 칸)`. **칸 이름이 최종목표와 같은** 시트다 —
    규칙 3이 권하는 모양은 아니지만 사용자가 그렇게 만들어 둔 상태이고, `sc04` 가
    재현하는 것이 바로 그 조합이다.

    (예전에는 `assert cell(...) is not None` 이었는데 `cell()` 이 내부에서 이미
    단언해서 **절대 실패할 수 없는 검사**였다.)
    """
    from evals.runner import load_cases

    titles = [d.title for d in sheet("screenshot_goal_cell")]
    assert titles == ["건강한 몸 만들기"], titles
    goal = next(c["goal"] for c in load_cases() if c["id"] == "sc04")
    assert titles[0] == goal, "칸 이름과 최종목표가 갈리면 그 조합을 재지 못한다"


def test_both_tasks_the_screen_pointed_at_are_present():
    """화면이 두 턴에 걸쳐 지목한 과제 둘. 빈도 표시까지 같아야 한다."""
    walking = task("screenshot_goal_cell", "건강한 몸 만들기", "매일 30분 걷기")
    assert frequency_label(walking.frequency, walking.count) == "일간 · 하루 1회"
    strength = task("screenshot_goal_cell", "건강한 몸 만들기", "주 3회 근력 운동")
    assert frequency_label(strength.frequency, strength.count) == "주간 · 주 3회"


def test_the_cell_still_has_room():
    """화면에서 그 칸에 과제 3개를 담자고 제안했으므로 자리가 있었다.

    꽉 찼으면 `sc04` 의 기대값이 generate 가 아니라 clarify 가 된다.
    """
    target = cell("screenshot_goal_cell", "건강한 몸 만들기")
    assert subject_count(target) < MAX_SUBJECTS_PER_DOMAIN


def test_the_count_in_the_title_is_kept():
    """`"주 3회 근력 운동"` 은 프롬프트가 생성 시 금지하는 모양이지만, 사용자가 편집기에서
    만든 값이라 후보로 실려 온다. 다듬으면 그 조합을 재지 못한다."""
    titles = [s.title for s in cell("screenshot_goal_cell", "건강한 몸 만들기").subjects]
    assert "주 3회 근력 운동" in titles


# -- 골든 케이스가 이 픽스처를 실제로 쓰는지 -------------------------------------

def test_the_screenshot_cases_point_at_these_fixtures():
    """케이스가 다른 시트로 옮겨 가면 이 파일이 아무것도 지키지 않게 된다."""
    from evals.runner import load_cases

    cases = {c["id"]: c for c in load_cases()}
    assert cases["sc01"]["sheet"] == "screenshot_exercise"
    assert cases["sc02"]["sheet"] == "screenshot_exercise"
    assert cases["sc03"]["sheet"] == "screenshot_exercise"
    assert cases["sc04"]["sheet"] == "screenshot_goal_cell"
    # 최종목표도 화면과 같아야 한다 — `sc03` 은 그 불일치가 논점이다.
    assert all(cases[i]["goal"] == "건강한 몸 만들기" for i in ("sc01", "sc02", "sc03", "sc04"))


def test_recommend_is_never_an_accepted_answer_for_these():
    """네 케이스 모두 화면에서 `recommend`("겹쳐요") 로 끝났다 — 그것이 오답이다."""
    from evals.runner import load_cases

    for case in load_cases():
        if not case["id"].startswith("sc"):
            continue
        allowed = case["action"]
        allowed = allowed if isinstance(allowed, list) else [allowed]
        assert "recommend" not in allowed, case["id"]
