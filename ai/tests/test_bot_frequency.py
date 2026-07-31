"""실천 빈도 — `mission`/`mindset` 과 `is_recurring` 을 대체한 단일 필드.

일간(주 7회) / 주간(주 1회) / 없음(단 한 번) 셋뿐입니다. 여기서 지키는 것은
두 가지입니다: **폐지한 어휘가 어디에도 남아 있지 않을 것**, 그리고 **프롬프트가
알려주는 값과 스키마가 강제하는 값이 같을 것**. 둘 중 하나만 어긋나도 모델은
스키마에 막히거나, 언제 무엇을 써야 할지 모르게 됩니다.
"""
import json
import re

import pytest
from test_bot_goal import ScriptedBackend, make_settings, write_templates

from app.bot.goal import GOAL_SCHEMA, GoalPipeline, render
from app.bot.prompt import PROJECT_ROOT, SystemPrompt
from app.bot.templates import FREQUENCY_LABELS, TemplateStore, frequency_label

FREQUENCIES = ("daily", "weekly", "none")

#: 폐지한 어휘. 프롬프트와 카탈로그에 남아 있으면 모델이 다시 쓰기 시작합니다.
RETIRED = ("mindset", "is_recurring", '"type"')


def shipped(name: str) -> str:
    return (PROJECT_ROOT / "prompts" / name).read_text(encoding="utf-8")


# ── 어휘 ───────────────────────────────────────────────────────────────
def test_there_are_exactly_three_frequencies():
    assert tuple(FREQUENCY_LABELS) == FREQUENCIES


def board_js() -> str:
    return (PROJECT_ROOT / "static" / "js" / "board.js").read_text(encoding="utf-8")


def test_the_browser_board_uses_the_same_three_frequencies():
    """`board.js` 의 어휘가 서버와 어긋나면 같은 과제가 다른 이름으로 보입니다.

    README 가 "똑같아야 합니다" 라고 적어두었지만 지키는 테스트가 없었습니다.
    파일을 읽어 비교합니다 — 이 프로젝트의 `static/` 에는 빌드 도구가 없어서
    JS 테스트 러너를 들일 수 없습니다.
    """
    block = re.search(r"const FREQUENCY_LABELS = \{(.*?)\};", board_js(), re.S).group(1)
    keys = tuple(re.findall(r"^\s*(\w+):", block, re.M))
    assert keys == tuple(FREQUENCY_LABELS)


def test_the_board_maps_frequency_to_the_spring_enum():
    """`SUBJECT_PERIOD` 는 `SubjectPeriod`(백엔드 enum)로 가는 유일한 변환 지점입니다.

    시트 초안(`sheetDraft()`)이 `POST /api/v1/sheets` 로 그대로 가므로, 매핑이 비면
    `period` 가 `undefined` 로 나가 서버 검증에서 걸립니다. 빈도 값을 한쪽에만
    추가하는 순간 그렇게 됩니다.
    """
    block = re.search(r"const SUBJECT_PERIOD = \{(.*?)\};", board_js(), re.S).group(1)
    mapping = dict(re.findall(r"(\w+):\s*'(\w+)'", block))

    assert set(mapping) == set(FREQUENCY_LABELS)
    # 값은 Spring `SubjectPeriod` 의 상수 이름입니다 (DAILY / WEEKLY / NONE).
    assert mapping == {key: key.upper() for key in FREQUENCY_LABELS}


def test_the_board_caps_domains_at_the_sheet_size():
    """시트는 8 도메인 x 8 과제 = 64칸 고정입니다(서버 `TOTAL_SUBJECT_COUNT = 64.0`).

    9번째 도메인을 담게 두면 `sheetDraft()` 가 `position` 을 줄 자리가 없습니다.
    """
    source = board_js()
    assert re.search(r"export const DOMAIN_CAPACITY = 8;", source)
    assert re.search(r"export const SHEET_DOMAIN_CAPACITY = 8;", source)


