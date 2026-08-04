"""방 하나에 **사용자 1명 + 에이전트 1개** 라는 전제를 지킵니다.

이 전제를 만드는 것은 백엔드입니다(방 이름 `u_<userId>`, identity = userId). 그래서 이
저장소의 방어층은 **지금 아무 트래픽도 막지 않습니다** — 도달할 수 없는 경로입니다.
그런 코드가 가장 조용히 사라집니다. "안 쓰는 것 같은데" 로 지워도 테스트도 서버도
브라우저도 초록불이고, 대가는 백엔드의 방 이름 규칙이 바뀌는 날에 치릅니다 —

    AI 가 남의 말에 답한다 / 내 시트가 남의 것으로 바뀐다 / 말하지 않은 STT 과금

전부 예외 없이 품질·요금으로만 드러나는 종류입니다(HANDOFF 2절과 같은 부류).

그래서 문구가 아니라 **구조**를 봅니다 — 어느 핸들러가 대조를 부르는지, 구독 범위가
무엇인지, 서버 설정에 상한이 있는지. `test_event_signatures.py` 와 같은 방식입니다.
"""
from __future__ import annotations

import ast
import logging
from pathlib import Path

import pytest
import yaml

import agent.entrypoint
from agent.entrypoint import sender_is_the_user

ENTRYPOINT_PY = Path(agent.entrypoint.__file__)
LIVEKIT_YAML = Path(__file__).resolve().parents[1] / "livekit.yaml"

#: 방 밖에서 온 것을 버려야 하는 인바운드 경로.
#:
#: 앞의 둘은 텍스트 스트림 핸들러(함수 이름으로 찾습니다), 뒤의 넷은 `@ctx.room.on(...)`
#: 이벤트 핸들러(데코레이터로 찾습니다 — 함수 이름이 바뀌어도 따라갑니다).
GUARDED_STREAM_HANDLERS = ("on_chat", "on_sheet")
GUARDED_ROOM_EVENTS = (
    "track_subscribed",
    "track_unmuted",
    "track_muted",
    "track_unsubscribed",
)


def _source() -> str:
    return ENTRYPOINT_PY.read_text(encoding="utf-8")


def _function_source(name: str) -> str | None:
    """중첩 함수도 찾습니다 — 이 파일의 핸들러는 `entrypoint()` 안에 있습니다."""
    source = _source()
    for node in ast.walk(ast.parse(source)):
        if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef) and node.name == name:
            return ast.get_source_segment(source, node)
    return None


def _room_event_handler_source(event: str) -> str | None:
    """`@ctx.room.on("<event>")` 로 등록된 핸들러의 소스."""
    source = _source()
    for node in ast.walk(ast.parse(source)):
        if not isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef):
            continue
        for deco in node.decorator_list:
            if not isinstance(deco, ast.Call) or not deco.args:
                continue
            first = deco.args[0]
            if isinstance(first, ast.Constant) and first.value == event:
                return ast.get_source_segment(source, node)
    return None


# -- 대조 함수 자체 ---------------------------------------------------------


def test_the_user_passes_and_a_stranger_does_not():
    assert sender_is_the_user("u_42", "u_42", "발화") is True
    assert sender_is_the_user("u_43", "u_42", "발화") is False


def test_a_stranger_leaves_a_trace(caplog: pytest.LogCaptureFixture):
    """**조용히 버리면 안 됩니다.**

    버리는 것은 맞지만, 로그가 없으면 "AI 가 반응을 안 한다" 만 남고 원인이 사라집니다.
    경고에 두 identity 가 다 들어가야 어느 쪽이 침입인지 알 수 있습니다.
    """
    with caplog.at_level(logging.WARNING, logger="mandarin.agent"):
        sender_is_the_user("u_43", "u_42", "시트")

    assert len(caplog.records) == 1
    message = caplog.records[0].getMessage()
    assert "u_43" in message and "u_42" in message and "시트" in message


def test_the_user_is_not_logged_about(caplog: pytest.LogCaptureFixture):
    """정상 경로는 아무것도 남기지 않습니다 — 발화마다 찍히면 로그가 못 쓰게 됩니다."""
    with caplog.at_level(logging.WARNING, logger="mandarin.agent"):
        sender_is_the_user("u_42", "u_42", "발화")

    assert caplog.records == []


