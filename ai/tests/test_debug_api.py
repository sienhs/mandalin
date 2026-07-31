"""진단 API 차단.

`/api/bot/*` 와 `/api/rooms/*` 는 **인증이 없습니다.** 열어두면 주소만 아는
누구나 LLM 크레딧을 태우고(`/ask`, `/probe-audio`), 시스템 프롬프트 전문을 읽고,
TURN 자격증명을 가져가고(`/ice-servers`), 접속 중인 사용자를 열거할 수 있습니다
(`/rooms` — 사용자별 방을 쓰기 시작한 뒤로 방 이름이 곧 사용자 식별자입니다).

그래서 기본값이 **꺼짐**이고, 여기서 그 기본값이 유지되는지 지킵니다.
"""
import httpx
import pytest

from app.config import Settings
from app.main import create_app

#: 인증 없이 열려 있으면 안 되는 것 전부.
#:
#: 세 번째 값은 OpenAPI 에 등록되는 경로입니다. 실제 요청 경로와 다른 것이
#: 있어서(`/api/rooms/demo` vs `/api/rooms/{room_id}`) 따로 적습니다 — 그리고
#: **라우트가 없어서 나는 404 와 방이 없어서 나는 404 는 구분해야 합니다.**
GATED = [
    ("GET", "/api/bot", "/api/bot"),
    ("GET", "/api/bot/prompt", "/api/bot/prompt"),
    ("POST", "/api/bot/ask", "/api/bot/ask"),
    ("POST", "/api/bot/probe-audio", "/api/bot/probe-audio"),
    ("GET", "/api/ice-servers", "/api/ice-servers"),
    ("GET", "/api/rooms", "/api/rooms"),
    ("GET", "/api/rooms/demo", "/api/rooms/{room_id}"),
]


def make_settings(**overrides) -> Settings:
    base = dict(bot_enabled=False)
    base.update(overrides)
    return Settings(_env_file=None, **base)


@pytest.fixture
async def closed():
    """기본 설정 그대로 — 진단 API 가 꺼져 있어야 합니다."""
    app = create_app(make_settings())
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            yield c


@pytest.fixture
async def opened():
    app = create_app(make_settings(debug_api_enabled=True))
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            yield c


def test_the_default_is_off():
    assert Settings(_env_file=None).debug_api_enabled is False


@pytest.mark.parametrize(("method", "path", "_schema_path"), GATED)
async def test_gated_endpoints_are_absent_by_default(closed, method, path, _schema_path):
    response = await closed.request(method, path, json={"text": "안녕"})
    assert response.status_code == 404, path


async def test_gated_endpoints_come_back_when_enabled(opened):
    """켰을 때는 살아 있어야 합니다 — 차단이 영구 삭제가 되면 진단을 못 합니다.

    응답 코드가 아니라 OpenAPI 등록 여부로 봅니다. `/api/rooms/{room_id}` 는
    방이 없으면 정상적으로 404 라서, 코드만 보면 "라우트가 없다" 와 구분되지
    않습니다.
    """
    paths = (await opened.get("/openapi.json")).json()["paths"]
    for _, _, schema_path in GATED:
        assert schema_path in paths, schema_path


async def test_health_is_always_open(closed):
    """로드밸런서 헬스체크는 인증 없이 통과해야 합니다."""
    response = await closed.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


async def test_health_reveals_nothing_but_status(closed):
    assert set((await closed.get("/api/health")).json()) == {"status"}


async def test_openapi_does_not_advertise_gated_paths(closed):
    """404 를 돌려주는 것보다 존재 자체를 숨기는 편이 낫습니다."""
    paths = (await closed.get("/openapi.json")).json()["paths"]
    assert "/api/health" in paths
    for _, _, schema_path in GATED:
        assert schema_path not in paths, schema_path


async def test_turn_credentials_are_not_reachable_by_default():
    """`/api/ice-servers` 는 TURN 자격증명을 그대로 내보냅니다."""
    settings = make_settings(
        turn_urls=["turn:example.com:3478"],
        turn_username="webrtc",
        turn_credential="비밀번호",
    )
    app = create_app(settings)
    async with app.router.lifespan_context(app):
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            response = await c.get("/api/ice-servers")
    assert response.status_code == 404
    assert "비밀번호" not in response.text
