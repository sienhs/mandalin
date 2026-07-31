"""WebSocket 시그널링 입구 검증."""
import pytest
from fastapi.testclient import TestClient

from app.main import create_app


@pytest.fixture
def client():
    with TestClient(create_app()) as c:
        yield c


def test_korean_room_names_are_accepted(client):
    with client.websocket_connect("/ws/회의실-ㅁㅁ") as ws:
        ws.send_json({"type": "join", "displayName": "우찬"})
        welcome = ws.receive_json()
        assert welcome["type"] == "welcome"
        assert welcome["room"] == "회의실-ㅁㅁ"


def test_ascii_room_names_still_work(client):
    with client.websocket_connect("/ws/team-standup_1") as ws:
        ws.send_json({"type": "join", "displayName": "a"})
        assert ws.receive_json()["type"] == "welcome"


# `?` 와 `#` 은 애초에 경로에 도달하지 못하므로(쿼리/프래그먼트) 제외합니다.
@pytest.mark.parametrize("room_id", ["a b", "%09tab", "x" * 65])
def test_invalid_room_names_get_a_readable_error(client, room_id):
    # 조용한 403 이 아니라 로비에 띄울 수 있는 메시지가 와야 합니다.
    with client.websocket_connect(f"/ws/{room_id}") as ws:
        message = ws.receive_json()
        assert message["type"] == "error"
        assert message["code"] == "BAD_ROOM_ID"


def test_bot_listen_is_a_known_message_type(client):
    with client.websocket_connect("/ws/demo") as ws:
        ws.send_json({"type": "join", "displayName": "우찬"})
        ws.receive_json()
        ws.send_json({"type": "bot-listen", "state": "start"})
        error = ws.receive_json()
        # 스키마에 등록돼 있으므로 BAD_MESSAGE 가 아니라 도메인 에러가 와야 합니다.
        assert error["code"] == "NO_AUDIO_TRACK"
