"""같은 자리로 돌아오는 응답을 그대로 내보내지 않는다.

실측(2026-08-08)에서 세 화면이 전부 이 모양이었다 —

  ① 사용자가 되묻기의 선택지를 골랐는데 **같은 질문**이 다시 나왔다
  ② "다른 것도 추천해 줄래?" 에 "이미 담아 두신 과제와 겹쳐요" 가 돌아왔다
  ③ 중복이라고 알린 그 칸이 실은 8/8 이었고, 그 사실은 **다음 턴에야** 나왔다
     (거절 이유가 "겹친다" → "꽉 찼다" 로 바뀌는 화면)

프롬프트에 "같은 질문을 두 번 하지 않는다" 를 적어도 어기면 조용히 통과한다
(`_settle_counts`·`_settle_capacity` 와 같은 이유로 서버가 한 번 더 본다). 여기는
`_run` 이 재시도를 걸 근거로 쓰는 판정과, 사용자에게 나가는 문장을 본다.
"""
from __future__ import annotations

from mandarin_goal.bot.goal import (
    CLARIFY_REPEAT_THRESHOLD,
    EXHAUSTED_REPLY,
    GoalPipeline,
    public_data,
    render,
)
from mandarin_goal.bot.llm import Turn
from mandarin_goal.config import Settings
from mandarin_goal.sheet import MAX_SUBJECTS_PER_DOMAIN, DomainRef

QUESTION = "특정 주제로 대화하기 / 경청하는 연습하기 중 어떤 것에 집중해 볼까요?"

#: 되묻기 한 번을 주고받은 히스토리. 마지막이 사용자 턴인 것이 실제 호출 모양이다
#: (`Conversation` 이 사용자 턴을 넣은 뒤 파이프라인을 부른다).
HISTORY = [
    Turn(role="user", text="대화를 잘하는 사람이 되고 싶어"),
    Turn(role="assistant", text=QUESTION),
    Turn(role="user", text="특정 주제로 대화하기"),
]


def clarify(question: str) -> dict:
    return {"action": "clarify", "clarify_question": question}


def domain(title: str, *subjects: str) -> list[DomainRef]:
    return [
        DomainRef(
            id=7,
            title=title,
            subjectCount=len(subjects),
            subjects=[
                {"id": 100 + i, "title": t, "period": "daily", "countPerPeriod": 1}
                for i, t in enumerate(subjects)
            ],
        )
    ]


# -- 같은 질문 반복 -----------------------------------------------------------

def test_the_same_question_is_caught():
    assert GoalPipeline._repeats_clarify(clarify(QUESTION), HISTORY) is True


def test_only_whitespace_differs_is_still_the_same_question():
    """공백을 넣어 빠져나가지 못한다 — 사용자에게는 같은 문장이다."""
    assert GoalPipeline._repeats_clarify(clarify(QUESTION.replace(" / ", " /  ")), HISTORY) is True


def test_a_genuinely_different_question_passes():
    """되묻기 자체를 막는 것이 아니다. **진전이 있으면** 통과해야 한다."""
    assert GoalPipeline._repeats_clarify(
        clarify("주 몇 회 정도 시간을 낼 수 있으세요?"), HISTORY
    ) is False


def test_generate_is_not_a_repeat():
    assert GoalPipeline._repeats_clarify({"action": "generate"}, HISTORY) is False


def test_an_empty_question_is_not_a_repeat():
    """빈 질문은 `render()` 가 다른 문장으로 메운다 — 이 판정의 몫이 아니다."""
    assert GoalPipeline._repeats_clarify(clarify(""), HISTORY) is False


def test_the_first_turn_has_nothing_to_compare():
    assert GoalPipeline._repeats_clarify(
        clarify(QUESTION), [Turn(role="user", text="대화를 잘하는 사람이 되고 싶어")]
    ) is False


