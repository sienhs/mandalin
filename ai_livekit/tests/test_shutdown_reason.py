"""job 종료 사유 — **로그를 오독하게 두지 않습니다.**

`parent process shutdown` 은 worker 가 사유 없이 종료를 지시했을 때 라이브러리가 쓰는
기본 문자열입니다. worker 가 죽은 것처럼 읽히지만 실제로는 방이 닫혀 job 이 회수된
정상 경로가 대부분입니다 — 실관측(2026-08-06)에서 사용자 퇴장 20초 뒤 서버가
`closing idle room {reason: departure timeout}` 을 남기고 이 사유로 끝났습니다.
"""
from __future__ import annotations

from agent.entrypoint import SHUTDOWN_REASONS, shutdown_reason


def test_the_misleading_default_is_translated():
    explained = shutdown_reason("parent process shutdown")
    assert explained != "parent process shutdown"
    assert "방이 닫혔거나" in explained


def test_an_unknown_reason_passes_through():
    """라이브러리가 사유를 늘려도 삼키지 않습니다 — 모르면 원문이 낫습니다."""
    assert shutdown_reason("some new reason") == "some new reason"


def test_no_translation_is_left_empty():
    """빈 문자열로 옮겨 두면 로그에 `job 종료 — ` 만 남습니다."""
    assert all(text.strip() for text in SHUTDOWN_REASONS.values())
