import asyncio

import httpx
import pytest

from app.bot.llm import (
    EchoBackend,
    GeminiBackend,
    LlmError,
    OpenAIBackend,
    Turn,
    build_backend,
)
from app.bot.manager import BotManager
from app.chat.service import build_payload, fan_out
from app.config import Settings
from app.rooms.manager import RoomManager


def make_settings(**overrides) -> Settings:
    base = dict(bot_enabled=True, bot_provider="echo", bot_display_name="AI")
    base.update(overrides)
    return Settings(_env_file=None, **base)


class RecordingBackend:
    """Captures what the manager asked for and returns a canned reply."""

    name = "recording"

    def __init__(self, reply: str = "안녕하세요", delay: float = 0.0) -> None:
        self._reply = reply
        self._delay = delay
        self.calls: list[list[Turn]] = []

    async def reply(self, system: str, history: list[Turn]) -> str:
        self.calls.append(list(history))
        if self._delay:
            await asyncio.sleep(self._delay)
        return self._reply

    async def aclose(self) -> None:
        return None


async def _collector(sink: list[dict]):
    async def _send(message: dict) -> None:
        sink.append(message)

    return _send


# ── bot lifecycle ─────────────────────────────────────────────────────
async def test_bot_joins_and_appears_as_a_normal_peer():
    settings = make_settings()
    rooms = RoomManager(settings)
    bots = BotManager(settings, rooms, RecordingBackend())

    inbox: list[dict] = []
    human = await rooms.join("demo", "우찬", await _collector(inbox))
    bot = await bots.ensure("demo")

    assert bot is not None
    room = rooms.get("demo")
    # welcome 의 peers 는 room.others() 로 만들어지므로 봇이 그대로 들어갑니다.
    assert [p.id for p in room.others(human.id)] == [bot.id]
    assert bot.info()["displayName"] == "AI"
    assert bot.info()["publishing"] is False


async def test_ensure_is_idempotent():
    settings = make_settings()
    rooms = RoomManager(settings)
    bots = BotManager(settings, rooms, RecordingBackend())

    await rooms.join("demo", "우찬", lambda m: asyncio.sleep(0))
    first = await bots.ensure("demo")
    second = await bots.ensure("demo")
    assert first is not None and first.id == second.id
    assert len(rooms.get("demo").participants) == 2


async def test_disabled_bot_never_joins():
    settings = make_settings(bot_enabled=False)
    rooms = RoomManager(settings)
    bots = BotManager(settings, rooms, RecordingBackend())

    await rooms.join("demo", "우찬", lambda m: asyncio.sleep(0))
    assert await bots.ensure("demo") is None
    assert len(rooms.get("demo").participants) == 1


async def test_room_is_disposed_once_only_the_bot_remains():
    settings = make_settings()
    rooms = RoomManager(settings)
    bots = BotManager(settings, rooms, RecordingBackend())

    human = await rooms.join("demo", "우찬", lambda m: asyncio.sleep(0))
    await bots.ensure("demo")

    await rooms.leave(human)
    assert rooms.get("demo") is not None  # 봇이 남아 방이 살아 있음

    await bots.release_if_only_bots("demo")
    assert rooms.get("demo") is None
    assert bots.is_bot(human.id) is False


async def test_bot_stays_while_another_human_is_present():
    # 사람 2 + 봇 1 = 3 자리. 기본 정원은 2(본인 + 봇)라 명시로 넘겨야 합니다 —
    # 이 테스트가 검사하는 것은 봇의 생명주기이고 정원은 무대 장치입니다.
    settings = make_settings(max_participants_per_room=3)
    rooms = RoomManager(settings)
    bots = BotManager(settings, rooms, RecordingBackend())

    a = await rooms.join("demo", "a", lambda m: asyncio.sleep(0))
    await rooms.join("demo", "b", lambda m: asyncio.sleep(0))
    bot = await bots.ensure("demo")

    await rooms.leave(a)
    await bots.release_if_only_bots("demo")
    assert bot.id in rooms.get("demo").participants


# ── conversation ──────────────────────────────────────────────────────
async def test_bot_replies_to_chat_and_fans_out():
    settings = make_settings()
    rooms = RoomManager(settings)
    backend = RecordingBackend(reply="반갑습니다")
    bots = BotManager(settings, rooms, backend)

    inbox: list[dict] = []
    human = await rooms.join("demo", "우찬", await _collector(inbox))
    bot = await bots.ensure("demo")
    room = rooms.get("demo")

    await fan_out(room, human, build_payload(human, "안녕", 1000))
    await asyncio.sleep(0.05)  # 봇 응답은 백그라운드 태스크

    replies = [m for m in inbox if m.get("from") == bot.id]
    assert len(replies) == 1
    assert replies[0]["text"] == "반갑습니다"
    assert replies[0]["displayName"] == "AI"

    # 화자 이름이 프롬프트에 붙어 그룹 대화를 구분할 수 있어야 합니다.
    assert backend.calls[0][-1].as_prompt_text() == "우찬: 안녕"


