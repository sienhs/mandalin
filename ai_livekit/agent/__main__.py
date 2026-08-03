"""`python -m agent` 로 worker 를 띄웁니다.

**`.env` 를 여기서 환경변수로 올립니다.** `livekit-agents` 는 `.env` 를 스스로 읽지
않고 `LIVEKIT_URL` · `LIVEKIT_API_KEY` · `LIVEKIT_API_SECRET` 을 **실제 환경변수**로
찾습니다. 안 올리면 기동 즉시 이렇게 죽습니다 —

    ValueError: ws_url is required, or set LIVEKIT_URL environment variable

`BOT_*` 설정은 사정이 다릅니다. `pydantic-settings` 가 `env_file=".env"` 로 파일을
직접 읽으므로 이것과 무관하게 동작합니다. **같은 `.env` 를 두 계층이 서로 다른
방법으로 읽습니다** — 헷갈리는 지점이라 적어 둡니다.

`load_dotenv()` 를 라이브러리 모듈(`entrypoint.py`)이 아니라 여기 두는 이유는 import
부작용을 만들지 않기 위해서입니다. 테스트가 `agent.*` 를 import 할 때 개발자의 `.env`
가 조용히 프로세스 환경에 섞이면, 로컬에서만 통과하는 테스트가 생깁니다.

## 로그를 파일에도 남깁니다

`worker.log`(덮어쓰기)에 콘솔과 같은 내용을 씁니다. **터미널을 띄운 사람만 로그를 볼 수
있는 상태가 진단을 막습니다** — LiveKit 서버 로그는 `docker logs` 로 누구나 보는데
worker 쪽 traceback 은 그 터미널에만 있어서, "에이전트가 안 들어온다" 를 가릴 때 정작
필요한 절반이 안 보입니다.

`encoding="utf-8"` 이 필수입니다. 이 PC 로케일이 CP949 라서 빼면 한글 로그에서
`UnicodeEncodeError` 가 납니다.
"""
from __future__ import annotations

import logging
import os
import re
import sys
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

#: 로그에 남으면 안 되는 환경변수. `load_dotenv()` 뒤라 `.env` 값이 이미 올라와 있습니다.
SECRET_ENV_VARS = (
    "BOT_API_KEY",
    "DEEPGRAM_API_KEY",
    "LIVEKIT_API_SECRET",
    "LIVEKIT_API_KEY",
)

#: HS256 최소 키 길이. 백엔드 `LiveKitTokenIssuer.MIN_SECRET_BYTES` 와 같은 값이고,
#: 그쪽은 이보다 짧으면 **토큰 발급을 거부**합니다 — 즉 여기서 걸리는 배포는 음성이
#: 아예 안 됩니다.
MIN_SECRET_BYTES = 32

#: `livekit-server --dev` 가 하드코딩한 키 쌍. 공개된 값이라 이걸로 운영에 올라가면
#: 누구나 유효한 입장 토큰을 서명할 수 있습니다.
DEV_CREDENTIALS = frozenset({"devkey", "secret"})

#: 저장소 루트의 `worker.log`. CWD 기준이 아니라 이 파일 기준으로 잡습니다 — 다른
#: 디렉터리에서 `python -m agent` 를 띄웠을 때 로그가 엉뚱한 곳에 생기지 않게.
LOG_PATH = Path(__file__).resolve().parents[1] / "worker.log"


def _add_file_logging() -> None:
    """루트 로거에 파일 핸들러를 답니다.

    `livekit-agents` 의 CLI 가 자기 포맷터로 콘솔 핸들러를 붙이므로, 여기서는 **더하기만**
    합니다. `basicConfig` 를 부르면 그쪽 설정과 충돌합니다.

    `mode="w"` 로 매 기동마다 새로 씁니다. 이어붙이면 여러 세션이 섞여서 "지금 이 기동의
    로그가 어디부터인가" 를 찾게 됩니다 — 진단용 파일이라 최신 것만 있으면 됩니다.
    """
    handler = logging.FileHandler(LOG_PATH, mode="w", encoding="utf-8")
    handler.setFormatter(
        logging.Formatter("%(asctime)s %(levelname)-7s %(name)s | %(message)s")
    )
    root = logging.getLogger()
    root.addHandler(handler)
    # CLI 가 레벨을 정하기 전이라 여기서 하한을 낮춰 둡니다. 안 하면 WARNING 만 남습니다.
    if root.level > logging.INFO:
        root.setLevel(logging.INFO)


def _silence_httpx() -> None:
    """`httpx` 를 WARNING 으로 올립니다. **키가 로그에 쌓이는 것을 막습니다.**

    `httpx` 는 INFO 에서 요청 URL 을 통째로 찍고, `BOT_API_KEY_IN_QUERY=true` 면 거기에
    **API 키가 그대로 들어갑니다** — 요청마다 한 벌씩 쌓입니다. worker 는 웹 앱
    팩토리를 거치지 않으므로 **그 설정을 여기서 해야 합니다.**

    **`worker.log` 때문에 더 심각합니다.** 콘솔이면 스크롤에 묻히지만 파일에는 남습니다.

    잃는 정보는 없습니다 — 성공은 `gemini usage` 로그가, 실패는 `LlmError` 가 남깁니다.
    """
    logging.getLogger("httpx").setLevel(logging.WARNING)


