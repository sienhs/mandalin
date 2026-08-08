"""프롬프트 로더가 **실패할 때** 어떻게 실패하는가.

`test_prompts_are_one_folder.py` 는 정본이 제자리에 있는지, 비상 문구가 안전 규칙을
들고 있는지를 봅니다. 이 파일은 그 **비상 문구에 도달하는 경로**를 봅니다 — 둘은 다른
것이고, 지금까지 뒤쪽은 한 번도 실행된 적이 없었습니다.

이 로더의 실패는 전부 조용합니다. 예외를 올리지 않고 다음 순위로 내려가는 것이 의도라
(*"프롬프트 파일 하나 때문에 봇 전체가 멈추는 것보다는 기본 인격으로라도 답하는 편이
낫습니다"*), 잘못 내려가도 증상은 **"프롬프트를 고쳤는데 반영이 안 된다"** 나
**"봇이 갑자기 멍청해졌다"** 뿐입니다. `evals/runner.py` 의 `require_prompt_dir` 이
같은 위험을 A/B 입구에서 막고 있는데(*"'B 가 나쁘다' 가 아니라 'B 폴더가 없다' 인데 두
팔의 표는 똑같이 그럴듯하게 그려집니다"*), worker 런타임 쪽은 비어 있었습니다.

우선순위가 계약입니다: **파일 > `BOT_SYSTEM_PROMPT` > `EMERGENCY`.**
"""
from __future__ import annotations

import logging

from mandarin_goal.bot.prompt import (
    EMERGENCY,
    FRAGMENT_FILES,
    PROJECT_ROOT,
    SystemPrompt,
    fragment,
)
from mandarin_goal.config import Settings

FALLBACK = "비상용 문구"


def _prompt(tmp_path, *, name: str = "p.md", cap: int | None = None) -> SystemPrompt:
    """`tmp_path` 의 파일 하나를 따라다니는 프롬프트. 파일은 아직 없습니다."""
    overrides = {} if cap is None else {"bot_system_prompt_max_chars": cap}
    return SystemPrompt(
        Settings(**overrides), file=str(tmp_path / name), fallback=FALLBACK
    )


# -- 내려가는 층 -------------------------------------------------------------


def test_a_missing_file_falls_back_instead_of_raising(tmp_path):
    """파일이 없어도 **예외를 올리지 않습니다.** 봇이 통째로 멈추면 안 됩니다."""
    assert _prompt(tmp_path).text() == FALLBACK


def test_an_unset_path_never_touches_the_disk(tmp_path):
    """설정이 비면 파일을 아예 안 봅니다 — 이 클래스를 끼워도 기존 동작 그대로."""
    prompt = SystemPrompt(Settings(), file="", fallback=FALLBACK)
    assert prompt.path is None
    assert prompt.text() == FALLBACK


def test_the_env_layer_sits_between_the_file_and_the_emergency_text(tmp_path):
    """`fallback` 을 안 주면 `BOT_SYSTEM_PROMPT` 가, 그것도 비면 `EMERGENCY` 가 온다.

    **마지막 층이 없으면 빈 프롬프트로 모델을 부르게 됩니다.**
    """
    missing = str(tmp_path / "없는파일.md")

    env = SystemPrompt(
        Settings(bot_system_prompt="환경변수 문구", bot_system_prompt_file=missing)
    )
    assert env.text() == "환경변수 문구"

    bare = SystemPrompt(Settings(bot_system_prompt="", bot_system_prompt_file=missing))
    assert bare.text() == EMERGENCY["system"]


def test_a_fragment_falls_back_to_its_own_text_not_the_system_one(tmp_path, monkeypatch):
    """조각이 사라지면 **그 조각의** 비상 문구로 내려갑니다.

    `EMERGENCY["system"]` 으로 떨어지면 정원 규칙 자리에 전체 지시문이 실립니다.
    """
    monkeypatch.setitem(
        FRAGMENT_FILES, "no_domains", str(tmp_path / "없는조각.md")
    )
    assert fragment(Settings(), "no_domains").text() == EMERGENCY["no_domains"]


# -- 파일을 따라다니는 규칙 ---------------------------------------------------


def test_a_saved_edit_lands_without_a_restart(tmp_path):
    """무재시작 반영이 이 로더의 존재 이유입니다."""
    prompt = _prompt(tmp_path)
    path = tmp_path / "p.md"

    path.write_text("첫 번째 문구", encoding="utf-8")
    assert prompt.text() == "첫 번째 문구"

    # 길이를 바꿉니다 — 키가 (mtime_ns, size) 라 같은 밀리초에 같은 길이로 덮어쓰면
    # 변경을 못 잡습니다. 그 한계는 의도된 것이고, 여기서 재려는 것이 아닙니다.
    path.write_text("두 번째로 고친 문구", encoding="utf-8")
    assert prompt.text() == "두 번째로 고친 문구"


