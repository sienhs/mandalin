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

**지금은 도구 넷이 전부 종결입니다.** 한 턴에 판단 하나 — `BOT_MODE=goal` 과 같은
동작이고, 골든셋으로 두 모드를 비교할 수 있어야 하기 때문입니다. 루프 기계
(스텝 예산·비종결 디스패치·되먹임)는 먼저 만들어 둡니다. `remove_task` 처럼 결과를
보고 이어가야 하는 도구는 `HANDLERS` 에 붙이면 그대로 돕니다.
"""
from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable, Sequence

from mandarin_goal.bot.llm import ToolCall, ToolReply, ToolResult, Turn
from mandarin_goal.bot.subjects import FREQUENCY_LABELS

logger = logging.getLogger(__name__)

#: 한 턴에 허용하는 모델 호출 수.
#:
#: **3 입니다.** 위로 못 올리는 이유는 지연입니다 — 생성 중에는 마이크가 잠기고
#: (`Conversation.busy` 를 `SpeechGate` 가 봅니다) 스텝당 실측 3.2초라, 3스텝이면
#: 사용자가 10초를 기다립니다. 아래로 못 내리는 이유는 비종결 도구입니다: 실행 →
#: 되먹임 → 종결이 최소 2스텝이고, 마지막 하나는 종결 강제용 여유입니다.
MAX_STEPS = 3

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

#: 종결이 아닌 도구의 실행기. 지금은 비어 있습니다 — 넷이 다 종결이라서입니다.
#: 여기 붙는 순간 그 도구는 결과를 되먹이고 루프가 이어집니다.
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

    모르는 도구나 터진 핸들러를 예외로 올리면 그 턴이 통째로 실패합니다. 결과로
    돌려주면 모델이 그걸 읽고 다른 도구를 고를 수 있습니다 — 되먹임이 있는 구조에서만
    되는 복구라, 안 쓰면 루프를 만든 이유의 절반이 사라집니다.
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
