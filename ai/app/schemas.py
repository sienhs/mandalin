"""시그널링 메시지 계약.

전송 형식은 참가자당 WebSocket 하나 위의 순수 JSON 입니다. 모든 메시지는
`type` 필드를 가진 객체이고, pydantic 의 **discriminated union** 으로
`type` 값만 보고 해당 모델로 분기합니다. 덕분에 파싱 단계에서 형식 검증이
끝나고, `session.py` 의 처리 코드에는 `isinstance` 분기만 남습니다.

STOMP 나 socket.io 같은 프로토콜을 쓰지 않은 이유는 WebRTC 시그널링에
필요한 게 "타입 있는 JSON 을 주고받는 것" 뿐이기 때문입니다. 라이브러리를
얹으면 프레이밍 규칙이 하나 더 생기고 디버깅만 어려워집니다.

---

**서버 -> 클라이언트** 메시지는 서비스 계층에서 dict 로 만들어 보냅니다.
목록만 정리하면:

`welcome`(selfId·iceServers·peers) · `peer-joined` · `peer-updated` ·
`peer-left` · `publish-answer` · `subscribe-offer` · `media-state` ·
`chat` · `bot-listen` · `error`
"""
from __future__ import annotations

from typing import Any, Literal

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator


class SessionDescription(BaseModel):
    """SDP. 브라우저의 `RTCSessionDescription` 과 같은 모양입니다."""

    type: Literal["offer", "answer", "pranswer", "rollback"]
    sdp: str


class IceCandidatePayload(BaseModel):
    """브라우저 `RTCIceCandidate.toJSON()` 의 결과.

    `candidate` 가 빈 문자열이면 "후보 수집 끝" 신호입니다.
    """

    candidate: str
    sdpMid: str | None = None
    sdpMLineIndex: int | None = None


#: `join` 이 실어 보낼 도메인 개수 상한.
#:
#: **이 값들은 그대로 LLM 프롬프트에 들어갑니다.** 태그 위조는 `escape_slot_value`
#: 가 막지만 분량은 막지 못합니다 — 개수와 길이를 여기서 자르지 않으면 클라이언트가
#: 도메인 1,000개를 보내 진짜 지시문을 모델 주의 밖으로 밀어낼 수 있고, 그 비용은
#: 매 발화마다 청구됩니다.
MAX_DOMAINS = 16
MAX_DOMAIN_TITLE_LENGTH = 40


class DomainRef(BaseModel):
    """사용자 시트의 도메인 칸 하나.

    **고정 목록이 아닙니다.** 도메인은 시트마다 다르고 사용자가 직접 만들 수 있어서,
    서버가 아는 유일한 방법은 클라이언트가 `join` 에 실어 보내는 것입니다. AI 는 이
    목록에 없는 도메인을 새로 제안할 수도 있습니다 — 그때 "새 칸인가" 는 모델에게
    묻지 않고 이 목록과 비교해 서버가 판단합니다.
    """

    #: 필드 이름은 Spring 의 `SheetDetailResponse.DomainDetailResponse` 와 맞췄습니다 —
    #: 프론트가 `GET /api/v1/sheets/{sheetId}` 응답의 `domains[]` 를 그대로 실어 보낼 수
    #: 있어야 매핑 코드가 한 겹 줄어듭니다.
    model_config = ConfigDict(populate_by_name=True)

    #: `domain` 테이블의 PK. 새로 만들 칸에는 없으므로 nullable 입니다.
    #: 담기 payload 에 실어 보내면 프론트가 `subject` 를 만들 때 그대로 씁니다.
    #:
    #: **`id` 로도 받습니다.** 이름이 어긋나면 값이 조용히 `None` 이 되고, 그러면 기존
    #: 칸을 새 칸으로 취급해 중복 생성으로 이어집니다 — 에러가 아니라 품질 저하로만
    #: 드러나는 종류라 양쪽을 다 받습니다.
    domainId: int | None = Field(
        default=None, validation_alias=AliasChoices("domainId", "id")
    )
    title: str
    #: 이 칸에 이미 담긴 과제 수. 프롬프트의 `<existing_domain_tasks>` 를 채웁니다.
    #:
    #: Spring 응답에는 이 필드가 없고 `subjects` 배열이 옵니다. **배열을 그대로 받지
    #: 않습니다** — 제목까지 딸려 와 프롬프트에 넣지도 않을 값으로 본문이 커집니다.
    #: 클라이언트가 `subjects.length` 를 넘기세요.
    subjectCount: int = 0

    @field_validator("title")
    @classmethod
    def _clean_title(cls, v: str) -> str:
        return v.strip()[:MAX_DOMAIN_TITLE_LENGTH]


