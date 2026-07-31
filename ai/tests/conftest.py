import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# 테스트는 개발자의 `.env` 에 좌우되면 안 됩니다. pydantic-settings 는 환경변수를
# `.env` 보다 먼저 보므로, 여기서 못 박아 두면 로컬 설정과 무관하게 같은 결과가 납니다.
#
# **AUTH_REQUIRED 를 왜 끄는가.** `create_app()` 을 인자 없이 쓰는 테스트들은 티켓
# 없이 `join` 합니다. `.env` 에서 인증을 켜면 그 테스트들이 전부 `AUTH_REQUIRED` 로
# 깨지는데, 코드가 아니라 로컬 설정이 바뀐 것일 뿐입니다. 인증을 검사하는 쪽은
# `tests/test_auth.py` 가 `Settings(_env_file=None, auth_required=True)` 를 직접
# 만들어 쓰므로 이 값에 영향받지 않습니다.
os.environ["AUTH_REQUIRED"] = "false"
