"""주기와 횟수는 **한 쌍**이고, 짝을 맞추는 것은 서버의 일이다.

주기가 넷으로 늘고(일간·주간·월간·한번만) 그 안의 횟수가 생기면서, 값 하나로는
빈도를 표현할 수 없게 되었습니다. 규칙은 주기마다 다릅니다 —

    daily   1 고정      weekly  1~7
    monthly 1~30        none    1 고정

**이 규칙을 어겨도 아무것도 실패하지 않습니다.** Spring 은 `countPerPeriod` 를
`@Min(1) @Max(30)` 으로만 받고 주기별 상한은 검사하지 않습니다(상한이 `period` 값에
달려 있어서 어노테이션으로 못 박습니다 — `SheetCreateRequest` 주석). 그래서 "매일 3회"
나 "주 10회" 가 그대로 저장되고, 서버는 목표 횟수를 `countPerPeriod × 주기 수` 로
산정하므로 **사용자가 채울 수 없는 목표**가 됩니다. 에러도 경고도 없습니다.

프롬프트로도 막지만 강제는 서버에서 합니다 — 프롬프트는 어겨도 조용히 통과합니다.
이 파일이 그 경계를 지킵니다.
"""
import asyncio

from mandarin_goal.bot.goal import GoalPipeline
from mandarin_goal.bot.llm import Turn
from mandarin_goal.bot.prompt import PROJECT_ROOT
from mandarin_goal.bot.subjects import Candidate, frequency_label
from mandarin_goal.config import Settings
from mandarin_goal.sheet import (
    FREQUENCIES,
    FREQUENCY_MAX_COUNT,
    DomainRef,
    SubjectRef,
    normalise_count,
)

SETTINGS = Settings(
    bot_mode="goal",
    bot_provider="echo",
    bot_classify_model=None,
    bot_decide_model=None,
)


# -- 규칙 자체 -------------------------------------------------------------
def test_fixed_periods_ignore_whatever_the_model_says():
    """일간·한번만은 **1 고정**이다 — 사용자도 못 바꾸는 자리다.

    모델이 3 을 내밀면 그건 제안이 아니라 오류입니다. "하루 3회" 를 원한다면 과제를
    나눌 일이고, 여기서 통과시키면 하루 세 번 눌러야 하는 과제가 담깁니다.
    """
    for period in ("daily", "none"):
        assert normalise_count(period, 5) == 1
        assert normalise_count(period, None) == 1
        assert normalise_count(period, 1) == 1


def test_variable_periods_are_clamped_not_rejected():
    """주간·월간은 범위 안으로 **자릅니다**(거부하지 않습니다).

    거부하면 횟수 하나 때문에 과제가 통째로 사라집니다. 자르면 사용자가 편집기에서
    고칠 수 있는 형태로 남습니다 — 잘못된 값보다 나쁜 것은 사라진 값입니다.
    """
    assert normalise_count("weekly", 3) == 3
    assert normalise_count("weekly", 7) == 7
    assert normalise_count("weekly", 10) == FREQUENCY_MAX_COUNT["weekly"]
    assert normalise_count("monthly", 2) == 2
    assert normalise_count("monthly", 99) == FREQUENCY_MAX_COUNT["monthly"]
    # 0·음수·비어 있음·숫자가 아닌 값은 1 로. 주기를 아는 이상 "최소 한 번" 은 확실하고
    # `count_per_period` 는 `NOT NULL DEFAULT 1` 컬럼입니다.
    assert normalise_count("weekly", 0) == 1
    assert normalise_count("weekly", -4) == 1
    assert normalise_count("weekly", None) == 1
    assert normalise_count("weekly", "세 번") == 1


def test_an_unknown_period_has_no_count():
    """주기를 모르면 횟수도 없다.

    기본값 1 을 붙이면 "한 번만" 인지 "모른다" 인지 구분이 사라집니다. `None` 이면
    `frequency_label()` 이 표시를 생략하는 기존 경로로 흘러갑니다.
    """
    assert normalise_count(None, 3) is None
    assert normalise_count("", 3) is None
    assert normalise_count("quarterly", 3) is None


