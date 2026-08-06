"""대화 규율 — 전송 방식과 무관한 부분.

`echo` 백엔드라 네트워크도 키도 필요 없고, `livekit.agents` 도 import 하지 않습니다.
"""
from __future__ import annotations

import asyncio

from agent.conversation import FAILURE_REPLY, TIMEOUT_REPLY, Conversation
from agent.reuse import DomainRef, EchoBackend, GoalPipeline, Settings


def make_conversation(*, timeout: float = 20.0) -> Conversation:
    settings = Settings(
        bot_mode="goal",
        bot_provider="echo",
        bot_system_prompt_file="./prompts/system.md",
        bot_classify_prompt_file="./prompts/classify.md",
    )
    conv = Conversation(GoalPipeline(settings, EchoBackend()), timeout_seconds=timeout)
    conv.set_domains([DomainRef(id=7, title="학습", subjectCount=1, subjects=[])])
    return conv


async def test_an_utterance_gets_a_reply_and_a_structured_result():
    conv = make_conversation()
    reply, result = await conv.respond("매일 알고리즘 문제 풀고 싶어")
    assert reply
    assert result is not None
    assert result.stages == ["classify", "retrieve", "decide"]
    # 서버가 채우는 필드가 채워져야 프론트가 담기 버튼을 그릴 수 있습니다.
    assert result.data["domain_id"] == 7


async def test_the_structured_result_never_carries_reasoning():
    """`public_data()` 를 거치지 않은 dict 를 내보내면 안 됩니다.

    `reasoning` 은 프롬프트에 "사용자에게 노출하지 않음" 이라고 적힌 필드입니다.
    `entrypoint.py` 가 `result.data` 를 그대로 토픽으로 내려보내므로 여기서 지킵니다.
    """
    conv = make_conversation()
    _, result = await conv.respond("매일 알고리즘 문제 풀고 싶어")
    assert result is not None
    assert "reasoning" not in result.data


async def test_blank_input_is_ignored():
    conv = make_conversation()
    assert await conv.respond("   ") == ("", None)
    assert await conv.respond("") == ("", None)


async def test_a_turn_arriving_mid_generation_is_dropped_not_queued():
    """쌓아두면 한참 뒤에 답변이 몰려 나와 대화 흐름이 깨집니다.

    **버리는 것이 기능입니다.** 호출하는 쪽은 빈 문자열을 받아 아무것도 보내지
    않습니다.
    """
    conv = make_conversation()
    started = asyncio.Event()
    release = asyncio.Event()

    original = conv._pipeline.run

    # **`goal` 을 받아야 합니다.** `Conversation` 이 최종목표를 키워드로 함께 넘기므로
    # (`set_goal` → `run(..., goal=...)`), 빼면 TypeError 가 광범위 except 에 먹혀
    # `started` 가 세팅되지 않고 이 테스트가 **멈춥니다**(실패가 아니라 교착).
    async def slow(history, domains, *, goal=None):
        started.set()
        await release.wait()
        return await original(history, domains, goal=goal)

    conv._pipeline.run = slow  # type: ignore[method-assign]

    first = asyncio.create_task(conv.respond("첫 발화"))
    await started.wait()
    assert conv._lock.locked()
    dropped = await conv.respond("생성 중에 들어온 발화")
    assert dropped == ("", None)

    release.set()
    reply, _ = await first
    assert reply


async def test_busy_says_when_the_utterance_would_be_dropped():
    """`listen.py` 가 이 값을 보고 STT 스트림을 닫습니다 — 버릴 오디오는 전사하지
    않습니다. 그래서 `busy` 는 **발화가 버려지는 구간과 정확히 같아야** 합니다.
    """
    conv = make_conversation()
    started = asyncio.Event()
    release = asyncio.Event()

    original = conv._pipeline.run

    async def slow(history, domains, *, goal=None):
        started.set()
        await release.wait()
        return await original(history, domains, goal=goal)

    conv._pipeline.run = slow  # type: ignore[method-assign]

    assert not conv.busy
    first = asyncio.create_task(conv.respond("첫 발화"))
    await started.wait()
    assert conv.busy
    assert await conv.respond("이건 버려집니다") == ("", None)

    release.set()
    await first
    assert not conv.busy


