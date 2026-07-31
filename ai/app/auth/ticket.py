"""입장 티켓 검증 — "이 사람이 누구이고, 어느 방에 들어갈 수 있는가".

**SFU 는 OAuth 를 모릅니다.** 사용자가 구글로 로그인했든 카카오로 했든, 세션
쿠키를 쓰든 자체 JWT 를 쓰든 그건 Spring 이 아는 일입니다. 이 서버가 아는 것은
Spring 이 서명해 준 **단기 티켓 하나**뿐입니다.

    [React]  "과제 AI 생성" 클릭
       │  POST /api/voice-sessions      ← Spring 이 평소 쓰는 인증 그대로
       ▼
    [Spring]  사용자 확인 → 방 확보 → 티켓 서명 (exp 2분, aud=sfu)
       │  { roomId, ticket }
       ▼
    [SFU]  이 파일이 티켓만 검증

이렇게 갈라두면 소셜 제공자가 늘어나거나 세션에서 JWT 로 바뀌어도 SFU 는 손댈
곳이 없습니다. 반대로 Spring 의 세션 쿠키를 여기까지 끌고 오려 하면 크로스
오리진 쿠키·WebSocket 업그레이드 시 쿠키 전달·세션 조회 왕복이 전부 문제가 됩니다.

**클레임 이름을 설정으로 뺀 이유**는 Spring 쪽 스펙이 확정되기 전에도 이 코드가
완성돼 있어야 하기 때문입니다. `sub` 든 `userId` 든 `.env` 한 줄이면 맞습니다.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

import jwt

from app.config import Settings

logger = logging.getLogger(__name__)

#: 서버 간 시계 차이 허용치. 이만큼은 만료·발급시각을 너그럽게 봅니다.
#: 없으면 배포 직후 NTP 가 몇 초 어긋난 것만으로 로그인이 됐다 안 됐다 합니다.
CLOCK_SKEW_SECONDS = 30

#: 거절 사유를 구분해 주지 않기 위한 **공용** 문구. 서명 불일치·`aud` 불일치·
#: 형식 오류·클레임 누락이 모두 이 문구로 나갑니다.
#:
#: 상수로 둔 이유는 갈라 쓰면 조용히 오라클이 되기 때문입니다. 클레임 누락에만
#: 다른 문구를 주면, 그 문구를 받은 쪽은 **서명·`aud`·`exp` 검증이 전부 통과
#: 했다**는 사실을 알게 됩니다 — 유효한 티켓을 만드는 실마리입니다.
#:
#: `AUTH_EXPIRED` 만 예외적으로 갈라둡니다. 티켓 수명이 2분이라 정상 사용자도
#: 자주 밟는 경로이고, 클라이언트가 "재발급받아 다시 시도" 를 판단해야 합니다.
INVALID_TICKET_MESSAGE = "입장 티켓이 올바르지 않습니다"


class AuthError(Exception):
    """티켓을 받아들일 수 없음.

    `code` 는 그대로 클라이언트 `error` 메시지의 코드가 됩니다. **왜 거절했는지는
    구체적으로 알려주지 않습니다** — 서명이 틀린 것과 만료된 것을 구분해 주면
    유효한 티켓을 만드는 실마리가 됩니다. 상세 사유는 로그로만 남깁니다.
    """

    def __init__(self, code: str, detail: str) -> None:
        super().__init__(detail)
        self.code = code
        self.detail = detail


@dataclass(frozen=True)
class Identity:
    """검증을 통과한 사용자."""

    #: Spring 의 사용자 식별자. 로그와 (나중에) 과제 조회에 씁니다.
    user_id: str
    #: 이 사람이 들어갈 방. **클라이언트가 보낸 값이 아닙니다.**
    room_id: str
    #: 화면에 보일 이름. 토큰에서 오므로 사용자가 위조할 수 없습니다.
    display_name: str


class TicketVerifier:
    """`Settings` 로 구성되는 JWT 검증기.

    `auth_required=False`(기본)면 아무것도 하지 않습니다. 로컬 개발과 기존
    테스트가 그대로 돌아야 하기 때문입니다.
    """

    def __init__(self, settings: Settings) -> None:
        self._s = settings

    @property
    def enabled(self) -> bool:
        return self._s.auth_required

    def verify(self, ticket: str | None, *, fallback_name: str) -> Identity | None:
        """티켓을 검증해 신원을 돌려줍니다.

        인증이 꺼져 있으면 `None` 을 돌려주고, 호출하는 쪽이 기존 동작(클라이언트가
        보낸 방·이름)을 유지합니다.
        """
        if not self.enabled:
            return None

        if not ticket or not ticket.strip():
            raise AuthError("AUTH_REQUIRED", "입장 티켓이 필요합니다")

        claims = self._decode(ticket.strip())
        user_id = self._claim(claims, self._s.auth_claim_user_id)
        if not user_id:
            # 서명은 통과했지만 우리가 필요한 클레임이 없는 경우입니다. 사유는
            # 로그에만 남기고 클라이언트에는 다른 거절과 같은 문구를 보냅니다.
            logger.warning(
                "티켓에 사용자 식별자 클레임(%s)이 없습니다", self._s.auth_claim_user_id
            )
            raise AuthError("AUTH_INVALID", INVALID_TICKET_MESSAGE)

        return Identity(
            user_id=user_id,
            room_id=self.room_for(claims, user_id),
            display_name=(
                self._claim(claims, self._s.auth_claim_name) or fallback_name
            )[: self._s.display_name_max_length],
        )

    def room_for(self, claims: dict, user_id: str) -> str:
        """이 신원이 들어갈 방.

        **클라이언트가 URL 로 보낸 방 이름은 쓰지 않습니다.** 인증만 붙이고 방을
        클라이언트가 고르게 두면, 로그인한 아무나 남의 방에 들어갑니다.

        Spring 이 `room` 클레임을 넣어주면 그걸 따르고(사용자가 방을 여러 개 가질
        수 있는 경우), 없으면 사용자당 방 하나로 유도합니다.
        """
        explicit = self._claim(claims, self._s.auth_claim_room)
        if explicit:
            return explicit
        return f"{self._s.auth_room_prefix}{user_id}"

    # -- 내부 ---------------------------------------------------------------
    def _decode(self, ticket: str) -> dict:
        key = self._s.auth_jwt_key
        if not key:
            # 설정 실수로 **모든 티켓이 통과되는** 상황을 만들지 않습니다.
            # 인증을 켰는데 키가 없으면 열어주는 게 아니라 막습니다.
            logger.error("AUTH_REQUIRED=true 인데 AUTH_JWT_KEY 가 비어 있습니다")
            raise AuthError("AUTH_MISCONFIGURED", "서버 인증 설정이 올바르지 않습니다")

        try:
            return jwt.decode(
                ticket,
                key,
                algorithms=self._s.auth_jwt_algorithms,
                audience=self._s.auth_jwt_audience or None,
                issuer=self._s.auth_jwt_issuer or None,
                leeway=CLOCK_SKEW_SECONDS,
                # aud/iss 를 설정하지 않았으면 검사하지 않습니다. 설정했으면
                # 반드시 있어야 합니다 — 다른 용도로 발급된 토큰이 이 서버에
                # 재사용되는 걸 막는 게 aud 의 존재 이유입니다.
                options={
                    "require": ["exp"],
                    "verify_aud": bool(self._s.auth_jwt_audience),
                    "verify_iss": bool(self._s.auth_jwt_issuer),
                    # PyJWT 2.10+ 는 RFC 7519 대로 `sub` 가 문자열이어야 한다고
                    # 봅니다. 그런데 서버 프레임워크는 숫자 PK 를 그대로 넣는
                    # 일이 흔합니다. 여기서 막으면 "티켓이 올바르지 않습니다"
                    # 만 보이고 원인을 찾기 어려우므로, 타입은 우리가 `_claim`
                    # 에서 문자열로 맞춥니다. 서명 검증과는 무관한 항목입니다.
                    "verify_sub": False,
                },
            )
        except jwt.ExpiredSignatureError as exc:
            # 티켓은 수명이 짧아서(2분 권장) 이 경로가 실제로 자주 밟힙니다.
            # 사용자가 페이지를 열어두고 한참 뒤에 연결하면 여기로 옵니다.
            raise AuthError("AUTH_EXPIRED", "입장 티켓이 만료되었습니다") from exc
        except jwt.InvalidTokenError as exc:
            logger.warning("티켓 검증 실패: %s", exc)
            raise AuthError("AUTH_INVALID", INVALID_TICKET_MESSAGE) from exc

    @staticmethod
    def _claim(claims: dict, name: str) -> str:
        """클레임을 문자열로. 숫자 id 를 그대로 쓰면 방 이름이 타입에 따라 갈립니다."""
        value = claims.get(name)
        if value is None or isinstance(value, (dict, list, bool)):
            return ""
        return str(value).strip()
