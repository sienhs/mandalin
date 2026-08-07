"""파이프라인에서 가져다 쓰는 것들 — **이 파일이 유일한 통로입니다.**

목표 설계 파이프라인은 전송 계층을 모릅니다. `mandarin_goal.bot.goal` 이 끌어오는
것은 `mandarin_goal.bot.{llm,prompt,subjects}` · `mandarin_goal.config` ·
`mandarin_goal.sheet` 여섯 개뿐이고, livekit 도 fastapi 도 없습니다 (아래
`TRANSPORT_ONLY` 를 `tests/test_reuse.py` 가 검증합니다). 전송 계층을 갈아도 이
여섯 개는 그대로 쓸 수 있습니다.

    from agent.reuse import GoalPipeline, DomainRef          # ← 이렇게
    from mandarin_goal.bot.goal import GoalPipeline          # ← 이렇게 하지 마세요
"""
from __future__ import annotations

from mandarin_goal.bot.goal import (
    BLOCKED_REPLIES,
    DOMAIN_UNKNOWN_REPLY,
    OFF_TOPIC_REPLY,
    PIPELINE_MODES,
    GoalPipeline,
    GoalResult,
    escape_slot_value,
)
from mandarin_goal.bot.llm import (
    BACKENDS,
    DEMO_PROVIDERS,
    GEMINI_BASE_URL,
    EchoBackend,
    LlmError,
    LlmRateLimitedError,
    LlmTruncatedError,
    MisconfiguredBackend,
    ToolCall,
    ToolReply,
    ToolResult,
    Turn,
    build_backend,
    normalize_provider,
    supports_tools,
)
from mandarin_goal.bot.prompt import PROJECT_ROOT, SystemPrompt
from mandarin_goal.bot.subjects import FREQUENCY_LABELS, frequency_label
from mandarin_goal.config import Settings, get_settings
from mandarin_goal.sheet import (
    MAX_DOMAINS,
    MAX_SHEET_TITLE_LENGTH,
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

#: 위 목록의 반대편 — 파이프라인에 **없어야** 하는 전송 계층입니다.
#: `tests/test_reuse.py` 가 import 를 막아 검증하고, `scripts/check_reuse.py` 가
#: 진단에 씁니다. 두 곳이 갈라지지 않게 여기서 한 번만 정합니다.
TRANSPORT_ONLY = ("livekit", "fastapi", "starlette", "uvicorn", "av")

__all__ = [
    "BACKENDS",
    "BLOCKED_REPLIES",
    "DEMO_PROVIDERS",
    "DOMAIN_UNKNOWN_REPLY",
    "FREQUENCY_LABELS",
    "GEMINI_BASE_URL",
    "MAX_DOMAINS",
    "MAX_SHEET_TITLE_LENGTH",
    "OFF_TOPIC_REPLY",
    "PIPELINE_MODES",
    "REUSED_MODULES",
    "TRANSPORT_ONLY",
    "PROJECT_ROOT",
    "DomainRef",
    "EchoBackend",
    "GoalPipeline",
    "GoalResult",
    "LlmError",
    "LlmRateLimitedError",
    "LlmTruncatedError",
    "MisconfiguredBackend",
    "Settings",
    "SubjectRef",
    "SystemPrompt",
    "ToolCall",
    "ToolReply",
    "ToolResult",
    "Turn",
    "build_backend",
    "drop_untitled_domains",
    "escape_slot_value",
    "frequency_label",
    "get_settings",
    "normalize_provider",
    "supports_tools",
]
