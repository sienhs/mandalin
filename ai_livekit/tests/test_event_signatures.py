"""LiveKit 이벤트 핸들러의 **인자 순서**를 SDK 와 맞춥니다.

이벤트는 위치 인자로 전달되고 파이썬은 타입을 검사하지 않습니다. 순서를 잘못 받으면
**예외 없이 조용히 엉뚱한 값을 씁니다** — 실제로 이렇게 터졌습니다.

    track_muted 를 (publication, participant) 로 받음
      -> publication 자리에 Participant 가 들어옴
      -> Participant 에도 `.sid` 가 있어서 AttributeError 도 안 남
      -> 참가자 sid(PA_…)를 트랙 sid(TR_…)로 알고 dict.pop 이 못 찾음
      -> 증상: "마이크를 껐는데 stt usage 가 5초마다 계속 찍힘"

로그에 에러가 없어서 찾는 데 왕복이 여러 번 걸렸습니다. **순서가 이벤트마다 다르다는
것**이 함정입니다 — `track_subscribed` 는 `(track, publication, participant)` 인데
`track_muted` 는 `(participant, publication)` 입니다.

여기서는 SDK 소스의 `self.emit(...)` 호출을 읽어 **실제 순서**를 뽑고, 우리 핸들러의
파라미터 이름이 그와 맞는지 봅니다. SDK 를 올릴 때 순서가 바뀌면 이 테스트가 먼저
깨집니다.
"""
from __future__ import annotations

import ast
import re
from pathlib import Path

import pytest
from livekit.rtc import room as room_module

import agent.entrypoint

ENTRYPOINT_PY = Path(agent.entrypoint.__file__)

#: 우리가 구독하는 이벤트와, 각 인자가 무엇이어야 하는지.
#: 값은 SDK 가 넘기는 **의미** 순서입니다 — 파라미터 이름이 이걸 따라야 합니다.
EXPECTED = {
    "track_subscribed": ("track", "publication", "participant"),
    "track_unsubscribed": ("track", "publication", "participant"),
    "track_muted": ("participant", "publication"),
    "track_unmuted": ("participant", "publication"),
}


def _sdk_emit_order(event: str) -> tuple[str, ...] | None:
    """SDK 소스에서 `self.emit("<event>", a, b, ...)` 의 인자 이름을 뽑습니다."""
    source = Path(room_module.__file__).read_text(encoding="utf-8")
    match = re.search(rf'self\.emit\(\s*"{event}"\s*,\s*([^)]+)\)', source)
    if match is None:
        return None
    return tuple(a.strip() for a in match.group(1).split(","))


def _handler_params(event: str) -> tuple[str, ...] | None:
    """`@ctx.room.on("<event>")` 로 등록된 우리 핸들러의 파라미터 이름."""
    tree = ast.parse(ENTRYPOINT_PY.read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if not isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef):
            continue
        for deco in node.decorator_list:
            if not isinstance(deco, ast.Call) or not deco.args:
                continue
            first = deco.args[0]
            if isinstance(first, ast.Constant) and first.value == event:
                return tuple(a.arg for a in node.args.args)
    return None


@pytest.mark.parametrize("event", sorted(EXPECTED))
def test_the_sdk_still_emits_the_order_we_assumed(event: str):
    """SDK 쪽 순서가 우리가 가정한 것과 같은지. 버전을 올리면 여기가 먼저 깨집니다."""
    order = _sdk_emit_order(event)
    assert order is not None, f"SDK 에서 {event} 의 emit 을 찾지 못했습니다"

    expected = EXPECTED[event]
    assert len(order) == len(expected), f"{event}: SDK 인자 개수가 {order} 로 바뀌었습니다"
    for got, want in zip(order, expected, strict=True):
        # SDK 변수명은 `rparticipant`·`remote_audio_track` 처럼 접두·접미가 붙습니다.
        assert want in got, f"{event}: {got!r} 자리에 {want!r} 를 기대했습니다 (SDK: {order})"


@pytest.mark.parametrize("event", sorted(EXPECTED))
def test_our_handler_takes_the_arguments_in_that_order(event: str):
    """우리 핸들러의 파라미터 이름이 SDK 순서와 맞는지.

    **이름을 검사하는 것이 요점입니다.** 타입 힌트는 런타임에 아무 일도 하지 않으므로
    `publication: rtc.TrackPublication` 이라고 적어두고 Participant 를 받아도 조용합니다.
    """
    params = _handler_params(event)
    assert params is not None, f"{event} 핸들러를 entrypoint.py 에서 찾지 못했습니다"

    expected = EXPECTED[event]
    assert len(params) == len(expected), (
        f"{event} 핸들러 인자 개수가 {params} 입니다 — SDK 는 {expected} 를 넘깁니다"
    )
    for got, want in zip(params, expected, strict=True):
        assert want in got, (
            f"{event}: {got!r} 자리에는 {want!r} 가 와야 합니다. "
            f"순서가 뒤바뀌면 예외 없이 조용히 엉뚱한 객체를 씁니다 (SDK 순서: {expected})"
        )
