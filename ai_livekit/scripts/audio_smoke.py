"""마이크 트랙을 발행해서 무음 게이트를 실제로 확인합니다.

`scripts/smoke_client.py` 가 텍스트 왕복을 보는 자리의 오디오 판입니다. 게이트
(`agent/listen.py` 의 `SpeechGate`)는 실제 트랙과 Deepgram 연결이 있어야 도는 코드라
단위 테스트가 닿지 않습니다.

    python scripts/audio_smoke.py

전제는 `smoke_client.py` 와 같습니다(LiveKit 서버 + worker + `.env`). 보내는 것은
사람 목소리가 아니라 사인파라 전사문은 비어 있습니다 — **보는 것은 전사가 아니라
스트림 수명**입니다. worker 로그가 이렇게 나와야 합니다.

    (무음 4초)                             ← "STT 스트림 열기" 가 없어야 합니다
    STT 스트림 열기                         ← 소리가 나면 엽니다
    stt usage audio_duration=3.1           ← 보낸 프레임 = 소리 + hangover + 프리버퍼
    stt usage audio_duration=6.9           ← 소켓 수명의 나머지(유휴 + 연결·종료)
    STT 스트림 닫기 — 보낸 오디오 3.1s / 마이크 16.3s
    STT 스트림 열기                         ← 다음 발화는 새 스트림
"""
from __future__ import annotations

import asyncio
import json
import math
import os
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import numpy as np
from dotenv import load_dotenv

load_dotenv()

from livekit import api, rtc  # noqa: E402

ROOM = "audio-smoke"
SAMPLE_RATE = 16_000
FRAME_MS = 20
SAMPLES = SAMPLE_RATE * FRAME_MS // 1000

#: `(소리인가, 초)`. 무음 14초는 `STT_IDLE_CLOSE_SECONDS`(5초)보다 길어야 합니다 —
#: 그 구간에서 스트림이 닫히는 것을 보는 것이 이 스크립트의 목적입니다.
SCRIPT = ((False, 4), (True, 2), (False, 14), (True, 2), (False, 12))

#: 3000 진폭이면 약 -20dBFS 로 게이트의 기본 임계값(-45dBFS)보다 훨씬 큽니다.
TONE_AMPLITUDE = 3000
TONE_HZ = 220


def build_token() -> tuple[str, str]:
    url = os.environ.get("LIVEKIT_URL", "ws://localhost:7880")
    key = os.environ.get("LIVEKIT_API_KEY", "devkey")
    secret = os.environ.get("LIVEKIT_API_SECRET", "secret")
    token = (
        api.AccessToken(key, secret)
        .with_identity("tester")
        .with_name("audio-smoke")
        .with_metadata(json.dumps({"domains": []}))
        .with_grants(api.VideoGrants(room_join=True, room=ROOM))
        .to_jwt()
    )
    return url, token


async def push(source: rtc.AudioSource, seconds: float, *, tone: bool) -> None:
    offset = 0
    for _ in range(int(seconds * 1000 / FRAME_MS)):
        if tone:
            t = (np.arange(SAMPLES) + offset) / SAMPLE_RATE
            block = TONE_AMPLITUDE * np.sin(2 * math.pi * TONE_HZ * t)
            offset += SAMPLES
        else:
            block = np.zeros(SAMPLES)
        frame = rtc.AudioFrame(
            block.astype(np.int16).tobytes(), SAMPLE_RATE, 1, SAMPLES
        )
        # 실시간으로 페이싱됩니다 — 트랙이 실제 마이크처럼 흘러야 게이트가 같은 조건을
        # 봅니다.
        await source.capture_frame(frame)


async def main() -> int:
    url, token = build_token()
    room = rtc.Room()
    await room.connect(url, token)
    print(f"방 접속: {ROOM}")

    source = rtc.AudioSource(SAMPLE_RATE, 1)
    track = rtc.LocalAudioTrack.create_audio_track("mic", source)
    await room.local_participant.publish_track(
        track, rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_MICROPHONE)
    )
    # 에이전트가 구독하기 전에 보내면 그만큼이 그냥 버려집니다.
    await asyncio.sleep(2)

    for tone, seconds in SCRIPT:
        print(f"{time.strftime('%H:%M:%S')} {'소리' if tone else '무음'} {seconds}s")
        await push(source, seconds, tone=tone)

    await room.disconnect()
    print("끊음 — worker 로그를 보세요 (worker.log)")
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