async def test_history_accumulates_both_sides():
    settings = make_settings(bot_history_turns=10)
    rooms = RoomManager(settings)
    backend = RecordingBackend(reply="네")
    bots = BotManager(settings, rooms, backend)

    human = await rooms.join("demo", "우찬", lambda m: asyncio.sleep(0))
    await bots.ensure("demo")
    room = rooms.get("demo")

    for text in ("첫번째", "두번째"):
        await fan_out(room, human, build_payload(human, text, 1000))
        await asyncio.sleep(0.05)

    second_call = backend.calls[1]
    assert [t.role for t in second_call] == ["user", "assistant", "user"]
    assert second_call[-1].text == "두번째"


async def test_history_is_trimmed():
    settings = make_settings(bot_history_turns=4)
    rooms = RoomManager(settings)
    backend = RecordingBackend(reply="네")
    bots = BotManager(settings, rooms, backend)

    human = await rooms.join("demo", "우찬", lambda m: asyncio.sleep(0))
    await bots.ensure("demo")
    room = rooms.get("demo")

    for i in range(6):
        await fan_out(room, human, build_payload(human, f"m{i}", 1000))
        await asyncio.sleep(0.05)

    assert all(len(call) <= 4 for call in backend.calls)


async def test_mention_trigger_ignores_plain_messages():
    settings = make_settings(bot_trigger="mention", bot_mention="@ai")
    rooms = RoomManager(settings)
    backend = RecordingBackend()
    bots = BotManager(settings, rooms, backend)

    human = await rooms.join("demo", "우찬", lambda m: asyncio.sleep(0))
    await bots.ensure("demo")
    room = rooms.get("demo")

    await fan_out(room, human, build_payload(human, "그냥 잡담", 1000))
    await asyncio.sleep(0.05)
    assert backend.calls == []

    await fan_out(room, human, build_payload(human, "@ai 요약해줘", 1000))
    await asyncio.sleep(0.05)
    assert len(backend.calls) == 1


async def test_overlapping_turns_are_dropped_not_queued():
    settings = make_settings()
    rooms = RoomManager(settings)
    backend = RecordingBackend(delay=0.2)
    bots = BotManager(settings, rooms, backend)

    human = await rooms.join("demo", "우찬", lambda m: asyncio.sleep(0))
    await bots.ensure("demo")
    room = rooms.get("demo")

    await fan_out(room, human, build_payload(human, "하나", 1000))
    await asyncio.sleep(0.01)
    await fan_out(room, human, build_payload(human, "둘", 1000))
    await asyncio.sleep(0.4)

    assert len(backend.calls) == 1


async def test_backend_failure_is_reported_in_the_room():
    class BrokenBackend:
        name = "broken"

        async def reply(self, system, history):
            raise LlmError("401: bad key")

        async def aclose(self):
            return None

    settings = make_settings()
    rooms = RoomManager(settings)
    bots = BotManager(settings, rooms, BrokenBackend())

    inbox: list[dict] = []
    human = await rooms.join("demo", "우찬", await _collector(inbox))
    bot = await bots.ensure("demo")
    room = rooms.get("demo")

    await fan_out(room, human, build_payload(human, "안녕", 1000))
    await asyncio.sleep(0.05)

    replies = [m for m in inbox if m.get("from") == bot.id]
    assert len(replies) == 1
    assert "AI 응답 실패" in replies[0]["text"]


async def test_non_chat_messages_are_ignored():
    settings = make_settings()
    rooms = RoomManager(settings)
    backend = RecordingBackend()
    bots = BotManager(settings, rooms, backend)

    await rooms.join("demo", "우찬", lambda m: asyncio.sleep(0))
    bot = await bots.ensure("demo")

    await bot.send_safe({"type": "peer-joined", "peer": {"id": "x"}})
    await bot.send_safe({"type": "chat", "text": "   ", "displayName": "우찬"})
    await asyncio.sleep(0.05)
    assert backend.calls == []


# ── backends ──────────────────────────────────────────────────────────
async def test_echo_backend_is_offline_safe():
    reply = await EchoBackend().reply("sys", [Turn(role="user", text="안녕", speaker="우찬")])
    assert "안녕" in reply


def test_build_backend_selects_by_provider():
    assert build_backend(make_settings(bot_provider="echo")).name == "echo"
    assert build_backend(make_settings(bot_provider="gemini")).name == "gemini"
    assert build_backend(make_settings(bot_provider="openai")).name == "openai"
    with pytest.raises(ValueError):
        build_backend(make_settings(bot_provider="nope"))


