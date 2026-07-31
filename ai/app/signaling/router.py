"""시그널링 WebSocket 엔드포인트.

여기서는 방 ID 검증과 세션 조립만 하고, 실제 프로토콜 처리는
`SignalingSession` 이 담당합니다.
"""
from __future__ import annotations

import re

from fastapi import APIRouter, WebSocket

from app.config import get_settings
from app.signaling.session import SignalingSession

router = APIRouter()

# 한글 등 유니코드 방 이름을 허용합니다. 공백과 URL 특수문자만 막습니다.
ROOM_ID_RE = re.compile(r"^[^\s/\\?#%]{1,64}$")


@router.websocket("/ws/{room_id}")
async def signaling_endpoint(websocket: WebSocket, room_id: str) -> None:
    if not ROOM_ID_RE.match(room_id):
        # accept 전에 닫으면 브라우저에 이유 없는 403 만 남습니다.
        # 일단 받아들이고 에러를 보낸 뒤 닫아야 로비에 메시지가 뜹니다.
        await websocket.accept()
        await websocket.send_json(
            {
                "type": "error",
                "code": "BAD_ROOM_ID",
                "message": "방 이름에 공백이나 / ? # % 는 쓸 수 없습니다 (1~64자)",
            }
        )
        await websocket.close(code=4002)
        return

    state = websocket.app.state
    session = SignalingSession(
        websocket=websocket,
        room_id=room_id,
        # `app.state` 를 먼저 봅니다. `create_app(settings=...)` 로 주입한 설정이
        # 여기까지 와야 인증 켜짐/꺼짐 같은 걸 테스트에서 바꿀 수 있습니다.
        settings=getattr(state, "settings", None) or get_settings(),
        rooms=state.rooms,
        media=state.media,
        bots=state.bots,
    )
    await session.run()
