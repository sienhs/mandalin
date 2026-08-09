"""LLM 실패 시 **사용자 화면에 나가는 문구**.

`agent/conversation.py` 가 `LlmError` 원문을 그대로 띄우므로 이 예외 메시지들은 내부
로그가 아니라 UI 문구입니다. 셋을 봅니다 — 원인이 갈리는가, 응답 본문이 화면까지
새지 않는가, 타입이 갈려 `Conversation` 이 다른 문구를 고를 수 있는가.

`httpx.MockTransport` 로 응답을 지어냅니다(`test_tool_calls.py` 와 같은 방식).
"""
from __future__ import annotations

import logging

import httpx
import pytest

from mandarin_goal.bot.llm import (
    GeminiBackend,
    LlmError,
    LlmRateLimitedError,
    ToolCall,
    Turn,
)
from mandarin_goal.config import Settings

SCHEMA = {"type": "object", "properties": {"intent": {"type": "string"}}}
HISTORY = [Turn(role="user", text="매일 알고리즘 문제 풀고 싶어")]


def _backend(handler) -> GeminiBackend:
    backend = GeminiBackend(
        Settings(bot_provider="gemini", bot_api_key="SECRET-KEY", bot_default_model="m")
    )
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    return backend


def _replies(response: httpx.Response) -> GeminiBackend:
    return _backend(lambda _request: response)


def _text(*chunks: str, finish: str = "STOP") -> httpx.Response:
    """모델이 `chunks` 를 텍스트 파트로 답한 정상 모양의 200 응답."""
    return httpx.Response(
        200,
        json={
            "candidates": [
                {"content": {"parts": [{"text": c} for c in chunks]}, "finishReason": finish}
            ]
        },
    )


async def _fails(backend: GeminiBackend, exc_type=LlmError) -> str:
    with pytest.raises(exc_type) as caught:
        await backend.reply_json("지시문", HISTORY, SCHEMA)
    return str(caught.value)


# -- 나가는 길에서 실패 -------------------------------------------------------


async def test_a_network_failure_names_the_backend():
    """어느 백엔드가 못 나갔는지 말합니다. 제공자가 둘 이상이면 이게 유일한 단서입니다."""

    def handler(_request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("연결할 수 없습니다")

    message = await _fails(_backend(handler))
    assert message.startswith("gemini 요청 실패")
    assert "연결할 수 없습니다" in message


async def test_a_4xx_body_is_cut_so_the_response_cannot_carry_a_key_to_the_screen():
    """본문은 앞부분만 남깁니다 — 이 문자열이 채팅 말풍선까지 갑니다."""
    message = await _fails(_replies(httpx.Response(400, text="에" * 500)))

    assert message.startswith("gemini 400: ")
    assert "에" * 200 in message
    assert "에" * 201 not in message


async def test_congestion_is_a_different_type_so_the_user_gets_a_different_line():
    """429 는 별도 타입입니다 — 일반 `LlmError` 면 원문 JSON 이 채팅에 나갑니다."""
    await _fails(
        _replies(httpx.Response(429, json={"error": {"message": "quota"}})),
        LlmRateLimitedError,
    )


async def test_a_rejected_request_logs_what_was_sent(caplog):
    """400 이면 보낸 **구조**를 남깁니다(`_describe`) — 발화 원문은 남기지 않습니다."""
    backend = _replies(httpx.Response(400, text="Invalid argument"))
    history = [Turn(role="assistant", call=ToolCall("ask", {"question": "왜?"}))]

    with caplog.at_level(logging.WARNING, logger="mandarin_goal.bot.llm"):
        with pytest.raises(LlmError):
            await backend.reply_json("지시문", history, SCHEMA)

    logged = "\n".join(r.getMessage() for r in caplog.records)
    assert "call(ask)" in logged
    # 발화 원문은 안 남는다 — 길이만.
    assert "왜?" not in logged


async def test_the_summary_tells_a_tool_result_from_a_tool_call():
    """`_describe` 가 둘을 같은 조각으로 줄이면 "결과를 안 실어 보냈다" 를 못 봅니다."""
    from mandarin_goal.bot.llm import _describe

    payload = {
        "contents": [
            {"role": "model", "parts": [{"functionCall": {"name": "ask", "args": {}}}]},
            {"role": "user", "parts": [{"functionResponse": {"name": "ask", "response": {}}}]},
        ]
    }
    summary = _describe(payload)
    assert "call(ask)" in summary
    assert "result(ask)" in summary


async def test_a_misconfigured_provider_fails_at_the_utterance_not_at_startup():
    """설정 오류는 세션을 끊지 않고 발화 시점에 원인을 올립니다."""
    from mandarin_goal.bot.llm import MisconfiguredBackend

    backend = MisconfiguredBackend("BOT_API_KEY 가 비었습니다")
    assert "BOT_API_KEY" in await _fails(backend)


# -- 200 인데 쓸 수 없는 응답 -------------------------------------------------
#
# 아래 셋은 전부 HTTP 200 입니다. 상태 코드만 보면 성공이라 **분기를 안 두면 조용히
# 빈 dict 나 깨진 값이 파이프라인으로 흘러 들어갑니다.**


async def test_a_safety_block_surfaces_its_reason():
    """안전 필터는 `candidates` 없이 `promptFeedback` 만 옵니다 — 이유를 붙입니다."""
    message = await _fails(
        _replies(httpx.Response(200, json={"promptFeedback": {"blockReason": "SAFETY"}}))
    )
    assert "SAFETY" in message


async def test_an_empty_candidate_names_the_finish_reason():
    """파트가 비면 `finishReason` 이 유일한 단서입니다(`RECITATION` 등)."""
    empty = httpx.Response(
        200,
        json={"candidates": [{"content": {"parts": []}, "finishReason": "RECITATION"}]},
    )
    assert "RECITATION" in await _fails(_replies(empty))


async def test_a_truncated_json_says_it_may_have_been_cut():
    """스키마를 걸었는데 깨졌으면 대개 잘린 것이라, 그 추정과 원문 앞부분을 담습니다."""
    message = await _fails(_replies(_text('{"intent": "go')))

    assert "잘렸을 수 있습니다" in message
    assert '{"intent": "go' in message


async def test_a_json_array_is_refused_by_name():
    """객체가 아니면 타입을 말합니다. 파이프라인은 필드를 읽으므로 배열은 쓸 수 없습니다."""
    assert "list" in await _fails(_replies(_text("[1, 2, 3]")))
