"""도구 루프(`BOT_MODE=agent`) — goal 모드와 **같은 dict 를 만들어야 한다**.

같은 모양이어야 하는 이유는 뒤에 오는 층 전부가 그걸 전제하기 때문입니다 —
`_resolve_match` · `_settle_counts` · `_settle_duplicates` · `_settle_capacity` ·
`render()`. 모델이 인자를 직접 건네는 경로라 그 층이 **더** 필요합니다.

`GOAL_SCHEMA` 와 도구 선언이 갈라지는 것이 이 파일이 막는 사고입니다. 갈려도
에러는 안 납니다 — 한쪽 모드에서만 빈도 배지가 사라지거나 정원이 안 걸립니다.
"""
from __future__ import annotations

import pytest

from mandarin_goal.bot.goal import GOAL_SCHEMA, PIPELINE_MODES, GoalPipeline
from mandarin_goal.bot.llm import EchoBackend, ToolCall, ToolReply, Turn
from mandarin_goal.bot.prompt import EMERGENCY, FRAGMENT_FILES, PROJECT_ROOT
from mandarin_goal.bot.tools import (
    DECLINE_KINDS,
    HANDLERS,
    MAX_STEPS,
    TASK_COUNT,
    TERMINAL,
    build_tools,
    parse_descriptions,
    run_tool_loop,
    to_decision,
)
from mandarin_goal.config import Settings

AGENT = Settings(
    bot_mode="agent",
    bot_provider="echo",
    bot_classify_model=None,
    bot_decide_model=None,
)


def _declarations() -> dict[str, dict]:
    tools = build_tools(parse_descriptions(_tools_text()))
    return {d["name"]: d for d in tools[0]["functionDeclarations"]}


def _tools_text() -> str:
    return (PROJECT_ROOT / FRAGMENT_FILES["tools"].lstrip("./")).read_text(encoding="utf-8")


# -- 두 모드가 같은 것을 말하는가 ---------------------------------------------


def test_every_action_has_a_tool() -> None:
    """`GOAL_SCHEMA.action` 의 값이 전부 도구로 갈 길이 있는가.

    빠지면 그 판단을 agent 모드에서 **아예 내릴 수 없습니다.** 예를 들어
    `self_harm` 이 빠지면 자해 발화가 다른 갈래로 떨어지고, 그 사람은
    상담 창구 안내 대신 거절 문구를 받습니다(`BLOCKED_REPLIES`).
    """
    actions = set(GOAL_SCHEMA["properties"]["action"]["enum"])
    reachable = {a for a in TERMINAL.values() if a} | set(DECLINE_KINDS)
    assert actions == reachable, f"두 모드가 다른 판단을 합니다: {actions ^ reachable}"


def test_the_task_shape_matches_the_schema() -> None:
    """과제 하나의 필드와 필수 여부가 `GOAL_SCHEMA` 와 같은가.

    `required` 가 갈리면 agent 모드에서만 모델이 필드를 비웁니다 — 빈도가 없으면
    화면의 배지가 빕니다(실측 2026-08-04). 에러는 나지 않습니다.
    """
    schema_item = GOAL_SCHEMA["properties"]["generated_tasks"]["items"]
    tool_item = _declarations()["propose_tasks"]["parameters"]["properties"]["tasks"]["items"]
    assert tool_item["properties"].keys() == schema_item["properties"].keys()
    assert sorted(tool_item["required"]) == sorted(schema_item["required"])
    assert tool_item["properties"]["frequency"]["enum"] == (
        schema_item["properties"]["frequency"]["enum"]
    )


def test_both_modes_ask_for_the_same_number_of_tasks() -> None:
    """개수가 갈리면 골든셋이 모드 차이가 아니라 개수 차이를 잽니다."""
    tasks = _declarations()["propose_tasks"]["parameters"]["properties"]["tasks"]
    assert GOAL_SCHEMA["properties"]["generated_tasks"]["minItems"] == TASK_COUNT
    assert tasks["minItems"] == tasks["maxItems"] == TASK_COUNT