def test_labels_say_how_often():
    """'일간' 만으로는 주 7회인지 알 수 없습니다. 숫자가 라벨에 있어야 합니다."""
    assert "7" in FREQUENCY_LABELS["daily"]
    assert "1" in FREQUENCY_LABELS["weekly"]


def test_an_unknown_frequency_has_no_label():
    """모르는 값을 '없음' 으로 단정하면 매일 할 일이 한 번짜리가 됩니다."""
    assert frequency_label("monthly") is None
    assert frequency_label(None) is None
    assert frequency_label("") is None


# ── 스키마 ─────────────────────────────────────────────────────────────
def test_a_generated_task_carries_a_frequency():
    properties = GOAL_SCHEMA["properties"]["generated_task"]["properties"]
    assert properties["frequency"]["enum"] == list(FREQUENCIES)


def test_a_matched_task_asks_only_for_the_template_id():
    """제목·빈도는 서버가 카탈로그에서 채웁니다(`_resolve_match`).

    모델에게 후보의 값을 베끼게 두었더니 제목 필드에서 생성이 무너져
    (같은 문장 130회 반복) 토큰 상한까지 태우고 JSON 이 잘렸습니다.
    """
    assert set(GOAL_SCHEMA["properties"]["matched_task"]["properties"]) == {"template_id"}


@pytest.mark.parametrize("slot", ["matched_task", "generated_task"])
def test_the_retired_fields_are_gone_from_the_schema(slot):
    properties = GOAL_SCHEMA["properties"][slot]["properties"]
    assert "type" not in properties
    assert "is_recurring" not in properties


def test_the_shipped_prompt_documents_the_same_frequencies_as_the_schema():
    """프롬프트에만 있는 값은 모델이 쓰려다 막히고, 스키마에만 있는 값은 안 쓰입니다."""
    text = SystemPrompt(make_settings(bot_system_prompt_file="./prompts/system.md")).text()
    # 값 목록의 출처는 `task_frequency` 규칙입니다. 예전에는 <output_format> 의
    # 스키마 JSON 에도 같은 목록이 있었지만, responseSchema 가 이미 강제하는 것을
    # 프롬프트에 복제해 두면 드리프트만 늘어서 지웠습니다.
    documented = re.findall(r"^\s+- (\w+)\s*:", text, re.M)
    assert documented, "프롬프트 task_frequency 규칙에 값 목록이 없습니다"
    assert sorted(documented) == sorted(FREQUENCIES)


@pytest.mark.parametrize("name", ["system.md", "classify.md"])
def test_no_prompt_still_mentions_the_retired_concepts(name):
    text = shipped(name)
    for word in RETIRED:
        assert word not in text, f"{name} 에 {word} 가 남아 있습니다"


def test_the_prompt_explains_all_three_values():
    """값만 나열하고 언제 쓰는지 안 알려주면 모델이 daily 로 몰립니다."""
    text = shipped("system.md")
    for value in FREQUENCIES:
        assert value in text


# ── 카탈로그 ───────────────────────────────────────────────────────────
def test_every_shipped_template_declares_a_valid_frequency():
    rows = json.loads((PROJECT_ROOT / "prompts" / "templates.json").read_text(encoding="utf-8"))
    assert rows
    for row in rows:
        assert row.get("frequency") in FREQUENCIES, row


#: 세 버킷으로 표현할 수 없는 주기를 제목이 말하고 있는 경우.
#:
#: "월 1회 …" 인데 frequency 가 `none`(단 한 번)이면 둘이 서로 다른 말을 합니다.
#: 모델은 제목을 읽고 배우므로, 카탈로그에 이런 항목이 있으면 표현할 수 없는
#: 주기를 따라 만들기 시작합니다.
UNEXPRESSIBLE_CADENCE = re.compile(r"분기|매월|월간|월 \d|주 [2-9]회|격주|격일")


def test_no_shipped_title_promises_a_cadence_the_model_cannot_express():
    rows = json.loads((PROJECT_ROOT / "prompts" / "templates.json").read_text(encoding="utf-8"))
    offenders = [r["title"] for r in rows if UNEXPRESSIBLE_CADENCE.search(r["title"])]
    assert not offenders, f"일간/주간/없음 으로 표현할 수 없는 주기: {offenders}"