# -- 배선 -------------------------------------------------------------------


@pytest.mark.parametrize("name", GUARDED_STREAM_HANDLERS)
def test_every_text_topic_checks_the_sender(name: str):
    body = _function_source(name)
    assert body is not None, f"{name} 핸들러를 찾지 못했습니다"
    assert "sender_is_the_user" in body, (
        f"{name} 이 발신자를 대조하지 않습니다 — 남이 보낸 발화·시트가 그대로 들어갑니다"
    )


@pytest.mark.parametrize("event", GUARDED_ROOM_EVENTS)
def test_every_audio_event_checks_the_sender(event: str):
    """**오디오는 과금이 붙습니다.** 시작 경로만 막아도 부족합니다 —

    시작(`track_subscribed`·`track_unmuted`)을 막으면 남의 트랙은 추적 목록에 없고,
    그 상태에서 중지(`track_muted`·`track_unsubscribed`)가 통과하면
    `stop_transcribing` 이 "해당 track 이 없습니다" 경고를 냅니다. 그 경고는 인자 순서
    버그를 잡으려고 둔 것이라(HANDOFF 2절) 가짜를 섞으면 다음 진단이 막힙니다.
    """
    body = _room_event_handler_source(event)
    assert body is not None, f"{event} 핸들러를 찾지 못했습니다"
    assert "sender_is_the_user" in body, f"{event} 이 발신자를 대조하지 않습니다"


def _ctx_connect_kwargs() -> dict[str, str] | None:
    """`ctx.connect(...)` 에 실제로 넘기는 키워드 인자.

    **소스에 문자열이 있는지로 검사하면 안 됩니다** — 모듈 주석에도 같은 이름이 적혀
    있어서, 호출에서 빼고 설명만 남겨도 통과합니다. 이 파일을 쓰면서 실제로 그렇게
    새는 것을 확인했습니다(변조 검사에서 드러났습니다).
    """
    source = _source()
    for node in ast.walk(ast.parse(source)):
        if (
            isinstance(node, ast.Call)
            and isinstance(node.func, ast.Attribute)
            and node.func.attr == "connect"
            and isinstance(node.func.value, ast.Name)
            and node.func.value.id == "ctx"
        ):
            return {kw.arg: ast.unparse(kw.value) for kw in node.keywords if kw.arg}
    return None


def test_only_audio_is_subscribed():
    """비디오는 쓰지 않으므로 받지 않습니다.

    기본값 `SUBSCRIBE_ALL` 로 돌아가면 누가 비디오를 올리는 순간 대역폭과 CPU 를
    쓰는데, 이 에이전트가 그 트랙으로 하는 일은 없습니다(`track_subscribed` 가
    오디오가 아니면 바로 돌아갑니다).
    """
    kwargs = _ctx_connect_kwargs()
    assert kwargs is not None, "ctx.connect(...) 호출을 찾지 못했습니다"
    assert kwargs.get("auto_subscribe") == "AutoSubscribe.AUDIO_ONLY", (
        f"ctx.connect 의 auto_subscribe 가 {kwargs.get('auto_subscribe')!r} 입니다 — "
        "오디오만 구독해야 합니다"
    )


# -- 서버 설정 ---------------------------------------------------------------


def test_the_server_caps_the_room_at_two_participants():
    """`max_participants: 2` — 사용자 + 에이전트.

    **문자열이 아니라 파싱해서 봅니다.** 들여쓰기를 잘못 넣으면 LiveKit 이 키를 조용히
    무시하고 상한이 사라지는데, grep 은 그걸 통과시킵니다.

    1 이면 사용자가 있는 방에 에이전트가 못 들어옵니다(`hidden=False` 라 참가자로
    세어집니다). 증상은 "브라우저는 붙는데 AI 만 안 들어옴" 입니다.
    """
    config = yaml.safe_load(LIVEKIT_YAML.read_text(encoding="utf-8"))
    room = config.get("room")
    assert isinstance(room, dict), "livekit.yaml 에 room 절이 없습니다"
    assert room.get("max_participants") == 2, (
        f"max_participants 가 {room.get('max_participants')!r} 입니다 — "
        "사용자 1명 + 에이전트 1개라 2 여야 합니다"
    )