def test_the_pointing_tool_takes_only_an_id() -> None:
    """제목을 받지 않습니다 — 서버가 시트에서 채웁니다(`_resolve_match`).

    베끼게 두면 그 필드에서 디코딩이 무너져 토큰 상한까지 태운 사고가 있었습니다.
    """
    params = _declarations()["point_to_existing"]["parameters"]
    assert set(params["properties"]) == {"subject_id"}
    assert params["required"] == ["subject_id"]


def test_agent_is_a_known_mode() -> None:
    assert "agent" in PIPELINE_MODES and "goal" in PIPELINE_MODES


# -- 설명은 prompts/ 에서 온다 -------------------------------------------------


def test_every_tool_has_a_description_from_the_prompt_file() -> None:
    """설명이 빈 도구가 없어야 합니다.

    이름이 어긋나면 그 도구만 설명 없이 나갑니다 — 모델은 여전히 부를 수 있어서
    에러가 없고, "언제 부르는가" 만 흐려집니다.
    """
    for name, declaration in _declarations().items():
        assert declaration["description"], f"{name} 의 설명이 비었습니다"


def test_the_emergency_text_still_names_every_tool() -> None:
    """파일을 못 읽어도 도구 이름은 다 들고 있어야 합니다."""
    sections = parse_descriptions(EMERGENCY["tools"])
    assert set(sections) == set(TERMINAL)


def test_the_preamble_is_not_sent_to_the_model() -> None:
    """`## 이름` 앞의 머리말은 사람이 읽는 안내라 버립니다 — 매 요청에 실릴 이유가 없습니다."""
    assert "# 도구 설명" not in "".join(parse_descriptions(_tools_text()).values())


# -- 종결 도구 → 결정 ----------------------------------------------------------


def test_proposing_becomes_generate() -> None:
    decision = to_decision(
        ToolCall("propose_tasks", {"domain": "학습", "tasks": [{"title": "x"}]})
    )
    assert decision == {
        "action": "generate",
        "domain": "학습",
        "generated_tasks": [{"title": "x"}],
    }


def test_pointing_becomes_recommend() -> None:
    assert to_decision(ToolCall("point_to_existing", {"subject_id": 41})) == {
        "action": "recommend",
        "matched_task": {"subject_id": 41},
    }


def test_asking_becomes_clarify() -> None:
    decision = to_decision(ToolCall("ask", {"question": "어느 쪽부터?", "domain": "건강"}))
    assert decision == {
        "action": "clarify",
        "clarify_question": "어느 쪽부터?",
        "domain": "건강",
    }


@pytest.mark.parametrize("kind", DECLINE_KINDS)
def test_declining_carries_the_kind_through(kind: str) -> None:
    """차단 갈래마다 사용자에게 할 말이 다릅니다(`BLOCKED_REPLIES`)."""
    assert to_decision(ToolCall("decline", {"kind": kind})) == {"action": kind}


def test_an_unknown_decline_kind_folds_to_out_of_scope() -> None:
    """**아무 거절 문구나 고르지 않습니다.**

    자해 발화에 `harmful` 의 문구가 가면 그 사람은 거절을 첫 문장으로 받습니다.
    모르는 값은 고정 문구인 범위 밖으로 접습니다 — 누구에게 가도 해롭지 않습니다.
    """
    assert to_decision(ToolCall("decline", {"kind": "??"})) == {"action": "out_of_scope"}


def test_a_non_terminal_tool_has_no_decision() -> None:
    assert to_decision(ToolCall("remove_task", {"subject_id": 3})) is None


# -- 루프 ---------------------------------------------------------------------


