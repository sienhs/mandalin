"""테스트는 **개발자의 `.env` 에 좌우되면 안 됩니다.**

`tests/test_ab_dev_server.py` 가 `scripts/dev_server.py` 를 import 하는데, 그 모듈은
import 시점에 `load_dotenv(ROOT / ".env")` 를 부릅니다. 수집 단계에서 한 번 불리면
그 값들이 **pytest 세션 전체의 `os.environ`** 에 올라가고, 이후 `os.environ` 을 읽는
모든 테스트가 그 사람의 `.env` 를 보게 됩니다.

실제로 밟았습니다(2026-08-08). `.env` 에 `STT_HANGOVER_MS=1500` 을 넣자
`test_the_stream_closes_when_the_silence_outlasts_the_idle_window` 가 깨졌습니다 —
그 테스트는 상한을 **모듈 상수**(`listen.HANGOVER_MS`, 800)로 계산하는데 게이트는
`SpeechGate.from_env()` 로 환경변수(1500)를 읽기 때문입니다. 파일 하나만 돌리면
통과하고 전체를 돌리면 실패해서, 원인이 `.env` 라는 것이 전혀 드러나지 않습니다.

`test_domain_authority.py` 의 `SETTINGS` 주석이 같은 함정을 단계 모델(`BOT_*_MODEL`)
쪽에서 먼저 적어 두었습니다 — *"그러면 이 파일은 개발자의 `.env` 에 따라 통과했다
실패했다 합니다."* 그쪽은 `Settings(...)` 로 값을 못 박아 피했고, 게이트는 설정 객체가
아니라 `os.environ` 을 직접 읽어서 그 수가 안 통합니다. 그래서 여기서 지웁니다.

**기본값으로 되돌리는 것이지 값을 정하는 것이 아닙니다.** 특정 값이 필요한 테스트는
`monkeypatch.setenv` 로 스스로 정하고, 그건 이 픽스처 뒤에 걸리므로 그대로 이깁니다.
"""
from __future__ import annotations

import pytest

#: 게이트 조율값. 전부 `SpeechGate.from_env()`·`TrackListener.run()` 이 `os.environ`
#: 에서 직접 읽습니다(`agent/listen.py`). 하나라도 `.env` 에 있으면 그 테스트는
#: 그 머신에서만 다른 답을 냅니다.
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
    for name in GATE_ENV:
        monkeypatch.delenv(name, raising=False)
