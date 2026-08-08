"""AI 가 칸을 지어낼 수 있는 경계는 **담을 자리가 있는가** 다.

예전 경계는 "시트에 있는 칸인가" 였습니다. 그 규칙은 이미 만들어 둔 시트를 돕는
경로에서는 맞았지만, **빈 시트에서 대화로 초안을 세우는 경로를 막았습니다** — 칸이
없으면 generate 가 전부 취소되고, AI 코치 화면에는 칸을 만드는 수단이 없어서
(칸은 과제를 담을 때 함께 생깁니다) 첫 발화부터 막다른 골목이었습니다.

그래서 경계를 `DOMAIN_SLOTS`(만다라트 세부 목표 8칸)로 옮겼습니다. 자리가 남으면
새 칸을 지어도 되고, 8칸이 찼으면 담을 곳이 실제로 없으므로 되묻습니다.

강제는 프롬프트가 아니라 서버에서 합니다 — 프롬프트는 어겨도 조용히 통과하지만
서버는 그렇지 않습니다. 이 파일이 그 경계를 지킵니다.
"""
from mandarin_goal.bot.goal import (
    DOMAIN_FULL_NOTE,
    DOMAIN_UNKNOWN_REPLY,
    GoalPipeline,
    domain_full_reply,
    domain_unknown_reply,
)
from mandarin_goal.bot.llm import Turn
from mandarin_goal.bot.tools import TASK_COUNT
from mandarin_goal.config import Settings
from mandarin_goal.sheet import DOMAIN_SLOTS, MAX_SUBJECTS_PER_DOMAIN, DomainRef

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

    def __init__(self, decided: dict, classified_domain: str | None = None) -> None:
        self._decided = decided
        #: 1단계가 내는 도메인. **기본은 비움입니다** — 채우면 `_settle_domain` 이
        #: 3단계의 빈 도메인을 메워버려서 무엇을 검사하고 있는지 흐려집니다.
        #: 그 메우기 자체를 보는 테스트만 값을 줍니다.
        self._classified_domain = classified_domain

    async def reply_json(
        self,
        system: str,
        history: list[Turn],
        schema: dict,
        *,
        max_output_tokens: int | None = None,
        **_,
    ) -> dict:
        if "intent" in schema.get("properties", {}):
            return {"intent": "goal", "domain": self._classified_domain}
        return dict(self._decided)

    async def aclose(self) -> None:
        return None


def _run(
    decided: dict,
    sheet: list[DomainRef],
    text: str = "매일 알고리즘 문제 풀고 싶어",
    classified_domain: str | None = None,
):
    import asyncio

    pipeline = GoalPipeline(SETTINGS, FakeBackend(decided, classified_domain))
    return asyncio.run(pipeline.run([Turn(role="user", text=text)], sheet))


GENERATED = [{"title": "매일 알고리즘 1문제 풀기", "frequency": "daily", "description": "설명"}]

#: 8칸이 다 찬 시트. 새 칸을 지을 자리가 없는 유일한 경우입니다.
FULL_SHEET = [
    DomainRef(id=i, title=f"칸{i}", subjectCount=1) for i in range(1, DOMAIN_SLOTS + 1)
]


def test_a_generated_task_for_a_sheet_domain_goes_through():
    """시트에 있는 칸이면 그대로 통과한다 — 기준선."""
    result = _run(
        {"action": "generate", "domain": "학습", "generated_tasks": GENERATED}, SHEET
    )
    assert result.data["action"] == "generate"
    assert result.data["domain"] == "학습"
    assert result.data["domain_id"] == 7
    assert result.data["domain_is_new"] is False
    assert "no_domain" not in result.stages


def test_a_new_cell_goes_through_while_there_is_room():
    """**자리가 남았으면 시트에 없는 칸도 통과한다.**

    이게 빈 시트에서 초안을 세우는 경로입니다. `domain_is_new` 가 붙어 나가고,
    프론트는 그 표시를 보고 `domain` 행을 먼저 만듭니다. `domain_id` 는 아직 없으니
    실려서는 안 됩니다 — 있으면 프론트가 남의 칸에 담습니다.
    """
    result = _run(
        {"action": "generate", "domain": "덕질", "generated_tasks": GENERATED}, SHEET
    )
    assert "no_domain" not in result.stages
    assert result.data["action"] == "generate"
    assert result.data["domain"] == "덕질"
    assert result.data["domain_is_new"] is True
    assert "domain_id" not in result.data


