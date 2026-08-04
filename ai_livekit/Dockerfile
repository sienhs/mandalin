# 에이전트 worker 이미지.
#
# **LiveKit 서버는 여기 안 들어갑니다.** 그쪽은 공식 이미지를 그대로 쓰고
# `docker-compose.yml` 이 둘을 같이 띄웁니다. 이 이미지는 `python -m agent` 하나입니다.

# requirements.txt 가 `livekit-agents~=1.6` 이고 그쪽 요구가 Python >=3.10,<3.15 입니다.
FROM python:3.12-slim

# PYTHONUNBUFFERED: 안 주면 stdout 이 블록 버퍼링돼서 `docker logs` 가 한참 뒤에야
#   나옵니다. worker 진단은 로그가 전부라 즉시 보여야 합니다.
# PYTHONIOENCODING: 로그에 한글이 섞이므로 필수입니다. slim 이미지의 로케일은 POSIX 라
#   빼면 UnicodeEncodeError 로 죽습니다(로컬 CP949 에서 겪은 것과 같은 사고).
ENV PYTHONUNBUFFERED=1 \
    PYTHONIOENCODING=utf-8

WORKDIR /app

# requirements 만 먼저 복사합니다. 소스만 고친 배포에서는 이 레이어가 캐시에 걸려
# pip install 을 건너뜁니다 — t3.micro 에서 매 배포마다 재설치하면 몇 분씩 걸립니다.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# `dev` 가 아니라 `start` 입니다. `dev` 는 파일 변경 감시와 자동 재시작이 붙은
# 개발용 모드라 운영에서 쓰면 안 됩니다.
#
# `.env` 는 이미지에 넣지 않습니다(.dockerignore). 런타임에 compose 의 env_file 로
# 들어옵니다 — 키가 이미지 레이어에 박히면 이미지를 가진 사람이 전부 읽을 수 있습니다.
CMD ["python", "-m", "agent", "start"]
