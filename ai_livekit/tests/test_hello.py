"""세션 능력 알림(`mandarin.hello`) — **조용한 실패를 막는 계약입니다.**

`DEEPGRAM_API_KEY` 가 없으면 서버는 텍스트만 받습니다. 그 사실을 클라이언트에 알리지
않으면 프론트는 마이크 버튼을 켜둔 채로 두고, 사용자는 눌러서 말하고 **아무 일도 일어나지
않는 것**을 봅니다 — 에러도, 로그도, 응답도 없습니다.

클라이언트가 필요한 초기 상태를 한 번에 전달하는 자리이고, 여기서는 음성 가능
여부를 싣습니다.
"""
from __future__ import annotations

import json

from agent.entrypoint import MODE_LABELS, hello_payload


def test_voice_off_is_announced_explicitly():
    """**`voice: false` 가 반드시 실려야 합니다.** 필드가 빠지면 프론트가 켜진 것으로
    간주할 수 있고, 그게 정확히 이 알림이 막으려는 실패입니다."""
    payload = json.loads(hello_payload("AI", voice=False))
    assert payload["voice"] is False


def test_voice_on_is_announced():
    payload = json.loads(hello_payload("AI", voice=True))
    assert payload["voice"] is True


def test_the_name_is_carried_so_the_chat_log_can_label_replies():
    """이름은 `BOT_DISPLAY_NAME` 설정에서 옵니다 — 프론트에 박아두지 않습니다."""
    payload = json.loads(hello_payload("만다린", voice=True))
    assert payload["name"] == "만다린"


def test_the_mode_is_a_suffix_not_a_separate_name():
    """**이름을 둘로 나누지 않습니다.**

    "채팅 AI" / "음성 AI" 로 갈라 쓰면 봇이 두 개인 것처럼 읽힙니다. 같은 봇이 모드만
    다른 것이라, 이름은 하나로 두고 모드를 별 필드로 보내 프론트가 접미로 붙입니다.
    """
    voice = json.loads(hello_payload("AI", voice=True))
    chat = json.loads(hello_payload("AI", voice=False))

    assert voice["name"] == chat["name"] == "AI"
    assert voice["mode"] != chat["mode"]
    assert voice["mode"] == MODE_LABELS[True]
    assert chat["mode"] == MODE_LABELS[False]


def test_the_payload_keeps_korean_readable():
    """`ensure_ascii=False` 없이 보내면 한 글자가 6바이트가 됩니다."""
    raw = hello_payload("만다린", voice=False)
    assert "만다린" in raw
    assert "\\u" not in raw


# ── LLM 상태 ───────────────────────────────────────────────────────────
def test_echo_backend_is_announced_as_a_demo():
    """`echo` 는 정해진 문구만 돌려줍니다. 알리지 않으면 사용자는 AI 가 고장난 줄 압니다."""
    from agent.entrypoint import llm_status

    assert llm_status("echo", None) == "echo"
    payload = json.loads(hello_payload("AI", voice=False, llm="echo"))
    assert payload["llm"] == "echo"
    assert "데모" in payload["llmMessage"]


def test_a_missing_key_is_announced_as_unusable():
    """**LLM 은 선택 기능이 아닙니다.** 키가 없으면 이 서비스는 아무것도 못 합니다.

    STT 는 없어도 텍스트로 쓰면 되지만, LLM 이 없으면 발화가 전부 실패합니다. 그래서
    fail-open 이 아니라 입장 즉시 알립니다 — 발화를 던지고 실패를 기다리게 두면 사용자는
    자기 말이 문제인 줄 압니다.
    """
    from agent.entrypoint import llm_status

    assert llm_status("gemini", None) == "missing_key"
    assert llm_status("gemini", "   ") == "missing_key"
    payload = json.loads(hello_payload("AI", voice=True, llm="missing_key"))
    assert payload["llm"] == "missing_key"
    assert "API 키" in payload["llmMessage"]


