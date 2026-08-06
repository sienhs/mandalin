"""방에 들어올 때마다 대화를 처음으로 되돌립니다.

새로고침·뒤로가기·창닫기가 모두 같은 방(`u_<userId>`)으로 돌아오고 job 은 방 단위라
살아남습니다. 지우지 않으면 AI 만 이전 대화를 기억하고 화면은 비어 있습니다.
"""
from __future__ import annotations

import ast
from pathlib import Path

import agent.entrypoint
from agent.conversation import Conversation
from agent.reuse import DomainRef, EchoBackend, GoalPipeline, Settings

ENTRYPOINT_PY = Path(agent.entrypoint.__file__)


def make_conversation() -> Conversation:
    settings = Settings(
        bot_mode="goal",
        bot_provider="echo",
        bot_system_prompt_file="./prompts/system.md",
        bot_classify_prompt_file="./prompts/classify.md",
    )
    conv = Conversation(GoalPipeline(settings, EchoBackend()), timeout_seconds=20.0)
    conv.set_domains([DomainRef(id=7, title="학습", subjectCount=1, subjects=[])])
    return conv


async def test_clearing_drops_what_the_model_would_have_read():
    conv = make_conversation()
    await conv.respond("매일 알고리즘 문제 풀고 싶어")
    assert conv._history, "발화 뒤에는 히스토리가 있어야 합니다 — 이 테스트의 전제입니다"

    conv.clear_history()
    assert conv._history == []


async def test_the_sheet_state_survives_the_reset():
    """목표·칸까지 비우면 재입장 직후의 발화가 목표도 칸도 없이 판단됩니다."""
    conv = make_conversation()
    conv.set_goal("취업하기")
    await conv.respond("매일 알고리즘 문제 풀고 싶어")

    conv.clear_history()
    assert conv._goal == "취업하기"
    # 필드 이름은 `domainId` 입니다 — `id` 는 입력 별칭일 뿐입니다(`sheet.py`).
    assert [d.domainId for d in conv._domains] == [7]


async def test_clearing_twice_is_harmless():
    """같은 identity 로 빠르게 두 번 붙으면 재입장 이벤트가 둘 납니다."""
    conv = make_conversation()
    await conv.respond("매일 알고리즘 문제 풀고 싶어")
    conv.clear_history()
    conv.clear_history()
    assert conv._history == []


def test_the_rejoin_handler_actually_clears():
    """**호출이 사라져도 에러가 안 납니다.** 드러나는 것은 "AI 가 지난 세션을 기억한다"
    뿐이라 로그에도 안 남습니다. 파일 어딘가가 아니라 그 핸들러 안을 봅니다."""
    source = ENTRYPOINT_PY.read_text(encoding="utf-8")
    handler = next(
        (
            ast.get_source_segment(source, node)
            for node in ast.walk(ast.parse(source))
            if isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef)
            and node.name == "_on_participant_connected"
        ),
        None,
    )
    assert handler is not None, "재입장 핸들러(_on_participant_connected)를 찾지 못했습니다"
    assert "clear_history()" in handler, (
        "재입장 핸들러가 clear_history() 를 부르지 않습니다 — 대화가 새로고침을 넘어 "
        "이어지고 화면만 비어 있게 됩니다"
    )
