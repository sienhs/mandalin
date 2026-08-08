"""출력 길이 상한은 **두 곳에 같이 적혀 있습니다.** 갈리면 평가가 거짓말을 합니다.

    prompts/system.md 의 <instructions> 6번    모델에게 주는 규칙
    evals/runner.py 의 LIMITS                  평가가 위반을 세는 기준

`runner.py` 의 주석이 이미 *"프롬프트에서 그 숫자를 고치면 여기도 고치세요"* 라고
적어 두었지만, 지키는 것은 사람의 기억뿐이었고 **실제로 갈려 있었습니다** —
프롬프트가 `domain 20 / title 40 / description 60`, 러너가 `10 / 25 / 40` 이었고,
프론트(`useCoachRoom.ts`)는 `description 40자` 라고 적고 있었습니다.

**증상이 조용합니다.** 스키마에 `maxLength` 가 없어 서버는 안 막고, 프롬프트는 어겨도
그냥 통과합니다. 드러나는 자리는 평가 리포트의 "출력 정상률" 하나뿐인데, 그 숫자가
낮게 나와도 **모델이 못한 것인지 기준이 틀린 것인지 구분할 방법이 없습니다.**

실제로 그 혼동이 났습니다 — 프롬프트 예시를 21% 줄이는 A/B 에서 출력 정상률이
100% → 88.7% 로 떨어졌는데(p=0.016), 그 시점의 프롬프트는 60자를 허용하고 평가는
40자로 세고 있었습니다. 어느 쪽이 원인인지 가르려면 먼저 이 둘을 맞춰야 했습니다.

**정본은 러너 쪽(40/25/10/100)입니다.** 프론트 주석과 같은 값이고, 그 값이 화면
레이아웃의 전제입니다.
"""
from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
SYSTEM_PROMPT = REPO_ROOT / "prompts" / "system.md"

#: `길이 상한은 domain 10자 / title 25자 / description 40자 1문장 / clarify_question 100자`
#:
#: 필드 이름 바로 뒤의 숫자만 봅니다. 문장 안의 다른 숫자("1문장")를 집지 않게
#: 이름을 앵커로 씁니다.
LIMIT_IN_PROMPT = re.compile(r"\b(domain|title|description|clarify_question)\s+(\d+)자")


def _limits_written_in_the_prompt() -> dict[str, int]:
    text = SYSTEM_PROMPT.read_text(encoding="utf8")
    return {name: int(value) for name, value in LIMIT_IN_PROMPT.findall(text)}


def test_the_prompt_states_every_limit_the_evaluator_counts():
    """러너가 세는 필드가 프롬프트에 하나라도 빠지면 그 규칙은 전달되지 않습니다."""
    from evals.runner import LIMITS

    written = _limits_written_in_the_prompt()
    missing = sorted(set(LIMITS) - set(written))
    assert not missing, (
        f"{SYSTEM_PROMPT.name} 의 <instructions> 에 길이 상한이 없는 필드: {missing} — "
        "평가는 세는데 모델은 못 듣습니다"
    )


def test_the_prompt_and_the_evaluator_agree_on_the_numbers():
    """숫자가 갈리면 '출력 정상률' 이 모델 탓인지 기준 탓인지 구분되지 않습니다."""
    from evals.runner import LIMITS

    written = _limits_written_in_the_prompt()
    mismatched = {
        name: (written[name], LIMITS[name])
        for name in LIMITS
        if name in written and written[name] != LIMITS[name]
    }
    assert not mismatched, (
        "프롬프트와 평가의 길이 상한이 다릅니다 (필드: (프롬프트, 러너)) — "
        f"{mismatched}. 정본은 러너 쪽이고 프론트의 "
        "`useCoachRoom.ts` 주석과 같은 값이어야 합니다"
    )
