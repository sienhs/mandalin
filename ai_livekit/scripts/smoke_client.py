"""LiveKit 방에 붙어 텍스트 왕복을 실제로 확인합니다 — 4단계 스모크 테스트.

`agent/entrypoint.py` 는 LiveKit API 를 호출하는 유일한 파일이라 단위 테스트로 덮을
수 없습니다. 이 스크립트가 그 자리를 메웁니다 — **사용자 역할로 방에 들어가** 발화를
보내고 응답이 돌아오는지 봅니다.

    python scripts/smoke_client.py

전제:
  1. LiveKit 서버가 떠 있어야 합니다 (`--dev` 면 devkey/secret)
  2. worker 가 떠 있어야 합니다 (`python -m agent dev`)
  3. `.env` 의 `LIVEKIT_*` 3개

`BOT_PROVIDER=echo` 면 LLM 호출이 0회입니다. **배선을 확인하는 것이 목적이므로 그게
맞습니다** — 응답 문구가 아니라 왕복이 되는지를 봅니다.
"""
from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from dotenv import load_dotenv  # noqa: E402

load_dotenv()

from livekit import api, rtc  # noqa: E402

from agent.entrypoint import CHAT_TOPIC, GOAL_TOPIC  # noqa: E402
from agent.sheet_transfer import SHEET_TOPIC  # noqa: E402

logging.basicConfig(level=logging.WARNING)

ROOM = "smoke-test"
IDENTITY = "tester"
DISPLAY_NAME = "우찬"

#: 토큰의 participant metadata 로 실어 보낼 시트. Spring 응답과 같은 모양입니다.
SHEET = {
    "domains": [
        {
            "id": 7,
            "title": "학습",
            "subjectCount": 2,
            "subjects": [
                {"id": 3, "title": "매일 알고리즘 1문제 풀기", "frequency": "daily"},
                {"id": 4, "title": "주 1회 블로그에 정리하기", "frequency": "weekly"},
            ],
        },
        {"id": 9, "title": "커리어", "subjectCount": 0, "subjects": []},
    ]
}


def build_token() -> tuple[str, str]:
    url = os.environ.get("LIVEKIT_URL", "ws://localhost:7880")
    key = os.environ.get("LIVEKIT_API_KEY", "devkey")
    secret = os.environ.get("LIVEKIT_API_SECRET", "secret")
    token = (
        api.AccessToken(key, secret)
        .with_identity(IDENTITY)
        .with_name(DISPLAY_NAME)
        # **시트는 토큰에 실립니다.** 실제로는 Spring 이 이 토큰을 서명하면서 넣습니다.
        .with_metadata(json.dumps(SHEET, ensure_ascii=False))
        .with_grants(api.VideoGrants(room_join=True, room=ROOM))
        .to_jwt()
    )
    return url, token


async def main(utterance: str, timeout: float) -> int:
    url, token = build_token()
    room = rtc.Room()

    replies: asyncio.Queue[tuple[str, str]] = asyncio.Queue()
    tasks: set[asyncio.Task] = set()

    def collect(topic: str):
        def handler(reader, participant_identity: str) -> None:
            async def run() -> None:
                text = await reader.read_all()
                await replies.put((topic, text))

            task = asyncio.create_task(run())
            tasks.add(task)
            task.add_done_callback(tasks.discard)

        return handler

    room.register_text_stream_handler(CHAT_TOPIC, collect(CHAT_TOPIC))
    room.register_text_stream_handler(GOAL_TOPIC, collect(GOAL_TOPIC))

    agent_joined = asyncio.Event()

    @room.on("participant_connected")
    def _on_join(p: rtc.RemoteParticipant) -> None:
        print(f"  참가자 입장: identity={p.identity} kind={p.kind}")
        agent_joined.set()

    print(f"방 접속: {url} room={ROOM}")
    await room.connect(url, token)
    print(f"  접속 완료. 기존 참가자: {list(room.remote_participants)}")

    if room.remote_participants:
        agent_joined.set()

    print("  에이전트 대기...")
    try:
        await asyncio.wait_for(agent_joined.wait(), timeout=timeout)
    except TimeoutError:
        print("\n[실패] 에이전트가 방에 들어오지 않았습니다.")
        print("       → worker 가 떠 있는지 확인하세요: python -m agent dev")
        await room.disconnect()
        return 1

    # 시트 갱신 경로도 같이 확인합니다 (담기·삭제 시 클라이언트가 보내는 것).
    await room.local_participant.send_text(
        json.dumps(SHEET, ensure_ascii=False), topic=SHEET_TOPIC
    )

    print(f"\n발화 전송 → {CHAT_TOPIC}: {utterance!r}")
    await room.local_participant.send_text(utterance, topic=CHAT_TOPIC)

    got_chat = got_goal = False
    deadline = asyncio.get_running_loop().time() + timeout
    while not (got_chat and got_goal):
        remaining = deadline - asyncio.get_running_loop().time()
        if remaining <= 0:
            break
        try:
            topic, text = await asyncio.wait_for(replies.get(), timeout=remaining)
        except TimeoutError:
            break
        if topic == CHAT_TOPIC:
            got_chat = True
            print(f"\n  [{CHAT_TOPIC}] {text}")
        else:
            got_goal = True
            data = json.loads(text)
            print(f"\n  [{GOAL_TOPIC}] {json.dumps(data, ensure_ascii=False, indent=2)}")
            if "reasoning" in data:
                print("  [실패] reasoning 이 클라이언트까지 왔습니다 (public_data 미적용)")
                await room.disconnect()
                return 1

    await room.disconnect()

    print("\n" + "-" * 60)
    if got_chat:
        print("  [OK]  텍스트 왕복 성공")
    else:
        print("  [실패] 응답이 오지 않았습니다 (worker 로그를 보세요)")
    print(f"  {'[OK] ' if got_goal else '[안내]'} 구조화 결과 {'수신' if got_goal else '미수신'}")
    return 0 if got_chat else 1


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("utterance", nargs="?", default="매일 알고리즘 문제 풀고 싶어")
    parser.add_argument("--timeout", type=float, default=30.0)
    args = parser.parse_args()
    raise SystemExit(asyncio.run(main(args.utterance, args.timeout)))
