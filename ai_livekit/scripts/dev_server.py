"""로컬 확인용 웹 서버 — **Spring 자리를 대신합니다.**

두 가지만 합니다.

    GET /              web/ 의 정적 파일 (브라우저 프론트)
    GET /api/token     access token 발급 + **시트를 participant metadata 에 심기**

두 번째가 핵심입니다. 실제 서비스에서는 Spring 이 하는 일입니다 — 사용자를 확인하고,
방을 정하고, 토큰에 서명하면서 그 사용자의 시트를 metadata 로 실어 보냅니다.
발급하는 것은 **LiveKit access token** 입니다.

## 절대 배포하지 마세요

**인증이 없습니다.** 주소만 알면 누구나 아무 방에 들어가는 토큰을 받아 갑니다.
잠글 스위치조차 없습니다 — 로컬 전용이라는 전제로 만든 파일입니다.

`API_SECRET` 이 이 프로세스에만 있고 브라우저로 가지 않는 것이 요점입니다. 시크릿을
프론트에 두면 누구나 토큰을 위조할 수 있습니다.

## 실행

    python scripts/dev_server.py            # http://localhost:8000
    python scripts/dev_server.py --port 9000
"""
from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")

from livekit import api  # noqa: E402

logger = logging.getLogger("dev_server")

WEB_DIR = ROOT / "web"

#: 브라우저에 심어 보낼 사용자 시트. **실제로는 Spring 이 DB 에서 읽어 넣습니다.**
#:
#: 그래서 **모양도 Spring 의 `GET /api/v1/sheets/{sheetId}` 응답을 따릅니다** —
#: `domainId`/`subjectId`/`period`. **`id`/`frequency`(브라우저 어휘)로 적지 마세요** —
#: 이 파일이 Spring 대역이라 그러면 로컬 개발 경로가 실제 모양을 한 번도 타지 않고,
#: `period` 를 못 읽는 버그가 그 밑에 숨습니다. 양쪽 이름을 다 받는 것은
#: `tests/test_sheet_transfer.py` 가 지키고, 여기서는 정본 모양만 씁니다.
#:
#: `sheet.json` 이 있으면 그 파일을 대신 씁니다 — 다른 시트로 시험해 보고 싶을 때
#: 이 파일을 고치지 않아도 되게 해 둔 것입니다(`.gitignore` 에 있습니다).
DEFAULT_SHEET = {
    "domains": [
        {
            "domainId": 7,
            "title": "학습",
            "subjects": [
                {"subjectId": 3, "title": "매일 알고리즘 1문제 풀기", "period": "daily"},
                {"subjectId": 4, "title": "주 1회 블로그에 정리하기", "period": "weekly"},
            ],
        },
        {"domainId": 9, "title": "커리어", "subjects": [
            {"subjectId": 11, "title": "이력서 분기별로 갱신하기", "period": "none"},
        ]},
        {"domainId": 12, "title": "건강", "subjects": []},
    ]
}


