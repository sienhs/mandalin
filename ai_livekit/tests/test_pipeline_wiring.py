"""가드가 **`_run` 에서 실제로 불리는지** 본다.

다른 파일들은 정적 메서드를 직접 부른다(`GoalPipeline._settle_lengths(...)`). 그건
"그 함수가 맞게 동작하는가" 를 재지만 **"파이프라인이 그 함수를 부르는가" 는 재지 않는다.**
호출 한 줄을 지우고 전체 테스트를 돌려 봤더니 여섯 가드가 통과했다(2026-08-08) —

    _settle_lengths 호출, _mark_domain_full 호출, _resolve_match 의 domains 인자,
    fill_slots 의 caps=, stuck() 의 clarify 반복 검사, _settle_duplicates 의 retry=

전부 "조용히 통과" 하는 종류다. 이 파일은 그 여섯 자리를 `pipeline.run()` 으로 태워서
막는다. 프롬프트가 아니라 **배선**을 보는 자리라, 모델 판단은 스크립트로 고정한다.
"""
from __future__ import annotations

import re

from mandarin_goal.bot.goal import (
    CLARIFY_STUCK_REPLY,
    EXHAUSTED_REPLY,
    MAX_CAPACITY_SLOT_CHARS,
    GoalPipeline,
)
from mandarin_goal.bot.llm import Turn
from mandarin_goal.config import Settings
from mandarin_goal.sheet import (
    DOMAIN_SLOTS,
    MAX_DOMAIN_TITLE_LENGTH,
    MAX_SUBJECT_TITLE_LENGTH,
    MAX_SUBJECTS_PER_DOMAIN,
    DomainRef,
)

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

FULL_CELL = [
    DomainRef(
        id=9,
        title="운동",
        subjectCount=MAX_SUBJECTS_PER_DOMAIN,
        subjects=[
            {"id": 100 + i, "title": f"운동 과제{i}", "period": "weekly", "countPerPeriod": 3}
            for i in range(MAX_SUBJECTS_PER_DOMAIN)
        ],
    )
]


class ScriptedBackend:
    """1단계는 고정, 3단계는 정해둔 순서대로. **받은 system 프롬프트를 기록한다.**

    프롬프트를 기록하는 이유는 슬롯 상한(`caps`)처럼 **모델에게 무엇이 갔는지**로만
    확인되는 배선이 있어서다 — 결과 dict 로는 보이지 않는다.
    """

    name = "scripted"

    def __init__(self, *decisions: dict, **classified: object) -> None:
        self.decisions = [dict(d) for d in decisions]
        self.classified: dict = {"intent": "goal", "domain": None, "what": None}
        self.classified.update(classified)
        self.systems: list[str] = []

    async def reply_json(self, system, history, schema, **kwargs):
        if "intent" in schema.get("properties", {}):
            return dict(self.classified)
        self.systems.append(system)
        # 되새김 재시도가 있으면 두 번째 응답을 쓴다. 부족하면 마지막을 되풀이한다.
        return dict(self.decisions[min(len(self.systems) - 1, len(self.decisions) - 1)])

    async def aclose(self) -> None:
        return None


def pipeline(backend: ScriptedBackend, **settings: object) -> GoalPipeline:
    return GoalPipeline(
        Settings(
            bot_mode="goal",
            bot_provider="echo",
            bot_classify_model=None,
            bot_decide_model=None,
            bot_system_prompt_file="./prompts/system.md",
            bot_classify_prompt_file="./prompts/classify.md",
            **settings,
        ),
        backend,
    )


def turns(*texts: str) -> list[Turn]:
    """마지막이 사용자 턴 — `Conversation` 이 부르는 모양."""
    return [
        Turn(role="user" if i % 2 == 0 else "assistant", text=t)
        for i, t in enumerate(texts)
    ]


def generated(*titles: str) -> list[dict]:
    return [
        {"title": t, "frequency": "weekly", "count": 2, "description": "설명"}
        for t in titles
    ]


# -- _settle_lengths 를 부르는가 -------------------------------------------------

async def test_an_over_long_domain_is_clipped_through_the_pipeline():
    backend = ScriptedBackend(
        {
            "action": "generate",
            "domain": "가" * (MAX_DOMAIN_TITLE_LENGTH + 20),
            "generated_tasks": generated("과제 하나", "과제 둘", "과제 셋"),
        }
    )
    result = await pipeline(backend).run(turns("목표 세우고 싶어"), SHEET)
    assert len(result.data["domain"]) == MAX_DOMAIN_TITLE_LENGTH


async def test_an_over_long_task_title_is_clipped_through_the_pipeline():
    backend = ScriptedBackend(
        {
            "action": "generate",
            "domain": "학습",
            "generated_tasks": generated("나" * (MAX_SUBJECT_TITLE_LENGTH + 20), "둘", "셋"),
        }
    )
    result = await pipeline(backend).run(turns("공부하고 싶어"), SHEET)
    longest = max(len(t["title"]) for t in result.data["generated_tasks"])
    assert longest == MAX_SUBJECT_TITLE_LENGTH


# -- _mark_domain_full 을 부르는가 -----------------------------------------------

async def test_a_recommend_on_a_full_cell_says_so_in_the_same_turn():
    """꽉 찬 사실이 다음 턴이 아니라 이 턴에 나가야 한다 — 거절 이유가 바뀌지 않게."""
    backend = ScriptedBackend(
        {"action": "recommend", "domain": "운동", "matched_task": {"subject_id": 100}}
    )
    result = await pipeline(backend).run(turns("운동 과제0 하고 싶어"), FULL_CELL)
    assert result.data["action"] == "recommend"
    assert "자리가 다 차서" in result.text