# --------------------------------------------------------------------------
# 클라이언트 -> 서버
# --------------------------------------------------------------------------
class JoinMessage(BaseModel):
    """방 입장. 반드시 첫 메시지여야 합니다."""

    type: Literal["join"]
    displayName: str = "guest"
    #: Spring 이 발급한 단기 입장 티켓 (`AUTH_REQUIRED=true` 일 때 필수).
    #:
    #: **URL 쿼리스트링이 아니라 메시지 본문으로 받습니다.** 브라우저의 WebSocket
    #: API 는 커스텀 헤더를 못 붙이는데, 쿼리스트링에 담으면 리버스 프록시
    #: 액세스 로그와 서버 로그에 토큰이 그대로 남습니다.
    #:
    #: 인증이 켜지면 `displayName` 은 무시되고 티켓의 클레임을 씁니다 — 이름은
    #: 채팅 payload 와 LLM 프롬프트에 들어가는 값이라 사용자가 정하면 안 됩니다.
    ticket: str | None = None
    #: 이 사용자 시트의 도메인 칸 목록.
    #:
    #: **`join` 한 번만 받습니다.** 세션 중에 시트가 바뀌지 않는다는 전제이고,
    #: 발화마다 실어 보내면 같은 값이 매번 오면서 검증만 반복됩니다.
    #:
    #: 비어 있어도 됩니다 — 시트가 아직 빈 사용자이거나 `BOT_MODE=chat` 이면
    #: 쓰이지 않습니다. 그때 AI 는 모든 도메인을 새 칸으로 제안합니다.
    domains: list[DomainRef] = Field(default_factory=list, max_length=MAX_DOMAINS)

    @field_validator("domains")
    @classmethod
    def _drop_untitled(cls, v: list[DomainRef]) -> list[DomainRef]:
        # 제목이 빈 칸은 프롬프트에 넣을 값이 없고, 모델이 그 빈 줄을 흉내내
        # 빈 도메인을 제안하게 만듭니다.
        return [d for d in v if d.title]

    @field_validator("displayName")
    @classmethod
    def _strip(cls, v: str) -> str:
        # 공백만 입력한 경우까지 여기서 처리해 두면, 아래 계층은 이름이 항상
        # 비어 있지 않다고 가정할 수 있습니다.
        v = v.strip() or "guest"
        return v[:32]


class PublishMessage(BaseModel):
    """업스트림(브라우저 -> SFU) 협상. 이쪽은 **클라이언트가 offerer** 입니다."""

    type: Literal["publish"]
    sdp: SessionDescription


class SubscribeMessage(BaseModel):
    """`targetId` 의 미디어를 내려달라는 요청.

    응답은 answer 가 아니라 `subscribe-offer` 입니다. 다운스트림은 서버가
    offerer 이기 때문입니다.
    """

    type: Literal["subscribe"]
    targetId: str


class SubscribeAnswerMessage(BaseModel):
    """서버가 만든 다운스트림 offer 에 대한 answer."""

    type: Literal["subscribe-answer"]
    targetId: str
    sdp: SessionDescription


class UnsubscribeMessage(BaseModel):
    """다운스트림 하나만 끊습니다. 탭을 숨기는 등의 최적화에 쓸 수 있습니다."""

    type: Literal["unsubscribe"]
    targetId: str


class IceMessage(BaseModel):
    """브라우저의 trickle ICE 후보.

    참가자 한 명이 여러 PeerConnection 을 가지므로 목적지를 지정해야 합니다.
    서버는 vanilla ICE(후보를 SDP 에 모두 담아 보냄)라서 이 메시지를 **받기만**
    하고 보내지는 않습니다.
    """

    #: 업스트림이면 `"publisher"`, 다운스트림이면 상대의 peerId.
    type: Literal["ice"]
    target: str
    candidate: IceCandidatePayload


class MediaStateMessage(BaseModel):
    """마이크/카메라 on-off 공유.

    `track.enabled = false` 는 트랙을 끊는 게 아니라 무음/검은 화면을 보내는
    것이라 서버가 알아챌 수 없습니다. 그래서 명시적으로 알려받습니다.
    """

    type: Literal["media-state"]
    audio: bool = True
    video: bool = True


class ChatMessage(BaseModel):
    """채팅의 **폴백** 경로. 기본 경로는 RTCDataChannel 입니다."""

    type: Literal["chat"]
    text: str

    @field_validator("text")
    @classmethod
    def _len(cls, v: str) -> str:
        return v[:1000]


class BotListenMessage(BaseModel):
    """푸시투토크. 버튼을 누르는 동안의 오디오만 AI 에게 보냅니다.

    시작/종료를 사람이 명시하므로 VAD(발화 감지) 튜닝이 필요 없고, 잡담에
    반응하거나 크레딧이 새는 일도 없습니다.
    """

    type: Literal["bot-listen"]
    state: Literal["start", "stop"]


class LeaveMessage(BaseModel):
    """정상 퇴장. 소켓이 그냥 끊겨도 서버는 동일하게 정리합니다."""

    type: Literal["leave"]


ClientMessage = (
    JoinMessage
    | PublishMessage
    | SubscribeMessage
    | SubscribeAnswerMessage
    | UnsubscribeMessage
    | IceMessage
    | MediaStateMessage
    | ChatMessage
    | BotListenMessage
    | LeaveMessage
)


class ClientEnvelope(BaseModel):
    """union 을 필드로 감싸는 래퍼.

    pydantic 의 `discriminator` 는 필드에만 붙일 수 있어서, 최상위 union 을
    직접 검증할 수 없습니다. 그래서 한 겹 감쌉니다.
    """

    payload: ClientMessage = Field(discriminator="type")


def parse_client_message(raw: dict[str, Any]) -> ClientMessage:
    """수신 JSON 을 구체 모델로 변환합니다.

    알 수 없는 `type` 이면 `ValidationError` 가 납니다. 호출하는 쪽에서
    잡아서 `BAD_MESSAGE` 로 응답합니다.
    """
    return ClientEnvelope.model_validate({"payload": raw}).payload


# --------------------------------------------------------------------------
# 서버 -> 클라이언트
# --------------------------------------------------------------------------
class PeerInfo(BaseModel):
    """`welcome.peers` / `peer-joined` 등에 실리는 참가자 요약.

    실제 직렬화는 `Participant.info()` 가 담당하고 이 모델은 형태를 문서화하는
    역할입니다. `publishing` 이 핵심인데, **서버가 그 사람의 트랙을 실제로
    받고 있는지**를 뜻하며 클라이언트는 이 값을 보고 구독을 시작합니다.
    """

    id: str
    displayName: str
    audio: bool = True
    video: bool = True
    publishing: bool = False
