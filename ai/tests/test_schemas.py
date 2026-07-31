import pytest
from pydantic import ValidationError

from app.schemas import (
    IceMessage,
    JoinMessage,
    PublishMessage,
    SubscribeMessage,
    parse_client_message,
)


def test_join_message_is_normalised():
    message = parse_client_message({"type": "join", "displayName": "  우찬  "})
    assert isinstance(message, JoinMessage)
    assert message.displayName == "우찬"


def test_blank_display_name_falls_back_to_guest():
    assert parse_client_message({"type": "join", "displayName": "   "}).displayName == "guest"


def test_publish_requires_a_session_description():
    message = parse_client_message(
        {"type": "publish", "sdp": {"type": "offer", "sdp": "v=0\r\n"}}
    )
    assert isinstance(message, PublishMessage)
    assert message.sdp.type == "offer"

    with pytest.raises(ValidationError):
        parse_client_message({"type": "publish", "sdp": {"type": "nope", "sdp": ""}})


def test_subscribe_and_ice_round_trip():
    assert isinstance(
        parse_client_message({"type": "subscribe", "targetId": "abc"}), SubscribeMessage
    )
    ice = parse_client_message(
        {
            "type": "ice",
            "target": "publisher",
            "candidate": {
                "candidate": "candidate:1 1 udp 2130706431 10.0.0.1 5000 typ host",
                "sdpMid": "0",
                "sdpMLineIndex": 0,
            },
        }
    )
    assert isinstance(ice, IceMessage)
    assert ice.target == "publisher"


def test_chat_text_is_truncated():
    message = parse_client_message({"type": "chat", "text": "x" * 5000})
    assert len(message.text) == 1000


def test_unknown_type_is_rejected():
    with pytest.raises(ValidationError):
        parse_client_message({"type": "hack", "payload": 1})
