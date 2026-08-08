"""도구 호출(function calling)이 이 모델·게이트웨이에서 되는지 재는 프로브.

    python scripts/probe_tools.py

**설계를 가르는 값이 하나 있습니다** — `tools` 와 `responseSchema` 를 **같이** 쓸 수
있는가. 지금 이 저장소의 방어선 대부분이 `responseSchema` 위에 서 있어서
(`goal.py` 의 `escape_slot_value` 주석: *"의미 수준의 설득은 스키마 강제가 받아낸다"*),
둘이 배타적이면 도구 루프의 모양이 달라집니다.

    같이 됨  → 루프는 도구로 돌고 **마지막 답만** 지금의 `GOAL_SCHEMA` 로 받는다
    배타적   → 출력도 도구로 받는다. `GOAL_SCHEMA` 는 `propose_tasks` 의 parameters 가
               되고, action enum 이 도구 이름으로 펼쳐진다

**게이트웨이 거부와 API 규격을 갈라 봐야 합니다.** `BOT_BASE_URL` 을 쓰면 모르는 키를
게이트웨이가 400 으로 막는 일이 실제로 있었습니다(`config.py` 의 `bot_frequency_penalty`
주석 — `Penalty is not enabled for models`). 그래서 프로브마다 상태 코드와 본문 앞부분을
그대로 남깁니다. 요약만 보고 "안 된다" 로 접으면 게이트웨이 설정 문제를 규격 문제로
오진합니다.

요청 모양은 `llm.py` 의 `_generate` 를 그대로 따릅니다(`thinkingConfig` 포함) — 최소
payload 로 재면 통과해 놓고 실제 경로에서만 깨지는 조합을 놓칩니다.
"""
from __future__ import annotations

import argparse
import asyncio
import sys
from dataclasses import dataclass, field
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import httpx  # noqa: E402

# `mandarin_goal.` 을 직접 import 하지 않습니다 — `tests/test_reuse.py` 의
# `test_only_the_gateway_module_touches_the_pipeline_package` 가 scripts/ 도 훑습니다.
from agent.reuse import GEMINI_BASE_URL, get_settings  # noqa: E402

# --- 도구 선언 ---------------------------------------------------------------
#
# 지금의 `action` enum 을 도구로 펼친 모양입니다. 프로브용이라 최소한만 적었지만
# 이름과 인자는 실제로 쓸 것과 같게 뒀습니다 — 모델이 "그럴듯한 도구" 를 부르는지가
# 아니라 **우리가 쓸 도구**를 부르는지를 봐야 합니다.

PROPOSE_TASKS = {
    "name": "propose_tasks",
    "description": (
        "세부 목표 칸 하나에 담을 새 실천과제 3개를 제안한다. "
        "사용자가 카드에서 골라 담는다."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "domain": {"type": "string", "description": "담을 세부 목표 칸 이름"},
            "tasks": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "title": {"type": "string"},
                        "frequency": {
                            "type": "string",
                            "enum": ["daily", "weekly", "monthly", "none"],
                        },
                        "count": {"type": "integer"},
                        "description": {"type": "string"},
                    },
                    "required": ["title", "frequency", "count", "description"],
                },
            },
        },
        "required": ["domain", "tasks"],
    },
}

ASK = {
    "name": "ask",
    "description": "판단할 정보가 모자라면 되묻는다.",
    "parameters": {
        "type": "object",
        "properties": {"question": {"type": "string"}},
        "required": ["question"],
    },
}

REMOVE_TASK = {
    "name": "remove_task",
    "description": "이미 담은 과제를 빼자고 제안한다. subject_id 로 지목한다.",
    "parameters": {
        "type": "object",
        "properties": {"subject_id": {"type": "integer"}},
        "required": ["subject_id"],
    },
}

#: `responseSchema` 대조군. 지금 `GOAL_SCHEMA` 가 하는 일의 축소판입니다.
GOAL_SCHEMA_MINI = {
    "type": "object",
    "properties": {
        "action": {"type": "string", "enum": ["generate", "clarify"]},
        "domain": {"type": "string", "nullable": True},
    },
    "required": ["action"],
}

SYSTEM = (
    "너는 만다라트 목표 설계 보조 AI 다. 사용자의 목표 발화를 듣고 세부 목표 칸 하나와 "
    "거기 담을 실천과제를 정한다. 반드시 도구를 호출해서 답한다."
)

#: 도구를 부를 수밖에 없는 발화. 되묻기로 새면 프로브가 무의미해집니다.
UTTERANCE = "매일 알고리즘 문제 풀어서 코딩테스트 준비하고 싶어"

