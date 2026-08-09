"""도구 호출 루프 — `GOAL_SCHEMA` 의 `action` enum 을 도구로 펼친 것.

    action="generate"   → propose_tasks(domain, tasks[3])
    action="recommend"  → point_to_existing(subject_id)
    action="clarify"    → ask(question, domain)
    나머지 넷           → decline(kind)

**왜 펼치는가.** `GOAL_SCHEMA` 는 평평한 객체 하나가 모든 action 을 겸합니다. action 을
하나 늘릴 때마다 다른 action 에서는 항상 `null` 인 필드가 늘고, 그게 매 턴 출력 토큰을
태우며 잘림 위험을 키웁니다(그 파일의 `propertyOrdering` 주석). 도구로 가르면 각
도구의 `parameters` 가 그 action 전용 스키마라 서로를 밀어내지 않습니다.

**출력을 도구로 받는 이유는 선택이 아닙니다.** Gemini 는 `tools` 와 `responseSchema`
를 같이 받지 않습니다 — 실측 400 *Function calling with a response mime type:
'application/json' is unsupported* (`scripts/probe_tools.py`). 그래서 스키마 강제가
하던 일을 **`mode=ANY`**(`reply_tools(force=True)`)가 대신합니다.

**루프의 결과는 `GOAL_SCHEMA` 와 같은 모양의 dict 입니다.** 일부러 그렇게 맞췄습니다 —
`_resolve_match`·`_settle_counts`·`_settle_duplicates`·`_settle_capacity`·`render()` 가
그 모양을 전제로 이미 돌고 있고, 그쪽이 **"아는 값은 서버가 정한다" 를 실제로 강제하는
층**입니다. 모델이 인자를 직접 건네는 도구 경로에서는 그 층이 더 필요합니다.

**에이전트는 만드는 일만 합니다.** 담은 과제를 빼거나 고치는 도구를 붙여 봤다가
**걷어냈습니다**(2026-08-07). 파이프라인 쪽은 잘 돌았지만 — 한 응답에 `remove_task` 와
`propose_tasks` 가 같이 오고 1스텝 2.9초였습니다 — 화면에서 되돌릴 수단 없이 과제가
사라지는 버튼이 생기는 것이 문제였습니다. 정리는 편집기에서 사용자가 합니다
(`domain_full_reply` 가 "편집기에서 정리해 주세요" 로 끝나는 것과 같은 경계입니다).

그래서 **지금 도구는 넷이고 전부 종결입니다.** 한 턴에 판단 하나 — `BOT_MODE=goal` 과
같은 동작이고, 골든셋으로 두 모드를 비교할 수 있습니다. 비종결 디스패치와 되먹임
(`HANDLERS`·`_run_handler`)은 남겨 둡니다. 모르는 도구 이름을 예외 없이 흡수하는 자리라
지금도 쓰이고, 다시 붙일 때 고칠 곳이 한 군데입니다.
"""
from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable, Sequence

from mandarin_goal.bot.llm import ToolCall, ToolReply, ToolResult, Turn
from mandarin_goal.bot.subjects import FREQUENCY_LABELS

logger = logging.getLogger(__name__)

#: 한 턴에 허용하는 모델 호출 수.
#:
#: **2 입니다 — 첫 시도와, 평문으로 샜을 때의 종결 강제 재시도.** 도구가 전부 종결이라
#: 정상 턴은 1스텝에 끝나고, 두 번째는 `mode=ANY` 가 뚫렸을 때만 씁니다.
#:
#: 위로 올리면 지연이 그대로 늘어납니다 — 생성 중에는 마이크가 잠기고
#: (`Conversation.busy` 를 `SpeechGate` 가 봅니다) 스텝당 실측 3.2초입니다. 비종결 도구를
#: 다시 붙이는 날에는 "실행 → 되먹임 → 종결" 이 최소 2스텝이라 3으로 올려야 합니다.
MAX_STEPS = 2

