"""입장 티켓 검증.

여기서 지키는 것은 두 가지입니다.

1. **방은 티켓이 정한다.** 클라이언트가 URL 로 보낸 방 이름은 권한의 근거가 될
   수 없습니다. 인증만 붙이고 이걸 놓치면 로그인한 아무나 남의 방에 들어갑니다.
2. **설정 실수가 열어주는 방향으로 끝나지 않는다.** 키를 안 넣었거나 잘못
   넣었으면 통과가 아니라 거절이어야 합니다.
"""
import time

import jwt
import pytest
from fastapi.testclient import TestClient

from app.auth import AuthError, TicketVerifier
from app.config import Settings
from app.main import create_app

#: HS256 은 32바이트 미만이면 PyJWT 가 경고합니다. 실제 배포 시크릿도 이 이상이어야
#: 하므로 테스트도 같은 길이를 씁니다.
SECRET = "test-secret-value-at-least-32-bytes-long"
OTHER_SECRET = "another-secret-value-32-bytes-or-more!!!"


def make_settings(**overrides) -> Settings:
    base = dict(
        auth_required=True,
        auth_jwt_key=SECRET,
        auth_jwt_algorithms=["HS256"],
        auth_jwt_audience="sfu",
        bot_enabled=False,
        # 방 배정을 /api/rooms 로 확인하는 테스트가 있습니다.
        debug_api_enabled=True,
    )
    base.update(overrides)
    return Settings(_env_file=None, **base)


def make_ticket(*, secret=SECRET, exp_in=120, **claims) -> str:
    payload = {"sub": "1042", "aud": "sfu", "exp": int(time.time()) + exp_in}
    payload.update(claims)
    return jwt.encode(payload, secret, algorithm="HS256")


def no_user_id_ticket() -> str:
    """서명은 우리 키로 올바르게 됐지만 `sub` 만 없는 티켓."""
    return jwt.encode({"aud": "sfu", "exp": int(time.time()) + 60}, SECRET, algorithm="HS256")


def endless_ticket() -> str:
    """`exp` 가 없어 유출되면 영원히 유효한 티켓."""
    return jwt.encode({"sub": "1", "aud": "sfu"}, SECRET, algorithm="HS256")


def unsigned_ticket() -> str:
    """`alg=none` — 서명 없이 통과시키려는 고전적인 공격."""
    return jwt.encode({"sub": "1", "aud": "sfu", "exp": int(time.time()) + 60},
                      key="", algorithm="none")


# ── 꺼져 있을 때 ───────────────────────────────────────────────────────
def test_disabled_by_default():
    """로컬 개발과 기존 테스트가 티켓 없이 돌아야 합니다."""
    assert Settings(_env_file=None).auth_required is False


def test_a_disabled_verifier_lets_everything_through():
    verifier = TicketVerifier(Settings(_env_file=None))
    assert verifier.enabled is False
    assert verifier.verify(None, fallback_name="게스트") is None


# ── 신원 ───────────────────────────────────────────────────────────────
def test_a_valid_ticket_yields_an_identity():
    identity = TicketVerifier(make_settings()).verify(make_ticket(), fallback_name="x")
    assert identity is not None
    assert identity.user_id == "1042"


def test_the_room_comes_from_the_claim_when_present():
    """사용자가 방을 여러 개 가질 수 있는 경우 Spring 이 정해 보냅니다."""
    identity = TicketVerifier(make_settings()).verify(
        make_ticket(room="board-77"), fallback_name="x"
    )
    assert identity.room_id == "board-77"


def test_without_a_room_claim_each_user_gets_one_room():
    identity = TicketVerifier(make_settings()).verify(make_ticket(), fallback_name="x")
    assert identity.room_id == "u_1042"


def test_the_room_prefix_is_configurable():
    settings = make_settings(auth_room_prefix="room-")
    identity = TicketVerifier(settings).verify(make_ticket(), fallback_name="x")
    assert identity.room_id == "room-1042"


def test_the_display_name_comes_from_the_ticket():
    """이름은 채팅 payload 와 LLM 프롬프트에 들어갑니다. 사용자가 정하면 안 됩니다."""
    identity = TicketVerifier(make_settings()).verify(
        make_ticket(name="우찬"), fallback_name="위조된이름"
    )
    assert identity.display_name == "우찬"


def test_the_fallback_name_is_used_when_the_claim_is_missing():
    identity = TicketVerifier(make_settings()).verify(make_ticket(), fallback_name="게스트")
    assert identity.display_name == "게스트"


def test_a_long_display_name_is_truncated():
    identity = TicketVerifier(make_settings()).verify(
        make_ticket(name="가" * 200), fallback_name="x"
    )
    assert len(identity.display_name) <= 32