def test_an_empty_sheet_gets_its_first_cell_named_by_the_ai():
    """칸이 하나도 없어도 generate 한다 — 8자리가 전부 남아 있다.

    예전에는 여기서 "칸을 먼저 만들어 주세요" 로 끊었습니다. AI 코치 화면에는 칸을
    만드는 수단이 없어서 그 안내가 곧 막다른 골목이었습니다.
    """
    result = _run(
        {"action": "generate", "domain": "규칙적인 운동", "generated_tasks": GENERATED}, []
    )
    assert "no_domain" not in result.stages
    assert result.data["action"] == "generate"
    assert result.data["domain_is_new"] is True


def test_a_new_cell_is_refused_when_all_eight_slots_are_taken():
    """**8칸이 차면 새 칸을 만들 수 없다 — 담을 곳이 없다.**

    이때만 담기를 취소하고 되묻습니다. 안내에는 "새 칸을 만들 수 없다" 는 사실이
    들어가야 합니다 — 그냥 되물으면 사용자는 새 이름을 다시 말하고 같은 자리로
    돌아옵니다.
    """
    result = _run(
        {"action": "generate", "domain": "덕질", "generated_tasks": GENERATED}, FULL_SHEET
    )
    assert result.stages[-1] == "no_domain"
    # 담기 버튼이 그려지지 않아야 한다 — 프론트는 `generate` 로만 버튼을 붙인다.
    assert result.data == {"action": "clarify"}
    assert "generated_tasks" not in result.data
    # 사용자가 고를 수 있게 **그 시트의 칸 이름**을 보여준다.
    assert "칸1" in result.text
    assert "덕질" not in result.text


def test_an_empty_domain_is_refused_even_when_there_is_room():
    """칸을 아예 못 정한 경우는 자리가 남았어도 되묻는다.

    이름이 없으면 담을 곳을 만들 수도 없습니다. 자리 여부와 무관한 경로입니다.
    """
    result = _run(
        {"action": "generate", "domain": None, "generated_tasks": GENERATED}, SHEET
    )
    assert result.stages[-1] == "no_domain"
    assert result.data == {"action": "clarify"}


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


# -- 칸 **안**의 정원 -------------------------------------------------------
#
# 위 검사들이 세는 것은 칸 수(`DOMAIN_SLOTS`)입니다. 아래는 칸 하나에 담기는 과제
# 수(`MAX_SUBJECTS_PER_DOMAIN`)이고, 한 턴이 과제를 3개까지 내므로 자리가 남은 칸에서도
# 합이 넘칠 수 있습니다.

THREE = [
    {"title": f"과제{i}", "frequency": "daily", "count": 1, "description": "설명"}
    for i in range(1, 4)
]


def _sheet(count: int) -> list[DomainRef]:
    """과제 `count` 개가 담긴 "학습" 칸 하나짜리 시트."""
    return [DomainRef(id=7, title="학습", subjectCount=count)]


def test_a_turn_is_trimmed_to_the_room_left_in_the_cell():
    """6개 담긴 칸에 3개를 내면 **2개만 담긴다.**

    잘리지 않으면 9번째 과제가 저장됩니다. 만다라트 3x3 블록에는 8칸뿐이라 그 과제는
    화면에 그려지지 않고, Spring 도 프론트도 칸당 개수를 검사하지 않아 에러도 없습니다.
    """
    result = _run(
        {"action": "generate", "domain": "학습", "generated_tasks": THREE}, _sheet(6)
    )
    assert result.data["action"] == "generate"
    # 턴을 통째로 잃지 않는다 — 담을 수 있는 만큼은 담는다.
    assert [t["title"] for t in result.data["generated_tasks"]] == ["과제1", "과제2"]
    assert "domain_full" not in result.stages


def test_a_turn_that_fits_is_left_alone():
    """자리가 넉넉하면 손대지 않는다 — 기준선."""
    result = _run(
        {"action": "generate", "domain": "학습", "generated_tasks": THREE}, _sheet(1)
    )
    assert len(result.data["generated_tasks"]) == 3


def test_a_full_cell_asks_instead_of_overflowing():
    """8개가 찬 칸에는 담지 않고 되묻는다.

    안내에는 **꽉 찼다는 사실**이 들어가야 합니다. 그냥 되물으면 사용자는 같은 칸을
    다시 말하고 같은 자리로 돌아옵니다 — 8칸이 찼을 때와 같은 구조입니다.
    """
    sheet = _sheet(8) + [DomainRef(id=8, title="운동", subjectCount=2)]
    result = _run(
        {"action": "generate", "domain": "학습", "generated_tasks": THREE}, sheet
    )
    assert result.stages[-1] == "domain_full"
    # 담기 버튼이 그려지지 않아야 한다.
    assert result.data == {"action": "clarify"}
    assert "학습" in result.text
    # 자리가 남은 다른 칸은 골라 쓸 수 있게 보여준다.
    assert "운동" in result.text
    # **"어느 과제를 뺄까요" 로 묻지 않는다** — AI 코치 화면에 과제를 빼는 수단이 없다.
    assert "뺄" not in result.text and "지워" not in result.text