#: 도구를 **두 개** 불러야 자연스러운 발화. 병렬 호출 지원을 봅니다.
UTTERANCE_PARALLEL = (
    "이미 담아둔 3번 과제는 빼줘. 그리고 그 칸에 다른 걸로 세 개 만들어줘."
)

#: 병렬 프로브 전용 시스템 프롬프트 — **시트를 실어 줍니다.**
#:
#: 첫 실행에서 모델이 도구 대신 평문으로 `"어떤 칸에서 3번 과제를 뺄까요?"` 를
#: 돌려줬습니다. 병렬 호출을 못 하는 것이 아니라 `3번` 이 어느 칸인지 몰라 되물은
#: 것이라, 그 상태로는 지원 여부를 잴 수 없습니다. `_capacity_context` 가 실제로
#: 만드는 줄과 같은 모양을 넣어 모호함을 없앱니다.
SHEET_CONTEXT = (
    "\n\n사용자 시트에 이미 담긴 과제:\n"
    "학습 2/8: [3]매일 알고리즘 1문제 풀기(일간), [7]코테 준비하기(주3)"
)


@dataclass
class Probe:
    """프로브 하나 — 무엇을 재는지와 어떻게 읽어야 하는지."""

    key: str
    title: str
    #: 이 프로브가 실패했을 때 설계에 무슨 뜻인지. 요약표에 그대로 나갑니다.
    meaning: str
    payload_extra: dict
    utterance: str = UTTERANCE
    #: 시스템 프롬프트 덧붙임. 프로브가 맥락을 더 줘야 할 때만 씁니다.
    system_extra: str = ""


PROBES: tuple[Probe, ...] = (
    Probe(
        key="schema_only",
        title="responseSchema 단독 (대조군 — 지금 도는 경로)",
        meaning="이게 실패하면 키·모델·게이트웨이 문제입니다. 아래는 볼 필요 없습니다",
        payload_extra={
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": GOAL_SCHEMA_MINI,
            }
        },
    ),
    Probe(
        key="tools_only",
        title="tools 단독 (도구 호출이 되는가)",
        meaning="실패하면 이 게이트웨이로는 도구 루프 자체가 불가능합니다",
        payload_extra={"tools": [{"functionDeclarations": [PROPOSE_TASKS, ASK]}]},
    ),
    Probe(
        key="tools_and_schema",
        title="tools + responseSchema 동시  ★ 설계를 가르는 값",
        meaning=(
            "실패하면 출력도 도구로 받습니다 — GOAL_SCHEMA 가 propose_tasks 의 "
            "parameters 가 됩니다"
        ),
        payload_extra={
            "tools": [{"functionDeclarations": [PROPOSE_TASKS, ASK]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "responseSchema": GOAL_SCHEMA_MINI,
            },
        },
    ),
    Probe(
        key="forced_any",
        title="toolConfig mode=ANY + allowedFunctionNames (마지막 스텝 강제)",
        meaning=(
            "실패하면 루프가 답 없이 끝나는 것을 막을 수단이 없습니다 — "
            "스텝 상한에 걸렸을 때 폴백 문구가 필요합니다"
        ),
        payload_extra={
            "tools": [{"functionDeclarations": [PROPOSE_TASKS, ASK]}],
            "toolConfig": {
                "functionCallingConfig": {
                    "mode": "ANY",
                    "allowedFunctionNames": ["propose_tasks", "ask"],
                }
            },
        },
    ),
    Probe(
        key="parallel",
        title="병렬 호출 (한 응답에 functionCall 이 둘 이상 오는가)",
        meaning=(
            "안 되면 remove+propose 를 한 턴에 못 합니다 — 스텝을 하나 더 써야 합니다"
        ),
        payload_extra={
            "tools": [
                {"functionDeclarations": [PROPOSE_TASKS, REMOVE_TASK, ASK]}
            ],
            # **ANY 로 강제합니다.** AUTO 로 두면 모델이 평문으로 되물어서(첫 실행이
            # 그랬습니다) 병렬 지원 여부가 아니라 모델의 그날 판단을 재게 됩니다.
            "toolConfig": {"functionCallingConfig": {"mode": "ANY"}},
        },
        utterance=UTTERANCE_PARALLEL,
        system_extra=SHEET_CONTEXT,
    ),
    Probe(
        key="text_escape",
        title="평문 누출 (도구를 안 부르고 그냥 말해버리는가)",
        meaning=(
            "평문이 오면 스키마 밖 문장이 그대로 말풍선까지 갑니다 — "
            "지금 responseSchema 가 막아주던 자리입니다"
        ),
        # **toolConfig 를 주지 않습니다**(= AUTO). 실제 루프의 중간 스텝이 이 상태라,
        # 여기서 새는지가 곧 "루프 중간에 스키마 밖 텍스트가 나올 수 있는가" 입니다.
        payload_extra={"tools": [{"functionDeclarations": [PROPOSE_TASKS, ASK]}]},
        utterance="오늘 서울 날씨 어때?",
    ),
)