# -- 들어오는 값 -----------------------------------------------------------
def test_the_sheet_settles_counts_on_the_way_in():
    """시트로 실려 온 값도 같은 규칙을 지납니다.

    클라이언트가 셋(프론트·브라우저 데모·eval 픽스처)이라 한 곳만 어긋나도 규칙이
    새는데, 증상은 "주 3회가 주 1회로 담긴다" 뿐입니다.
    """
    assert SubjectRef(title="a", period="daily", countPerPeriod=5).count == 1
    assert SubjectRef(title="a", period="weekly", countPerPeriod=9).count == 7
    # 전송 이름 세 가지를 다 받습니다 — 하나가 어긋나면 값이 조용히 `None` 이 됩니다.
    assert SubjectRef(title="a", period="weekly", count_per_period=3).count == 3
    assert SubjectRef(title="a", frequency="weekly", count=3).count == 3
    # 주기를 모르면 횟수도 버립니다.
    assert SubjectRef(title="a", period="quarterly", countPerPeriod=3).count is None


def test_the_candidate_line_carries_the_count():
    """후보 줄에 횟수가 실려야 **중복 판정이 성립합니다.**

    기준이 "행동과 빈도가 둘 다 같아야 겹친다" 인데, 주간이 1~7회로 갈라진 뒤로는
    주기만으로 빈도가 정해지지 않습니다 — 횟수를 빼면 모델에게 "주 1회 러닝" 과
    "주 5회 러닝" 이 같은 줄로 보입니다.
    """
    ran = Candidate(id=3, domain="건강", title="러닝", frequency="weekly", count=5)
    line = ran.as_prompt_line()
    assert '"frequency": "weekly"' in line
    assert '"count": 5' in line
    # 주기를 모르면 둘 다 싣지 않습니다.
    assert "count" not in Candidate(id=3, domain="건강", title="러닝").as_prompt_line()


# -- 사람이 읽는 문구 ------------------------------------------------------
def test_the_label_never_shows_a_count_it_does_not_know():
    """모르는 횟수를 1 로 단정하지 않습니다.

    예전 라벨은 `"weekly": "주간 · 주 1회"` 였습니다. 주간이 1~7회가 된 뒤로 그
    문자열은 **주 3회짜리 과제를 주 1회로 표시합니다** — 값은 맞는데 화면만 틀리는,
    제일 찾기 어려운 종류입니다.
    """
    assert frequency_label("weekly", 3) == "주간 · 주 3회"
    assert frequency_label("monthly", 2) == "월간 · 월 2회"
    # 횟수를 모르면 주기까지만.
    assert frequency_label("weekly") == "주간"
    # 고정 주기는 셀 것이 없어 횟수 없이도 문장이 완성됩니다.
    assert frequency_label("daily") == "일간 · 하루 1회"
    assert frequency_label("none") == "한번만 · 기간 내 1회"
    assert frequency_label("quarterly") is None
    assert frequency_label(None) is None


# -- 파이프라인 경계 -------------------------------------------------------
class FakeBackend:
    """1단계는 goal 로 통과시키고 3단계는 미리 정한 판단을 돌려줍니다."""

    name = "fake"

    def __init__(self, decided: dict) -> None:
        self._decided = decided

    async def reply_json(self, system, history, schema, *, max_output_tokens=None, **_):
        if "intent" in schema.get("properties", {}):
            return {"intent": "goal", "domain": None}
        return dict(self._decided)

    async def aclose(self) -> None:
        return None


