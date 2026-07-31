import httpx
import pytest

from app.bot.llm import EchoBackend
from app.config import get_settings
from app.main import create_app


@pytest.fixture
async def client():
    # 진단 API 를 쓰는 테스트입니다. 기본값은 꺼짐이라 명시적으로 켭니다
    # (.env 의 다른 설정은 그대로 유지합니다).
    app = create_app(get_settings().model_copy(update={"debug_api_enabled": True}))
    transport = httpx.ASGITransport(app=app)
    async with app.router.lifespan_context(app):
        # 개발자의 .env 설정과 무관하게 결정적으로 돌아야 합니다.
        app.state.bots._backend = EchoBackend()
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            yield c, app


async def test_status_reports_config_without_leaking_the_key(client):
    c, _ = client
    body = (await c.get("/api/bot")).json()
    assert body["provider"] == "echo"
    assert body["activeRooms"] == []
    assert "hasApiKey" in body
    assert "apiKey" not in body and "bot_api_key" not in body


async def test_ask_round_trips_through_the_backend(client):
    c, _ = client
    response = await c.post("/api/bot/ask", json={"text": "안녕"})
    assert response.status_code == 200
    body = response.json()
    assert body["provider"] == "echo"
    assert "안녕" in body["reply"]


async def test_ask_rejects_an_empty_prompt(client):
    c, _ = client
    assert (await c.post("/api/bot/ask", json={"text": ""})).status_code == 422


async def test_backend_failure_surfaces_as_502(client):
    from app.bot.llm import LlmError

    c, app = client

    class BrokenBackend:
        name = "broken"

        async def reply(self, system, history):
            raise LlmError("401: invalid api key")

        async def aclose(self):
            return None

    app.state.bots._backend = BrokenBackend()
    response = await c.post("/api/bot/ask", json={"text": "안녕"})
    assert response.status_code == 502
    assert "invalid api key" in response.json()["detail"]


async def test_status_lists_rooms_the_bot_is_in(client):
    c, app = client
    app.state.bots._bots["demo"] = object()
    assert (await c.get("/api/bot")).json()["activeRooms"] == ["demo"]


async def test_probe_audio_sends_a_synthetic_clip(client):
    """마이크 없이 오디오 업로드 경로만 시험할 수 있어야 합니다."""
    from app.bot.llm import Turn

    c, app = client
    seen: list[Turn] = []

    class AudioBackend:
        name = "audio-stub"

        async def reply(self, system, history):
            seen.extend(history)
            return "440Hz 톤이 들립니다"

        async def aclose(self):
            return None

    app.state.bots._backend = AudioBackend()
    body = (await c.post("/api/bot/probe-audio")).json()

    assert body["ok"] is True
    assert body["sentMime"] == "audio/ogg"
    assert 0 < body["sentBytes"] < 50_000
    assert seen[0].audio is not None and seen[0].audio[:4] == b"OggS"


async def test_probe_audio_can_force_wav(client):
    c, app = client

    class AudioBackend:
        name = "audio-stub"

        async def reply(self, system, history):
            return "ok"

        async def aclose(self):
            return None

    app.state.bots._backend = AudioBackend()
    body = (await c.post("/api/bot/probe-audio?codec=wav")).json()
    assert body["sentMime"] == "audio/wav"