#: 같은 질문을 살짝 고쳐 쓴 것. **잡혀야 한다** — 물음표 하나로 빠져나가면 가드가 없다.
#: (자카드 바이그램 0.964)
REPHRASED = QUESTION.rstrip("?")

#: 선택지 하나를 바꾼 질문. **통과해야 한다** — 그건 진전이다. (0.583)
PROGRESSED = QUESTION.replace("경청하는 연습하기", "긍정적인 표현 쓰기")


def test_a_rephrased_question_is_still_the_same_question():
    """문턱이 너무 높으면(예: 0.99) 물음표만 떼고 같은 질문을 다시 할 수 있다."""
    assert GoalPipeline._repeats_clarify(clarify(REPHRASED), HISTORY) is True


def test_a_changed_option_is_progress_not_a_repeat():
    """문턱이 너무 낮으면 선택지를 바꾼 **진전**까지 반복으로 잡아 되묻기가 죽는다."""
    assert GoalPipeline._repeats_clarify(clarify(PROGRESSED), HISTORY) is False


def test_the_threshold_sits_between_those_two():
    """위 두 테스트가 문턱을 실제로 가둔다 — 이 단언은 그 범위를 눈에 보이게 적어 둔다.

    예전에는 `0.8 < 문턱 < 1.0` 이었는데, 그 범위는 0.999 도 통과시킨다(재표현이
    0.964 라 그 값에서는 같은 질문이 그대로 두 번 나간다).
    """
    from mandarin_goal.bot.subjects import similarity

    assert similarity(PROGRESSED, QUESTION) < CLARIFY_REPEAT_THRESHOLD
    assert CLARIFY_REPEAT_THRESHOLD <= similarity(REPHRASED, QUESTION)


# -- 꽉 찬 칸을 그 턴에 알리기 -------------------------------------------------

def matched(subject_id: int = 100) -> dict:
    return {
        "action": "recommend",
        "domain": "운동",
        "matched_task": {
            "subject_id": subject_id,
            "title": "조깅하기",
            "frequency": "weekly",
            "count": 3,
        },
    }


def test_a_full_cell_is_flagged_and_said_in_the_same_turn():
    decided = matched()
    GoalPipeline._mark_domain_full(
        decided, domain("운동", *[f"과제{i}" for i in range(MAX_SUBJECTS_PER_DOMAIN)])
    )
    assert decided["domain_full"] is True
    assert "자리가 다 차서" in render(decided)


def test_the_flag_does_not_reach_the_browser():
    """`render()` 전용 힌트다. 프론트가 이 값으로 그리는 것이 없다."""
    decided = matched()
    decided["domain_full"] = True
    assert "domain_full" not in public_data(decided)


def test_a_cell_with_room_is_not_flagged():
    decided = matched()
    GoalPipeline._mark_domain_full(decided, domain("운동", "조깅하기"))
    assert "domain_full" not in decided


def test_recommend_offers_a_way_forward_in_the_same_cell():
    """예전 꼬리말은 "다른 목표를 말씀해 주시면" 이라 같은 칸에서 이어갈 길이 없었다 —
    중복이라고 들은 사용자가 하려던 것은 대개 그 칸의 다른 방법이다."""
    text = render(matched())
    assert "다른 방식으로" in text
    assert "다른 목표를 말씀해" not in text


def test_a_domain_without_a_name_is_left_alone():
    decided = {"action": "generate", "domain": ""}
    GoalPipeline._mark_domain_full(decided, domain("운동", "조깅하기"))
    assert "domain_full" not in decided


# -- 재요청 턴 (파이프라인 통째로) ---------------------------------------------

AEROBIC = [
    DomainRef(
        id=300,
        title="운동",
        subjectCount=1,
        subjects=[{"id": 31, "title": "조깅하기", "period": "weekly", "countPerPeriod": 3}],
    )
]