def test_claim_names_are_configurable():
    """Spring 이 sub 대신 userId 를 쓰더라도 .env 한 줄로 맞습니다."""
    settings = make_settings(
        auth_claim_user_id="userId", auth_claim_room="boardId", auth_claim_name="nickname"
    )
    ticket = make_ticket(userId="7", boardId="b1", nickname="닉")
    identity = TicketVerifier(settings).verify(ticket, fallback_name="x")
    assert (identity.user_id, identity.room_id, identity.display_name) == ("7", "b1", "닉")


def test_a_numeric_user_id_becomes_a_string():
    """숫자로 오면 방 이름이 타입에 따라 갈립니다."""
    identity = TicketVerifier(make_settings()).verify(
        make_ticket(sub=1042), fallback_name="x"
    )
    assert identity.room_id == "u_1042"


# ── 거절 ───────────────────────────────────────────────────────────────
@pytest.mark.parametrize("ticket", [None, "", "   "])
def test_a_missing_ticket_is_rejected(ticket):
    with pytest.raises(AuthError) as caught:
        TicketVerifier(make_settings()).verify(ticket, fallback_name="x")
    assert caught.value.code == "AUTH_REQUIRED"


def test_a_ticket_signed_with_another_key_is_rejected():
    with pytest.raises(AuthError) as caught:
        TicketVerifier(make_settings()).verify(
            make_ticket(secret=OTHER_SECRET), fallback_name="x"
        )
    assert caught.value.code == "AUTH_INVALID"


def test_an_expired_ticket_is_rejected():
    with pytest.raises(AuthError) as caught:
        TicketVerifier(make_settings()).verify(make_ticket(exp_in=-600), fallback_name="x")
    assert caught.value.code == "AUTH_EXPIRED"


def test_a_ticket_for_another_audience_is_rejected():
    """다른 용도로 발급된 토큰이 이 서버에 재사용되는 걸 막는 게 aud 의 존재 이유입니다."""
    with pytest.raises(AuthError) as caught:
        TicketVerifier(make_settings()).verify(make_ticket(aud="spring-api"), fallback_name="x")
    assert caught.value.code == "AUTH_INVALID"


def test_a_ticket_without_an_expiry_is_rejected():
    """수명 없는 티켓은 유출되면 영원히 유효합니다."""
    with pytest.raises(AuthError) as caught:
        TicketVerifier(make_settings()).verify(endless_ticket(), fallback_name="x")
    assert caught.value.code == "AUTH_INVALID"


def test_the_none_algorithm_is_rejected():
    """alg=none 은 서명 없이 통과시키려는 고전적인 공격입니다."""
    with pytest.raises(AuthError):
        TicketVerifier(make_settings()).verify(unsigned_ticket(), fallback_name="x")


def test_a_ticket_without_a_user_id_is_rejected():
    with pytest.raises(AuthError) as caught:
        TicketVerifier(make_settings()).verify(no_user_id_ticket(), fallback_name="x")
    assert caught.value.code == "AUTH_INVALID"


def test_auth_enabled_without_a_key_rejects_instead_of_opening_up():
    """설정 실수가 '전부 통과' 로 끝나면 안 됩니다."""
    settings = make_settings(auth_jwt_key=None)
    with pytest.raises(AuthError) as caught:
        TicketVerifier(settings).verify(make_ticket(), fallback_name="x")
    assert caught.value.code == "AUTH_MISCONFIGURED"


#: `AUTH_INVALID` 로 거절되는 모든 경로. 클라이언트가 받는 문구는 하나여야 합니다.
#:
#: **`sub` 없는 티켓이 여기 있는 이유**: 이 경로만 문구가 달랐던 적이 있습니다.
#: 서명 검증을 통과한 뒤에 걸리는 유일한 케이스라, 다른 문구가 나가면 "서명과
#: aud 와 exp 는 다 맞았다" 를 알려주는 셈입니다.
INVALID_TICKETS = {
    "다른 키로 서명": lambda: make_ticket(secret=OTHER_SECRET),
    "aud 불일치": lambda: make_ticket(aud="다른곳"),
    "JWT 형식이 아님": lambda: "완전히-깨진-토큰",
    "exp 없음": endless_ticket,
    "alg=none": unsigned_ticket,
    "사용자 식별자 없음": no_user_id_ticket,
}


def test_rejection_does_not_reveal_which_check_failed():
    """서명 오류와 클레임 오류를 구분해 주면 유효한 티켓을 만드는 실마리가 됩니다."""
    verifier = TicketVerifier(make_settings())
    seen: dict[str, tuple[str, str]] = {}
    for label, build in INVALID_TICKETS.items():
        with pytest.raises(AuthError) as caught:
            verifier.verify(build(), fallback_name="x")
        seen[label] = (caught.value.code, caught.value.detail)

    # 어느 케이스가 튀는지 실패 메시지에 그대로 보이게 dict 를 함께 넘깁니다.
    assert len(set(seen.values())) == 1, seen