def test_a_cell_over_capacity_counts_by_subject_count():
    """`subjects` 는 8개로 잘려 오지만 `subjectCount` 는 실제 개수다.

    길이로만 세면 9개 담긴 칸이 "8개 = 꽉 찼다" 가 아니라 한 자리 남은 것처럼 보입니다.
    """
    sheet = [
        DomainRef(
            id=7,
            title="학습",
            subjectCount=9,
            subjects=[
                {"id": i, "title": f"기존{i}", "frequency": "daily"} for i in range(9)
            ],
        )
    ]
    result = _run(
        {"action": "generate", "domain": "학습", "generated_tasks": THREE}, sheet
    )
    assert result.stages[-1] == "domain_full"


# -- 꽉 찬 칸에서 빠져나갈 길 ------------------------------------------------
#
# 다른 칸의 자리만 보면 칸이 7개 비어 있어도 편집기로 보내게 됩니다. 칸 자체가 남아
# 있으면 길은 새 칸입니다.


def test_a_full_cell_offers_a_new_one_while_slots_remain():
    """칸 자리가 남았으면 편집기로 보내지 않습니다."""
    result = _run(
        {"action": "generate", "domain": "학습", "generated_tasks": THREE}, _sheet(8)
    )
    assert result.stages[-1] == "domain_full"
    assert "새 칸" in result.text
    assert "편집기" not in result.text
    # **이름은 짓지 않는다** — 칸을 지을 권한은 3단계에 있다.
    assert "학습" in result.text  # 꽉 찬 칸을 가리키는 것뿐


def test_a_full_cell_offers_both_when_both_ways_out_exist():
    """다른 칸에 자리가 있고 칸 자리도 남았으면 둘 다 알린다."""
    sheet = _sheet(8) + [DomainRef(id=8, title="운동", subjectCount=2)]
    text = domain_full_reply("학습", sheet)
    assert "운동" in text
    assert "새 칸" in text


def test_a_full_sheet_offers_only_the_cells_that_still_have_room():
    """8칸이 다 찼으면 새 칸은 없다. 그래도 **자리가 남은 칸은 고를 수 있다.**"""
    sheet = [
        DomainRef(id=i, title=f"칸{i}", subjectCount=MAX_SUBJECTS_PER_DOMAIN)
        for i in range(1, DOMAIN_SLOTS)
    ] + [DomainRef(id=DOMAIN_SLOTS, title="여유칸", subjectCount=1)]
    text = domain_full_reply("칸1", sheet)
    assert "여유칸" in text
    assert "새 칸" not in text
    # 고를 칸이 있으므로 편집기는 **대안**으로만 나온다.
    assert "편집기" in text


def test_the_editor_is_the_last_resort_only():
    """8칸이 다 찼고 그 칸들도 다 찼을 때만 편집기다. **이때는 진짜로 자리가 없다.**"""
    sheet = [
        DomainRef(id=i, title=f"칸{i}", subjectCount=MAX_SUBJECTS_PER_DOMAIN)
        for i in range(1, DOMAIN_SLOTS + 1)
    ]
    text = domain_full_reply("칸1", sheet)
    assert "편집기" in text
    assert "새 칸" not in text


def test_a_full_cell_still_counts_toward_the_slots():
    """꽉 찬 칸도 자리는 차지합니다 — 빼고 세면 만들 수 없는 칸을 제안하게 됩니다."""
    sheet = [
        DomainRef(id=i, title=f"칸{i}", subjectCount=MAX_SUBJECTS_PER_DOMAIN)
        for i in range(1, DOMAIN_SLOTS + 1)
    ]
    assert "새 칸" not in domain_full_reply("칸1", sheet)
    # 한 칸만 지우면 그 자리가 살아난다.
    assert "새 칸" in domain_full_reply("칸1", sheet[:-1])


def test_a_new_cell_has_all_eight_places_free():
    """시트에 없는 칸은 비어 있으므로 3개가 그대로 간다."""
    result = _run(
        {"action": "generate", "domain": "덕질", "generated_tasks": THREE}, _sheet(8)
    )
    assert result.data["domain_is_new"] is True
    assert len(result.data["generated_tasks"]) == 3