#: 이걸 부르면 그 턴이 끝납니다. 값은 그대로 `decided["action"]` 이 됩니다.
TERMINAL: dict[str, str] = {
    "propose_tasks": "generate",
    "point_to_existing": "recommend",
    "ask": "clarify",
    # `decline` 만 `kind` 인자가 action 을 정합니다 — 넷을 도구 넷으로 만들면
    # 선언만 늘고 고르는 판단은 같습니다.
    "decline": "",
}

#: `decline(kind)` 가 고를 수 있는 값. `GOAL_SCHEMA.action` 의 차단 갈래와 같습니다.
#: **`self_harm` 을 `harmful` 에서 가르는 이유는 응답 문구입니다**(`BLOCKED_REPLIES`).
DECLINE_KINDS = ("out_of_scope", "injection", "harmful", "self_harm")

#: 종결이 아닌 도구의 실행기. **비어 있습니다** — 지금 도구는 전부 종결입니다.
#: 여기 등록하는 순간 그 도구는 결과를 되먹이고 루프가 이어집니다.
HANDLERS: dict[str, Callable[[dict], dict]] = {}

#: 한 턴이 내는 과제 수. `GOAL_SCHEMA.generated_tasks` 와 **같은 값이어야 합니다** —
#: 두 모드가 다른 개수를 내면 골든셋 비교가 모드 차이가 아니라 개수 차이를 잽니다.
TASK_COUNT = 3


def _declarations(descriptions: dict[str, str]) -> list[dict]:
    """도구 선언. **설명만 밖에서 받습니다**(`prompts/fragments/tools.md`).

    인자 모양은 여기 둡니다 — `FREQUENCY_LABELS` 나 과제 개수처럼 코드가 이미 정본을
    들고 있는 데이터 제약이라 문구가 아닙니다. 설명은 "언제 부르는가" 라 문구입니다.

    **`reasoning` 을 두지 않습니다.** `GOAL_SCHEMA` 에는 있지만 그쪽은
    `propertyOrdering` 으로 맨 뒤에 밀어 두어서, 잘리면 그것부터 사라지게 해 둔
    것입니다. 실측(도구 왕복)에서 **인자 순서가 모델 마음대로 섞여 나왔으므로**
    그 방어가 이 경로에는 없습니다 — 판단 근거 한 줄 때문에 과제 셋이 잘릴 수는
    없습니다. 대신 어떤 도구를 무슨 인자로 불렀는지가 로그에 그대로 남습니다.
    """
    return [
        {
            "name": "propose_tasks",
            "description": descriptions.get("propose_tasks", ""),
            "parameters": {
                "type": "object",
                "properties": {
                    "domain": {"type": "string"},
                    "tasks": {
                        "type": "array",
                        "minItems": TASK_COUNT,
                        "maxItems": TASK_COUNT,
                        "items": {
                            "type": "object",
                            "properties": {
                                "title": {"type": "string"},
                                "frequency": {
                                    "type": "string",
                                    "enum": list(FREQUENCY_LABELS),
                                },
                                "count": {"type": "integer"},
                                "description": {"type": "string"},
                            },
                            # 네 필드 전부 필수입니다. `GOAL_SCHEMA` 와 같은 이유로 —
                            # 빼면 모델이 채우지 않고, 빈도가 없으면 화면의 배지가
                            # 빕니다(실측 2026-08-04).
                            "required": ["title", "frequency", "count", "description"],
                        },
                    },
                },
                "required": ["tasks"],
            },
        },
        {
            "name": "point_to_existing",
            "description": descriptions.get("point_to_existing", ""),
            "parameters": {
                "type": "object",
                # **`subject_id` 하나뿐입니다.** 제목·빈도는 서버가 시트에서 채웁니다
                # (`_resolve_match`). 베끼게 두면 그 필드에서 디코딩이 무너져 토큰
                # 상한까지 태운 사고가 있었습니다 — 필드를 없애면 발판이 사라집니다.
                "properties": {"subject_id": {"type": "integer"}},
                "required": ["subject_id"],
            },
        },
        {
            "name": "ask",
            "description": descriptions.get("ask", ""),
            "parameters": {
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                    # 칸까지 정해졌으면 같이 받습니다 — `render()` 가 질문이 빈
                    # 경우에 이 값으로 되묻고, 비우면 이미 알아낸 것을 다시 묻습니다.
                    "domain": {"type": "string"},
                },
                "required": ["question"],
            },
        },
        {
            "name": "decline",
            "description": descriptions.get("decline", ""),
            "parameters": {
                "type": "object",
                "properties": {"kind": {"type": "string", "enum": list(DECLINE_KINDS)}},
                "required": ["kind"],
            },
        },
    ]