def test_a_configured_provider_is_ok():
    """**설정만 봅니다 — LLM 을 부르지 않습니다.**

    입장마다 확인 호출을 하면 발화 없이도 크레딧이 나갑니다. 폐기된 키나 할당량 초과는
    첫 발화의 `LlmError` 로 드러나고, `Conversation` 이 그 문구를 그대로 보여줍니다.
    """
    from agent.entrypoint import llm_status

    assert llm_status("gemini", "AIza-something") == "ok"
    payload = json.loads(hello_payload("AI", voice=True, llm="ok"))
    assert payload["llm"] == "ok"
    assert "llmMessage" not in payload, "정상일 때 경고 문구를 실으면 노이즈입니다"


def test_every_known_provider_has_a_status():
    """**표를 훑습니다.** provider 문자열을 해석하는 곳이 둘(`BACKENDS` 디스패치와 이
    알림)이면, 제공자를 추가한 날 디스패치는 맞고 알림만 조용히 틀립니다 — 사용자에게는
    `ok` 라고 알리면서 첫 발화에서 실패하는 조합입니다. 문구가 아니라 구조를 봅니다.
    """
    from agent.entrypoint import llm_status
    from agent.reuse import BACKENDS

    for provider in BACKENDS:
        assert llm_status(provider, "key") in {"ok", "echo"}, (
            f"BACKENDS 에 {provider!r} 를 추가하고 llm_status 를 안 고쳤습니다"
        )


def test_a_provider_typo_is_announced_instead_of_guessed():
    """오타를 `echo` 로 폴백하지 않습니다 — 답이 나오면 설정이 맞다고 믿게 됩니다."""
    from agent.entrypoint import llm_status

    assert llm_status("gemmini", "AIza-something") == "unknown_provider"
    payload = json.loads(hello_payload("AI", voice=False, llm="unknown_provider"))
    assert payload["llm"] == "unknown_provider"
    assert "BOT_PROVIDER" in payload["llmMessage"]


def test_surrounding_whitespace_is_not_a_typo():
    """`.env` 에 `BOT_PROVIDER=gemini ` 처럼 공백이 붙는 경우입니다. 이것까지 설정
    오류로 보내면 원인이 보이지 않습니다."""
    from agent.entrypoint import llm_status

    assert llm_status(" gemini ", "AIza-something") == "ok"
    assert llm_status("ECHO", None) == "echo"


def test_a_provider_typo_does_not_kill_the_session():
    """**예외를 내면 이 알림 자체가 못 나갑니다.**

    `build_backend()` 가 `raise` 하던 동안에는 `entrypoint()` 가 `ctx.connect()` 뒤·
    `wait_for_participant()` 앞에서 죽어서, 브라우저는 접속은 되는데 에이전트만 안 들어오는
    것을 봤습니다 — 사용자에게 원인을 전할 경로가 없었습니다.
    """
    from agent.reuse import Settings, build_backend

    backend = build_backend(Settings(bot_provider="gemmini"))
    assert backend.name == "misconfigured"


async def test_a_misconfigured_provider_says_why_on_every_utterance():
    """알림을 놓친 사용자에게도 원인이 닿아야 합니다.

    `LlmError` 라서 `Conversation` 이 `(AI 응답 실패: …)` 로 그대로 띄웁니다 — 그 예외의
    독스트링대로 "방에 그대로 노출해도 되는 실패" 입니다. `supports_json()` 을 통과하는
    것도 중요합니다. 안 그러면 실패 문구가 설정 오류가 아니라 "스키마 강제 미지원" 이 됩니다.
    """
    import pytest

    from agent.reuse import LlmError, Settings, build_backend

    backend = build_backend(Settings(bot_provider="gemmini"))
    with pytest.raises(LlmError, match="gemmini"):
        await backend.reply_json("system", [], {})
