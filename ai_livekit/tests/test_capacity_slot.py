"""꽉 찬 시트에서도 담긴 과제가 프롬프트에서 사라지지 않는다.

`<existing_domain_tasks>` 는 중복 판정의 근거다. 예전에는 이 슬롯이 다른 슬롯과 같은
상한(`MAX_SLOT_CHARS` 2,000)을 써서, **8칸이 다 차고 제목이 평균 17자를 넘으면**
뒤쪽 칸의 과제가 조용히 사라졌다(실측: 12자 1,744 / 16자 2,000 / 20자 2,256자).

하필 그 조합에서 근거가 가장 필요하다 —

  - 칸이 다 차면 담긴 과제가 64건까지 늘어난다(겹칠 확률이 가장 높다)
  - **재요청 턴에는 후보 검색을 건너뛰므로**(`_run` 의 `retry`) 이 목록이 유일한 근거다

`_settle_duplicates` 가 시트 원본으로 정확 일치를 잡아 주므로 correctness 구멍은
아니지만, 모델이 "이미 있는 것" 을 못 보면 비슷한 과제를 다시 만들고 칸 선택도
어긋난다. 그래서 **과제를 빼는 대신 제목을 줄인다**(`CAPACITY_TITLE_CLIP`).
"""
from __future__ import annotations

import re

from mandarin_goal.bot.goal import (
    CAPACITY_TITLE_CLIPS,
    MAX_CAPACITY_SLOT_CHARS,
    MAX_SLOT_CHARS,
    GoalPipeline,
    escape_slot_value,
    fill_slots,
    split_reminder,
)
from mandarin_goal.bot.llm import EchoBackend
from mandarin_goal.config import Settings
from mandarin_goal.sheet import (
    DOMAIN_SLOTS,
    MAX_DOMAIN_TITLE_LENGTH,
    MAX_DOMAINS,
    MAX_SUBJECT_TITLE_LENGTH,
    MAX_SUBJECTS_PER_DOMAIN,
    DomainRef,
)

#: 8칸 x 8과제 = **정원**이 허용하는 최대 과제 수.
TOTAL_SUBJECTS = DOMAIN_SLOTS * MAX_SUBJECTS_PER_DOMAIN


def pipeline() -> GoalPipeline:
    return GoalPipeline(
        Settings(
            bot_mode="goal",
            bot_provider="echo",
            bot_system_prompt_file="./prompts/system.md",
            bot_classify_prompt_file="./prompts/classify.md",
        ),
        EchoBackend(),
    )


def full_sheet(title_length: int, domain_count: int = DOMAIN_SLOTS) -> list[DomainRef]:
    """칸도 과제도 꽉 찬 시트. 제목 길이와 칸 수를 바꿔 가며 잰다.

    `domain_count` 를 둔 이유: `_capacity_context` 가 훑는 것은 정원(`DOMAIN_SLOTS` 8)이
    아니라 **넘어온 칸 전부**이고, 전송 상한은 `MAX_DOMAINS`(16)다. 8칸만 재면 16칸짜리
    시트에서 과제가 사라지는 것을 못 잡는다 — 실제로 그랬다(24자에서 20건).
    """
    return [
        DomainRef(
            id=d,
            title=f"칸{d}",
            subjectCount=MAX_SUBJECTS_PER_DOMAIN,
            subjects=[
                {
                    "id": d * 100 + s,
                    "title": f"과제{d}_{s}".ljust(title_length, "나"),
                    "period": "weekly",
                    "countPerPeriod": 3,
                }
                for s in range(MAX_SUBJECTS_PER_DOMAIN)
            ],
        )
        for d in range(domain_count)
    ]