def build_tools(descriptions: dict[str, str]) -> list[dict]:
    """`reply_tools` 에 그대로 넘길 `tools` 값."""
    return [{"functionDeclarations": _declarations(descriptions)}]


def tool_names() -> tuple[str, ...]:
    """선언된 도구 전부. 설명이 없어도 이름은 코드가 압니다.

    `TERMINAL` 로 대신하지 않습니다. 지금은 두 목록이 같지만, 비종결 도구가 다시
    생기면 설명이 필요한 쪽은 **선언된 전부**입니다.
    """
    return tuple(declaration["name"] for declaration in _declarations({}))


def parse_descriptions(text: str) -> dict[str, str]:
    """`prompts/fragments/tools.md` 를 `{도구이름: 설명}` 으로.

    `## 이름` 이 한 도구의 시작입니다. 그 앞의 머리말은 사람이 읽는 안내라 버립니다 —
    모델에게 갈 이유가 없고, 매 요청에 실리면 토큰만 씁니다.
    """
    sections: dict[str, str] = {}
    name = ""
    body: list[str] = []
    for line in text.splitlines():
        if line.startswith("## "):
            if name:
                sections[name] = "\n".join(body).strip()
            name = line[3:].strip()
            body = []
        elif name:
            body.append(line)
    if name:
        sections[name] = "\n".join(body).strip()
    return sections


def to_decision(call: ToolCall) -> dict | None:
    """종결 도구 호출을 `GOAL_SCHEMA` 모양의 dict 로. 종결이 아니면 `None`.

    **인자를 다듬지 않습니다.** 횟수 자르기·정원 자르기·중복 버리기는 전부
    `GoalPipeline` 의 `_settle_*` 가 이미 하는 일이고, 여기서 한 번 더 손대면 같은
    규칙이 두 곳에 생깁니다 — 한쪽만 고치는 날 두 모드가 다르게 동작합니다.
    """
    action = TERMINAL.get(call.name)
    if action is None:
        return None

    if call.name == "decline":
        kind = str(call.args.get("kind") or "").strip()
        if kind not in DECLINE_KINDS:
            # 모르는 이유는 **거절 문구를 고를 수 없습니다.** 차단 갈래마다 사용자에게
            # 할 말이 다른데(자해에는 상담 창구를 안내합니다) 아무거나 고르면 그
            # 사람에게 틀린 문장이 갑니다. 범위 밖으로 접습니다 — 그쪽은 고정 문구라
            # 누구에게 가도 해롭지 않습니다.
            logger.warning("decline 의 kind 를 알 수 없어 out_of_scope 로 접습니다: %r", kind)
            kind = "out_of_scope"
        return {"action": kind}

    if call.name == "propose_tasks":
        return {
            "action": action,
            "domain": (call.args.get("domain") or "").strip() or None,
            "generated_tasks": call.args.get("tasks") or [],
        }

    if call.name == "point_to_existing":
        return {
            "action": action,
            "matched_task": {"subject_id": call.args.get("subject_id")},
        }

    return {
        "action": action,
        "clarify_question": (call.args.get("question") or "").strip() or None,
        "domain": (call.args.get("domain") or "").strip() or None,
    }