@dataclass
class Result:
    probe: Probe
    status: int = 0
    #: 응답에 실린 functionCall 이름들. 순서 그대로.
    calls: list[str] = field(default_factory=list)
    text: str = ""
    finish: str = ""
    body: str = ""
    error: str = ""

    @property
    def ok(self) -> bool:
        return self.status == 200 and not self.error


def build_payload(probe: Probe, settings) -> dict:
    """`llm.py` 의 `_generate` 와 같은 모양으로 만듭니다.

    `generationConfig` 는 프로브가 자기 것을 들고 오므로 **병합**합니다 — 덮어쓰면
    `maxOutputTokens` 가 빠져서 실패 원인이 하나 늘어납니다.
    """
    generation_config: dict = {"maxOutputTokens": settings.bot_goal_max_output_tokens}
    if settings.bot_decide_temperature is not None:
        generation_config["temperature"] = settings.bot_decide_temperature
    if settings.bot_thinking_budget >= 0:
        generation_config["thinkingConfig"] = {
            "thinkingBudget": settings.bot_thinking_budget
        }

    payload: dict = {
        "systemInstruction": {"parts": [{"text": SYSTEM + probe.system_extra}]},
        "contents": [{"role": "user", "parts": [{"text": probe.utterance}]}],
        "generationConfig": generation_config,
    }
    for key, value in probe.payload_extra.items():
        if key == "generationConfig":
            generation_config.update(value)
        else:
            payload[key] = value
    return payload


async def run_probe(client: httpx.AsyncClient, probe: Probe, settings) -> Result:
    result = Result(probe=probe)
    base = (settings.bot_base_url or GEMINI_BASE_URL).rstrip("/")
    url = f"{base}/v1beta/models/{settings.bot_default_model}:generateContent"
    payload = build_payload(probe, settings)

    try:
        response = await client.post(
            url,
            headers={"x-goog-api-key": settings.bot_api_key},
            params={"key": settings.bot_api_key}
            if settings.bot_api_key_in_query
            else None,
            json=payload,
        )
    except httpx.HTTPError as exc:
        result.error = f"요청 실패: {exc}"
        return result

    result.status = response.status_code
    # **본문을 항상 남깁니다.** 게이트웨이 거부와 규격 제약을 가르는 유일한 단서라
    # 성공했을 때도 잘라서 들고 있습니다.
    result.body = response.text[:400]
    if response.status_code != 200:
        return result

    try:
        data = response.json()
    except ValueError:
        result.error = "JSON 이 아닙니다"
        return result

    candidates = data.get("candidates") or []
    if not candidates:
        blocked = (data.get("promptFeedback") or {}).get("blockReason")
        result.error = f"candidates 가 비었습니다 (blockReason={blocked})"
        return result

    result.finish = candidates[0].get("finishReason") or ""
    parts = (candidates[0].get("content") or {}).get("parts") or []
    for part in parts:
        call = part.get("functionCall")
        if call:
            result.calls.append(call.get("name") or "(이름 없음)")
        elif part.get("text"):
            result.text += part["text"]
    return result


def report(result: Result) -> None:
    probe = result.probe
    print()
    print(f"■ {probe.title}")
    if result.error:
        print(f"  [실패] {result.error}")
    elif result.status != 200:
        print(f"  [실패] HTTP {result.status}")
        print(f"         {result.body}")
    else:
        print(f"  [OK]  HTTP 200  finish={result.finish or '-'}")

    if result.calls:
        print(f"         functionCall {len(result.calls)}건: {', '.join(result.calls)}")
    if result.text:
        one_line = " ".join(result.text.split())
        print(f"         text: {one_line[:160]}")
    if not result.ok:
        print(f"         → {probe.meaning}")


