"""`python -m app` — `.env` 의 HOST/PORT 로 서버를 띄웁니다.

**왜 진입점을 따로 두는가.** `uvicorn app.main:app` 을 직접 부르면 포트는 명령줄
인자로만 정해집니다. `.env` 에 `PORT=8081` 을 써두고 인자를 빠뜨리면 uvicorn 기본값
(8000)에 붙는데, 기동 로그는 설정값을 그대로 출력하므로 **로그와 실제 포트가
어긋납니다.** 실제로 이 함정에 걸려 "8081 이라고 찍혀 있는데 8081 로 접속이 안 되는"
상황이 나왔습니다.

    python -m app            # .env 의 PORT 로 바인딩 (로그와 실제가 항상 일치)
    python -m app --reload    # 코드 변경 시 재기동
    uvicorn app.main:app --port 8081   # 여전히 가능. 인자가 .env 보다 우선한다

`--reload` 는 uvicorn 이 프로세스를 다시 띄우는 방식이라 import 문자열이 필요합니다.
그래서 앱 객체가 아니라 `"app.main:app"` 을 넘깁니다.
"""
from __future__ import annotations

import sys

import uvicorn

from app.config import get_settings


def main() -> None:
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload="--reload" in sys.argv,
        # 워커는 반드시 하나입니다. 방과 미디어 파이프라인이 이 프로세스의
        # 메모리에 있어서, 워커를 늘리면 참가자들이 서로 다른 방에 흩어집니다.
        workers=1,
    )


if __name__ == "__main__":
    main()
