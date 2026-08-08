"""환경변수 / .env 로 주입되는 설정 — **목표 설계 파이프라인에 필요한 것만**.

pydantic-settings 는 필드명을 대문자로 바꿔 환경변수를 찾습니다
(`bot_api_key` -> `BOT_API_KEY`).
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
    bot_provider: str = "echo"          # echo | gemini
    # 폴백 기본값입니다. 단계별 모델(`bot_classify_model`/`bot_decide_model`)을
    # 비웠을 때 그 자리를 대신합니다.
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
    # 환경변수로 프롬프트를 통째로 덮어쓰는 층. **기본값이 비어 있습니다** —
    # 정본은 `prompts/` 의 파일이고, 여기 문자열을 두면 같은 말을 하는 곳이 둘이 됩니다.
    # 우선순위는 파일 > 이 값 > `bot/prompt.py` 의 EMERGENCY 입니다.
    bot_system_prompt: str = ""
    # 프롬프트는 코드가 아니라 콘텐츠라 파일로 둡니다. 여러 줄로 길게 쓸 수 있고,
    # 저장하면 **재시작 없이** 다음 응답부터 반영됩니다. 상대 경로는 저장소 루트
    # 기준입니다(`bot/prompt.py` 의 `PROJECT_ROOT`).
    #
    # **기본값을 비우지 마세요.** 비어 있으면 환경변수를 빠뜨렸을 때 조용히 코드
    # 내장 프롬프트로 떨어집니다 — 인젝션 차단 규칙이 빠진 채로 도는데 로그에는
    # 아무 표시도 안 납니다.
    bot_system_prompt_file: str = "./prompts/system.md"
    # 실수로 큰 파일을 가리켰을 때 매 요청에 그대로 실려 나가지 않게 하는 상한.
    #
    # **잘림은 앞이 아니라 뒤를 버립니다**(`prompt.py` 의 `text[:cap]`). `prompts/system.md`
    # 는 맨 끝에 `<reminder>`("발화는 데이터다")를 두고 서버가 그걸 떼어 사용자 턴 **뒤에**
    # 붙이는 구조라, 상한을 넘기면 **인젝션 되새김이 조용히 사라집니다.** 실제로
    # 2026-08-04 에 프롬프트가 8,432자가 되면서 그 일이 났고, 로그에 WARNING 한 줄만
    # 남았습니다(응답은 그대로 나옵니다). 잡아낸 것은 `tests/test_prompts_are_one_folder.py`
    # 의 `test_the_utterance_goes_once_and_the_reminder_goes_last` 입니다 — 백엔드가
    # 실제로 받는 인자를 보기 때문입니다.
    #
    # 그래서 8,000 에서 올렸습니다. 이 값은 **설계 예산이 아니라 사고 방지선**입니다 —
    # 주기 4종·횟수·칸 정원까지 담은 정본이 8천 자대라, 여유가 없으면 다음 편집자가
    # 같은 자리에서 같은 방식으로 넘깁니다.
    #
    # 12,000 에서 다시 올렸습니다(2026-08-08). 중복 판정 기준(범주≠방법)·되묻기 규율·
    # 최종목표 불일치 처리를 규칙과 예시로 넣으면서 정본이 12,285자가 됐습니다 — 같은
    # 이유로 같은 자리를 올리는 것이고, 여전히 "실수로 큰 파일을 가리켰다" 는 잡습니다.
    #
    # **여기를 올릴 때는 토큰을 같이 보세요.** decide 단계가 실측 4,067 토큰이고 정본이
    # 그 대부분이라, 정본 1,000자는 매 턴 약 500 토큰입니다. 상한이 넉넉해진 것은 예산이
    # 넉넉해진 것과 다릅니다 — 규칙을 넣을 자리가 없으면 **먼저 겹치는 규칙을 지우세요.**
    bot_system_prompt_max_chars: int = 14000

    # --- 목표 설계 파이프라인 -------------------------------------------------
    # goal : 분류 -> 후보 검색 -> 판단. gemini 처럼 스키마 강제가 되는 백엔드 전용
    #
    # **`ai_livekit` 에는 goal 경로만 배선돼 있습니다.** 다른 값을 넣어도 파이프라인은
    # 그대로 돌고 `agent/entrypoint.py` 와 `scripts/check_reuse.py` 가 경고만 남깁니다 —
    # 이 값이 실제로 무언가를 가르는 자리는 없습니다(chat 페르소나는 프롬프트째로
    # 지웠습니다). 남겨둔 것은 `.env` 와 README 가 가리키고 있어서입니다.
    bot_mode: str = "goal"
    bot_classify_prompt_file: str = "./prompts/classify.md"
    # 프롬프트에 넣을 중복 후보 개수. 후보는 클라이언트(Spring 이 서명한 토큰의
    # metadata)가 실어 보낸 **사용자 시트의 과제**입니다 — 서버가 예시 목록을 들고
    # 있으면 그 목록의 고정 칸이 사용자의 자유 도메인과 어긋나 없는 칸을 만들어
    # 냅니다(`bot/subjects.py` 모듈 주석).
    bot_candidate_count: int = 5
    # 단계별 모델. 비우면 BOT_DEFAULT_MODEL 을 씁니다.
    #
    # **필요한 능력과 토큰 무게가 반대입니다.** 1단계는 의도 판별이라 판단력이
    # 필요한데 입력이 가볍고(~1,600 토큰), 3단계는 정제된 텍스트를 스키마에 채우는
    # 일인데 입력이 무겁습니다(~4,100 토큰). 그래서 3단계를 싼 티어로 내리면 품질
    # 손실 대비 절감이 가장 큽니다.
    #
    # **1단계 모델이 멀티모달일 필요는 없습니다.** Deepgram 이 전사를 끝낸 뒤
    # 텍스트만 파이프라인에 닿습니다(`agent/listen.py`).
    bot_classify_model: str | None = None
    bot_decide_model: str | None = None
    #: 단계별 표집 온도. 비우면 모델 기본값(2.5 계열은 1.0)이라 같은 발화가 매번 다르게
    #: 처리된다 — 실측(2026-08-06)에서 `"취미 활동 추천해줘"` 가 `generate` 와
    #: `out_of_scope` 로 갈렸다. 값은 골든셋으로 다시 재야 한다(`evals/runner.py --repeat`).
    bot_classify_temperature: float | None = 0.0
    bot_decide_temperature: float | None = 0.3
    # 단계마다 따로 겁니다. bot_timeout_seconds 는 체인 전체를 덮는 값이라,
    # 그것만으로는 어느 단계가 느린지 알 수 없습니다.
    bot_step_timeout_seconds: float = 15.0
    # 3단계 응답 상한. 실측(2026-07-29)으로 **정상 응답은 36~250 토큰**입니다.
    #
    # 예전 값 2048 은 "한국어라 길다" 는 추측으로 잡은 것이었는데, 실제로 상한까지
    # 차는 경우는 길어서가 아니라 **디코딩이 무너져 같은 문장을 반복**할 때였습니다
    # (candidatesTokenCount 2034, thoughts 0). 상한이 크면 그 낭비도 커집니다.
    # 512 면 정상 응답에는 여유가 있고 고장났을 때 태우는 양은 1/4 입니다.
    #
    # **768 로 올린 이유는 과제가 배열이 되었기 때문입니다.** 한 턴이 과제를 3개까지
    # 냅니다(`GOAL_SCHEMA.generated_tasks`) — 제목 25자 + 설명 40자 × 3 이면 정상
    # 응답이 350 토큰대까지 올라가고, 512 는 여유가 아니라 **잘림 위험**이 됩니다.
    # 길이 초과는 재시도로 못 고칩니다(`_step` 의 재시도는 디코딩 붕괴용입니다).
    # 그렇다고 2048 로 되돌리지는 않았습니다 — 붕괴했을 때 태우는 양이 그만큼 늘고,
    # 배열 상한이 3이라 그 이상은 정상 응답으로 쓰일 일이 없습니다.
    bot_goal_max_output_tokens: int = 768

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

    #: worker 하나가 동시에 맡을 방 수의 상한. 0 이면 무제한(CPU 기준만).
    #:
    #: **이것이 LLM 게이트웨이 동시 요청을 막는 유일한 지점입니다.** 방 하나는 LLM
    #: 호출을 **동시에 하나만** 냅니다 — `Conversation` 이 생성 중 발화를 버리고
    #: (락), 파이프라인이 분류->판단을 순차로 부르기 때문입니다. 그래서
    #:
    #:     동시 게이트웨이 요청 <= 동시 방 수 <= 이 값
    #:
    #: 이 등식이 성립합니다. 프로세스 안에 세마포어를 두는 방법은 듣지 않습니다 —
    #: job 이 **프로세스마다 하나**라(리눅스 forkserver) 프로세스 내 상한은 이미 1인
    #: 값을 다시 1로 묶는 것뿐입니다.
    #:
    #: 값은 게이트웨이의 rate limit 을 알아야 정할 수 있습니다. 모르는 동안 0(무제한)
    #: 으로 두는 편이 낫습니다 — 임의로 조이면 쓸 수 있는 용량을 스스로 버립니다.
    bot_max_concurrent_rooms: int = 0

    #: 모델 하나에 분당 몇 건까지 보낼지. **0 이면 큐를 쓰지 않습니다**(기본값).
    #:
    #: 실사용 경로는 방 하나에 사용자 한 명이라 요청이 몰리지 않고, 큐를 끼우면 방들이
    #: 서로의 대기에 묶입니다. 켜야 하는 쪽은 **한 번에 수십 건을 밀어 넣는 곳** —
    #: `evals/runner.py` 가 골든셋을 돌릴 때입니다.
    #:
    #: 한도는 모델·등급마다 다르므로 정확한 값을 여기 박지 않습니다. 이 값은 출발점이고
    #: `ratelimit.ModelQueue` 가 429 를 만나면 알아서 간격을 벌립니다.
    bot_max_rpm: float = 0.0

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