def capacity_slot(domains: list[DomainRef]) -> str:
    """`_run` 과 **같은 경로**로 채운 뒤 슬롯 안쪽만 꺼낸다.

    `_capacity_context()` 를 직접 보면 안 된다 — 실제로 자르는 곳은 `fill_slots` 의
    `escape_slot_value` 이고, 거기 상한이 어긋나면 이 테스트가 통과하면서 프롬프트는
    잘린다. 그 조합이 원래 버그였다.
    """
    pipe = pipeline()
    prompt = fill_slots(
        pipe._goal_prompt.text(),
        {
            "final_goal": "건강한 몸 만들기",
            "domain_list": pipe._domain_list(domains),
            "domain_slots": pipe._slots_context(domains),
            "existing_domain_tasks": pipe._capacity_context(domains),
            "existing_subjects": "(담긴 과제 없음)",
        },
        caps={"existing_domain_tasks": MAX_CAPACITY_SLOT_CHARS},
    )
    match = re.search(
        r"<existing_domain_tasks>(.*?)</existing_domain_tasks>", prompt, re.DOTALL
    )
    assert match is not None, "슬롯이 프롬프트에 없습니다"
    return match.group(1)


def kept_subjects(slot: str) -> int:
    """`[id]` 표시를 세면 모델이 지목할 수 있는 과제 수가 나온다."""
    return len(re.findall(r"\[\d+\]", slot))


def test_no_subject_disappears_at_any_title_length():
    """**이 파일의 핵심.** 제목이 길어도 64건이 전부 남아야 한다."""
    for title_length in (8, 12, 16, 20, 24, 30, 40, MAX_SUBJECT_TITLE_LENGTH):
        slot = capacity_slot(full_sheet(title_length))
        assert kept_subjects(slot) == TOTAL_SUBJECTS, (
            f"제목 {title_length}자에서 과제가 사라졌습니다 "
            f"({kept_subjects(slot)}/{TOTAL_SUBJECTS}, 슬롯 {len(slot)}자)"
        )


def test_no_subject_disappears_at_the_transfer_limit():
    """**정원을 넘겨 온 시트도 버텨야 한다.**

    `DOMAIN_SLOTS`(8)는 만다라트 정원이고 `MAX_DOMAINS`(16)는 전송 상한이라, 16칸짜리
    시트가 실제로 도달한다. 줄임 길이가 24자 하나로 고정이었을 때 128건 중 20건이
    사라졌다 — 그래서 `CAPACITY_TITLE_CLIPS` 가 여러 값이다.
    """
    for domain_count in (DOMAIN_SLOTS, 12, MAX_DOMAINS):
        total = domain_count * MAX_SUBJECTS_PER_DOMAIN
        for title_length in (12, 24, MAX_SUBJECT_TITLE_LENGTH):
            slot = capacity_slot(full_sheet(title_length, domain_count))
            assert kept_subjects(slot) == total, (
                f"칸 {domain_count}개 / 제목 {title_length}자에서 과제가 사라졌습니다 "
                f"({kept_subjects(slot)}/{total}, 슬롯 {len(slot)}자)"
            )
            assert "…(생략)" not in slot, "슬롯이 뒤에서 잘렸습니다 — 과제가 사라집니다"


def test_the_slot_stays_within_its_own_cap():
    """상한을 없앤 것이 아니다 — 슬롯 전용 상한 안에 들어와야 한다(토큰 예산)."""
    for title_length in (8, 24, MAX_SUBJECT_TITLE_LENGTH):
        slot = capacity_slot(full_sheet(title_length))
        assert len(slot) <= MAX_CAPACITY_SLOT_CHARS + len(" …(생략)")


def test_the_longest_titles_are_clipped_not_dropped():
    """시트 상한 길이에서는 제목이 줄어든다. **줄었다는 표시가 남아야** 한다 —
    없으면 모델이 잘린 제목을 온전한 이름으로 읽고 그것으로 중복을 판단한다."""
    slot = capacity_slot(full_sheet(MAX_SUBJECT_TITLE_LENGTH))
    assert "…" in slot
    assert kept_subjects(slot) == TOTAL_SUBJECTS
    # 줄인 제목이 실제로 그 길이인지 — 표시(…)를 뺀 길이로 본다.
    titles = re.findall(r"\[\d+\](.+?)\(주3\)", slot)
    assert titles, "제목을 읽지 못했습니다"
    assert all(len(t.rstrip("…")) <= CAPACITY_TITLE_CLIPS[0] for t in titles)


def test_a_short_sheet_is_not_clipped():
    """줄임은 넘칠 때만이다 — 평범한 시트의 제목을 건드리면 안 된다."""
    slot = capacity_slot(full_sheet(12))
    assert "…" not in slot


