"""환경변수 / .env 로 주입되는 애플리케이션 설정.

pydantic-settings 는 필드명을 대문자로 바꿔 환경변수를 찾습니다
(`bot_api_key` -> `BOT_API_KEY`).

**주의: 리스트 필드는 JSON 배열로 써야 합니다.**
`STUN_URLS=stun:a,stun:b` 는 기동 시 ValidationError 를 냅니다.
`STUN_URLS=["stun:a","stun:b"]` 처럼 쓰세요.
"""
from __future__ import annotations

from functools import lru_cache

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        # `validation_alias` 를 쓴 필드를 파이썬에서 필드명으로도 넣을 수 있게 합니다
        # (`Settings(bot_default_model=...)`). 없으면 테스트가 별칭만 써야 합니다.
        populate_by_name=True,
    )

    # --- HTTP ---------------------------------------------------------------
    host: str = "0.0.0.0"
    port: int = 8080
    cors_origins: list[str] = Field(default_factory=lambda: ["*"])

    # --- 진단 API -------------------------------------------------------------
    # `/api/bot/*` 와 `/api/rooms/*`, `/api/ice-servers` 를 등록할지.
    #
    # **기본값이 false 인 이유**: 이 엔드포인트들은 인증이 없습니다. 켜두면 주소만
    # 아는 누구나 ① LLM 크레딧을 태우고(`/api/bot/ask`, `/api/bot/probe-audio`)
    # ② 시스템 프롬프트 전문을 읽고 ③ TURN 자격증명을 가져가고(`/api/ice-servers`)
    # ④ 접속 중인 사용자 목록을 열거(`/api/rooms` — 방 이름이 사용자 식별자입니다).
    #
    # false 면 라우터를 아예 등록하지 않아 OpenAPI 문서에도 나오지 않습니다.
    # `/api/health` 만 항상 열려 있습니다.
    debug_api_enabled: bool = False

    # --- 인증 -----------------------------------------------------------------
    # 기본값이 false 인 이유: 로컬 개발과 기존 테스트가 티켓 없이 돌아야 합니다.
    # **배포 환경에서는 반드시 true 로 두세요.** false 면 방 이름만 알면 입장합니다.
    auth_required: bool = False
    # HS256 이면 공유 시크릿, RS256 이면 PEM 공개키를 그대로 넣습니다.
    # 여러 줄 PEM 은 .env 에서 \n 을 쓰거나 환경변수로 직접 주입하세요.
    auth_jwt_key: str | None = None
    auth_jwt_algorithms: list[str] = Field(default_factory=lambda: ["HS256"])
    # 이 서버용으로 발급된 티켓만 받습니다. 비우면 검사하지 않는데, 그러면 다른
    # 용도의 토큰이 여기 재사용될 수 있습니다 — 채우는 쪽을 권합니다.
    auth_jwt_audience: str | None = "sfu"
    auth_jwt_issuer: str | None = None
    # 클레임 이름. Spring 스펙에 맞춰 .env 로 맞춥니다 (sub / userId / memberId …).
    auth_claim_user_id: str = "sub"
    auth_claim_room: str = "room"
    auth_claim_name: str = "name"
    # `room` 클레임이 없을 때 사용자당 방 하나를 만드는 접두사.
    auth_room_prefix: str = "u_"

    # --- 방 정책 -------------------------------------------------------------
    # 2 = 본인(1) + AI 봇(1). 봇은 WebSocket 없이 `RoomManager.join()` 으로 들어오는
    # 평범한 참가자라 정원 한 자리를 그대로 차지합니다 — **1 로 두면 봇이 그 자리를
    # 먹고 본인이 `ROOM_FULL` 로 튕깁니다.**
    #
    # 접근 통제 장치가 아닙니다. 남의 방에 못 들어가게 하는 것은 티켓의 `room`
    # 클레임 재배정이고(→ `app/auth/`), 이 값은 방당 부하 상한입니다(aiortc 는
    # GIL 위에서 돕니다). 다자간 경로는 서버에 그대로 있으므로 화면이 필요해지면
    # `.env` 한 줄로 되살아납니다.
    max_participants_per_room: int = 2
    max_rooms: int = 100
    display_name_max_length: int = 32
    chat_message_max_length: int = 1000

    # --- ICE ------------------------------------------------------------------
    # 환경변수에서는 JSON 배열로: STUN_URLS=["stun:stun.l.google.com:19302"]
    stun_urls: list[str] = Field(
        default_factory=lambda: ["stun:stun.l.google.com:19302"]
    )
    turn_urls: list[str] = Field(default_factory=list)
    turn_username: str | None = None
    turn_credential: str | None = None

    # 서버는 보통 공인 주소를 가지므로 자기 트래픽에 TURN 이 필요 없습니다.
    # SFU 자체가 NAT 뒤(사내망, 개발 PC)에 있을 때만 켜세요.
    server_uses_turn: bool = False

    # --- AI 챗봇 ---------------------------------------------------------------
    bot_enabled: bool = False
    bot_display_name: str = "AI"
    bot_provider: str = "echo"          # echo | gemini | openai
    # 폴백 기본값입니다. 단계별 모델(`bot_classify_model`/`bot_decide_model`)을
    # 비웠을 때 그 자리를 대신하고, `BOT_MODE=chat` 경로에서 직접 쓰입니다.
    #
    # **구 이름 `BOT_MODEL` 도 계속 받습니다.** 이름만 바꾸고 별칭을 안 두면,
    # 예전 `.env` 를 쓰는 사람은 값이 조용히 코드 기본값으로 돌아갑니다 —
    # 에러도 경고도 없이 모델이 바뀌는 종류의 사고입니다.
    bot_default_model: str = Field(
        default="gemini-2.5-flash",
        validation_alias=AliasChoices("BOT_DEFAULT_MODEL", "BOT_MODEL"),
    )
    bot_api_key: str | None = None
    bot_base_url: str | None = None     # 사내 게이트웨이 등으로 엔드포인트를 바꿀 때
    # 일부 게이트웨이는 헤더 대신 ?key= 를 요구합니다. 켜면 헤더와 함께 보냅니다.
    bot_api_key_in_query: bool = False
    bot_system_prompt: str = (
        "너는 화상회의에 참여한 한국어 어시스턴트다. 답변은 3문장 이내로 짧고 구체적으로 한다."
    )
    # 프롬프트는 코드가 아니라 콘텐츠라 파일로 두는 편이 낫습니다. 여러 줄로
    # 길게 쓸 수 있고, 저장하면 **재시작 없이** 다음 응답부터 반영됩니다.
    # 상대 경로는 저장소 루트 기준이며, 비워두면 위의 BOT_SYSTEM_PROMPT 를 씁니다.
    bot_system_prompt_file: str | None = None
    # 실수로 큰 파일을 가리켰을 때 매 요청에 그대로 실려 나가지 않게 하는 상한.
    bot_system_prompt_max_chars: int = 8000
    # --- 목표 설계 파이프라인 -------------------------------------------------
    # chat : 프롬프트 하나로 한 번 호출 (기본, 기존 동작)
    # goal : 분류 -> 후보 검색 -> 판단. gemini 처럼 스키마 강제가 되는 백엔드 전용
    bot_mode: str = "chat"
    bot_classify_prompt_file: str | None = None   # 비우면 코드 내장 분류 프롬프트
    bot_template_file: str | None = None          # 예시 과제 JSON
    bot_candidate_count: int = 5                  # 프롬프트에 넣을 후보 개수
    # 단계별 모델. 비우면 BOT_DEFAULT_MODEL 을 씁니다.
    #
    # **필요한 능력과 토큰 무게가 반대입니다.** 1단계는 의도 판별 + (음성이면)
    # 받아쓰기라 판단력·멀티모달이 필요한데 입력이 가볍고(~1,600 토큰), 3단계는
    # 정제된 텍스트를 스키마에 채우는 일인데 입력이 무겁습니다(~4,100 토큰).
    # 그래서 3단계를 싼 티어로 내리면 품질 손실 대비 절감이 가장 큽니다.
    #
    # **1단계 모델은 멀티모달이어야 합니다.** 푸시투토크 오디오가 1단계로 들어가
    # 받아쓰기까지 여기서 일어납니다(`transcript` 필드). 오디오를 두 번 보내지
    # 않으려고 받아쓰기와 분류를 한 호출로 묶은 결과입니다 — 텍스트 전용 모델을
    # 넣으면 음성 입력이 깨집니다.
    bot_classify_model: str | None = None
    bot_decide_model: str | None = None
    # 단계마다 따로 겁니다. bot_timeout_seconds 는 체인 전체를 덮는 값이라,
    # 그것만으로는 어느 단계가 느린지 알 수 없습니다.
    bot_step_timeout_seconds: float = 15.0
    # 3단계 응답 상한. 실측(2026-07-29)으로 **정상 응답은 36~250 토큰**입니다.
    #
    # 예전 값 2048 은 "한국어라 길다" 는 추측으로 잡은 것이었는데, 실제로 상한까지
    # 차는 경우는 길어서가 아니라 **디코딩이 무너져 같은 문장을 반복**할 때였습니다
    # (candidatesTokenCount 2034, thoughts 0). 상한이 크면 그 낭비도 커집니다.
    # 512 면 정상 응답에는 여유가 있고 고장났을 때 태우는 양은 1/4 입니다.
    bot_goal_max_output_tokens: int = 512

    # 같은 발화를 다시 받으면 이전 결과를 그대로 돌려줍니다. 0 이면 꺼짐.
    #
    # **개발용입니다.** 테스트하면서 같은 문장을 수십 번 보내는데 goal 모드는
    # 발화당 LLM 호출이 2회라, 크레딧이 서비스 사용보다 반복 테스트에서 더 나갑니다.
    # 캐시가 있으면 두 번째부터 0회입니다.
    #
    # 기본값이 0(꺼짐)인 이유는 **대화 맥락을 무시**하기 때문입니다. 키가 발화
    # 텍스트뿐이라 앞에서 무슨 말을 했든 같은 답이 나옵니다. 운영에서는 켜지 마세요.
    bot_cache_size: int = 0

    bot_trigger: str = "always"         # always | mention
    bot_mention: str = "@ai"
    bot_history_turns: int = 12
    bot_timeout_seconds: float = 20.0
    bot_max_output_tokens: int = 512
    # 반복 억제(Gemini 2.x). 0 이면 요청에 넣지 않습니다.
    #
    # 실측(2026-07-29): 같은 문장을 130회 반복해 상한까지 태우고 JSON 이 잘리는
    # 사고가 flash 와 flash-lite 양쪽에서 났습니다. 프롬프트로 "25자 이내" 라고
    # 적어도 막히지 않습니다 — 지시를 어긴 게 아니라 디코딩이 무너진 것이라서요.
    #
    # 게이트웨이가 이 키를 모르면 요청이 400 이 될 수 있어 기본값은 0(미전송)입니다.
    bot_frequency_penalty: float = 0.0
    bot_presence_penalty: float = 0.0
    bot_thinking_budget: int = 0        # gemini 2.5 계열: 0이면 사고 비활성화(지연 최소)

    # 푸시투토크 음성 입력 (gemini 백엔드에서만 동작)
    bot_voice_enabled: bool = True
    bot_voice_max_seconds: float = 60.0
    # 경로를 지정하면 캡처한 WAV 를 저장합니다. 인식 문제를 진단할 때 직접 들어보세요.
    bot_voice_debug_dir: str | None = None
    # opus 로 압축해 업로드 본문을 약 1/20 로 줄입니다. wav 로 두면 원본 전송.
    bot_voice_codec: str = "opus"

    @property
    def client_ice_servers(self) -> list[dict]:
        """브라우저에게 내려보낼 ICE 서버 목록 (`welcome` 메시지에 실림).

        TURN 자격증명을 프론트엔드에 하드코딩하지 않기 위해 서버가 쥐고
        있다가 입장 시점에 전달합니다. 나중에 단기 자격증명(REST API 방식)
        으로 바꾼다면 이 프로퍼티를 함수로 바꾸면 됩니다.
        """
        """ICE servers handed to the browser in the `welcome` message."""
        servers: list[dict] = []
        if self.stun_urls:
            servers.append({"urls": self.stun_urls})
        if self.turn_urls:
            entry: dict = {"urls": self.turn_urls}
            if self.turn_username:
                entry["username"] = self.turn_username
            if self.turn_credential:
                entry["credential"] = self.turn_credential
            servers.append(entry)
        return servers


@lru_cache
def get_settings() -> Settings:
    """설정은 한 번만 읽고 캐시합니다.

    그래서 `.env` 를 고쳤다면 `--reload` 여부와 무관하게 **프로세스를 완전히
    재시작**해야 반영됩니다. 자주 걸리는 함정입니다.
    """
    return Settings()