# -- 1단계 도메인은 칸을 만들 수 없다 ---------------------------------------


def test_the_classify_hint_fills_an_empty_domain_when_the_cell_exists():
    """3단계가 칸을 비웠고 1단계 힌트가 **시트에 있는 칸**이면 채운다.

    모델을 다시 부르지 않고 메우는 경로입니다. 2단계 후보 검색에 쓰고 버려지던 값입니다.
    """
    result = _run(
        {"action": "generate", "domain": None, "generated_tasks": GENERATED},
        SHEET,
        classified_domain="학습",
    )
    assert result.data["action"] == "generate"
    assert result.data["domain"] == "학습"
    assert result.data["domain_is_new"] is False
    assert "no_domain" not in result.stages


def test_the_classify_hint_cannot_invent_a_cell():
    """**시트에 없는 1단계 힌트로는 칸을 만들지 않는다.**

    1단계의 `domain` 은 검증하지 않는 값입니다 — 후보 검색의 가점에만 쓰이고 필터가
    아니라서 틀려도 순서만 나빠진다는 전제였습니다. 그 값으로 빈 칸을 메우면 검색
    힌트가 `domain_is_new` 를 달고 **실제 칸이 됩니다.** 새 칸을 지을 권한은 3단계에만
    있으니, 채우지 않고 되묻습니다.
    """
    result = _run(
        {"action": "generate", "domain": None, "generated_tasks": GENERATED},
        SHEET,
        classified_domain="지어낸칸",
    )
    assert result.stages[-1] == "no_domain"
    assert result.data == {"action": "clarify"}
    assert "지어낸칸" not in result.text


# -- 되묻기 문구는 히스토리보다 오래 살면 안 된다 ---------------------------
#
# 위 두 되묻기(`no_domain` · `domain_full`)의 문구는 호출 시점의 시트로 만듭니다.
# 슬롯은 매 턴 다시 계산되지만 히스토리는 `bot_history_turns` 동안 남으므로, 그 문장을
# 그대로 남기면 모델이 옛 시트를 따릅니다. 그래서 `text` 와 `history_text` 를 가릅니다.


def test_a_full_cell_does_not_leave_its_count_in_the_history():
    """`"8개가 다 차서"` 는 사용자에게만 갑니다 — 다음 턴이면 거짓일 수 있습니다."""
    sheet = _sheet(8) + [DomainRef(id=8, title="운동", subjectCount=2)]
    result = _run(
        {"action": "generate", "domain": "학습", "generated_tasks": THREE}, sheet
    )
    assert result.stages[-1] == "domain_full"
    # 사용자는 이유를 듣는다.
    assert "다 차서" in result.text
    # 히스토리에는 그 주장이 남지 않는다 — 개수도 칸 이름도.
    assert result.history_entry == DOMAIN_FULL_NOTE
    assert "다 차서" not in result.history_entry
    assert "학습" not in result.history_entry


def test_the_question_survives_the_history_but_the_cell_names_do_not():
    """`no_domain` 은 질문이라 통째로 버리지 않고 열거한 이름만 뺍니다.

    이름은 `<domain_list>` 가 매 턴 다시 실어줍니다.
    """
    result = _run(
        {"action": "generate", "domain": "덕질", "generated_tasks": GENERATED}, FULL_SHEET
    )
    assert result.stages[-1] == "no_domain"
    # 사용자에게는 고를 수 있게 칸을 열거한다.
    assert "칸1" in result.text
    # 히스토리에는 질문만 남는다.
    assert result.history_entry == DOMAIN_UNKNOWN_REPLY
    assert "칸1" not in result.history_entry
    assert "어느 칸에 담을지" in result.history_entry


def test_an_ordinary_turn_is_left_alone():
    """대체는 상태를 주장하는 응답에만 겁니다 — 아니면 모델이 자기 제안을 잃습니다."""
    result = _run(
        {"action": "generate", "domain": "학습", "generated_tasks": GENERATED}, SHEET
    )
    assert "no_domain" not in result.stages and "domain_full" not in result.stages
    assert result.history_text is None
    assert result.history_entry == result.text


