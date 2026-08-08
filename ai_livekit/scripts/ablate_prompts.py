"""`prompts/system.md` 의 예시를 빼낸 비교용 폴더를 만듭니다.

**왜 예시인가** — `<examples>` 가 `system.md` 의 3분의 1이 넘고, 이것이
`systemInstruction` 으로 **매 decide 호출마다** 전송됩니다. GMS 게이트웨이가
`cachedContents` 를 지원하지 않아 캐시로 깎을 수 없으므로, 입력 토큰을 실제로 줄이는
길은 프롬프트 자체를 줄이는 것뿐입니다.

이 도구로 예시 4개를 이미 뺐습니다(11,283 → 8,865자). 그 경위와 그때 드러난 버그는
`HANDOFF.md` 4절에 있습니다 — **다음 라운드를 돌리기 전에 읽으세요.** 거기 결론이
"예시가 필요 없다" 가 아니라 "규칙이 맞으면 그 4개는 없어도 된다" 입니다.

**왜 도구가 필요한가** — 어느 예시가 일하는지는 짐작으로 알 수 없습니다. 손으로
지우고 눈으로 보면 "빼도 괜찮아 보인다" 가 되는데, 골든셋 규모(62)에서 그 판단은
표본 분산과 구분되지 않습니다. `evals.runner` 의 짝지은 A/B(갈린 쌍 이항검정)에
걸어야 답이 나오고, 그러려면 **폴더 두 개**가 필요합니다.

    python scripts/ablate_prompts.py --list
    python scripts/ablate_prompts.py --drop 2,9 --out prompts_ab
    python -m evals.runner ab --prompt-dir prompts --vs prompts_ab --repeat 3

**안전 예시는 빼지 마세요**(`--list` 가 `[!안전]` 으로 표시합니다). 넷을 합쳐도
636자(전체의 7%)라 절감이 거의 없는 반면, `evals.runner` 가 안전 recall 을 따로 세는
이유가 프롬프트에 적혀 있습니다 —
"목표를 놓치는 것보다 해로운 내용을 실천과제로 만드는 쪽이 훨씬 나쁘다". 이 도구는
그래서 안전 예시를 지목하면 경고합니다(막지는 않습니다 — 측정 자체가 금지될 이유는
없고, 다만 모르고 빼는 일이 없게 합니다).

**발화가 같은 예시는 쌍입니다**(`[!쌍]`). `기타 배우고 싶어요` 가 `<domain_slots>`
만 다르게 두 번 나오는데(자리 남음 → generate / 8/8 → clarify), 한쪽만 빼면 "같은
발화인데 시트에 따라 답이 갈린다" 는 규칙이 사라져 남은 한쪽이 그 발화의 정답처럼
읽힙니다. 쌍은 번호가 아니라 발화로 찾으므로 예시를 빼서 번호가 밀려도 맞습니다.
"""
from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

#: 안전 라벨을 가르치는 예시들. 인덱스는 `--list` 와 같은 1-based 입니다.
SAFETY_ACTIONS = ("out_of_scope", "injection", "harmful", "self_harm")


#: 뒤따르는 빈 줄까지 같이 먹습니다. `\n?` 만 두면 예시를 여럿 뺐을 때 그 자리에
#: 빈 줄이 겹쳐 쌓이고, 그것도 프롬프트로 나가는 토큰입니다.
EXAMPLE_RE = re.compile(r"[ \t]*<example>.*?</example>\n?\n?", re.S)


def _examples(text: str) -> list[re.Match[str]]:
    return list(EXAMPLE_RE.finditer(text))


def _describe(block: str) -> tuple[str, str]:
    """(action, 입력 첫 줄) — 목록과 경고 문구에 씁니다."""
    action = re.search(r'"action"\s*:\s*"(\w+)"', block)
    inp = re.search(r"<input>(.*?)</input>", block, re.S)
    return (
        action.group(1) if action else "?",
        inp.group(1).strip().replace("\n", " ") if inp else "",
    )


def _contrast_pairs(matches: list[re.Match[str]]) -> list[tuple[int, ...]]:
    """입력이 같은 예시들의 묶음. **번호를 박아 두지 않습니다.**

    한때 `CONTRAST_PAIRS = ((3, 4),)` 로 적어 두었는데, 이 도구로 앞쪽 예시를 빼자
    번호가 밀려 **경고가 엉뚱한 예시를 가리키게 되었습니다.** 경고가 조용히 틀리는
    것은 경고가 없는 것보다 나쁩니다 — 안전하다고 믿고 빼게 됩니다.

    발화가 같은 예시는 "답을 가르는 것은 발화가 아니라 슬롯" 이라는 규칙을 그 대비로
    가르칩니다(`prompts/system.md` 의 `기타 배우고 싶어요` 쌍). 한쪽만 빼면 남은 쪽이
    그 발화의 정답처럼 읽힙니다.
    """
    seen: dict[str, list[int]] = {}
    for i, m in enumerate(matches, 1):
        _, inp = _describe(m.group(0))
        if inp:
            seen.setdefault(inp, []).append(i)
    return [tuple(v) for v in seen.values() if len(v) > 1]


