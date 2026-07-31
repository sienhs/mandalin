import httpx
import pytest

from app.config import get_settings
from app.main import create_app


@pytest.fixture
async def client():
    # 진단 API 를 쓰는 테스트입니다. 기본값은 꺼짐이라 명시적으로 켭니다
    # (.env 의 다른 설정은 그대로 유지합니다).
    app = create_app(get_settings().model_copy(update={"debug_api_enabled": True}))
    transport = httpx.ASGITransport(app=app)
    async with app.router.lifespan_context(app):
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            yield c, app


async def test_health(client):
    c, _ = client
    response = await c.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_ice_servers_are_exposed(client):
    c, _ = client
    response = await c.get("/api/ice-servers")
    assert response.status_code == 200
    assert "iceServers" in response.json()


async def test_room_listing_reflects_the_manager(client):
    c, app = client

    async def _noop(_message: dict) -> None:
        return None

    assert (await c.get("/api/rooms")).json() == {"rooms": []}
    assert (await c.get("/api/rooms/ghost")).status_code == 404

    await app.state.rooms.join("demo", "우찬", _noop)
    body = (await c.get("/api/rooms/demo")).json()
    assert body["id"] == "demo"
    assert body["participants"][0]["displayName"] == "우찬"