def _asker(replies: list[ToolReply], seen: list | None = None):
    """스텝마다 정해진 응답을 돌려주는 가짜 모델."""

    async def ask(turns, allowed):
        if seen is not None:
            seen.append((list(turns), allowed))
        return replies[min(len(seen or []) - 1 if seen else 0, len(replies) - 1)]

    return ask


async def test_a_terminal_call_ends_the_loop_at_once() -> None:
    seen: list = []
    ask = _asker([ToolReply(calls=[ToolCall("ask", {"question": "왜?"})])], seen)
    decision = await run_tool_loop(ask, [Turn(role="user", text="x")])
    assert decision["action"] == "clarify"
    assert len(seen) == 1, "종결 도구가 나왔는데 더 불렀습니다"


async def test_the_first_step_does_not_narrow_the_tools() -> None:
    """중간 스텝은 비종결 도구도 부를 수 있어야 합니다 — 그게 루프의 이유입니다."""
    seen: list = []
    ask = _asker([ToolReply(calls=[ToolCall("ask", {"question": "왜?"})])], seen)
    await run_tool_loop(ask, [Turn(role="user", text="x")])
    assert seen[0][1] is None


async def test_plain_text_never_reaches_the_decision() -> None:
    """평문이 오면 **종결 도구로 좁혀 다시 묻습니다.**

    그 문장은 어떤 스키마도 거치지 않았습니다. 사용자에게 내보내면
    `responseSchema` 이전으로 돌아갑니다.
    """
    seen: list = []
    replies = [
        ToolReply(text="저는 목표 설계를 돕는 AI 입니다"),
        ToolReply(calls=[ToolCall("ask", {"question": "어떤 목표를?"})]),
    ]

    async def ask(turns, allowed):
        seen.append((list(turns), allowed))
        return replies[min(len(seen) - 1, len(replies) - 1)]

    decision = await run_tool_loop(ask, [Turn(role="user", text="x")])
    assert decision == {
        "action": "clarify",
        "clarify_question": "어떤 목표를?",
        "domain": None,
    }
    assert seen[1][1] == list(TERMINAL), "평문 뒤에 종결 도구로 좁히지 않았습니다"
    # 그 문장을 히스토리에 넣으면 모델이 그것을 맥락 삼아 같은 답을 되풀이합니다.
    assert all("AI 입니다" not in t.text for t in seen[1][0])


async def test_the_last_step_is_narrowed_to_terminal_tools() -> None:
    """안 좁히면 상한을 비종결 호출로 다 쓰고 답 없이 끝나는 턴이 생깁니다."""
    seen: list = []
    HANDLERS["noop"] = lambda args: {"ok": True}
    try:

        async def ask(turns, allowed):
            seen.append((list(turns), allowed))
            return ToolReply(calls=[ToolCall("noop", {})])

        await run_tool_loop(ask, [Turn(role="user", text="x")])
    finally:
        HANDLERS.pop("noop")
    assert len(seen) == MAX_STEPS
    assert seen[-1][1] == list(TERMINAL)


async def test_running_out_of_steps_falls_back_to_clarify() -> None:
    """**빈 `clarify` 입니다.** `render()` 가 이미 도메인을 보고 되묻는 문장을
    만들므로 여기에 문구를 적지 않습니다 — 적으면 정본이 둘이 됩니다."""
    HANDLERS["noop"] = lambda args: {"ok": True}
    try:

        async def ask(turns, allowed):
            return ToolReply(calls=[ToolCall("noop", {})])

        decision = await run_tool_loop(ask, [Turn(role="user", text="x")])
    finally:
        HANDLERS.pop("noop")
    assert decision == {"action": "clarify"}


