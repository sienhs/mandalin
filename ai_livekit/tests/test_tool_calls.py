"""도구 호출 경로 — `responseSchema` 가 막아주던 것을 무엇이 대신 막는가.

`reply_json` 과 달리 이쪽에는 **스키마 강제가 없습니다.** Gemini 가 둘을 같이 받지
않기 때문입니다(실측 400: *Function calling with a response mime type:
'application/json' is unsupported* — `scripts/probe_tools.py`). 그 자리를 둘이
나눠 맡습니다.

    mode=ANY        모델이 도구를 건너뛰고 평문으로 답하는 것을 막습니다
    ToolReply.text  그래도 뚫렸을 때 호출부가 알아챌 수 있게 남깁니다

여기 있는 것들은 전부 **에러 없이 조용히 틀리는** 종류입니다(HANDOFF 2절). 특히
`functionResponse` 의 role 은 틀려도 200 이 오고, 증상은 "모델이 자기 도구 호출의
결과를 못 본다" 뿐입니다.
"""
from __future__ import annotations

import httpx
import pytest

from mandarin_goal.bot.llm import (
    EchoBackend,
    GeminiBackend,
    LlmTruncatedError,
    ToolCall,
    ToolReply,
    ToolResult,
    Turn,
    _contents,
    supports_json,
    supports_tools,
)
from mandarin_goal.config import Settings

ASK = {
    "name": "ask",
    "parameters": {
        "type": "object",
        "properties": {"question": {"type": "string"}},
        "required": ["question"],
    },
}
REMOVE = {
    "name": "remove_task",
    "parameters": {
        "type": "object",
        "properties": {"subject_id": {"type": "integer"}},
        "required": ["subject_id"],
    },
}
TOOLS = [{"functionDeclarations": [ASK, REMOVE]}]


def _answer(*parts: dict, finish: str = "STOP") -> httpx.Response:
    return httpx.Response(
        200,
        json={"candidates": [{"content": {"parts": list(parts)}, "finishReason": finish}]},
    )


def _backend(response: httpx.Response) -> tuple[GeminiBackend, list[dict]]:
    """백엔드와 **보낸 payload 를 담는 리스트**를 함께 돌려줍니다.

    무엇을 보냈는지 봐야 하는 테스트가 대부분입니다 — `toolConfig` 는 응답을 보고는
    확인할 수 없고, 빠져도 200 이 옵니다.
    """
    sent: list[dict] = []

    def handler(request: httpx.Request) -> httpx.Response:
        import json as _json

        sent.append(_json.loads(request.content))
        return response

    backend = GeminiBackend(
        Settings(bot_provider="gemini", bot_api_key="k", bot_default_model="m")
    )
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return backend, sent


def _tool_config(payload: dict) -> dict:
    return (payload.get("toolConfig") or {}).get("functionCallingConfig") or {}


# -- contents 변환 -----------------------------------------------------------


def test_a_tool_call_turn_goes_out_as_the_model_speaking() -> None:
    contents = _contents([Turn(role="assistant", call=ToolCall("ask", {"question": "왜?"}))])
    assert contents == [
        {"role": "model", "parts": [{"functionCall": {"name": "ask", "args": {"question": "왜?"}}}]}
    ]


def test_a_tool_result_turn_goes_out_as_the_user_speaking() -> None:
    """**role 이 `user` 여야 합니다.**

    서버가 만든 값이라 `assistant` 로 적기 쉬운 자리인데, Gemini 는
    `functionResponse` 를 사용자 쪽 content 로 받습니다. 틀려도 400 이 아니라
    200 이 오고, 모델이 자기 호출의 결과를 못 본 채 같은 도구를 다시 부릅니다 —
    루프가 상한까지 돌다 끝나는 것으로만 드러납니다.
    """
    contents = _contents([Turn(role="user", result=ToolResult("remove_task", {"ok": True}))])
    assert contents == [
        {
            "role": "user",
            "parts": [{"functionResponse": {"name": "remove_task", "response": {"ok": True}}}],
        }
    ]


def test_the_call_role_does_not_follow_the_turn_role() -> None:
    """호출 턴을 `role="user"` 로 적어도 `model` 로 나갑니다.

    루프를 쓰는 쪽이 역할을 잘못 적는 것을 여기서 흡수합니다 — 도구 왕복의 역할은
    대화의 역할이 아니라 **형식이 정한 값**입니다.
    """
    contents = _contents([Turn(role="user", call=ToolCall("ask"))])
    assert contents[0]["role"] == "model"


def test_plain_turns_are_untouched() -> None:
    """텍스트 턴은 예전 그대로 나갑니다 — `reply_json` 이 같은 함수를 씁니다."""
    contents = _contents([Turn(role="user", text="안녕"), Turn(role="assistant", text="네")])
    assert contents == [
        {"role": "user", "parts": [{"text": "안녕"}]},
        {"role": "model", "parts": [{"text": "네"}]},
    ]


# -- 강제 ---------------------------------------------------------------------


async def test_tool_calls_are_forced_by_default() -> None:
    """**기본값이 강제입니다.** 이게 `responseSchema` 를 대신합니다."""
    backend, sent = _backend(_answer({"functionCall": {"name": "ask", "args": {}}}))
    await backend.reply_tools("sys", [Turn(role="user", text="x")], TOOLS)
    assert _tool_config(sent[0])["mode"] == "ANY"
    assert "allowedFunctionNames" not in _tool_config(sent[0])


