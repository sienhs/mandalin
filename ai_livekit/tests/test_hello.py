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