def test_a_file_that_vanishes_keeps_the_last_good_text(tmp_path):
    """**한 번 읽은 뒤 사라지면 마지막 값을 유지합니다** — 의도적인 예외입니다.

    많은 에디터가 "임시 파일에 쓰고 이름 바꾸기" 로 저장해서 저장하는 찰나에 `stat`
    이 실패합니다. 그때 기본값으로 튕기면 사용자는 저장했을 뿐인데 봇의 인격이 잠깐
    바뀌는 걸 봅니다.
    """
    prompt = _prompt(tmp_path)
    path = tmp_path / "p.md"
    path.write_text("읽어둔 문구", encoding="utf-8")
    assert prompt.text() == "읽어둔 문구"

    path.unlink()
    assert prompt.text() == "읽어둔 문구"
    assert prompt.text() != FALLBACK


def test_an_emptied_file_means_go_back_to_the_default(tmp_path):
    """파일을 통째로 비우는 건 "기본값으로 돌려줘" 입니다.

    사라진 경우와 **갈라야 합니다** — 그쪽은 저장하는 찰나일 수 있지만 이쪽은 사용자가
    실제로 지운 것입니다. 빈 문자열을 그대로 내보내면 프롬프트 없이 모델을 부릅니다.
    """
    prompt = _prompt(tmp_path)
    path = tmp_path / "p.md"
    path.write_text("한동안 쓰던 문구", encoding="utf-8")
    assert prompt.text() == "한동안 쓰던 문구"

    path.write_text("   \n  ", encoding="utf-8")
    assert prompt.text() == FALLBACK


def test_a_file_saved_in_the_wrong_encoding_keeps_the_last_good_text(tmp_path):
    """**UTF-8 이 아닌 프롬프트 파일**은 사라진 것과 같게 다룹니다.

    이 머신에서 실제로 열리는 창입니다 — 로케일이 CP949 라 에디터가 "ANSI" 로
    저장하면 한글이 UTF-8 로 안 읽힙니다(`requirements.txt` 첫 주석이 같은 이유로
    거기 주석을 ASCII 로 못박아 뒀습니다). 이때 기본값으로 튕기면 사용자는 저장만
    했는데 봇의 인격이 바뀐 것을 봅니다.
    """
    prompt = _prompt(tmp_path)
    path = tmp_path / "p.md"
    path.write_text("제대로 저장된 문구", encoding="utf-8")
    assert prompt.text() == "제대로 저장된 문구"

    path.write_bytes("잘못 저장된 문구".encode("cp949"))
    assert prompt.text() == "제대로 저장된 문구"


def test_an_oversized_file_is_cut_not_refused(tmp_path):
    """상한을 넘으면 **자르고 경고합니다.** 거부하면 문구 하나로 봇이 멈춥니다.

    로그 파일 같은 걸 잘못 가리켰을 때 매 요청마다 통째로 실려 나가는 것을 막는
    자리입니다 — 그 비용은 발화마다 청구됩니다.
    """
    prompt = _prompt(tmp_path, cap=50)
    (tmp_path / "p.md").write_text("가" * 500, encoding="utf-8")

    text = prompt.text()
    assert len(text) == 50
    assert text == "가" * 50


def test_a_relative_path_resolves_against_the_repo_not_the_cwd(tmp_path, monkeypatch):
    """CWD 기준이면 worker 를 다른 디렉터리에서 띄웠을 때 조용히 기본값으로 떨어집니다."""
    monkeypatch.chdir(tmp_path)
    prompt = SystemPrompt(Settings(), file="./prompts/system.md", fallback=FALLBACK)

    assert prompt.path == PROJECT_ROOT / "prompts" / "system.md"
    # 딴 데서 띄워도 정본을 읽는다 — 비상 문구가 아니다.
    assert prompt.text() != FALLBACK


# -- 실패를 알리되 도배하지 않는다 --------------------------------------------
#
# 이 로더는 **모델을 부르기 직전마다** 불립니다. 경고를 그대로 두면 발화마다 같은 줄이
# 쌓여서 `worker.log` 에서 진짜 신호를 덮습니다. 반대로 아예 안 남기면 "왜 프롬프트가
# 반영이 안 되지" 를 로그에서 찾을 수 없습니다.


def test_the_same_failure_is_not_logged_every_turn(tmp_path, caplog):
    """같은 실패는 한 번만 경고합니다."""
    prompt = _prompt(tmp_path)
    with caplog.at_level(logging.WARNING, logger="mandarin_goal.bot.prompt"):
        for _ in range(5):
            prompt.text()

    assert len(caplog.records) == 1


def test_a_failure_after_a_recovery_warns_again(tmp_path, caplog):
    """읽기에 성공하면 이전 실패는 해소된 것으로 봅니다.

    표식을 안 지우면 **두 번째 고장이 조용해집니다** — 로그가 있는 이유가 사라집니다.
    """
    prompt = _prompt(tmp_path)
    path = tmp_path / "p.md"

    with caplog.at_level(logging.WARNING, logger="mandarin_goal.bot.prompt"):
        prompt.text()                                   # 1회차 실패 → 경고
        path.write_text("복구된 문구", encoding="utf-8")
        assert prompt.text() == "복구된 문구"           # 성공 → 표식 해제
        path.unlink()
        prompt.text()                                   # 다시 실패 → 다시 경고

    assert len(caplog.records) == 2