async def test_a_timeout_still_says_something():
    """침묵하면 사용자는 AI 가 죽었는지 생각 중인지 알 수 없습니다."""
    conv = make_conversation(timeout=0.01)

    async def never(history, domains, *, goal=None):
        await asyncio.sleep(10)

    conv._pipeline.run = never  # type: ignore[method-assign]
    reply, result = await conv.respond("느린 발화")
    assert reply == TIMEOUT_REPLY
    assert result is None


async def test_a_crash_still_says_something():
    conv = make_conversation()

    async def boom(history, domains, *, goal=None):
        raise RuntimeError("파이프라인 폭발")

    conv._pipeline.run = boom  # type: ignore[method-assign]
    reply, result = await conv.respond("발화")
    assert reply == FAILURE_REPLY
    assert result is None


async def test_a_failure_does_not_poison_the_next_turn():
    """실패 응답을 히스토리에 그대로 남기면 모델이 자기 오류 메시지를 맥락으로 읽습니다."""
    conv = make_conversation()

    async def boom(history, domains, *, goal=None):
        raise RuntimeError("일시 실패")

    original = conv._pipeline.run
    conv._pipeline.run = boom  # type: ignore[method-assign]
    await conv.respond("첫 발화")
    conv._pipeline.run = original  # type: ignore[method-assign]

    reply, result = await conv.respond("두 번째 발화")
    assert reply and result is not None
    assert not any("파이프라인" in t.text for t in conv._history)


async def test_history_is_capped():
    """길어지면 매 발화마다 프롬프트가 커지고 그 비용이 계속 청구됩니다."""
    from agent.conversation import DEFAULT_HISTORY_TURNS

    conv = make_conversation()
    for i in range(DEFAULT_HISTORY_TURNS):
        await conv.respond(f"발화 {i}")
    assert len(conv._history) <= DEFAULT_HISTORY_TURNS


async def test_replacing_the_sheet_is_reflected_in_the_cell_judgment():
    """담기·삭제로 시트가 바뀌면 통째로 갈아끼웁니다.

    **`set_domains` 가 실제로 무엇을 바꾸는지**를 봅니다. 시트는 `_mark_new_domain`
    이 "이 칸이 새로 생기는가" 를 판단하는 근거이고, 그 판단은 모델이 아니라 서버가
    합니다 — 갈아끼운 시트가 반영되지 않으면 이미 있는 칸이 하나 더 생깁니다.

    `echo` 는 입력과 무관하게 1단계에서 `학습` 을 냅니다(3단계는 칸을 비웁니다).
    그래서 시트에 `학습` 이 어떤 id 로 있는지, 아예 없는지가 그대로 드러납니다.
    """
    conv = make_conversation()  # 시트: 학습(id=7)
    _, existing = await conv.respond("매일 알고리즘 문제 풀고 싶어")
    assert existing is not None
    assert existing.data["domain_is_new"] is False
    assert existing.data["domain_id"] == 7

    # 같은 이름 다른 id 로 갈아끼웁니다 — 갈아끼운 시트를 보고 있다는 증거입니다.
    conv.set_domains([DomainRef(id=42, title="학습", subjectCount=1, subjects=[])])
    _, moved = await conv.respond("주 1회 블로그 정리하고 싶어")
    assert moved is not None
    assert moved.data["domain_id"] == 42

    # `학습` 이 없는 시트로 갈아끼웁니다. **1단계 힌트로는 칸을 만들 수 없습니다** —
    # 그 값은 후보 검색의 가점 전용이라 검증하지 않는 값이고, 그걸로 빈 칸을 메우면
    # 검색 힌트가 `domain_is_new` 를 달고 실제 칸이 됩니다(`_settle_domain`).
    conv.set_domains([DomainRef(id=99, title="덕질", subjectCount=0, subjects=[])])
    _, fresh = await conv.respond("주 1회 굿즈 정리하고 싶어")
    assert fresh is not None
    assert "domain_is_new" not in fresh.data
    assert "domain_id" not in fresh.data


