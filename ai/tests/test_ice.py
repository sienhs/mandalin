from app.config import Settings
from app.media.ice import parse_ice_candidate, server_rtc_configuration
from app.schemas import IceCandidatePayload


def test_candidate_prefix_is_stripped():
    candidate = parse_ice_candidate(
        IceCandidatePayload(
            candidate="candidate:1 1 udp 2130706431 192.0.2.10 54321 typ host",
            sdpMid="0",
            sdpMLineIndex=0,
        )
    )
    assert candidate is not None
    assert candidate.ip == "192.0.2.10"
    assert candidate.port == 54321
    assert candidate.sdpMid == "0"


def test_end_of_candidates_returns_none():
    assert parse_ice_candidate(IceCandidatePayload(candidate="")) is None


def test_turn_is_excluded_from_server_config_by_default():
    settings = Settings(
        _env_file=None,
        turn_urls=["turn:example.com:3478"],
        turn_username="u",
        turn_credential="p",
    )
    urls = [s.urls for s in server_rtc_configuration(settings).iceServers]
    assert all("turn:example.com:3478" not in u for u in urls)

    settings_with_turn = settings.model_copy(update={"server_uses_turn": True})
    urls = [s.urls for s in server_rtc_configuration(settings_with_turn).iceServers]
    assert any("turn:example.com:3478" in u for u in urls)


def test_client_ice_servers_include_credentials():
    settings = Settings(
        _env_file=None,
        turn_urls=["turn:example.com:3478"],
        turn_username="u",
        turn_credential="p",
    )
    turn = [s for s in settings.client_ice_servers if "turn:example.com:3478" in s["urls"]]
    assert turn and turn[0]["username"] == "u" and turn[0]["credential"] == "p"
