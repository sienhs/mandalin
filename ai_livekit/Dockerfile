# worker 이미지. `python -m agent start` 하나만 돕니다 — 들어오는 요청을 받지 않고
# LiveKit 서버로 나가서 붙습니다(README "포트"). 그래서 EXPOSE 가 없습니다.
FROM python:3.13-slim

# `livekit` rtc SDK 는 미리 빌드된 네이티브 라이브러리를 싣고, `av` 는 manylinux
# wheel 로 ffmpeg 를 함께 가져옵니다. slim 에 없는 것은 TLS 루트 인증서뿐입니다 —
# 이게 빠지면 Deepgram·Gemini 로 나가는 요청이 인증서 검증에서 실패합니다.
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 의존성을 먼저 넣어 레이어 캐시를 살립니다. 프롬프트만 고칠 때 재설치하지 않습니다.
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# 파이프라인 · 전송 계층 · 프롬프트. **prompts/ 가 빠지면 조용히 코드 기본값으로
# 내려갑니다** — 인젝션 차단 규칙이 없는 EMERGENCY 문구로 도는 상태이고, 로그에
# 표시가 없습니다(`bot/prompt.py`). 그래서 이미지에 반드시 포함시킵니다.
COPY mandarin_goal ./mandarin_goal
COPY agent ./agent
COPY prompts ./prompts

# `.env` 는 굽지 않습니다. compose 의 `env_file` 로 주입합니다.
#
# `-u` 로 버퍼링을 끕니다. 없으면 `docker logs` 에 로그가 늦게 나오고, 컨테이너가
# 죽을 때 마지막 줄이 유실됩니다 — 기동 실패를 진단할 때 정작 그 줄이 필요합니다.
# `start` 는 운영 모드입니다(`dev` 는 재접속·리로드 동작이 다릅니다).
ENV PYTHONUNBUFFERED=1 PYTHONIOENCODING=utf-8
CMD ["python", "-m", "agent", "start"]
