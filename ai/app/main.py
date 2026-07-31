"""FastAPI 앱 조립.

의존성은 `lifespan` 에서 한 번 만들어 `app.state` 에 올려둡니다. 전역 변수
대신 이 방식을 쓰면 테스트에서 앱을 여러 개 띄워도 서로 간섭하지 않습니다.

정적 프론트엔드도 같은 프로세스에서 서빙합니다. 배포 단위가 하나뿐이라
CORS 설정 없이 동작하고, WebSocket 도 같은 오리진을 씁니다.
"""
from __future__ import annotations

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.api.bot import debug_router as bot_debug_router
from app.api.rooms import debug_router as rooms_debug_router
from app.api.rooms import router as rooms_router
from app.bot.manager import BotManager
from app.config import Settings, get_settings
from app.media.engine import MediaEngine
from app.rooms.manager import RoomManager
from app.signaling.router import router as signaling_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-5s %(name)s | %(message)s",
)

STATIC_DIR = Path(__file__).resolve().parent.parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    """앱 수명 동안 유지되는 객체들을 만들고, 종료 시 정리합니다.

    이 셋이 서버의 전부입니다.
      - RoomManager : 누가 어느 방에 있는가
      - MediaEngine : PeerConnection 생성·구독·해제
      - BotManager  : AI 참가자와 LLM 백엔드
    """
    # `create_app(settings=...)` 로 주입한 값이 있으면 그걸 씁니다. 없으면 캐시된
    # 전역 설정입니다 — 테스트에서 설정이 다른 앱을 여러 개 띄우기 위한 것입니다.
    settings = getattr(app.state, "settings", None) or get_settings()
    app.state.settings = settings
    app.state.rooms = RoomManager(settings)
    app.state.media = MediaEngine(settings)
    app.state.bots = BotManager(settings, app.state.rooms)
    # 설정값이지 실제 바인딩이 아닙니다. `python -m app` 으로 띄우면 둘이 같고,
    # `uvicorn --port` 로 직접 띄우면 그 인자가 이깁니다 — 그래서 "설정" 이라고 적습니다.
    logging.getLogger(__name__).info(
        "SFU ready — 설정 %s:%s (실제 포트는 uvicorn 인자가 우선)", settings.host, settings.port
    )
    _warn_about_unsafe_config(settings)
    yield
    await app.state.bots.aclose()


def _warn_about_unsafe_config(settings: Settings) -> None:
    """운영에 그대로 나가면 안 되는 설정을 기동 시 한 번 알립니다.

    셋 다 로컬 개발에서는 정상이고 배포에서는 위험합니다. 그래서 값을 강제하지
    않고 경고만 합니다 — 다만 **로그를 안 보면 모른다**는 게 이 셋의 공통점이라,
    조용히 넘어가지 않게 WARNING 으로 남깁니다.
    """
    log = logging.getLogger(__name__)
    if not settings.auth_required:
        log.warning(
            "AUTH_REQUIRED=false — 방 이름만 알면 누구나 입장합니다. 배포 시 켜세요"
        )
    if settings.debug_api_enabled:
        log.warning(
            "DEBUG_API_ENABLED=true — /api/bot/* 와 /api/rooms/* 가 인증 없이 열려 "
            "있습니다. LLM 크레딧 소모·프롬프트 노출·TURN 자격증명 유출 경로입니다"
        )
    if settings.bot_voice_debug_dir:
        log.warning(
            "BOT_VOICE_DEBUG_DIR=%s — 사용자 음성이 디스크에 계속 쌓입니다. "
            "진단이 끝나면 비우세요",
            settings.bot_voice_debug_dir,
        )


def create_app(settings: Settings | None = None) -> FastAPI:
    """`settings` 를 주면 그 설정으로, 아니면 `.env` 기준으로 앱을 만듭니다.

    주입을 허용하는 이유는 테스트입니다. `get_settings()` 가 `lru_cache` 라
    프로세스당 하나뿐이라서, 인증 켜짐/꺼짐처럼 설정이 다른 앱을 나란히 띄우려면
    이 통로가 필요합니다.
    """
    settings = settings or get_settings()
    app = FastAPI(title="WebRTC SFU", version="1.0.0", lifespan=lifespan)
    # lifespan 이 여기서 읽어 갑니다. 라우터 등록 전에 올려두어야 합니다.
    app.state.settings = settings

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(rooms_router)
    app.include_router(signaling_router)

    # 진단 API 는 인증이 없습니다. 끄면 라우터를 아예 등록하지 않아 OpenAPI
    # 문서에도 나오지 않습니다 — 404 를 돌려주는 것보다 존재 자체를 숨기는
    # 편이 낫습니다.
    if settings.debug_api_enabled:
        app.include_router(rooms_debug_router)
        app.include_router(bot_debug_router)

    # 프론트엔드 서빙. 폴더가 없어도(API 전용 배포) 앱은 정상 기동합니다.
    if STATIC_DIR.is_dir():
        app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

        @app.get("/", include_in_schema=False)
        async def index() -> FileResponse:
            return FileResponse(STATIC_DIR / "index.html")

    return app


app = create_app()