def test_the_reminder_survives_a_full_sheet():
    """상한(`bot_system_prompt_max_chars`)은 **파일에만** 걸리고 슬롯 채우기 전에
    적용된다. 그래서 시트가 커져도 `<reminder>`(인젝션 되새김)는 살아 있어야 한다 —
    그게 잘리는 것이 `config.py` 에 기록된 2026-08-04 사고다."""
    pipe = pipeline()
    domains = full_sheet(MAX_SUBJECT_TITLE_LENGTH)
    prompt = fill_slots(
        pipe._goal_prompt.text(),
        {
            "final_goal": "건강한 몸 만들기",
            "domain_list": pipe._domain_list(domains),
            "domain_slots": pipe._slots_context(domains),
            "existing_domain_tasks": pipe._capacity_context(domains),
            "existing_subjects": "(담긴 과제 없음)",
        },
        caps={"existing_domain_tasks": MAX_CAPACITY_SLOT_CHARS},
    )
    _, reminder = split_reminder(prompt)
    assert reminder, "시트가 큰데 되새김이 사라졌습니다"


def test_a_too_long_domain_is_clipped_to_what_the_sheet_accepts():
    """프롬프트 규칙 6의 20자는 **품질 기준**이고, 여기서 막는 것은 저장이 깨지는 길이다.

    `DomainRef`/`SubjectRef` 의 검증기는 **들어오는** 시트에만 걸린다 — 우리가 내보내는
    제안은 그 층을 지나지 않고 프론트가 그대로 `subject` 를 만드는 데 쓰므로, 여기서
    보지 않으면 상한을 넘는 값이 그대로 저장된다.
    """
    decided = {"action": "generate", "domain": "가" * (MAX_DOMAIN_TITLE_LENGTH + 10)}
    GoalPipeline._settle_lengths(decided)
    assert len(decided["domain"]) == MAX_DOMAIN_TITLE_LENGTH


def test_a_too_long_task_title_is_clipped():
    decided = {
        "action": "generate",
        "domain": "학습",
        "generated_tasks": [
            {"title": "나" * (MAX_SUBJECT_TITLE_LENGTH + 5), "frequency": "daily", "count": 1},
            {"title": "짧은 제목", "frequency": "daily", "count": 1},
        ],
    }
    GoalPipeline._settle_lengths(decided)
    lengths = [len(t["title"]) for t in decided["generated_tasks"]]
    assert lengths == [MAX_SUBJECT_TITLE_LENGTH, len("짧은 제목")]


def test_a_name_within_the_sheet_limit_is_left_alone():
    """프롬프트가 20자를 권해도 **25자를 자르지는 않는다** — 여기서 막으려는 것은
    "품질이 아쉬운 이름" 이 아니라 저장·화면이 깨지는 길이다."""
    decided = {"action": "generate", "domain": "가" * 25}
    GoalPipeline._settle_lengths(decided)
    assert decided["domain"] == "가" * 25


def test_the_prompt_guideline_is_stricter_than_the_enforced_cap():
    """둘이 뒤집히면(지침 > 상한) 서버가 지침을 어기는 값을 통과시킨다."""
    assert MAX_DOMAIN_TITLE_LENGTH > 20, "프롬프트 규칙 6의 domain 지침보다 커야 한다"
    assert MAX_SUBJECT_TITLE_LENGTH > 40, "프롬프트 규칙 6의 title 지침보다 커야 한다"


def test_other_slots_keep_the_default_cap():
    """상한을 슬롯별로 준 것이지 없앤 것이 아니다. `caps` 를 안 주면 기본값이다."""
    assert MAX_CAPACITY_SLOT_CHARS > MAX_SLOT_CHARS
    long_value = "가" * (MAX_SLOT_CHARS + 500)
    filled = fill_slots("<domain_list>x</domain_list>", {"domain_list": long_value})
    assert len(filled) < len(long_value)
    # 같은 값에 큰 상한을 주면 잘리지 않는다.
    assert len(escape_slot_value(long_value, max_chars=MAX_CAPACITY_SLOT_CHARS)) == len(
        long_value
    )