#: 여기 있던 `test_a_hostile_display_name_does_not_break_the_turn` 은 지웠습니다.
#: 표시 이름이 프롬프트에 닿는 경로(`Turn.speaker`)가 없어져서 위조할 대상이 없습니다 —
#: 대신 접두가 되살아나는 것을 `tests/test_reuse.py` 의
#: `test_the_user_turn_reaches_the_model_verbatim` 이 막습니다.


async def test_an_llm_error_is_shown_to_the_user_not_swallowed():
    """**`LlmError` 는 원인을 그대로 보여줍니다.**

    그 예외의 docstring 이 "방에 그대로 노출해도 되는 실패 … 키 오류·할당량 초과·안전 필터
    차단 등은 사용자가 봐야 원인을 알 수 있으므로" 라고 적어 둔 계약입니다.

    일반 `Exception` 으로 뭉개고 "다시 말씀해 주세요" 를 돌려주면,
    **키가 비었거나 할당량이 끝난 경우 그건 거짓말입니다** — 몇 번 말해도 안 됩니다.
    """
    from agent.conversation import LLM_FAILURE_PREFIX
    from agent.reuse import LlmError

    conv = make_conversation()

    async def boom(history, domains, *, goal=None):
        raise LlmError("gemini 429: 할당량을 초과했습니다")

    conv._pipeline.run = boom  # type: ignore[method-assign]
    reply, result = await conv.respond("발화")

    assert LLM_FAILURE_PREFIX in reply
    assert "429" in reply and "할당량" in reply
    assert result is None
    assert reply != FAILURE_REPLY, "일반 실패 문구로 뭉개면 원인이 사라집니다"


async def test_an_unexpected_exception_still_uses_the_generic_reply():
    """`LlmError` 가 아닌 것은 사용자에게 보여줄 값이 없습니다 — 내부 오류 문구가 새면 안 됩니다."""
    conv = make_conversation()

    async def boom(history, domains, *, goal=None):
        raise RuntimeError("내부 자료구조가 깨졌습니다 /srv/app/... 스택 정보")

    conv._pipeline.run = boom  # type: ignore[method-assign]
    reply, _ = await conv.respond("발화")

    assert reply == FAILURE_REPLY
    assert "내부 자료구조" not in reply


async def test_the_final_goal_reaches_the_pipeline():
    """`set_goal` 로 받은 최종목표가 판단 단계까지 간다.

    **이게 없으면 증상이 "AI 가 최종목표를 모른다" 뿐입니다** — 시트는 잘 들어오고
    칸·과제는 맞는데 중심 목표만 최근 발화로 오인합니다. 프롬프트 규칙 2가 이 값에
    매달려 있으므로(`<final_goal>`), 배선이 끊기면 규칙이 조용히 근거를 잃습니다.
    """
    conv = make_conversation()
    seen: list[str | None] = []
    original = conv._pipeline.run

    async def spy(history, domains, *, goal=None):
        seen.append(goal)
        return await original(history, domains, goal=goal)

    conv._pipeline.run = spy  # type: ignore[method-assign]

    conv.set_goal("올해 안에 10kg 빼기")
    await conv.respond("운동 뭐부터 할까")
    assert seen == ["올해 안에 10kg 빼기"]

    # 갈아끼우면 다음 턴부터 새 목표다 — 편집기에서 고치고 돌아온 경우.
    conv.set_goal("정보처리기사 취득")
    await conv.respond("공부 계획 짜줘")
    assert seen[-1] == "정보처리기사 취득"

    # 빈 문자열·공백은 **없는 것**이다. 그때는 모델이 첫 목표 발화를 중심 목표로 쓴다.
    conv.set_goal("   ")
    await conv.respond("또 뭐 할까")
    assert seen[-1] is None
