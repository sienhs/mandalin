"""`python -m agent` 로 worker 를 띄웁니다.

**`.env` 를 여기서 환경변수로 올립니다.** `livekit-agents` 는 `.env` 를 스스로 읽지
않고 `LIVEKIT_URL` · `LIVEKIT_API_KEY` · `LIVEKIT_API_SECRET` 을 **실제 환경변수**로
찾습니다. 안 올리면 기동 즉시 이렇게 죽습니다 —

    ValueError: ws_url is required, or set LIVEKIT_URL environment variable

`../ai` 의 `BOT_*` 설정은 사정이 다릅니다. `pydantic-settings` 가 `env_file=".env"` 로
파일을 직접 읽으므로 이것과 무관하게 동작합니다. **같은 `.env` 를 두 계층이 서로 다른
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
`UnicodeEncodeError` 가 납니다(→ `../ai/LEARNING.md` 13절).
"""
from __future__ import annotations

import logging
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()

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
    **API 키가 그대로 들어갑니다** — 요청마다 한 벌씩 쌓입니다. `../ai` 는 `main.py` 에서
    이걸 올렸는데(→ `../ai/LEARNING.md` 16절, 관측성을 켜다가 발견한 사고), 여기서는
    `create_app()` 을 부르지 않으므로 **그 설정이 실행되지 않습니다.**

    **`worker.log` 때문에 더 심각합니다.** 콘솔이면 스크롤에 묻히지만 파일에는 남습니다.

    잃는 정보는 없습니다 — 성공은 `gemini usage` 로그가, 실패는 `LlmError` 가 남깁니다.
    """
    logging.getLogger("httpx").setLevel(logging.WARNING)


_add_file_logging()
_silence_httpx()

from livekit.agents import cli  # noqa: E402

from agent.entrypoint import server  # noqa: E402

logging.getLogger("mandarin.agent").info("worker 로그를 %s 에도 씁니다", LOG_PATH)

cli.run_app(server)