def load_sheet() -> dict:
    override = ROOT / "sheet.json"
    if override.exists():
        try:
            return json.loads(override.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            # 조용히 기본값으로 떨어지면 "왜 내 시트가 안 보이지" 를 브라우저에서
            # 찾게 됩니다. 프롬프트 로더와 같은 판단입니다.
            logger.warning("sheet.json 을 읽지 못해 기본 시트를 씁니다: %s", exc)
    return DEFAULT_SHEET


def _http_url(ws_url: str) -> str:
    return ws_url.replace("ws://", "http://").replace("wss://", "https://")


async def _delete_room(room: str) -> None:
    lk = api.LiveKitAPI(
        url=_http_url(os.environ.get("LIVEKIT_URL", "ws://localhost:7880")),
        api_key=os.environ.get("LIVEKIT_API_KEY", "devkey"),
        api_secret=os.environ.get("LIVEKIT_API_SECRET", "secret"),
    )
    try:
        await lk.room.delete_room(api.DeleteRoomRequest(room=room))
    finally:
        await lk.aclose()


def reset_room(room: str) -> None:
    """토큰을 주기 전에 방을 지웁니다 — **좌초된 에이전트 job 을 치우는 것이 목적입니다.**

    LiveKit 은 방이 만들어질 때 에이전트 job 을 한 번 배정합니다. 그 job 을 받은 worker
    가 죽으면(개발 중 재시작이 대표적입니다) **방은 남고 job 은 죽은 상태**가 되고,
    새 참가자가 들어와도 다시 배정되지 않습니다. 실제로 이렇게 관측됩니다 —

        assigned job AJ_Qefdzm... -> room "dev-room"
        (worker 재시작)
        failed sending TerminateJob RPC ... participant: agent-AJ_Qefdzm...

    증상은 **"브라우저는 붙는데 에이전트가 안 들어옴"** 이고, 서버 로그에 에러가 없어서
    원인을 찾기 어렵습니다. 방을 지우면 다음 입장이 새 방을 만들어 배정이 다시 일어납니다.

    **운영에서는 이런 짓을 하지 않습니다.** Spring 은 방을 지우지 않고, worker 재시작은
    배포 절차로 다룹니다. 여기서만 유효한 개발 편의입니다 — 그래서 실패해도 무시합니다
    (방이 없으면 지울 것도 없습니다).
    """
    try:
        asyncio.run(_delete_room(room))
    except Exception as exc:  # noqa: BLE001 - 정리 실패가 토큰 발급을 막으면 안 됩니다
        logger.debug("방 정리 건너뜀 room=%s: %s", room, exc)


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:  # noqa: N802 - stdlib 규약
        if urlparse(self.path).path == "/api/token":
            self._serve_token()
            return
        super().do_GET()

    def _serve_token(self) -> None:
        query = parse_qs(urlparse(self.path).query)
        room = (query.get("room") or ["dev-room"])[0]
        identity = (query.get("identity") or ["tester"])[0]
        name = (query.get("name") or ["우찬"])[0]

        url = os.environ.get("LIVEKIT_URL", "ws://localhost:7880")
        key = os.environ.get("LIVEKIT_API_KEY", "devkey")
        secret = os.environ.get("LIVEKIT_API_SECRET", "secret")

        # 죽은 에이전트 job 이 남은 방을 치웁니다. 안 하면 브라우저는 붙지만 에이전트가
        # 안 들어옵니다(위 `reset_room` 주석). 다른 탭이 같은 방에 있으면 끊깁니다 —
        # 개발용이라 감당하는 대가입니다.
        reset_room(room)

        sheet = load_sheet()
        token = (
            api.AccessToken(key, secret)
            .with_identity(identity)
            # 표시 이름은 **서버가 정합니다.** 채팅과 LLM 프롬프트에 들어가는 값이라
            # 사용자가 정하면 가짜 발화자를 만들 수 있습니다(`_safe_speaker` 가 2차 방어).
            .with_name(name)
            # 시트를 여기 싣습니다. 브라우저가 보내는 게 아니라 **토큰에 박혀서** 갑니다.
            .with_metadata(json.dumps(sheet, ensure_ascii=False))
            .with_grants(api.VideoGrants(room_join=True, room=room))
            .to_jwt()
        )

        body = json.dumps(
            {"url": url, "token": token, "room": room, "identity": identity, "sheet": sheet},
            ensure_ascii=False,
        ).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        # 캐시되면 시트를 고쳐도 옛 토큰이 재사용됩니다.
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)
        logger.info(
            "토큰 발급 room=%s identity=%s 도메인=%d개", room, identity, len(sheet["domains"])
        )

    def log_message(self, fmt: str, *args) -> None:
        # 정적 파일 요청 로그는 노이즈입니다. 토큰 발급만 위에서 직접 남깁니다.
        pass


def main() -> None:
    parser = argparse.ArgumentParser(description="로컬 확인용 프론트 + 토큰 발급 (Spring 스탠드인)")
    parser.add_argument("--port", type=int, default=8000)
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s | %(message)s")

    if not WEB_DIR.exists():
        print(f"web/ 폴더가 없습니다: {WEB_DIR}")
        raise SystemExit(1)

    handler = partial(Handler, directory=str(WEB_DIR))
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)

    print(f"프론트:  http://localhost:{args.port}")
    print(f"LiveKit: {os.environ.get('LIVEKIT_URL', 'ws://localhost:7880')}")
    print("\n**로컬 전용입니다.** 토큰 발급에 인증이 없습니다 — 배포하지 마세요.")
    print("Ctrl+C 로 종료\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n종료")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
