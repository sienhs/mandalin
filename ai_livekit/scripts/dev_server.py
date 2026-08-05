"""로컬 확인용 웹 서버 — **Spring 자리를 대신합니다.**

    GET  /              web/ 의 정적 파일 (브라우저 프론트)
    GET  /api/token     access token 발급 + **시트를 participant metadata 에 심기**

    GET  /eval          프롬프트 평가 화면 (아래)
    GET  /api/eval/cases
    POST /api/eval/run          mode="ab" 면 두 폴더를 연달아 돌리고 비교까지
    GET  /api/eval/status?id=...
    GET  /api/eval/ab[?name=]   지난 A/B 기록 + 목록 (디스크에 쌓입니다. LLM 호출 없음)

`/eval` 은 서비스 화면이 **아닙니다.** 프롬프트를 고쳤을 때 좋아졌는지를 골든셋으로
재는 개발 도구이고, `evals/runner.py` 를 브라우저에서 눌러 돌리는 것뿐입니다. 같은 것을
CLI 로도 돌릴 수 있습니다(`python -m evals.runner`) — 화면은 결과를 읽기 쉽게 할 뿐
계산은 전부 러너가 합니다. **한 번에 한 건만 돌립니다**(`_RUN_LOCK`) — 러너가 프로세스
전역인 `mandarin_goal` 로거를 갈아 끼워 사용량을 걷어 가므로, 두 건이 겹치면 서로의
로그를 주워 담습니다.

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
import threading
import traceback
import uuid
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse, urlunparse

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
                {"subjectId": 3, "title": "매일 알고리즘 1문제 풀기",
                 "period": "daily", "countPerPeriod": 1},
                # **제목에 "주 1회" 를 적지 않습니다.** 프롬프트의 `task_frequency` 가
                # 금지하는 형태인데(사용자가 횟수를 고치면 제목만 옛 값으로 남습니다),
                # 후보로 보여주는 데이터가 그 형태면 모델에게 규칙과 반대되는 예시를
                # 주는 셈입니다 — 규칙보다 눈앞의 데이터가 최신이라 그쪽을 흉내 냅니다.
                {"subjectId": 4, "title": "블로그에 정리하기",
                 "period": "weekly", "countPerPeriod": 1},
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
    parsed = urlparse(ws_url)
    if parsed.scheme == "ws":
        return urlunparse(parsed._replace(scheme="http"))
    if parsed.scheme == "wss":
        return urlunparse(parsed._replace(scheme="https"))
    return ws_url


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


#: 진행 중·끝난 eval 실행. 개발 도구라 메모리에만 둡니다 — 서버를 내리면 사라집니다.
_RUNS: dict[str, dict] = {}
#: 동시 실행 방지. 러너가 `mandarin_goal` 로거의 레벨과 `propagate` 를 바꿔 가며
#: 사용량을 걷어 가므로, 두 건이 겹치면 서로의 로그를 주워 담아 수치가 섞입니다.
_RUN_LOCK = threading.Lock()


def _finished_run(report: dict) -> str:
    """이미 끝난 리포트를 `_RUNS` 에 등록하고 그 id 를 돌려줍니다.

    A/B 의 각 팔을 여기 넣습니다. 그러면 A/B 를 돌린 뒤에도 **기존 재실행이 그대로
    먹습니다** — "B 에서 틀린 것만 다시" 를 A/B 화면에서 바로 이어 갈 수 있습니다.
    새 경로를 만들지 않고 이미 있는 `rerun_of` 를 쓰는 것이 요점입니다.
    """
    run_id = uuid.uuid4().hex[:12]
    _RUNS[run_id] = {"id": run_id, "done": 0, "total": 0, "current": None,
                     "finished": True, "error": None, "report": report, "stopping": False}
    return run_id


def _start_eval(options: dict) -> dict:
    """백그라운드 스레드에서 골든셋을 돌립니다. 즉시 `run_id` 를 돌려줍니다.

    러너가 `asyncio.run()` 을 부르므로 **이벤트 루프가 없는 스레드**여야 합니다.
    HTTP 핸들러 스레드에서 직접 부르면 수십 초 동안 응답을 못 돌려줘 브라우저가
    타임아웃으로 끊습니다 — 그래서 진행률을 폴링하는 모양으로 갈랐습니다.

    `mode="ab"` 면 두 폴더를 연달아 돌리고 비교까지 만듭니다(`run_ab`). 같은 잠금
    (`_RUN_LOCK`)을 하나로 쓰므로 A/B 한 건이 도는 동안 다른 평가는 시작되지 않습니다 —
    두 팔이 서로의 로그를 주워 담으면 사용량이 섞입니다.
    """
    from evals.runner import DEFAULT_PICK, run_ab, run_eval, save_ab

    # 재실행 — 지난 실행의 리포트를 기준으로 실패·모호만 다시 돕니다. **id 목록을
    # 브라우저가 만들어 보내지 않습니다.** 그러면 "무엇이 실패인가" 의 정의가 화면과
    # 러너 두 곳에 생기고, 한쪽만 고치는 날 둘이 갈립니다.
    baseline = None
    if options.get("rerun_of"):
        prior = _RUNS.get(options["rerun_of"])
        if prior is None or not prior.get("report"):
            return {"id": None, "error": "기준으로 삼을 실행 결과가 없습니다"}
        baseline = prior["report"]

    # A/B 는 폴더 두 개가 다 있어야 시작합니다. 빠진 쪽을 기본값으로 메우면 조용히
    # A/A 가 돌아 몇 분을 쓰고 "차이 없음" 을 봅니다 — A/A 는 **일부러** 고를 때만
    # 의미가 있습니다(잡음 크기 측정).
    if options.get("mode") == "ab" and not (options.get("prompt_dir")
                                            and options.get("prompt_dir_b")):
        return {"id": None, "error": "A/B 는 두 프롬프트 폴더를 다 적어야 합니다"}

    run_id = uuid.uuid4().hex[:12]
    state = {"id": run_id, "done": 0, "total": 0, "current": None,
             "finished": False, "error": None, "report": None, "stopping": False,
             # A/B 전용. 지금 도는 팔("A (prompts)")과, 끝났을 때의 비교 기록·팔 id.
             "arm": None, "ab": None, "arms": None, "ab_note": None}
    _RUNS[run_id] = state

    def progress(done: int, total: int, case: dict) -> None:
        state.update(done=done, total=total, current=case.get("id"))

    def work_ab() -> None:
        """두 팔을 돌리고 비교를 만듭니다. 끝나면 **디스크에도 남깁니다** —
        서버를 내려도 `/eval` 이 "가장 최근 A/B" 로 다시 그릴 수 있어야 합니다."""
        result = run_ab(
            a=options.get("prompt_dir") or "prompts",
            b=options.get("prompt_dir_b") or "prompts",
            provider=options.get("provider") or None,
            repeat=max(1, int(options.get("repeat") or 1)),
            on_progress=progress,
            on_arm=lambda side, folder: state.update(arm=f"{side.upper()} ({folder})"),
            should_stop=lambda: state["stopping"],
        )
        # 각 팔을 독립 실행으로도 등록합니다 — 아래 카드가 팔 하나를 그대로 그리고,
        # 재실행("틀린 것만 다시")이 그 팔을 기준으로 이어집니다.
        state["arms"] = {
            side: _finished_run(result[side]) for side in ("a", "b") if result.get(side)
        }
        # 화면의 단일 리포트 자리에는 **B**(새 것)를 놓습니다. A/B 를 돌린 사람이
        # 케이스를 파고들 때 보려는 것은 새 프롬프트의 결과입니다.
        state["report"] = result.get("b") or result.get("a")
        if result["stopped_before_b"]:
            # 돌다 만 A 와 완주한 B 를 비교하면 표가 통째로 거짓말을 합니다. 러너가
            # 비교를 만들지 않았으므로 A 리포트만 보여 주고 이유를 적습니다.
            #
            # **`error` 로 두지 않습니다** — 화면은 오류면 리포트를 버리고 빨간 상자만
            # 그립니다. 중지는 실패가 아니고, 그때까지 돈 A 는 볼 값어치가 있습니다.
            # 아래에 남아 있는 표를 가리키지 않는 문구여야 합니다 — 지난 기록이 그대로
            # 있을 수도, 아무것도 없을 수도 있습니다.
            state["ab_note"] = (
                "A 를 중지해서 B 는 돌지 않았습니다 — 이번 실행의 비교표는 없습니다."
            )
            return
        state["ab"] = save_ab(result)

    def work() -> None:
        if not _RUN_LOCK.acquire(blocking=False):
            state.update(finished=True, error="다른 평가가 이미 돌고 있습니다")
            return
        try:
            if options.get("mode") == "ab":
                work_ab()
                return
            state["report"] = run_eval(
                prompt_dir=options.get("prompt_dir") or "prompts",
                provider=options.get("provider") or None,
                repeat=max(1, int(options.get("repeat") or 1)),
                only=options.get("only") or None,
                baseline=baseline,
                pick=options.get("pick") or list(DEFAULT_PICK),
                on_progress=progress,
                # 협조적 중지 — 스레드를 죽이지 않습니다. 러너가 케이스 사이와
                # 백오프 대기 중에 이 값을 봅니다. 강제 종료하면 열린 HTTP 클라이언트와
                # 갈아 끼운 로거 설정이 그대로 남습니다(`_run_all` 의 `finally`).
                should_stop=lambda: state["stopping"],
            )
        except Exception as exc:  # noqa: BLE001 - 실패도 화면에 그대로 보여 줍니다
            logger.warning("eval 실패: %s", exc)
            state["error"] = f"{type(exc).__name__}: {exc}"
            state["trace"] = traceback.format_exc()[-1200:]
        finally:
            state["finished"] = True
            _RUN_LOCK.release()

    threading.Thread(target=work, daemon=True, name=f"eval-{run_id}").start()
    return state


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:  # stdlib 규약이라 이름이 camelCase 입니다
        path = urlparse(self.path).path
        if path == "/api/token":
            self._serve_token()
            return
        if path in ("/eval", "/eval/"):
            # 별도 주소로 둡니다. `web/` 아래 파일이라 `/eval.html` 로도 열리지만,
            # 주소를 하나로 못 박아야 북마크와 문서가 갈리지 않습니다.
            self.path = "/eval.html"
            super().do_GET()
            return
        if path == "/api/eval/cases":
            from evals.runner import SHEET_JSON, load_cases

            self._send_json({"cases": load_cases(), "sheet": SHEET_JSON})
            return
        if path == "/api/eval/ab":
            # **지난 A/B 는 디스크에서 옵니다**(`evals/ab_history/`). 메모리에 두면
            # 서버를 내릴 때마다 사라지는데, A/B 한 번이 실모델로 수백 번의 호출이라
            # 지난 결과를 잃으면 그걸 다시 보려고 또 돌려야 합니다. CLI(`--vs`)로 돌린
            # 것도 같은 폴더에 쌓이므로 화면과 터미널이 같은 목록을 봅니다.
            #
            # **이 경로는 LLM 을 부르지 않습니다.** 파일을 읽어 그대로 내려줄 뿐입니다 —
            # 판정·p값은 A/B 를 돌린 그 순간 이미 계산돼 파일에 박혀 있습니다.
            #
            # `name` 은 목록에 있는 이름만 받습니다(`load_ab` 가 확인합니다) — 브라우저가
            # 보내는 값을 그대로 경로에 붙이면 `../../.env` 를 읽어 갈 수 있습니다.
            from evals.runner import list_ab, load_ab

            name = (parse_qs(urlparse(self.path).query).get("name") or [""])[0]
            self._send_json({"record": load_ab(name or None), "history": list_ab()})
            return
        if path == "/api/eval/status":
            run_id = (parse_qs(urlparse(self.path).query).get("id") or [""])[0]
            state = _RUNS.get(run_id)
            if state is None:
                self._send_json({"error": "그런 실행이 없습니다"}, status=404)
                return
            self._send_json(state)
            return
        super().do_GET()

    def do_POST(self) -> None:  # stdlib 규약이라 이름이 camelCase 입니다
        path = urlparse(self.path).path
        if path == "/api/eval/stop":
            run_id = (parse_qs(urlparse(self.path).query).get("id") or [""])[0]
            state = _RUNS.get(run_id)
            if state is None:
                self._send_json({"error": "그런 실행이 없습니다"}, status=404)
                return
            # 깃발만 세웁니다. 러너가 다음 케이스 경계에서 봅니다 — 이미 나간 요청은
            # 끝까지 갑니다(그 결과는 버려집니다).
            state["stopping"] = True
            logger.info("eval 중지 요청 id=%s (%s/%s)", run_id, state["done"], state["total"])
            self._send_json({"id": run_id, "stopping": True})
            return
        if path != "/api/eval/run":
            self.send_error(404)
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            options = json.loads(self.rfile.read(length) or b"{}")
        except (ValueError, json.JSONDecodeError) as exc:
            self._send_json({"error": f"요청 본문을 읽지 못했습니다: {exc}"}, status=400)
            return
        state = _start_eval(options)
        if state.get("error") and state["id"] is None:
            self._send_json({"error": state["error"]}, status=400)
            return
        logger.info("eval 시작 id=%s %s", state["id"], options)
        self._send_json({"id": state["id"]})

    def _send_json(self, payload: dict, status: int = 200) -> None:
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self) -> None:
        """**모든 응답에 캐시 금지를 붙입니다** — 정적 파일까지 포함해서.

        `SimpleHTTPRequestHandler` 는 `Last-Modified` 만 보내고 `Cache-Control` 을 붙이지
        않습니다. 그러면 브라우저가 **휴리스틱 캐싱**을 합니다 — Chrome 은 "마지막 수정
        이후 경과 시간의 10%" 를 신선도로 잡으므로, 며칠 전에 만든 파일은 한 번 받아가면
        몇 시간 동안 서버에 다시 묻지 않습니다.

        `web/` 를 고칠 때 이게 고약합니다. `index.html` 만 새로 받고 `style.css` 와
        `app.js` 는 캐시에서 나오면 **새 마크업에 옛 선택자가 붙어 화면이 통째로
        깨집니다** — CSS 가 깨진 것처럼 보이지만 파일은 멀쩡합니다. 실제로 한 번
        헤맸습니다. 개발용 서버라 캐시로 얻을 것이 없으니 전부 끕니다.
        """
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

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
            # 표시 이름. **실서비스에서는 Spring 이 DB 값을 넣습니다** — 여기서는 대역이라
            # `?name=` 으로 받습니다(이 파일에는 인증이 없으므로 어차피 신뢰 경계가 없습니다).
            #
            # **프롬프트로는 가지 않습니다.** 예전에는 화자 라벨로 LLM 입력에 실렸고 그래서
            # 무해화가 필요했는데, 방에 사람이 1명이라 `Turn` 에서 뺐습니다(그 docstring 참고).
            # 지금 이 값이 닿는 곳은 worker 의 입장 로그뿐입니다.
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
        # `Cache-Control: no-store` 는 `end_headers()` 가 붙입니다 — 여기서 또 넣으면
        # 헤더가 두 줄이 됩니다. 캐시되면 시트를 고쳐도 옛 토큰이 재사용됩니다.
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

    # **기동 안내문 때문에 서버가 안 뜨는 것을 막습니다.** 출력을 파일로 넘기면
    # (`> dev.log`) 파이썬이 콘솔이 아니라 로케일 인코딩(한국어 Windows 는 cp949)을
    # 쓰는데, 아래 안내문의 `—` 가 그 표에 없어 **`serve_forever()` 에 닿기도 전에**
    # `UnicodeEncodeError` 로 죽습니다. 로그만 리다이렉트했을 뿐인데 서버가 안 뜨고,
    # 메시지도 인코딩 오류라 원인이 안 보입니다. 못 그리는 글자는 `?` 로 떨어뜨립니다.
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(errors="replace")

    if not WEB_DIR.exists():
        print(f"web/ 폴더가 없습니다: {WEB_DIR}")
        raise SystemExit(1)

    handler = partial(Handler, directory=str(WEB_DIR))
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)

    print(f"프론트:  http://localhost:{args.port}")
    print(f"평가:    http://localhost:{args.port}/eval")
    print(f"LiveKit: {os.environ.get('LIVEKIT_URL', 'ws://localhost:7880')}")
    print("\n**로컬 전용입니다.** 토큰 발급에 인증이 없습니다 — 배포하지 마세요.")
    print("Ctrl+C 로 종료\n")
    try:
        server.serve_forever()  # nosonar
    except KeyboardInterrupt:
        print("\n종료")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