#: "또 다른 거는?" 이 오기까지의 히스토리. 앞 턴이 있어야 재요청이 성립한다.
RETRY_HISTORY = [
    Turn(role="user", text="운동 습관 추천해줘"),
    Turn(role="assistant", text="3가지 방법을 준비했어요."),
    Turn(role="user", text="또 다른 거는?"),
]


class StubbornBackend:
    """1단계는 `retry=True`, 3단계는 계속 `recommend` 를 고집한다."""

    name = "stubborn"

    def __init__(self) -> None:
        self.decide_calls = 0

    async def reply_json(self, system, history, schema, **kwargs):
        if "intent" in schema.get("properties", {}):
            return {"intent": "goal", "domain": "운동", "what": None, "retry": True}
        self.decide_calls += 1
        return {
            "action": "recommend",
            "domain": "운동",
            "matched_task": {"subject_id": 31},
            "generated_tasks": None,
            "reasoning": "",
        }

    async def aclose(self) -> None:
        return None


class RecoveringBackend(StubbornBackend):
    """되새김을 받고 두 번째에 새 과제를 낸다 — 정상 회복 경로."""

    async def reply_json(self, system, history, schema, **kwargs):
        if "intent" in schema.get("properties", {}):
            return {"intent": "goal", "domain": "운동", "what": None, "retry": True}
        self.decide_calls += 1
        if self.decide_calls == 1:
            return {"action": "recommend", "domain": "운동", "matched_task": {"subject_id": 31}}
        return {
            "action": "generate",
            "domain": "운동",
            "generated_tasks": [
                {"title": "수영하기", "frequency": "weekly", "count": 2,
                 "description": "관절이 편합니다"},
                {"title": "줄넘기 하기", "frequency": "weekly", "count": 3,
                 "description": "짧고 강합니다"},
                {"title": "계단 오르기", "frequency": "daily", "count": 1,
                 "description": "따로 시간이 안 듭니다"},
            ],
            "reasoning": "",
        }


def pipeline(backend) -> GoalPipeline:
    return GoalPipeline(
        Settings(
            bot_mode="goal",
            bot_provider="echo",
            bot_system_prompt_file="./prompts/system.md",
            bot_classify_prompt_file="./prompts/classify.md",
        ),
        backend,
    )


async def test_a_retry_turn_never_ends_in_a_duplicate_notice():
    """"또 다른 거는?" 에 "이미 담아 두신 과제와 겹쳐요" 가 돌아가면 안 된다.

    실측(2026-08-08)에서 세 턴 중 두 턴이 그렇게 끝났다. 겹친 것이 아니라 낼 것이
    떨어진 것이라, 사용자가 할 수 있는 일이 다르다.
    """
    backend = StubbornBackend()
    result = await pipeline(backend).run(RETRY_HISTORY, AEROBIC, goal="건강한 몸 만들기")

    assert "nudge" in result.stages, "되새김으로 한 번 더 굴려야 한다"
    assert backend.decide_calls == 2, "재시도는 **한 번만** — 예산이 45초다"
    assert result.stages[-1] == "stuck"
    assert result.text == EXHAUSTED_REPLY
    assert "겹쳐요" not in result.text
    # 담기 버튼을 그리지 않는 값이어야 한다(`web/app.js`).
    assert result.data == {"action": "clarify"}


async def test_a_retry_turn_that_recovers_uses_the_second_answer():
    """가드는 루프만 끊는다 — 되새김 뒤에 새 것이 나오면 그것을 그대로 쓴다."""
    result = await pipeline(RecoveringBackend()).run(
        RETRY_HISTORY, AEROBIC, goal="건강한 몸 만들기"
    )

    assert "stuck" not in result.stages
    assert result.data["action"] == "generate"
    titles = [t["title"] for t in result.data["generated_tasks"]]
    assert len(titles) == 3
    # 이미 담긴 과제를 다시 내지 않는다.
    assert "조깅하기" not in titles