async def test_allowed_narrows_the_forced_call() -> None:
    """루프의 마지막 스텝이 종결 도구만 부르게 하는 자리입니다."""
    backend, sent = _backend(_answer({"functionCall": {"name": "ask", "args": {}}}))
    await backend.reply_tools("sys", [Turn(role="user", text="x")], TOOLS, allowed=["ask"])
    assert _tool_config(sent[0]) == {"mode": "ANY", "allowedFunctionNames": ["ask"]}


async def test_auto_mode_is_an_explicit_choice() -> None:
    """`force=False` 면 `toolConfig` 를 아예 안 보냅니다(= AUTO).

    끄는 것이 명시적 선택이어야 합니다 — AUTO 에서는 모델이 도구를 건너뛰고
    평문으로 답하는 것이 실측으로 확인됐습니다.
    """
    backend, sent = _backend(_answer({"functionCall": {"name": "ask", "args": {}}}))
    await backend.reply_tools("sys", [Turn(role="user", text="x")], TOOLS, force=False)
    assert "toolConfig" not in sent[0]


async def test_forcing_without_declarations_sends_no_tool_config() -> None:
    """도구가 없는데 `mode=ANY` 만 가면 400 입니다. 원인이 요청 어디에도 안 적힙니다."""
    backend, sent = _backend(_answer({"text": "…"}))
    await backend.reply_tools("sys", [Turn(role="user", text="x")], [])
    assert "toolConfig" not in sent[0]


# -- 응답 해석 ----------------------------------------------------------------


async def test_a_talking_model_is_reported_as_escaped() -> None:
    """도구를 안 부르고 말로 때운 응답. **문장을 버리지 않습니다.**

    호출부가 그것을 사용자에게 내보낼지 접을지 정해야 합니다 — 스키마를 거치지
    않은 문장이라 그대로 말풍선에 띄우면 `responseSchema` 이전으로 돌아갑니다.
    """
    backend, _ = _backend(_answer({"text": "저는 목표 설계를 돕는 AI 입니다"}))
    reply = await backend.reply_tools("sys", [Turn(role="user", text="날씨?")], TOOLS)
    assert reply.escaped
    assert reply.text == "저는 목표 설계를 돕는 AI 입니다"


async def test_a_nameless_call_is_dropped_but_the_rest_survive() -> None:
    """이름 없는 호출은 디스패치할 데가 없습니다. 그 하나만 버립니다 —
    `drop_polluted` 가 과제 하나만 버리는 것과 같은 규율입니다."""
    backend, _ = _backend(
        _answer(
            {"functionCall": {"args": {}}},
            {"functionCall": {"name": "remove_task", "args": {"subject_id": 3}}},
        )
    )
    reply = await backend.reply_tools("sys", [Turn(role="user", text="x")], TOOLS)
    assert [c.name for c in reply.calls] == ["remove_task"]
    assert reply.calls[0].args == {"subject_id": 3}


async def test_args_that_are_not_an_object_become_empty() -> None:
    """`args` 가 객체가 아니면 빈 dict 입니다 — 핸들러가 `.get()` 을 쓸 수 있어야 합니다."""
    backend, _ = _backend(_answer({"functionCall": {"name": "ask", "args": "말도 안 되는 값"}}))
    reply = await backend.reply_tools("sys", [Turn(role="user", text="x")], TOOLS)
    assert reply.calls[0].args == {}


async def test_truncation_is_raised_on_the_tool_path_too() -> None:
    """잘림 판정은 두 경로가 **같은 코드**를 씁니다.

    `_step` 이 이 예외만 재시도하므로(디코딩 붕괴는 비결정적이라), 도구 경로에서만
    빠지면 붕괴한 응답이 그대로 핸들러로 갑니다.
    """
    backend, _ = _backend(_answer({"text": "…"}, finish="MAX_TOKENS"))
    with pytest.raises(LlmTruncatedError):
        await backend.reply_tools("sys", [Turn(role="user", text="x")], TOOLS)


# -- 능력 판정과 대역 ---------------------------------------------------------


def test_a_json_only_backend_does_not_claim_tools() -> None:
    """테스트의 가짜 백엔드처럼 `reply_json` 만 있는 것은 도구를 못 씁니다."""

    class JsonOnly:
        name = "json-only"

        async def reply_json(self, system, history, schema, **_):
            return {}

    assert supports_json(JsonOnly())
    assert not supports_tools(JsonOnly())
    assert supports_tools(EchoBackend())


async def test_the_echo_backend_ends_the_loop() -> None:
    """키 없이 도는 데모가 **루프를 돌면 안 됩니다.**

    `reply_json` 이 늘 `clarify` 를 돌려주는 것과 같은 판단입니다 — echo 로 보려는
    것은 판단이 아니라 배선인데, 도구를 골라 부르면 스텝 예산과 상한 처리까지
    echo 경로로 끌려 들어옵니다.
    """
    reply = await EchoBackend().reply_tools("sys", [Turn(role="user", text="x")], TOOLS)
    assert [c.name for c in reply.calls] == ["ask"]
    assert reply.calls[0].args["question"]


def test_an_empty_reply_is_escaped() -> None:
    assert ToolReply().escaped
    assert not ToolReply(calls=[ToolCall("ask")]).escaped
