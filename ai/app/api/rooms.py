"""방 상태 조회용 REST 엔드포인트.

시그널링은 WebSocket 이라 밖에서 들여다보기 어렵습니다. 디버깅할 때 제일
먼저 두드리는 곳이 여기입니다 — 특히 `participants[].publishing` 이
"서버가 그 사람의 미디어를 실제로 받고 있는가" 를 알려줍니다.

**라우터가 둘로 갈려 있습니다.**

- `router` — `/api/health` 만. 로드밸런서 헬스체크용이라 항상 열려 있습니다.
- `debug_router` — 나머지 전부. `DEBUG_API_ENABLED=true` 일 때만 등록됩니다.

진단용을 갈라낸 이유는 **인증이 없기 때문**입니다. 열어두면 주소만 아는 누구나
TURN 자격증명을 가져가고(`/api/ice-servers`), 접속 중인 사용자 목록을 열 수
있습니다 — 사용자별 방을 쓰기 시작한 뒤로 **방 이름이 곧 사용자 식별자**입니다.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from app.config import get_settings

router = APIRouter(prefix="/api", tags=["rooms"])
debug_router = APIRouter(prefix="/api", tags=["rooms-debug"])


@router.get("/health")
async def health() -> dict:
    """항상 열려 있습니다. 서버 상태 외에는 아무것도 알려주지 않습니다."""
    return {"status": "ok"}


@debug_router.get("/ice-servers")
async def ice_servers() -> dict:
    """**TURN 자격증명이 그대로 나갑니다.**

    브라우저는 이 엔드포인트를 쓰지 않습니다 — 자격증명은 `join` 을 통과한 뒤
    `welcome` 에 실려 갑니다. 여기 남겨둔 것은 설정이 제대로 읽혔는지 확인하기
    위해서입니다.
    """
    return {"iceServers": get_settings().client_ice_servers}


@debug_router.get("/rooms")
async def list_rooms(request: Request) -> dict:
    return {"rooms": request.app.state.rooms.snapshot()}


@debug_router.get("/rooms/{room_id}")
async def get_room(room_id: str, request: Request) -> dict:
    room = request.app.state.rooms.get(room_id)
    if room is None:
        raise HTTPException(status_code=404, detail="room not found")
    return {
        "id": room.id,
        "capacity": get_settings().max_participants_per_room,
        "participants": [p.info() for p in room.participants.values()],
    }
