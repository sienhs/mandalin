"""모델에게 가는 텍스트는 `prompts/` 에만 있다.

`goal.py`(1단계 폴백 · 정원 규칙 · 빈 목록 문구)나 `config.py`(chat 페르소나)에
문구를 두면, 다듬을 때 어디에 있는지부터 찾아야 하고 두 곳이 서로 다른 말을 하게
됩니다.

**이 파일이 지키는 것은 "한 폴더" 라는 사실 자체입니다.** 경로에 오타가 나거나
환경변수를 빠뜨리면 `SystemPrompt` 는 예외 없이 비상 문구로 내려갑니다(의도된
폴백입니다). 그러면 인젝션 차단 규칙이 빠진 채로 도는데 로그에도 화면에도 아무
표시가 없습니다 — 그래서 "정본에서 왔는가" 를 테스트가 확인합니다.
"""
from mandarin_goal.bot.goal import GoalPipeline
from mandarin_goal.bot.llm import EchoBackend
from mandarin_goal.bot.prompt import EMERGENCY, FRAGMENT_FILES, PROJECT_ROOT, PROMPTS_DIR
from mandarin_goal.config import Settings

#: 단계 모델을 비웁니다 — `.env` 에 `BOT_DECIDE_MODEL` 이 있으면 `_stage_backend()`
#: 가 백엔드를 새로 만들어 이 파일이 개발자의 `.env` 에 따라 흔들립니다.
SETTINGS = Settings(
    bot_mode="goal",
    bot_provider="echo",
    bot_classify_model=None,
    bot_decide_model=None,
)


def test_every_prompt_file_exists():
    """설정이 가리키는 파일이 전부 실제로 있는가."""
    paths = [
        SETTINGS.bot_system_prompt_file,
        SETTINGS.bot_classify_prompt_file,
        *FRAGMENT_FILES.values(),
    ]
    for raw in paths:
        path = PROJECT_ROOT / raw.lstrip("./")
        assert path.is_file(), f"{raw} 이 없습니다"
        # `prompts/` 밖으로 새어 나가지 않았는지도 본다.
        assert PROMPTS_DIR in path.parents, f"{raw} 이 prompts/ 밖에 있습니다"


def test_the_defaults_point_at_the_repo_so_a_missing_env_var_is_harmless():
    """**환경변수를 빠뜨려도 정본이 로드된다.**

    예전 기본값은 `None` 이었습니다 — `.env` 에서 한 줄만 빠져도 조용히 코드 내장
    프롬프트로 떨어졌고, 증상은 "인젝션 차단이 안 된다" 뿐이라 원인을 찾기 어려웠습니다.
    """
    assert SETTINGS.bot_system_prompt_file.startswith("./prompts/")
    assert SETTINGS.bot_classify_prompt_file.startswith("./prompts/")
    # 환경변수 층은 **덮어쓰기용**이라 비어 있어야 한다. 여기에 문구를 두면 정본이 둘이 된다.
    assert SETTINGS.bot_system_prompt == ""


def test_the_pipeline_reads_the_files_not_the_emergency_text():
    """네 프롬프트가 전부 파일에서 온다 — 비상 문구는 쓰이지 않는다."""
    pipeline = GoalPipeline(SETTINGS, EchoBackend())
    loaded = {
        "system": pipeline._goal_prompt.text(),
        "classify": pipeline._classify_prompt.text(),
        "domain_capacity": pipeline._capacity_rule.text(),
        "no_domains": pipeline._no_domains_note.text(),
    }
    for name, text in loaded.items():
        assert text, f"{name} 프롬프트가 비었습니다"
        assert text != EMERGENCY[name], (
            f"{name} 이 비상 문구로 떨어졌습니다 — 경로가 어긋났을 수 있습니다"
        )


def test_the_emergency_text_still_carries_the_safety_rules():
    """비상 문구는 짧아도 **안전 규칙은 들고 있어야** 한다.

    비상 문구가 쓰이는 상황은 저장소가 깨진 때입니다. 그때 인젝션·유해 발화 차단이
    함께 사라지면, 품질이 아니라 안전이 내려갑니다. 예전 코드 폴백에는
    `injection`·`harmful` 이 아예 없었습니다(스키마는 허용하는데 프롬프트가 모름).
    """
    for name in ("system", "classify"):
        assert "injection" in EMERGENCY[name], f"EMERGENCY[{name}] 에 인젝션 규칙이 없습니다"
        assert "harmful" in EMERGENCY[name], f"EMERGENCY[{name}] 에 유해 발화 규칙이 없습니다"
    # 칸을 지어내지 않는다는 규칙도 안전 쪽이다 — 사용자 만다라트에 없는 칸이 생긴다.
    assert "새 칸을 지어내지" in EMERGENCY["system"]


#: 각 프롬프트가 받는 슬롯. `goal.py` 의 `fill_slots(...)` 호출부와 같아야 합니다 —
#: 테스트가 계약을 **독립적으로** 다시 적는 자리라 일부러 복사해 둡니다.
SLOTS = {
    "bot_system_prompt_file": (
        "domain_list",
        "existing_domain_tasks",
        "existing_subjects",
        "user_utterance",
    ),
    "bot_classify_prompt_file": ("domain_list",),
}


def test_every_slot_is_filled_where_the_data_actually_goes():
    """**`fill_slots` 는 첫 일치만 갈아끼웁니다**(`goal.py` 의 `pattern.search`).

    그래서 프롬프트 본문에서 슬롯 이름을 언급할 때는 `&lt;domain_list&gt;` 처럼
    이스케이프해야 합니다. 안 하면 그 언급이 채워지고 `<context>` 의 진짜 슬롯은
    `{{설명}}` 플레이스홀더 그대로 모델에게 갑니다 — 에러도 로그도 없고 증상은
    "칸 이름을 못 알아본다" 뿐입니다.

    모양이 아니라 **실제로 채워 보고** 검사합니다. 남은 `{{` 가 곧 안 채워진 슬롯입니다.
    """
    from mandarin_goal.bot.goal import fill_slots

    for setting, tags in SLOTS.items():
        path = PROJECT_ROOT / getattr(SETTINGS, setting).lstrip("./")
        filled = fill_slots(
            path.read_text(encoding="utf-8"), {tag: f"__{tag}__" for tag in tags}
        )
        for tag in tags:
            assert filled.count(f"__{tag}__") == 1, (
                f"{path.name} 의 <{tag}> 슬롯이 한 자리에 들어가지 않았습니다"
            )
        assert "{{" not in filled, (
            f"{path.name} 에 안 채워진 슬롯이 남았습니다 — 본문의 슬롯 언급을 "
            "이스케이프하지 않아 그쪽이 먼저 채워졌을 수 있습니다"
        )
