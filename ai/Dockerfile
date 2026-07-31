# aiortc needs the native media stack (libopus / libvpx / ffmpeg headers) that
# its manylinux wheels bundle; the slim base still needs the runtime libs.
FROM python:3.12-slim AS base

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

RUN useradd --create-home --uid 10001 sfu && chown -R sfu:sfu /srv
USER sfu

# The default from app/config.py. Override with the PORT env var (see compose).
EXPOSE 8080
# `python -m app` binds to HOST/PORT from the environment, so the logged port and
# the real one cannot drift. One worker only: rooms and media pipelines live in
# this process's memory.
CMD ["python", "-m", "app"]
