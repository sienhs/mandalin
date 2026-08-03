"""파이프라인에서 가져다 쓰는 것들 — **이 파일이 유일한 통로입니다.**

목표 설계 파이프라인은 전송 계층을 모릅니다. `mandarin_goal.bot.goal` 이 끌어오는
것은 `mandarin_goal.bot.{llm,prompt,subjects}` · `mandarin_goal.config` ·
`mandarin_goal.sheet` 여섯 개뿐이고, aiortc 도 fastapi 도 livekit 도 없습니다
(`tests/test_reuse.py` 가 확인합니다). SFU 를 LiveKit 으로 갈아치우면서도 이 여섯
개를 그대로 쓸 수 있었던 이유입니다.

**`../ai` 의존은 끝났습니다.** 예전에는 `pip install -e ../ai --no-deps` 로 옆
폴더의 `app` 패키지를 참조했습니다. 지금은 여섯 파일이 `mandarin_goal/` 로,
프롬프트가 `prompts/` 로 들어와 **이 저장소만으로 돕니다.** 옆 폴더가 없어도,
이름이 바뀌어도, 통째로 사라져도 worker 는 뜹니다.

**왜 통로를 그대로 두는가.** 승격 전에도 후에도 이유는 같습니다 — 파이프라인
패키지를 다시 옮기거나(공용 라이브러리로 배포, 이름 변경) 다른 구현으로 갈아끼울
때 고칠 곳이 **이 파일 하나**여야 합니다. 새 코드에서 `mandarin_goal.` 을 직접
import 하지 마세요.

    from agent.reuse import GoalPipeline, DomainRef          # ← 이렇게
    from mandarin_goal.bot.goal import GoalPipeline          # ← 이렇게 하지 마세요

**프롬프트는 `ai_livekit/prompts/` 입니다.** `mandarin_goal.bot.prompt` 의
`PROJECT_ROOT` 가 `Path(__file__).parents[2]` 라서 상대 경로가 이 저장소 루트
기준으로 풀립니다 — `.env` 의 `BOT_SYSTEM_PROMPT_FILE=./prompts/system.md` 는
`ai_livekit/prompts/system.md` 입니다(예전에는 `../ai/prompts/` 였습니다).
"""
from __future__ import annotations

from mandarin_goal.bot.goal import (
    BLOCKED_REPLIES,
    DOMAIN_UNKNOWN_REPLY,
    OFF_TOPIC_REPLY,
    GoalPipeline,
    GoalResult,
    escape_slot_value,
)
from mandarin_goal.bot.llm import (
    EchoBackend,
    LlmError,
    LlmTruncatedError,
    Turn,
    build_backend,
)
from mandarin_goal.bot.prompt import PROJECT_ROOT, SystemPrompt
from mandarin_goal.bot.subjects import FREQUENCY_LABELS, frequency_label
from mandarin_goal.config import Settings, get_settings
from mandarin_goal.sheet import (
    MAX_DOMAINS,
    DomainRef,
    SubjectRef,
    drop_untitled_domains,
)

#: 파이프라인 모듈 목록. `tests/test_reuse.py` 가 이 값을 보고 검사하므로,
#: 위 import 를 늘리면 여기도 같이 늘리세요.
REUSED_MODULES = (
    "mandarin_goal.bot.goal",
    "mandarin_goal.bot.llm",
    "mandarin_goal.bot.prompt",
    "mandarin_goal.bot.subjects",
    "mandarin_goal.config",
    "mandarin_goal.sheet",
)

__all__ = [
    "BLOCKED_REPLIES",
    "DOMAIN_UNKNOWN_REPLY",
    "FREQUENCY_LABELS",
    "MAX_DOMAINS",
    "OFF_TOPIC_REPLY",
    "REUSED_MODULES",
    "PROJECT_ROOT",
    "DomainRef",
    "EchoBackend",
    "GoalPipeline",
    "GoalResult",
    "LlmError",
    "LlmTruncatedError",
    "Settings",
    "SubjectRef",
    "SystemPrompt",
    "Turn",
    "build_backend",
    "drop_untitled_domains",
    "escape_slot_value",
    "frequency_label",
    "get_settings",
]
