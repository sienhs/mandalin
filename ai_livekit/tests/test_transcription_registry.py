"""전사 태스크 레지스트리 — mute/unmute 반복에서 새는 곳.

**이 파일이 존재하는 이유가 발견 순서입니다.** 이 영역에서 세 번 연속 버그가 났고
(플러그인 import 위치 · 이벤트 인자 순서 · 완료 콜백 경합) 셋 다 **예외 없이 조용히**
빗나갔습니다. 증상은 매번 "마이크를 껐는데 stt usage 가 계속 찍힘" 하나였습니다.

엔트리포인트 클로저의 dict 로는 이걸 테스트할 수 없어서 밖으로 뺐습니다.
"""
from __future__ import annotations

import asyncio

from agent.listen import TranscriptionRegistry


async def _forever() -> None:
    await asyncio.Event().wait()


async def test_start_registers_and_stop_cancels():
    reg = TranscriptionRegistry()
    assert reg.start("TR_a", _forever) is True
    assert reg.tracked == ["TR_a"]

    assert reg.stop("TR_a") is True
    assert reg.tracked == []


async def test_starting_twice_is_refused():
    """중복 시작을 막지 않으면 같은 트랙에 STT 연결이 두 개 열려 **과금이 두 배**입니다."""
    reg = TranscriptionRegistry()
    assert reg.start("TR_a", _forever) is True
    assert reg.start("TR_a", _forever) is False
    assert reg.tracked == ["TR_a"]
    await reg.aclose()


async def test_stopping_something_untracked_reports_false():
    """호출하는 쪽이 경고를 남길 수 있어야 합니다 — 조용히 넘기면 버그가 숨습니다."""
    reg = TranscriptionRegistry()
    assert reg.stop("TR_nope") is False


async def test_a_finished_task_does_not_evict_its_replacement():
    """**핵심 회귀 테스트.** mute 직후 unmute 하는 순서를 재현합니다.

    취소한 태스크의 완료 콜백은 취소가 실제로 끝난 뒤에 불립니다. 그 사이에 같은 sid 로
    새 태스크가 등록되면, 옛 콜백이 무조건 `pop` 할 경우 **새 태스크가 추적 목록에서
    사라집니다.** 그러면 다음 mute 가 대상을 못 찾고 전사가 계속 돌아 과금이 멈추지
    않습니다 — 앞서 고쳤다고 생각한 버그가 이 경로로 되살아납니다.
    """
    reg = TranscriptionRegistry()

    reg.start("TR_a", _forever)  # 마이크 켜짐
    # **`stop()` 이어야 합니다 — `aclose()` 를 쓰면 취소 완료를 기다려 버려서 경합이
    # 재현되지 않습니다.** 재현의 조건이 "취소 요청만 하고 아직 안 끝난 상태" 입니다.
    reg.stop("TR_a")  # mute
    reg.start("TR_a", _forever)  # unmute — 같은 sid 로 새 태스크
    assert reg.tracked == ["TR_a"]

    # 옛 태스크의 취소가 이제 완료되고 완료 콜백이 불립니다.
    await asyncio.sleep(0)
    await asyncio.sleep(0)

    assert reg.tracked == ["TR_a"], "옛 태스크의 콜백이 새 태스크를 지웠습니다"
    # 그리고 새 태스크는 여전히 멈출 수 있어야 합니다.
    assert reg.stop("TR_a") is True
    await reg.aclose()


async def test_a_task_that_ends_on_its_own_is_forgotten():
    """트랙이 끊겨 `run()` 이 스스로 끝난 경우. 죽은 항목이 남으면 재시작이 막힙니다."""
    reg = TranscriptionRegistry()

    async def immediate() -> None:
        return

    reg.start("TR_a", immediate)
    for _ in range(5):
        await asyncio.sleep(0)

    assert reg.tracked == []
    # 다시 시작할 수 있어야 합니다 — 죽은 항목이 남아 있으면 여기서 False 가 납니다.
    assert reg.start("TR_a", _forever) is True
    await reg.aclose()


async def test_many_mute_unmute_cycles_do_not_leak():
    """마이크를 빠르게 켜고 끄는 실제 사용 패턴. 항목이 쌓이면 안 됩니다."""
    reg = TranscriptionRegistry()
    for _ in range(20):
        reg.start("TR_a", _forever)
        reg.stop("TR_a")
        await asyncio.sleep(0)

    assert reg.tracked == []
    await reg.aclose()
