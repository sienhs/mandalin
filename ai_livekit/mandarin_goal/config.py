"""환경변수 / .env 로 주입되는 설정 — **목표 설계 파이프라인에 필요한 것만**.

pydantic-settings 는 필드명을 대문자로 바꿔 환경변수를 찾습니다
(`bot_api_key` -> `BOT_API_KEY`).

**`../ai` 에서 옮겨오면서 전송 계층 설정을 덜어냈습니다.** 저쪽의 `Settings` 에는
`HOST`/`PORT`/`CORS_ORIGINS`(FastAPI) · `AUTH_*`(입장 티켓) · `STUN_URLS`/`TURN_*`
(ICE) · `MAX_PARTICIPANTS_PER_ROOM`(방 정책) · `BOT_VOICE_*`(aiortc 푸시투토크
캡처)가 함께 있는데, 여기서는 **하나도 쓰이지 않습니다** — 방·ICE·토큰은 LiveKit
서버가, 음성 캡처는 Deepgram 이 합니다. 읽는 코드가 없는 설정을 남겨두면 `.env` 에
적어놓고 왜 안 먹는지 찾게 됩니다.

`extra="ignore"` 라서 **`../ai/.env` 를 그대로 가져와도 기동은 됩니다** — 덜어낸
키들은 조용히 무시됩니다. 되살릴 일이 생기면 `../ai/app/config.py` 에 원문이
그대로 있습니다.
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

    # --- AI 챗봇 ---------------------------------------------------------------
    #: 채팅에 붙는 이름. 입장 직후 `mandarin.hello` 로 프론트에 전달됩니다.
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
    # 상대 경로는 저장소 루트 기준이며(`bot/prompt.py` 의 `PROJECT_ROOT`),
    # 비워두면 위의 BOT_SYSTEM_PROMPT 를 씁니다.
    bot_system_prompt_file: str | None = None
    # 실수로 큰 파일을 가리켰을 때 매 요청에 그대로 실려 나가지 않게 하는 상한.
    bot_system_prompt_max_chars: int = 8000

    # --- 목표 설계 파이프라인 -------------------------------------------------
    # chat : 프롬프트 하나로 한 번 호출 (기존 동작)
    # goal : 분류 -> 후보 검색 -> 판단. gemini 처럼 스키마 강제가 되는 백엔드 전용
    #
    # **`chat` 이면 과제를 만들지 않습니다.** `ai_livekit` 은 goal 경로만 배선돼
    # 있어서 `agent/entrypoint.py` 가 기동 시 경고를 남깁니다.
    bot_mode: str = "chat"
    bot_classify_prompt_file: str | None = None   # 비우면 코드 내장 분류 프롬프트
    # 프롬프트에 넣을 중복 후보 개수. 후보는 클라이언트(Spring 이 서명한 토큰의
    # metadata)가 실어 보낸 **사용자 시트의 과제**입니다 — 서버가 들고 있던 예시
    # 과제 카탈로그(`BOT_TEMPLATE_FILE`)는 없어졌습니다. 카탈로그의 고정 8칸이
    # 사용자의 자유 도메인과 어긋나 없는 칸을 만들어내던 문제 때문입니다
    # (`bot/subjects.py` 모듈 주석).
    bot_candidate_count: int = 5
    # 단계별 모델. 비우면 BOT_DEFAULT_MODEL 을 씁니다.
    #
    # **필요한 능력과 토큰 무게가 반대입니다.** 1단계는 의도 판별이라 판단력이
    # 필요한데 입력이 가볍고(~1,600 토큰), 3단계는 정제된 텍스트를 스키마에 채우는
    # 일인데 입력이 무겁습니다(~4,100 토큰). 그래서 3단계를 싼 티어로 내리면 품질
    # 손실 대비 절감이 가장 큽니다.
    #
    # **`../ai` 와 달리 1단계 모델이 멀티모달일 필요는 없습니다.** 저쪽은 푸시투토크
    # 오디오가 1단계로 들어가 받아쓰기까지 거기서 일어났지만, 여기서는 Deepgram 이
    # 전사를 끝낸 뒤 텍스트만 파이프라인에 닿습니다(`agent/listen.py`).
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
    # SSAFY 게이트웨이에서는 `Penalty is not enabled for models` 400 이 확인됐습니다.
    bot_frequency_penalty: float = 0.0
    bot_presence_penalty: float = 0.0
    bot_thinking_budget: int = 0        # gemini 2.5 계열: 0이면 사고 비활성화(지연 최소)


@lru_cache
def get_settings() -> Settings:
    """설정은 한 번만 읽고 캐시합니다.

    그래서 `.env` 를 고쳤다면 **worker 프로세스를 완전히 재시작**해야 반영됩니다.
    자주 걸리는 함정입니다 — 특히 worker 를 두 개 띄워놓고 한쪽만 재시작하면
    증상이 간헐적이 됩니다(README "안 될 때").
    """
    return Settings()