async def test_gemini_request_shape_and_parsing():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        captured["key"] = request.headers.get("x-goog-api-key")
        captured["json"] = __import__("json").loads(request.content)
        return httpx.Response(
            200,
            json={"candidates": [{"content": {"parts": [{"text": "안녕하세요!"}]}}]},
        )

    settings = make_settings(
        bot_provider="gemini", bot_default_model="gemini-2.5-flash", bot_api_key="test-key"
    )
    backend = GeminiBackend(settings)
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))

    text = await backend.reply(
        "너는 어시스턴트다",
        [Turn(role="user", text="안녕", speaker="우찬"), Turn(role="assistant", text="네")],
    )
    await backend.aclose()

    assert text == "안녕하세요!"
    assert captured["url"].endswith("/v1beta/models/gemini-2.5-flash:generateContent")
    assert captured["key"] == "test-key"
    assert [c["role"] for c in captured["json"]["contents"]] == ["user", "model"]
    assert captured["json"]["contents"][0]["parts"][0]["text"] == "우찬: 안녕"
    assert captured["json"]["systemInstruction"]["parts"][0]["text"] == "너는 어시스턴트다"
    # 2.5 계열 지연을 줄이기 위해 사고 토큰을 끕니다.
    assert captured["json"]["generationConfig"]["thinkingConfig"]["thinkingBudget"] == 0


async def test_gemini_blocked_response_raises():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"promptFeedback": {"blockReason": "SAFETY"}})

    backend = GeminiBackend(make_settings(bot_provider="gemini", bot_api_key="k"))
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    with pytest.raises(LlmError) as exc:
        await backend.reply("sys", [Turn(role="user", text="x")])
    await backend.aclose()
    assert "SAFETY" in str(exc.value)


async def test_gemini_http_error_is_wrapped():
    def handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(429, text="quota exceeded")

    backend = GeminiBackend(make_settings(bot_provider="gemini", bot_api_key="k"))
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    with pytest.raises(LlmError) as exc:
        await backend.reply("sys", [Turn(role="user", text="x")])
    await backend.aclose()
    assert "429" in str(exc.value)


async def test_missing_api_key_is_caught_before_the_request():
    backend = GeminiBackend(make_settings(bot_provider="gemini", bot_api_key=None))
    with pytest.raises(LlmError) as exc:
        await backend.reply("sys", [Turn(role="user", text="x")])
    await backend.aclose()
    assert "BOT_API_KEY" in str(exc.value)


async def test_openai_uses_max_completion_tokens_on_official_endpoint():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        captured["json"] = __import__("json").loads(request.content)
        captured["auth"] = request.headers.get("Authorization")
        return httpx.Response(200, json={"choices": [{"message": {"content": "hi"}}]})

    backend = OpenAIBackend(
        make_settings(bot_provider="openai", bot_default_model="gpt-4o-mini", bot_api_key="sk-x")
    )
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    assert await backend.reply("sys", [Turn(role="user", text="hi", speaker="우찬")]) == "hi"
    await backend.aclose()

    assert captured["auth"] == "Bearer sk-x"
    assert "max_completion_tokens" in captured["json"]
    assert captured["json"]["messages"][0]["role"] == "system"


async def test_openai_compatible_endpoint_uses_max_tokens():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["json"] = __import__("json").loads(request.content)
        return httpx.Response(200, json={"choices": [{"message": {"content": "hi"}}]})

    backend = OpenAIBackend(
        make_settings(
            bot_provider="openai", bot_api_key="k", bot_base_url="http://localhost:1234/v1"
        )
    )
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    await backend.reply("sys", [Turn(role="user", text="hi")])
    await backend.aclose()
    assert "max_tokens" in captured["json"]


async def test_gemini_custom_gateway_url_and_query_key():
    """사내 게이트웨이(예: SSAFY GMS)는 base_url 교체 + ?key= 를 요구합니다."""
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        captured["header_key"] = request.headers.get("x-goog-api-key")
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": "ok"}]}}]})

    backend = GeminiBackend(
        make_settings(
            bot_provider="gemini",
            bot_default_model="gemini-2.5-flash",
            bot_api_key="gms-key",
            bot_base_url="https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com",
            bot_api_key_in_query=True,
        )
    )
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    assert await backend.reply("sys", [Turn(role="user", text="hi")]) == "ok"
    await backend.aclose()

    assert captured["url"].startswith(
        "https://gms.ssafy.io/gmsapi/generativelanguage.googleapis.com"
        "/v1beta/models/gemini-2.5-flash:generateContent"
    )
    assert "key=gms-key" in captured["url"]
    assert captured["header_key"] == "gms-key"   # 헤더도 함께 보냅니다


async def test_gemini_omits_the_query_key_by_default():
    captured: dict = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        return httpx.Response(200, json={"candidates": [{"content": {"parts": [{"text": "ok"}]}}]})

    backend = GeminiBackend(make_settings(bot_provider="gemini", bot_api_key="k"))
    backend._client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
    await backend.reply("sys", [Turn(role="user", text="hi")])
    await backend.aclose()
    assert "key=" not in captured["url"]