def test_the_pipeline_settles_counts_before_the_client_sees_them():
    """**브라우저까지 가는 dict 가 이미 맞춰져 있어야 합니다.**

    프론트가 이 값을 그대로 `subject` 생성에 씁니다. 여기서 안 맞추면 담기 API 로
    "매일 5회" 가 나가고, Spring 은 그것을 받아 줍니다.
    """
    decided = {
        "action": "generate",
        "domain": "건강",
        "generated_tasks": [
            {"title": "스트레칭", "frequency": "daily", "count": 5},
            {"title": "근력 운동", "frequency": "weekly", "count": 99},
            {"title": "체중 기록", "frequency": "weekly"},
            {"title": "건강검진", "frequency": "none", "count": 3},
        ],
    }
    pipeline = GoalPipeline(SETTINGS, FakeBackend(decided))
    result = asyncio.run(
        pipeline.run(
            [Turn(role="user", text="건강 관리하고 싶어")],
            [DomainRef(id=1, title="건강")],
        )
    )
    counts = [t.get("count") for t in result.data["generated_tasks"]]
    assert counts == [1, 7, 1, 1], counts
    # 사람이 읽는 문장에도 잘린 값이 나가야 합니다 — 화면과 payload 가 갈리면 안 됩니다.
    assert "주 7회" in result.text
    assert "주 99회" not in result.text


# -- 스키마가 실제로 값을 받아내는가 ---------------------------------------
def test_every_task_field_is_required_or_the_model_skips_it():
    """**`required` 가 없는 필드는 모델이 그냥 안 채웁니다.**

    실측(2026-08-04, gemini-2.5-flash-lite): 과제를 배열로 바꾼 첫 실행에서 세 과제가
    전부 `{"title": ...}` 만 왔습니다 — `finish=STOP`, output 55토큰이라 **잘림이
    아니고**, 스키마가 허용한 **최소 객체**를 낸 것입니다. 스키마에 있다는 것은
    "채워도 된다" 일 뿐입니다.

    증상이 "값이 틀리다" 가 아니라 "값이 없다" 라서 프롬프트를 아무리 고쳐도 안 나오고,
    화면에서는 빈도 배지가 조용히 빕니다. `matched_task.subject_id` 도 같은 함정입니다 —
    빠지면 `_resolve_match` 가 제목을 못 채워 "제목을 읽지 못했습니다" 로 끝납니다.
    """
    from mandarin_goal.bot.goal import GOAL_SCHEMA

    task = GOAL_SCHEMA["properties"]["generated_tasks"]["items"]
    assert set(task["required"]) == {"title", "frequency", "count", "description"}, (
        "과제의 네 필드가 전부 required 여야 합니다 — 빠진 필드는 모델이 생략합니다"
    )
    # 설명은 맨 뒤여야 합니다. 잘리면 뒤부터 사라지는데, 없어도 카드가 그려지는 것은
    # 설명뿐입니다(빈도·횟수는 그렇지 않습니다).
    assert task["propertyOrdering"][-1] == "description"

    matched = GOAL_SCHEMA["properties"]["matched_task"]
    assert matched["required"] == ["subject_id"], (
        "subject_id 가 required 가 아니면 recommend 가 빈 객체로 올 수 있습니다"
    )


# -- 프롬프트와 코드가 같은 어휘를 쓰는가 ----------------------------------
def test_the_prompt_teaches_every_period_and_its_ceiling():
    """프롬프트가 네 주기와 상한을 다 적고 있는가.

    스키마의 enum 은 `FREQUENCIES` 에서 자동으로 나오지만(`bot/goal.py`), **프롬프트는
    사람이 손으로 씁니다.** 어휘를 늘리면서 프롬프트를 안 고치면 모델은 그 값이
    존재하는 줄 모릅니다 — 스키마가 허용하는데 한 번도 쓰이지 않는 값이 됩니다
    (`monthly` 를 넣기 전 이 저장소가 실제로 그랬습니다: 월 1회 → `none`).
    """
    text = (PROJECT_ROOT / "prompts" / "system.md").read_text(encoding="utf-8")
    for period in FREQUENCIES:
        assert period in text, f"prompts/system.md 에 {period} 가 없습니다"
    # 상한도 적혀 있어야 합니다. 없으면 모델이 주 20회를 내고 서버가 매번 자릅니다.
    assert "1~7" in text
    assert "1~30" in text
    # 고정이라는 사실도 — count 를 쓸 자리가 없다는 뜻입니다.
    assert "고정" in text
