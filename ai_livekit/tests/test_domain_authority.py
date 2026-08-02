"""칸을 정하는 권한은 AI 가 아니라 사용자에게 있다.

프론트(`frontend/src/pages/AiCoachPage.tsx` 의 `handleGoal`)는 시트에 없는 칸으로
온 과제를 **이미 버리고 있습니다** — `payload.domain_is_new || !known` 이면
`"○○" 칸은 시트에 없어서 …` 만 띄우고 끝냅니다. 서버가 같은 검사를 하지 않으면
사용자는 대화 한 턴을 통째로 잃습니다.

그래서 강제는 프롬프트가 아니라 서버에서 합니다. 프롬프트는 어겨도 조용히
통과하지만 서버는 그렇지 않습니다 — 이 파일이 그 경계를 지킵니다.
"""
from mandarin_goal.bot.goal import GoalPipeline, domain_unknown_reply
from mandarin_goal.bot.llm import Turn
from mandarin_goal.config import Settings
from mandarin_goal.sheet import DomainRef

#: **단계 모델을 비워 둡니다.** `.env` 에 `BOT_DECIDE_MODEL` 이 있으면
#: `_stage_backend()` 가 "기본 모델과 다르다" 고 보고 백엔드를 새로 만들어서,
#: 주입한 `FakeBackend` 를 조용히 버립니다. 그러면 이 파일은 개발자의 `.env` 에
#: 따라 통과했다 실패했다 합니다.
SETTINGS = Settings(
    bot_mode="goal",
    bot_provider="echo",
    bot_classify_model=None,
    bot_decide_model=None,
)

SHEET = [
    DomainRef(
        id=7,
        title="학습",
        subjectCount=1,
        subjects=[{"id": 3, "title": "주 1회 블로그 정리", "frequency": "weekly"}],
    )
]


class FakeBackend:
    """1단계는 goal 로 통과시키고, 3단계는 미리 정한 판단을 그대로 돌려줍니다.

    `EchoBackend` 로는 이 경로를 못 봅니다 — 3단계에서 언제나 `clarify` 를 내서
    `generate` 검사에 닿지 않기 때문입니다.
    """

    name = "fake"

    def __init__(self, decided: dict) -> None:
        self._decided = decided

    async def reply(self, system: str, history: list[Turn]) -> str:  # pragma: no cover
        raise AssertionError("goal 모드는 reply_json 만 씁니다")

    async def reply_json(
        self,
        system: str,
        history: list[Turn],
        schema: dict,
        *,
        max_output_tokens: int | None = None,
    ) -> dict:
        if "intent" in schema.get("properties", {}):
            last = next((t for t in reversed(history) if t.role == "user"), None)
            # 1단계 도메인은 비웁니다. 채우면 `_settle_domain` 이 3단계의 빈 도메인을
            # 메워버려서 무엇을 검사하고 있는지 흐려집니다.
            return {"intent": "goal", "domain": None, "transcript": last.text if last else ""}
        return dict(self._decided)

    async def aclose(self) -> None:
        return None


def _run(decided: dict, sheet: list[DomainRef], text: str = "매일 알고리즘 문제 풀고 싶어"):
    import asyncio

    pipeline = GoalPipeline(SETTINGS, FakeBackend(decided))
    return asyncio.run(pipeline.run([Turn(role="user", text=text)], sheet))


GENERATED = {"title": "매일 알고리즘 1문제 풀기", "frequency": "daily", "description": "설명"}


def test_a_generated_task_for_a_sheet_domain_goes_through():
    """시트에 있는 칸이면 그대로 통과한다 — 기준선."""
    result = _run(
        {"action": "generate", "domain": "학습", "generated_task": GENERATED}, SHEET
    )
    assert result.data["action"] == "generate"
    assert result.data["domain"] == "학습"
    assert result.data["domain_id"] == 7
    assert result.data["domain_is_new"] is False
    assert "no_domain" not in result.stages


def test_an_invented_domain_is_refused_and_turned_into_a_question():
    """**시트에 없는 칸을 지어내면 담기를 취소하고 되묻는다.**

    프론트가 버릴 값을 그대로 내보내면 사용자는 "담지 않았어요" 만 보고 턴을
    잃습니다. `clarify` 로 바꾸면 같은 턴이 "어느 칸에 담을까요" 로 살아납니다.
    """
    result = _run(
        {"action": "generate", "domain": "덕질", "generated_task": GENERATED}, SHEET
    )
    assert result.stages[-1] == "no_domain"
    # 담기 버튼이 그려지지 않아야 한다 — 프론트는 `generate` 로만 버튼을 붙인다.
    assert result.data == {"action": "clarify"}
    assert "generated_task" not in result.data
    # 사용자가 고를 수 있게 **그 시트의 칸 이름**을 보여준다.
    assert "학습" in result.text
    assert "덕질" not in result.text


def test_an_empty_domain_is_refused_too():
    """칸을 아예 못 정한 경우도 같은 경로로 모인다."""
    result = _run(
        {"action": "generate", "domain": None, "generated_task": GENERATED}, SHEET
    )
    assert result.stages[-1] == "no_domain"
    assert result.data == {"action": "clarify"}


def test_an_empty_sheet_asks_the_user_to_make_a_cell_first():
    """칸이 하나도 없으면 고르라고 할 수 없다 — 먼저 만들라고 안내한다."""
    result = _run(
        {"action": "generate", "domain": "학습", "generated_task": GENERATED}, []
    )
    assert result.stages[-1] == "no_domain"
    assert "먼저" in result.text


def test_recommend_is_not_checked_because_the_sheet_already_settled_it():
    """`recommend` 는 검사 대상이 아니다.

    `_resolve_match` 가 후보(=사용자 시트)의 도메인으로 이미 덮으므로 정의상
    시트에 있는 칸입니다. 여기까지 막으면 중복 알림이 되묻기로 바뀝니다.
    """
    result = _run(
        {"action": "recommend", "domain": "없는칸", "matched_task": {"subject_id": 3}},
        SHEET,
        text="주 1회 블로그 정리하고 싶어",
    )
    assert result.data["action"] == "recommend"
    assert "no_domain" not in result.stages


def test_the_question_lists_the_users_own_cells():
    """안내 문구는 **호출 시점의 시트**로 만든다.

    상수로 박아두면 남의 시트 기준으로 안내하게 됩니다. 그래서 열거는 함수가 합니다.
    """
    text = domain_unknown_reply(
        [DomainRef(id=1, title="운동"), DomainRef(id=2, title="식단")]
    )
    assert "운동" in text and "식단" in text
    assert "학습" not in text
    # 칸이 없으면 고르라고 하지 않는다.
    assert "운동" not in domain_unknown_reply([])
