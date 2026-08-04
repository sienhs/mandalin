"""토픽 문자열은 **세 곳에 같이 적혀 있습니다.** 갈리면 조용히 실패합니다.

    agent/entrypoint.py · agent/sheet_transfer.py    서버(정본)
    web/app.js                                       빌드 없는 확인용 프론트
    ../frontend/src/components/aiCoach/useCoachRoom.ts   React 프론트

한쪽만 고치면 **에러가 아니라 무응답**으로 드러납니다. 보낸 쪽은 성공하고, 받는 쪽에
그 토픽 핸들러가 없어서 메시지가 사라집니다 — 서버 로그에도 브라우저 콘솔에도 아무것도
남지 않습니다. `useCoachRoom.ts` 의 파일 주석이 그걸 경고하고 있는데 지키는 것은
사람의 기억뿐이었습니다.

**값이 아니라 이름→값 짝을 비교합니다.** 집합만 보면 `CHAT_TOPIC` 과 `GOAL_TOPIC` 의
값이 서로 바뀐 경우를 통과시킵니다 — 그게 정확히 "AI 답이 과제 카드 자리에 뜨는" 증상
입니다.

`web/` 에 빌드 도구가 없어 JS 러너를 들일 수 없으므로 소스를 읽어 확인합니다
(`test_sheet_transfer.py` 의 `renderSheet` 검사와 같은 방식입니다).
"""
from __future__ import annotations

import re
from pathlib import Path

import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]

#: `CHAT_TOPIC = "lk.chat"` (파이썬) / `const CHAT_TOPIC = 'lk.chat'` (JS·TS)
PY_TOPIC = re.compile(r"^([A-Z_]*TOPIC[A-Z_]*) = \"([^\"]+)\"", re.M)
JS_TOPIC = re.compile(r"^const ([A-Z_]*TOPIC[A-Z_]*) = '([^']+)'", re.M)

#: React 프론트는 **다른 폴더**입니다. `ai_livekit` 만 체크아웃한 환경에서는 없을 수
#: 있어서, 없으면 실패가 아니라 skip 입니다 — 그 경우 검사할 계약도 없습니다.
REACT_HOOK = REPO_ROOT.parent / "frontend" / "src" / "components" / "aiCoach" / "useCoachRoom.ts"


def _topics(path: Path, pattern: re.Pattern[str]) -> dict[str, str]:
    return dict(pattern.findall(path.read_text(encoding="utf-8")))


def server_topics() -> dict[str, str]:
    """정본. 두 파일에 나뉘어 있습니다 — `SHEET_TOPIC` 만 `sheet_transfer.py` 입니다."""
    topics = _topics(REPO_ROOT / "agent" / "entrypoint.py", PY_TOPIC)
    topics |= _topics(REPO_ROOT / "agent" / "sheet_transfer.py", PY_TOPIC)
    return topics


def test_the_server_defines_every_topic_we_expect():
    """이름이 바뀌면 아래 비교가 **양쪽 다 빠진 채로** 통과할 수 있어서 먼저 고정합니다."""
    assert server_topics() == {
        "CHAT_TOPIC": "lk.chat",
        "GOAL_TOPIC": "mandarin.goal",
        "TRANSCRIPT_TOPIC": "mandarin.transcript",
        "HELLO_TOPIC": "mandarin.hello",
        "SHEET_TOPIC": "mandarin.sheet",
    }


def test_the_plain_frontend_uses_the_same_topics():
    assert _topics(REPO_ROOT / "web" / "app.js", JS_TOPIC) == server_topics()


def test_the_react_frontend_uses_the_same_topics():
    if not REACT_HOOK.is_file():
        pytest.skip(f"React 프론트가 없습니다({REACT_HOOK}) — 검사할 계약이 없습니다")
    assert _topics(REACT_HOOK, JS_TOPIC) == server_topics()
