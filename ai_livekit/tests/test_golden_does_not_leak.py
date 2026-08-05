"""골든 발화가 **프롬프트 예시에 들어 있으면** 그 케이스는 아무것도 재지 않는다.

베끼기만으로 맞을 수 있기 때문입니다. 점수는 올라가는데 실력은 그대로라, 지표가
좋아지는 방향으로 프롬프트를 고치다 보면 골든셋을 프롬프트에 옮겨 적는 것이 최적
전략이 됩니다 — 평가가 개선을 막는 쪽으로 뒤집힙니다.

실제로 그렇게 됐던 자리를 정리하고 이 테스트를 붙였습니다(2026-08-04). 네 건이
프롬프트 예시와 **글자 단위로 같았고**, 그중 둘은 분류 프롬프트에 표 행을 추가하면서
하필 골든 케이스와 같은 문장을 고른 결과였습니다. 사람이 눈으로 잡을 수 없는 종류라
(발화가 52개, 프롬프트가 두 파일) 기계가 봐야 합니다.

**규칙이 무엇을 금지하고 무엇을 허용하는가.**

  금지: 발화가 프롬프트 어딘가에 그대로(공백만 다른 정도로) 들어 있는 것
  허용: 규칙을 프롬프트에 적고 그 준수를 재는 것

둘째가 허용인 이유는 그게 평가의 목적이기 때문입니다. `task_frequency` 는 "주 3회"
→ weekly/3 매핑을 프롬프트에 명시하고, g45 는 그 매핑을 따르는지 봅니다 — 정답을
베낀 게 아니라 **적어 둔 규칙을 적용**하는지 보는 것이라 유효합니다. 그래서 판정선을
"발화 자체가 예시로 실려 있는가" 에 둡니다. n-gram 유사도로 넓게 잡으면 이 정당한
케이스들까지 걸려서, 통과시키려고 발화를 인위적으로 비틀게 됩니다.
"""
from __future__ import annotations

import json
import re

from mandarin_goal.bot.prompt import PROMPTS_DIR

#: 골든셋과 프롬프트 정본. 러너를 import 하지 않고 파일을 직접 읽습니다 —
#: 이 테스트가 보는 것은 **디스크의 내용**이고, 러너의 로딩 방식이 아닙니다.
GOLDEN = PROMPTS_DIR.parent / "evals" / "golden.jsonl"
PROMPT_FILES = ("system.md", "classify.md")


def _squeeze(text: str) -> str:
    """공백을 지웁니다.

    "기타 배우고 싶어요" 와 "기타배우고 싶어요" 를 같은 것으로 봐야 합니다 — 공백
    하나 넣어 테스트를 통과시키는 것은 누출을 고친 게 아닙니다.
    """
    return re.sub(r"\s+", "", text)


def _cases() -> list[dict]:
    with GOLDEN.open(encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def _prompt_text() -> str:
    return "\n".join(
        (PROMPTS_DIR / name).read_text(encoding="utf-8") for name in PROMPT_FILES
    )


def test_no_golden_utterance_appears_in_the_prompts():
    """발화가 프롬프트에 그대로 실려 있으면 실패한다."""
    prompt = _squeeze(_prompt_text())
    leaked = [
        (c["id"], c["utterance"])
        for c in _cases()
        if _squeeze(c["utterance"]) in prompt
    ]
    assert not leaked, (
        "골든 발화가 프롬프트 예시에 그대로 있습니다 — 베끼기만으로 맞습니다. "
        "발화를 바꾸거나(기대값은 그대로) 프롬프트 예시를 다른 문장으로 고치세요: "
        + ", ".join(f"{cid}({utt})" for cid, utt in leaked)
    )


def test_the_prompts_still_carry_their_own_examples():
    """**앞 테스트를 "예시를 지워서" 통과시키지 않았는지** 확인한다.

    누출을 없애는 가장 쉬운 방법은 프롬프트에서 `<example>` 을 다 지우는 것입니다.
    테스트는 통과하고 품질은 내려갑니다 — 그 방향을 막아 둡니다.
    """
    system = (PROMPTS_DIR / "system.md").read_text(encoding="utf-8")
    examples = system.count("<example>")
    assert examples >= 8, f"system.md 의 예시가 {examples}개로 줄었습니다"
    # 분류 프롬프트의 예시는 표로 들어 있습니다.
    classify = (PROMPTS_DIR / "classify.md").read_text(encoding="utf-8")
    rows = classify.count("| `goal` |") + classify.count("| `chitchat` |")
    assert rows >= 5, f"classify.md 의 판단 표가 {rows}행으로 줄었습니다"