# -- _resolve_match 에 domains 를 넘기는가 --------------------------------------

async def test_an_id_outside_the_candidate_list_resolves_through_the_pipeline():
    """후보를 1건으로 좁혀 놓고, 그 밖의 id 를 지목하게 한다.

    `domains` 를 안 넘기면 제목을 못 채워 "제목을 읽지 못했습니다" 로 끝난다.
    """
    backend = ScriptedBackend(
        {"action": "recommend", "domain": "학습", "matched_task": {"subject_id": 7}},
        what="알고리즘 문제 풀기",  # 후보 1위는 id 3 이 된다
    )
    result = await pipeline(backend, bot_candidate_count=1).run(
        turns("코테 준비하고 싶어"), SHEET
    )
    assert result.data["matched_task"]["title"] == "코테 준비하기"
    assert "제목을 읽지 못했습니다" not in result.text


# -- fill_slots 에 caps 를 넘기는가 ---------------------------------------------

async def test_the_capacity_slot_is_not_truncated_in_the_real_prompt():
    """**모델에게 간 프롬프트**로 확인한다 — 결과 dict 로는 보이지 않는 배선이다.

    기본 상한(`MAX_SLOT_CHARS` 2,000)으로 재면 이 시트에서 슬롯이 잘리고 뒤쪽 칸의
    과제가 사라진다. 사라진 과제는 모델에게 존재하지 않는 것이 되고, 그게 곧 중복
    판정의 근거다.
    """
    big = [
        DomainRef(
            id=d,
            title=f"칸{d}",
            subjectCount=MAX_SUBJECTS_PER_DOMAIN,
            subjects=[
                # 제목 길이를 못 박습니다 — 짧으면 슬롯이 기본 상한(2,000)을 안 넘어
                # 이 테스트가 아무것도 재지 않습니다(아래 assert 가 그것을 잡습니다).
                {"id": d * 100 + s, "title": f"과제 제목 {d}-{s}".ljust(22, "가"),
                 "period": "weekly", "countPerPeriod": 3}
                for s in range(MAX_SUBJECTS_PER_DOMAIN)
            ],
        )
        for d in range(DOMAIN_SLOTS)
    ]
    total = DOMAIN_SLOTS * MAX_SUBJECTS_PER_DOMAIN
    backend = ScriptedBackend({"action": "clarify", "clarify_question": "어느 칸에 담을까요?"})
    await pipeline(backend).run(turns("뭐라도 시작하고 싶어"), big)

    assert backend.systems, "decide 단계가 안 불렸습니다"
    slot = re.search(
        r"<existing_domain_tasks>(.*?)</existing_domain_tasks>", backend.systems[0], re.DOTALL
    )
    assert slot is not None
    kept = len(re.findall(r"\[\d+\]", slot.group(1)))
    assert kept == total, f"과제가 사라졌습니다 ({kept}/{total})"
    assert "…(생략)" not in slot.group(1)
    assert len(slot.group(1)) > 2000, "이 시트가 기본 상한을 넘지 않으면 배선을 못 잽니다"
    assert len(slot.group(1)) <= MAX_CAPACITY_SLOT_CHARS


# -- stuck() 이 clarify 반복을 잡는가 -------------------------------------------

QUESTION = "특정 주제로 대화하기 / 경청하는 연습하기 중 어떤 것에 집중해 볼까요?"


async def test_the_same_question_twice_is_broken_through_the_pipeline():
    """직전에 한 말과 같은 되묻기를 고집하면 서버가 루프를 끊는다."""
    backend = ScriptedBackend(
        {"action": "clarify", "clarify_question": QUESTION},
        {"action": "clarify", "clarify_question": QUESTION},
    )
    result = await pipeline(backend).run(
        turns("대화를 잘하고 싶어", QUESTION, "특정 주제로 대화하기"), SHEET
    )
    assert "nudge" in result.stages, "되새김으로 한 번 더 굴려야 한다"
    assert result.stages[-1] == "stuck"
    assert result.text == CLARIFY_STUCK_REPLY
    assert result.text != QUESTION


async def test_a_changed_question_is_left_alone():
    """가드는 루프만 끊는다 — 진전이 있으면 그대로 내보낸다."""
    backend = ScriptedBackend(
        {"action": "clarify", "clarify_question": "주 몇 회 정도 시간을 낼 수 있으세요?"}
    )
    result = await pipeline(backend).run(
        turns("대화를 잘하고 싶어", QUESTION, "특정 주제로 대화하기"), SHEET
    )
    assert "nudge" not in result.stages
    assert result.text == "주 몇 회 정도 시간을 낼 수 있으세요?"


# -- 재요청 턴에 "겹쳐요" 가 안 나가는가 ----------------------------------------

async def test_a_retry_turn_with_only_duplicates_ends_honestly():
    """이미 담긴 제목만 다시 내밀면 "겹쳐요" 가 아니라 "낼 것이 떨어졌다" 로 끝난다.

    `_settle_duplicates(retry=)` 와 `stuck()` 의 recommend 검사가 **같은 결과로**
    수렴하므로(둘 다 EXHAUSTED_REPLY), 이 테스트는 둘 중 하나만 지워도 통과한다 —
    단위 테스트가 그 둘을 따로 본다(`test_duplicate_tasks`, `test_stuck_loop`).
    """
    duplicate = {
        "action": "generate",
        "domain": "학습",
        "generated_tasks": generated("알고리즘 문제 풀기", "코테 준비하기"),
    }
    backend = ScriptedBackend(duplicate, duplicate, retry=True)
    result = await pipeline(backend).run(turns("다른 거 없어?"), SHEET)
    assert result.text == EXHAUSTED_REPLY
    assert "겹쳐요" not in result.text