def test_a_weekly_title_is_not_labelled_daily():
    """제목이 '주 1회' 인데 daily 면 화면과 제목이 서로 다른 말을 합니다."""
    rows = json.loads((PROJECT_ROOT / "prompts" / "templates.json").read_text(encoding="utf-8"))
    for row in rows:
        if "주 1회" in row["title"] or "주말" in row["title"]:
            assert row["frequency"] == "weekly", row
        if row["title"].startswith("매일") or row["title"].startswith("하루"):
            assert row["frequency"] == "daily", row


def test_the_candidate_line_carries_the_frequency():
    """후보에 빈도가 없으면 모델이 추천 과제의 주기를 매번 새로 지어냅니다."""
    store = TemplateStore("./prompts/templates.json")
    line = store.all()[0].as_prompt_line()
    assert '"frequency"' in line
    assert json.loads(line.removeprefix("- "))["frequency"] in FREQUENCIES


def test_an_invalid_frequency_falls_back_and_warns(tmp_path, caplog):
    path = tmp_path / "templates.json"
    rows = [{"id": "tpl_x", "domain": "학습", "title": "제목", "frequency": "monthly"}]
    path.write_text(json.dumps(rows, ensure_ascii=False), encoding="utf-8")

    store = TemplateStore(str(path))
    with caplog.at_level("WARNING"):
        items = store.all()
    assert items[0].frequency == "none"
    assert "monthly" in caplog.text


def test_a_template_without_a_frequency_is_not_a_crash(tmp_path):
    path = tmp_path / "templates.json"
    rows = [{"id": "tpl_x", "domain": "학습", "title": "제목"}]
    path.write_text(json.dumps(rows, ensure_ascii=False), encoding="utf-8")
    assert TemplateStore(str(path)).all()[0].frequency == "none"


# ── 렌더링 ─────────────────────────────────────────────────────────────
@pytest.mark.parametrize("value", FREQUENCIES)
def test_generate_shows_the_frequency(value):
    text = render({"action": "generate", "generated_task": {"title": "제목", "frequency": value}})
    assert FREQUENCY_LABELS[value] in text


def test_recommend_shows_the_frequency():
    text = render(
        {"action": "recommend", "matched_task": {"title": "제목", "frequency": "weekly"}}
    )
    assert FREQUENCY_LABELS["weekly"] in text


def test_a_missing_frequency_renders_the_title_alone():
    """빈도를 못 읽었다고 응답 전체가 깨지거나 틀린 주기를 말하면 안 됩니다."""
    text = render({"action": "generate", "generated_task": {"title": "제목"}})
    assert "제목" in text
    assert not any(label in text for label in FREQUENCY_LABELS.values())


# ── 파이프라인 ─────────────────────────────────────────────────────────
async def test_the_board_payload_carries_the_frequency(tmp_path):
    backend = ScriptedBackend(
        classify={"intent": "goal", "domain": "학습", "transcript": "매일 알고리즘"},
        decide={
            "action": "generate",
            "domain": "학습",
            "generated_task": {"title": "매일 알고리즘 1문제 풀기", "frequency": "daily"},
        },
    )
    pipeline = GoalPipeline(
        make_settings(bot_template_file=str(write_templates(tmp_path))), backend
    )
    result = await pipeline.run([])
    assert result.data["generated_task"]["frequency"] == "daily"


async def test_candidates_reach_the_prompt_with_their_frequency(tmp_path):
    backend = ScriptedBackend(
        classify={"intent": "goal", "domain": "학습", "transcript": "알고리즘 풀고 싶어"},
        decide={"action": "clarify", "clarify_question": "얼마나 자주 하시겠어요?"},
    )
    pipeline = GoalPipeline(
        make_settings(
            bot_template_file=str(write_templates(tmp_path)),
            bot_system_prompt_file="./prompts/system.md",
        ),
        backend,
    )
    await pipeline.run([])
    decide_prompt = backend.json_calls[1][0]
    assert '"frequency": "daily"' in decide_prompt