async def test_a_handler_result_is_fed_back_to_the_model() -> None:
    """비종결 도구의 결과가 다음 스텝의 `contents` 에 들어가는가."""
    seen: list = []
    HANDLERS["noop"] = lambda args: {"ok": True, "echo": args.get("v")}
    try:

        async def ask(turns, allowed):
            seen.append(list(turns))
            if len(seen) == 1:
                return ToolReply(calls=[ToolCall("noop", {"v": 7})])
            return ToolReply(calls=[ToolCall("ask", {"question": "다음?"})])

        await run_tool_loop(ask, [Turn(role="user", text="x")])
    finally:
        HANDLERS.pop("noop")

    fed = seen[1]
    assert fed[-2].call is not None and fed[-2].call.name == "noop"
    assert fed[-1].result is not None
    assert fed[-1].result.payload == {"ok": True, "echo": 7}


async def test_an_unknown_tool_becomes_a_result_not_an_exception() -> None:
    """모르는 도구를 예외로 올리면 그 턴이 통째로 실패합니다.

    결과로 돌려주면 모델이 읽고 다른 도구를 고를 수 있습니다 — 되먹임이 있는
    구조에서만 되는 복구라, 안 쓰면 루프를 만든 이유의 절반이 사라집니다.
    """
    seen: list = []

    async def ask(turns, allowed):
        seen.append(list(turns))
        if len(seen) == 1:
            return ToolReply(calls=[ToolCall("없는도구", {})])
        return ToolReply(calls=[ToolCall("ask", {"question": "다음?"})])

    decision = await run_tool_loop(ask, [Turn(role="user", text="x")])
    assert decision["action"] == "clarify"
    assert seen[1][-1].result.payload["ok"] is False


async def test_a_broken_handler_does_not_kill_the_turn() -> None:
    def boom(args: dict) -> dict:
        raise RuntimeError("터졌다")

    HANDLERS["boom"] = boom
    seen: list = []
    try:

        async def ask(turns, allowed):
            seen.append(list(turns))
            if len(seen) == 1:
                return ToolReply(calls=[ToolCall("boom", {})])
            return ToolReply(calls=[ToolCall("ask", {"question": "다음?"})])

        decision = await run_tool_loop(ask, [Turn(role="user", text="x")])
    finally:
        HANDLERS.pop("boom")
    assert decision["action"] == "clarify"
    assert "터졌다" in seen[1][-1].result.payload["error"]


# -- 파이프라인 배선 -----------------------------------------------------------


async def test_the_pipeline_runs_the_loop_in_agent_mode() -> None:
    """`BOT_MODE=agent` 면 3단계가 `reply_tools` 로 갑니다.

    `EchoBackend` 는 언제나 `ask` 를 부르므로(루프를 돌지 않습니다) 되묻기로
    끝나야 합니다 — goal 모드에서 echo 가 늘 `clarify` 인 것과 같습니다.
    """
    used: list[str] = []

    class Watching(EchoBackend):
        async def reply_json(self, system, history, schema, **kwargs):
            used.append("json")
            return await super().reply_json(system, history, schema, **kwargs)

        async def reply_tools(self, system, history, tools, **kwargs):
            used.append("tools")
            return await super().reply_tools(system, history, tools, **kwargs)

    pipeline = GoalPipeline(AGENT, Watching())
    result = await pipeline.run([Turn(role="user", text="매일 알고리즘 문제 풀고 싶어")])

    assert used == ["json", "tools"], f"단계 배선이 어긋났습니다: {used}"
    assert result.data is not None and result.data["action"] == "clarify"
    assert result.stages == ["classify", "retrieve", "decide"]


async def test_goal_mode_never_touches_the_tool_path() -> None:
    """agent 를 붙이면서 기본 경로가 바뀌지 않았는가."""
    used: list[str] = []

    class Watching(EchoBackend):
        async def reply_tools(self, system, history, tools, **kwargs):
            used.append("tools")
            return await super().reply_tools(system, history, tools, **kwargs)

    pipeline = GoalPipeline(AGENT.model_copy(update={"bot_mode": "goal"}), Watching())
    await pipeline.run([Turn(role="user", text="매일 알고리즘 문제 풀고 싶어")])
    assert used == []
