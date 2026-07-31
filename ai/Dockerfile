# aiortc needs the native media stack (libopus / libvpx / ffmpeg headers) that
# its manylinux wheels bundle; the slim base still needs the runtime libs.
#
# **배포판을 못 박아 둡니다.** 그냥 `slim` 은 데비안이 올라갈 때마다 따라 올라가는데,
# 아래 apt 패키지 이름에 SO 버전이 박혀 있어서 그때마다 빌드가 깨집니다. 실제로
# `slim` 이 trixie(13)로 넘어가면서 libvpx7 이 libvpx9 로 바뀌어 빌드가 멈췄습니다.
# 올릴 때는 태그와 아래 패키지 이름을 같이 확인하세요.
FROM python:3.12-slim-bookworm AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
        libopus0 libvpx7 libsrtp2-1 libffi8 libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /srv

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY static ./static
# BOT_MODE=goal reads these at request time (paths resolve against /srv). Missing
# files do not raise — the bot silently falls back to the built-in short prompt and
# an empty template catalogue, so leaving them out of the image degrades answer
# quality with nothing but a warning in the log.
COPY prompts ./prompts

# ── test ────────────────────────────────────────────────────────────────────
# `docker build --target test .` 로만 만들어집니다. 테스트가 깨지면 RUN 이 실패해
# 빌드가 멈추므로, 배포 스크립트에서 `up -d --build` 앞에 세워 두면 게이트가 됩니다.
# 운영 이미지(runtime)는 base 에서 따로 갈라지므로 pytest·ruff 도, tests/ 도 담기지
# 않습니다.
FROM base AS test

# requirements-dev.txt 안의 `-r requirements.txt` 가 base 에서 복사해 둔 /srv/requirements.txt
# 를 가리킵니다.
COPY requirements-dev.txt .
RUN pip install --no-cache-dir -r requirements-dev.txt

# **pyproject.toml 을 빠뜨리면 안 됩니다.** asyncio_mode = "auto" 가 여기 있어서,
# 없으면 async 픽스처가 전부 "no plugin handled it" 으로 무너집니다 — 코드가 아니라
# 설정이 없어서 나는 실패라 원인을 찾기 어렵습니다. ruff 설정도 같은 파일에 있습니다.
COPY pyproject.toml .
COPY tests ./tests

# test_media_relay 는 실제 aiortc 피어를 띄웁니다. ICE 가 loopback 후보를 모으지 않아
# non-loopback 인터페이스가 필요한데, 빌드 컨테이너의 eth0 로 충족됩니다. 없으면 그
# 테스트만 스스로 스킵하고 나머지는 그대로 돕니다.
RUN ruff check app tests && pytest -q --timeout=120

# ── runtime ─────────────────────────────────────────────────────────────────
# 마지막 스테이지 = 기본 타깃. `docker build .` 와 compose 의 `build: .` 는 그대로
# 이 이미지를 만듭니다.
FROM base AS runtime

RUN useradd --create-home --uid 10001 sfu && chown -R sfu:sfu /srv
USER sfu

# The default from app/config.py. Override with the PORT env var (see compose).
EXPOSE 8080
# `python -m app` binds to HOST/PORT from the environment, so the logged port and
# the real one cannot drift. One worker only: rooms and media pipelines live in
# this process's memory.
CMD ["python", "-m", "app"]