#: 루프가 아무것도 못 얻었을 때. **`render()` 의 빈 `clarify` 경로로 떨어집니다** —
#: 그쪽이 이미 도메인을 보고 되묻는 문장을 만들고, 없으면 일반 되묻기로 끝냅니다.
#: 여기에 문구를 적지 않는 이유가 그것입니다(정본이 둘이 됩니다).
EXHAUSTED: dict = {"action": "clarify"}

#: `ask_model(turns, allowed)` — 모델을 한 번 부르는 함수. 재시도·타임아웃·레이트리밋은
#: 호출부(`GoalPipeline._step`)가 이미 감싸고 있으므로 루프는 그것을 모릅니다.
AskModel = Callable[[list[Turn], Sequence[str] | None], Awaitable[ToolReply]]


async def run_tool_loop(
    ask_model: AskModel, turns: list[Turn], *, max_steps: int = MAX_STEPS
) -> dict:
    """종결 도구가 나올 때까지 부르고, 그 결과를 dict 로 돌려줍니다.

    **마지막 스텝은 종결 도구로 좁힙니다**(`allowedFunctionNames`). 안 좁히면 상한을
    비종결 호출로 다 쓰고 답 없이 끝나는 턴이 생깁니다.

    **평문이 오면 종결로 좁혀 다시 묻습니다.** `mode=ANY` 로 강제했는데도 도구를 안
    부르는 경우가 있는데(게이트웨이가 `toolConfig` 를 떨어뜨리면), 그 문장은 어떤
    스키마도 거치지 않았으므로 **사용자에게 내보내지 않습니다.**
    """
    working = list(turns)
    narrow = False

    for step in range(max_steps):
        last = step == max_steps - 1
        allowed = list(TERMINAL) if (last or narrow) else None
        reply = await ask_model(working, allowed)

        if not reply.calls:
            # 평문. 다음 스텝에서 종결 도구로 좁혀 다시 묻습니다 — 히스토리에
            # 넣지 않습니다(그 문장을 맥락으로 삼으면 같은 답을 되풀이합니다).
            logger.warning(
                "tools/escaped %d/%d 스텝에서 도구 대신 평문이 왔습니다: %r",
                step + 1, max_steps, reply.text[:120],
            )
            narrow = True
            continue

        for call in reply.calls:
            decision = to_decision(call)
            if decision is not None:
                logger.info(
                    "tools/decide %d/%d 스텝 — %s → action=%s",
                    step + 1, max_steps, call.name, decision.get("action"),
                )
                return decision

            # 비종결 도구. 실행하고 결과를 되먹입니다.
            result = _run_handler(call)
            working.append(Turn(role="assistant", call=call))
            working.append(Turn(role="user", result=result))

    logger.warning("tools/exhausted %d 스텝을 다 쓰고 종결 도구가 없었습니다", max_steps)
    return dict(EXHAUSTED)


def _run_handler(call: ToolCall) -> ToolResult:
    """비종결 도구를 실행합니다. 실패해도 **예외를 올리지 않습니다.**

    지금은 등록된 것이 없으므로 실제로 도는 경로는 "모르는 도구" 쪽입니다 — 모델이
    없는 이름을 부르는 일이 있고, 예외로 올리면 그 턴이 통째로 실패합니다. 결과로
    돌려주면 모델이 그걸 읽고 다른 도구를 고를 수 있습니다.
    """
    handler = HANDLERS.get(call.name)
    if handler is None:
        logger.warning("tools/unknown 모르는 도구를 불렀습니다: %r", call.name)
        return ToolResult(
            name=call.name,
            payload={"ok": False, "error": f"{call.name} 은 없는 도구입니다"},
        )
    try:
        return ToolResult(name=call.name, payload=handler(call.args))
    except Exception as exc:  # noqa: BLE001 — 아래에서 트레이스백을 남깁니다
        logger.exception("tools/handler %s 가 실패했습니다", call.name)
        return ToolResult(name=call.name, payload={"ok": False, "error": str(exc)[:200]})