# ── 핸드셰이크 ─────────────────────────────────────────────────────────
@pytest.fixture
def client():
    """인증이 켜진 서버. `with` 로 열어야 lifespan 이 돌아 방·봇이 준비됩니다."""
    with TestClient(create_app(make_settings())) as c:
        yield c


def test_every_invalid_ticket_reaches_the_client_the_same_way(client):
    """검증기뿐 아니라 실제 핸드셰이크에서도 같은 응답이어야 합니다.

    `_error()` 가 `code` 와 `detail` 을 그대로 클라이언트에 실어 보내므로,
    검증기 쪽만 통일해 두면 나머지 한쪽에서 새어 나갈 수 있습니다.
    """
    seen = set()
    for build in INVALID_TICKETS.values():
        with client.websocket_connect("/ws/solo") as ws:
            ws.send_json({"type": "join", "ticket": build()})
            message = ws.receive_json()
        seen.add((message["code"], message["message"]))
    assert len(seen) == 1, seen


def test_an_expired_ticket_is_the_one_rejection_we_do_distinguish(client):
    """수명이 2분이라 정상 사용자도 자주 밟습니다. 재발급 후 재시도를 판단해야 합니다."""
    with client.websocket_connect("/ws/solo") as ws:
        ws.send_json({"type": "join", "ticket": make_ticket(exp_in=-600)})
        expired = ws.receive_json()
    with client.websocket_connect("/ws/solo") as ws:
        ws.send_json({"type": "join", "ticket": no_user_id_ticket()})
        invalid = ws.receive_json()
    assert expired["code"] == "AUTH_EXPIRED"
    assert (expired["code"], expired["message"]) != (invalid["code"], invalid["message"])


def test_join_without_a_ticket_is_closed(client):
    with client.websocket_connect("/ws/solo") as ws:
        ws.send_json({"type": "join", "displayName": "침입자"})
        message = ws.receive_json()
    assert message["type"] == "error"
    assert message["code"] == "AUTH_REQUIRED"


def test_join_with_a_ticket_lands_in_the_ticket_room_not_the_url_room(client):
    """URL 로 남의 방을 지목해도 티켓이 정한 방으로 갑니다."""
    with client.websocket_connect("/ws/남의-방") as ws:
        ws.send_json({"type": "join", "ticket": make_ticket(name="우찬")})
        welcome = ws.receive_json()
    assert welcome["type"] == "welcome"
    assert welcome["room"] == "u_1042"


def test_the_display_name_in_the_room_comes_from_the_ticket(client):
    with client.websocket_connect("/ws/solo") as ws:
        ws.send_json(
            {"type": "join", "displayName": "위조된이름", "ticket": make_ticket(name="우찬")}
        )
        ws.receive_json()
        # 방은 마지막 사람이 나가면 폐기되므로 연결을 유지한 채로 확인합니다.
        room = client.get("/api/rooms/u_1042").json()
    assert [p["displayName"] for p in room["participants"]] == ["우찬"]


def test_two_users_land_in_two_rooms(client):
    """같은 URL 로 들어와도 서로 다른 방입니다. 예전에는 정원에 막혔습니다."""
    with client.websocket_connect("/ws/solo") as first:
        first.send_json({"type": "join", "ticket": make_ticket(sub="1")})
        assert first.receive_json()["room"] == "u_1"

        with client.websocket_connect("/ws/solo") as second:
            second.send_json({"type": "join", "ticket": make_ticket(sub="2")})
            assert second.receive_json()["room"] == "u_2"

            listed = client.get("/api/rooms").json()["rooms"]
            assert sorted(r["id"] for r in listed) == ["u_1", "u_2"]


def test_one_user_cannot_see_another_users_room(client):
    """남의 사용자 id 로 만든 방 이름을 URL 에 넣어도 자기 방으로 갑니다."""
    with client.websocket_connect("/ws/u_1") as ws:
        ws.send_json({"type": "join", "ticket": make_ticket(sub="2")})
        welcome = ws.receive_json()
    assert welcome["room"] == "u_2"
    assert welcome["peers"] == []


def test_an_expired_ticket_never_creates_a_room(client):
    """검증이 방 배정보다 앞서야 합니다. 뒤면 실패할 연결이 봇을 깨웁니다."""
    with client.websocket_connect("/ws/solo") as ws:
        ws.send_json({"type": "join", "ticket": make_ticket(exp_in=-600)})
        assert ws.receive_json()["code"] == "AUTH_EXPIRED"
    assert client.get("/api/rooms").json()["rooms"] == []
