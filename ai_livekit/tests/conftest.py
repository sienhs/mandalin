"""테스트를 개발자의 `.env` 에서 떼어냅니다.

`tests/test_ab_dev_server.py` 가 import 하는 `scripts/dev_server.py` 는 import 시점에
`load_dotenv()` 를 부릅니다. 그 값이 pytest 세션 전체의 `os.environ` 에 올라가므로,
`os.environ` 을 직접 읽는 게이트(`SpeechGate.from_env`)가 그 사람의 `.env` 를 봅니다.
"""
from __future__ import annotations

import pytest

#: `agent/listen.py` 가 `os.environ` 에서 직접 읽는 게이트 조율값.
GATE_ENV = (
    "STT_SILENCE_DBFS",
    "STT_ONSET_MS",
    "STT_HANGOVER_MS",
    "STT_PREBUFFER_MS",
    "STT_IDLE_CLOSE_SECONDS",
    "STT_FINALIZE_SECONDS",
)


@pytest.fixture(autouse=True)
def _gate_defaults(monkeypatch: pytest.MonkeyPatch) -> None:
    """기본값으로 되돌립니다. 값이 필요한 테스트의 `setenv` 는 이 뒤에 걸려 이깁니다."""
    for name in GATE_ENV:
        monkeypatch.delenv(name, raising=False)