def cmd_list(system: Path) -> int:
    text = system.read_text(encoding="utf8")
    matches = _examples(text)
    if not matches:
        print(f"{system} 에 <example> 가 없습니다", file=sys.stderr)
        return 1

    pairs = _contrast_pairs(matches)
    total = len(text)
    block_total = sum(len(m.group(0)) for m in matches)
    print(f"{system}  전체 {total:,}자 / 예시 {len(matches)}개 {block_total:,}자 "
          f"({block_total * 100 // total}%)\n")
    for i, m in enumerate(matches, 1):
        action, inp = _describe(m.group(0))
        # 기호는 ASCII 로 둡니다 — 이 저장소의 콘솔 로케일이 CP949 라 `!`/화살표가
        # 아닌 문자는 UnicodeEncodeError 로 죽습니다(`requirements.txt` 도 같은 이유로
        # 주석이 ASCII 입니다).
        flag = " [!안전]" if action in SAFETY_ACTIONS else ""
        pair = next((" [!쌍 " + "/".join(map(str, g)) + "]" for g in pairs if i in g), "")
        print(f"{i:2}. {len(m.group(0)):5,}자  {action:12}{flag}{pair}  {inp[:38]}")
    return 0


def _warn(drop: set[int], matches: list[re.Match[str]]) -> None:
    for i in sorted(drop):
        action, _ = _describe(matches[i - 1].group(0))
        if action in SAFETY_ACTIONS:
            print(f"[!] {i}번은 안전 예시({action})입니다 — 절감은 미미하고 "
                  f"안전 recall 이 떨어질 수 있습니다", file=sys.stderr)
    for group in _contrast_pairs(matches):
        hit = set(group) & drop
        if hit and len(hit) != len(group):
            names = "/".join(map(str, group))
            print(f"[!] {names}번은 발화가 같은 대조쌍입니다 — 한쪽만 빼면 "
                  f"'시트에 따라 답이 갈린다' 는 규칙이 사라집니다", file=sys.stderr)


def cmd_drop(source: Path, out: Path, drop: set[int]) -> int:
    system = source / "system.md"
    text = system.read_text(encoding="utf8")
    matches = _examples(text)

    bad = [i for i in drop if not 1 <= i <= len(matches)]
    if bad:
        print(f"예시 번호는 1~{len(matches)} 입니다 (받은 값: {bad})", file=sys.stderr)
        return 1

    _warn(drop, matches)

    # 뒤에서부터 지웁니다 — 앞에서 지우면 뒤 매치의 오프셋이 밀립니다.
    dropped = 0
    for i in sorted(drop, reverse=True):
        m = matches[i - 1]
        dropped += len(m.group(0))
        text = text[: m.start()] + text[m.end():]

    if out.exists():
        shutil.rmtree(out)
    # `require_prompt_dir` 은 system.md·classify.md 만 보지만 fragments/ 도
    # 런타임에 로드되므로 폴더를 통째로 복사합니다.
    shutil.copytree(source, out)
    (out / "system.md").write_text(text, encoding="utf8")

    before = len(system.read_text(encoding="utf8"))
    after = len(text)
    print(f"{out}  {before:,} -> {after:,}자  (-{dropped:,}, -{dropped * 100 // before}%)")
    print(f"뺀 예시: {sorted(drop)}")
    print()
    print(f"  python -m evals.runner ab --prompt-dir {source.name} "
          f"--vs {out.name} --repeat 3")
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    parser.add_argument("--source", default="prompts", help="원본 프롬프트 폴더")
    parser.add_argument("--list", action="store_true", help="예시 목록만 보여줍니다")
    parser.add_argument("--drop", help="뺄 예시 번호 (쉼표로 구분: 2,9)")
    parser.add_argument("--out", help="만들 비교용 폴더")
    args = parser.parse_args(argv)

    source = PROJECT_ROOT / args.source
    if not (source / "system.md").is_file():
        print(f"{source}/system.md 가 없습니다", file=sys.stderr)
        return 1

    if args.list or not args.drop:
        return cmd_list(source / "system.md")

    if not args.out:
        print("--drop 을 쓸 때는 --out 도 주세요", file=sys.stderr)
        return 1

    try:
        drop = {int(x) for x in args.drop.split(",") if x.strip()}
    except ValueError:
        print(f"--drop 은 숫자 목록입니다 (받은 값: {args.drop!r})", file=sys.stderr)
        return 1

    return cmd_drop(source, PROJECT_ROOT / args.out, drop)


if __name__ == "__main__":
    raise SystemExit(main())