def _redact_secrets() -> None:
    """모든 로그 레코드에서 비밀값을 `***` 로 가립니다.

    `_silence_httpx()` 의 보완층입니다. 저쪽은 로거 하나·레벨 하나만 막으므로,
    누가 진단하려고 `httpx` 를 DEBUG 로 올리거나 다른 라이브러리가 URL 을 찍으면
    다시 뚫립니다. 여기는 **레코드가 만들어지는 시점**에 걸어 출처를 가리지 않습니다.

    **핸들러 필터가 아니라 레코드 팩토리인 이유**는 `livekit-agents` CLI 가 자기
    콘솔 핸들러를 **이 함수보다 나중에** 붙이기 때문입니다. 필터는 붙일 때 있던
    핸들러만 덮고, 로거에 붙인 필터는 자식 로거에서 전파된 레코드를 보지 못합니다.

    8자 미만은 건너뜁니다. 로컬 `LIVEKIT_API_KEY=devkey` 처럼 짧고 흔한 값을 지우면
    로그가 온통 `***` 이 됩니다.
    """
    secrets = [
        value
        for name in SECRET_ENV_VARS
        if (value := os.environ.get(name, "").strip()) and len(value) >= 8
    ]
    if not secrets:
        return
    pattern = re.compile("|".join(map(re.escape, secrets)))

    def scrub(value: object) -> object:
        if isinstance(value, str):
            return pattern.sub("***", value)
        # httpx 는 URL 을 `httpx.URL` 객체로 넘깁니다. 값이 실제로 들어 있을 때만
        # 문자열로 바꿔치기해서, `%d` 를 쓰는 숫자 인자는 그대로 둡니다 — 전부
        # `str()` 하면 "%d format: a real number is required" 로 로깅이 깨집니다.
        text = str(value)
        return pattern.sub("***", text) if pattern.search(text) else value

    base = logging.getLogRecordFactory()

    def factory(*args, **kwargs) -> logging.LogRecord:
        record = base(*args, **kwargs)
        if isinstance(record.msg, str):
            record.msg = pattern.sub("***", record.msg)
        if record.args:
            record.args = (
                {key: scrub(v) for key, v in record.args.items()}
                if isinstance(record.args, dict)
                else tuple(scrub(a) for a in record.args)
            )
        return record

    logging.setLogRecordFactory(factory)
    logging.getLogger("mandarin.agent").info(
        "로그 마스킹 활성 — 환경변수 %d개", len(secrets)
    )


def _check_production_credentials() -> None:
    """`start` 로 뜰 때만 LiveKit 자격증명을 점검합니다. **막지 않고 알립니다.**

    worker 는 토큰을 발급하지 않고 자기를 등록할 뿐이라, 약한 시크릿으로도 서버가
    받아주는 한 정상 동작합니다 — 그래서 증상이 없습니다. 문제는 그 서버가 같은
    약한 값을 쓰고 있다는 뜻이고, 그러면 **누구나 유효한 입장 토큰을 서명**할 수
    있습니다. 여기서 기동을 막으면 AI 가 통째로 죽으므로 경고만 남깁니다(발급을
    실제로 거부하는 것은 백엔드 `LiveKitTokenIssuer.buildKey()` 입니다).

    `dev`·`console`·`connect` 에서는 아무것도 하지 않습니다. 로컬은 `--dev` 서버의
    `devkey`/`secret` 을 쓰는 것이 정상이라(README "실행"), 그때 경고하면 매 기동마다
    무시해야 하는 잡음이 되고 정작 운영에서 눈에 안 띄게 됩니다.

    **stderr 에도 직접 씁니다.** 이 함수는 `cli.run_app()` 보다 먼저 돌고, CLI 가
    콘솔 핸들러를 그 뒤에 붙이므로 로거로만 내면 `worker.log` 에만 남습니다 —
    운영에서 `docker logs` 로 보는 것은 stdout/stderr 이라 정작 안 보입니다.
    """
    if "start" not in sys.argv[1:]:
        return

    problems: list[str] = []
    for name in ("LIVEKIT_API_KEY", "LIVEKIT_API_SECRET"):
        value = os.environ.get(name, "").strip()
        if not value:
            problems.append(f"{name} 가 비어 있습니다 — worker 가 기동하지 못합니다")
        elif value in DEV_CREDENTIALS:
            problems.append(
                f"{name} 가 `livekit-server --dev` 의 공개 기본값입니다 — 운영에 쓰면 "
                "누구나 유효한 입장 토큰을 서명할 수 있습니다. "
                "서버의 livekit.yaml 과 함께 새 값으로 바꾸세요"
            )

    secret = os.environ.get("LIVEKIT_API_SECRET", "").strip()
    length = len(secret.encode("utf-8"))
    if secret and secret not in DEV_CREDENTIALS and length < MIN_SECRET_BYTES:
        problems.append(
            f"LIVEKIT_API_SECRET 이 {length}바이트로 짧습니다"
            f"(HS256 은 {MIN_SECRET_BYTES}바이트 이상) — "
            "백엔드가 토큰 발급을 거부하므로 음성이 동작하지 않습니다"
        )

    logger = logging.getLogger("mandarin.agent")
    for problem in problems:
        logger.error(problem)
        print(f"[설정 경고] {problem}", file=sys.stderr, flush=True)


_add_file_logging()
_silence_httpx()
_redact_secrets()
_check_production_credentials()

from livekit.agents import cli  # noqa: E402

from agent.entrypoint import server  # noqa: E402

logging.getLogger("mandarin.agent").info("worker 로그를 %s 에도 씁니다", LOG_PATH)

cli.run_app(server)