def verdict(results: dict[str, Result]) -> None:
    """설계 결론. **여기만 읽고 넘기지 마세요** — 위의 본문이 근거입니다."""
    print()
    print("=" * 70)
    print("결론")
    print("-" * 70)

    control = results["schema_only"]
    if not control.ok:
        print("  대조군(responseSchema 단독)이 실패했습니다.")
        print("  BOT_API_KEY / BOT_BASE_URL / BOT_DEFAULT_MODEL 을 먼저 보세요 —")
        print("  아래 판정은 의미가 없습니다.")
        return

    tools = results["tools_only"]
    if not tools.ok or not tools.calls:
        print("  [막힘] 이 모델·게이트웨이는 도구 호출을 하지 않습니다.")
        print("         200 인데 functionCall 이 없으면 게이트웨이가 tools 를")
        print("         조용히 떨어뜨렸을 수 있습니다 — 위의 text 를 보세요.")
        return

    both = results["tools_and_schema"]
    if both.ok:
        print("  [옵션 A] tools 와 responseSchema 를 같이 쓸 수 있습니다.")
        print("           루프는 도구로 돌리고 **마지막 답만** GOAL_SCHEMA 로 받으세요.")
        print("           기존 방어(_settle_*, render, public_data)가 그대로 남습니다.")
    else:
        print(f"  [옵션 B] 둘은 배타적입니다 (HTTP {both.status}).")
        print("           출력도 도구로 받습니다 — GOAL_SCHEMA 를 propose_tasks 의")
        print("           parameters 로 옮기고, action enum 을 도구 이름으로 펼칩니다.")
        print("           핸들러에서 _settle_counts / _settle_capacity 를 반드시 태우세요.")

    forced = results["forced_any"]
    if forced.ok and forced.calls:
        print()
        print("  [OK]  mode=ANY 로 마지막 스텝을 강제할 수 있습니다.")
    else:
        print()
        print("  [주의] mode=ANY 가 안 먹습니다 — 스텝 상한에 걸린 턴을 위한")
        print("         폴백 문구가 필요합니다(지금의 FAILURE_REPLY 자리).")

    parallel = results["parallel"]
    print()
    if len(parallel.calls) >= 2:
        print(f"  [OK]  병렬 호출 됩니다 ({', '.join(parallel.calls)}).")
        print("        remove_task + propose_tasks 를 한 턴에 처리할 수 있습니다.")
    else:
        print(f"  [주의] 병렬 호출이 안 왔습니다 (호출 {len(parallel.calls)}건).")
        print("         한 턴에 두 동작을 하려면 스텝을 하나 더 써야 합니다 —")
        print("         지연 예산(BOT_TIMEOUT_SECONDS)을 그만큼 더 잡으세요.")

    escape = results["text_escape"]
    print()
    if escape.calls and not escape.text:
        print("  [OK]  AUTO 모드에서도 도구만 부릅니다.")
    else:
        print("  [주의] 도구를 안 부르고 평문으로 답했습니다.")
        print("         지금은 responseSchema 가 이 자리를 막고 있었습니다 —")
        print("         도구로 가면 **평문이 오는 스텝을 서버가 처리해야 합니다**:")
        print("         마지막 스텝은 mode=ANY 로 강제하고, 중간 스텝의 평문은")
        print("         사용자에게 내보내지 말고 버리거나 되묻기로 접으세요.")


async def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", help="BOT_DEFAULT_MODEL 대신 쓸 모델")
    parser.add_argument("--json", action="store_true", help="원본 본문을 그대로 출력")
    # 프로브 하나만 다시 재는 자리입니다. 프롬프트를 고쳐 가며 재는 일이 생기는데
    # (병렬 호출이 그랬습니다) 그때마다 전부 쏘면 크레딧이 그냥 나갑니다.
    parser.add_argument(
        "--only",
        choices=[p.key for p in PROBES],
        help="이 프로브만 돌립니다 (결론은 생략)",
    )
    args = parser.parse_args()

    settings = get_settings()
    if args.model:
        settings = settings.model_copy(update={"bot_default_model": args.model})

    if not settings.bot_api_key:
        print("[실패] BOT_API_KEY 가 비어 있습니다 (.env)")
        return 1

    print("도구 호출 프로브")
    print("-" * 70)
    print(f"  model    {settings.bot_default_model}")
    print(f"  base_url {settings.bot_base_url or GEMINI_BASE_URL}")
    print(f"  thinking {settings.bot_thinking_budget}")

    probes = [p for p in PROBES if not args.only or p.key == args.only]
    results: dict[str, Result] = {}
    # **순차로 돕니다.** 동시에 쏘면 429 가 프로브 실패로 보이고, 그게 규격 제약과
    # 구분되지 않습니다(`_step` 이 429 를 따로 다루는 것과 같은 이유).
    async with httpx.AsyncClient(timeout=settings.bot_timeout_seconds) as client:
        for probe in probes:
            result = await run_probe(client, probe, settings)
            results[probe.key] = result
            report(result)
            if args.json and result.body:
                print(f"         본문: {result.body}")

    if not args.only:
        verdict(results)
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