# -- 한 턴이 내는 과제 수 -----------------------------------------------------
#
# 위 검사들이 세는 것은 **자리**(칸 수·칸 안의 정원)입니다. 이건 다른 규칙입니다 —
# 자리가 아무리 남아도 한 턴은 `TASK_COUNT` 개까지만 냅니다. 이유는 `system.md` 의
# `one_cell_at_a_time` 에 있습니다: *"한 턴에 칸 하나와 그 칸의 과제 3개만 다룬다 …
# **고르는 것은 사용자다**"*. 카드가 8장 뜨면 고르는 화면이 아니라 받아 적는 화면입니다.
#
# 그 규칙을 정면으로 겨냥하는 발화가 실제로 옵니다 — `"다 채워줘"`, `"남은 칸 채워줘"`.
# 프롬프트가 그 두 낱말을 예시로 들고 있지만 의역은 무한하고, 프롬프트는 어겨도 조용히
# 통과합니다. 그래서 서버가 셉니다.

MANY = [
    {"title": f"과제{i}", "frequency": "daily", "count": 1, "description": "설명"}
    for i in range(8)
]


def test_a_turn_is_capped_even_when_the_whole_cell_is_empty():
    """`_settle_capacity` 는 *칸의 남은 자리*로만 자르므로 빈 칸에서는 안 막힙니다."""
    result = _run({"action": "generate", "domain": "덕질", "generated_tasks": MANY}, [])
    assert len(result.data["generated_tasks"]) == TASK_COUNT


def test_the_declared_maximum_is_not_enforced_by_the_declaration():
    """3 은 스키마에도 있지만 지키는 주체가 제공자라, 서버가 자르는지 봅니다."""
    decided = {"action": "generate", "domain": "학습", "generated_tasks": list(MANY)}
    result = _run(decided, SHEET)
    assert len(result.data["generated_tasks"]) == TASK_COUNT
    # 앞에서부터 남깁니다 — 모델이 낸 순서가 곧 우선순위입니다.
    assert [t["title"] for t in result.data["generated_tasks"]] == ["과제0", "과제1", "과제2"]


def test_the_cell_capacity_still_wins_when_it_is_tighter():
    """두 상한이 겹치면 **작은 쪽**이 이깁니다.

    한 턴 상한으로 잘랐다고 자리 계산을 건너뛰면 9번째 과제가 저장됩니다.
    """
    result = _run(
        {"action": "generate", "domain": "학습", "generated_tasks": MANY}, _sheet(6)
    )
    assert len(result.data["generated_tasks"]) == 2


def test_a_normal_turn_is_left_alone():
    """상한 이하는 손대지 않습니다 — 자르는 코드가 정상 턴을 갉으면 안 됩니다."""
    result = _run(
        {"action": "generate", "domain": "학습", "generated_tasks": THREE}, SHEET
    )
    assert len(result.data["generated_tasks"]) == len(THREE)


def test_duplicates_are_dropped_before_the_cap_counts():
    """중복을 버린 뒤에 셉니다 — 먼저 자르면 남길 3개가 전부 중복일 수 있습니다."""
    sheet = [
        DomainRef(
            id=7,
            title="학습",
            subjectCount=3,
            subjects=[
                {"id": i, "title": f"이미{i}", "frequency": "daily"} for i in range(3)
            ],
        )
    ]
    tasks = [
        {"title": f"이미{i}", "frequency": "daily", "count": 1, "description": "설명"}
        for i in range(3)
    ] + [
        {"title": f"새것{i}", "frequency": "daily", "count": 1, "description": "설명"}
        for i in range(4)
    ]
    result = _run({"action": "generate", "domain": "학습", "generated_tasks": tasks}, sheet)

    kept = [t["title"] for t in result.data["generated_tasks"]]
    assert kept == ["새것0", "새것1", "새것2"]


def test_a_capacity_note_on_a_duplicate_reply_stays_out_of_the_history():
    """겹쳤다는 사실은 그 턴의 기록이라 남기고 자리 상태만 뺍니다."""
    full = [
        DomainRef(
            id=7,
            title="학습",
            subjectCount=MAX_SUBJECTS_PER_DOMAIN,
            subjects=[
                {"id": i, "title": f"과제{i}", "period": "daily"}
                for i in range(MAX_SUBJECTS_PER_DOMAIN)
            ],
        )
    ]
    result = _run(
        {
            "action": "generate",
            "domain": "학습",
            "generated_tasks": [
                {"title": "과제0", "frequency": "daily", "count": 1, "description": "설명"}
            ],
        },
        full,
    )
    # 사용자는 둘 다 듣는다.
    assert "겹쳐요" in result.text
    assert "다 차서" in result.text
    # 히스토리에는 겹쳤다는 사실만 남는다.
    assert "겹쳐요" in result.history_entry
    assert "다 차서" not in result.history_entry
