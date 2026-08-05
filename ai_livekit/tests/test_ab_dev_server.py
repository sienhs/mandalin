"""브라우저가 A/B 를 누를 때의 **배선**.

`/eval` 은 A/B 를 두 리포트가 아니라 하나의 실행으로 봅니다 — 폴링하던 상태에 비교표와
두 팔의 리포트가 같이 실려 옵니다. 그 자리에서 조용히 틀릴 수 있는 것이 두 가지입니다.

① **어느 팔이 아래 카드에 뜨는가.** A 를 띄워 놓고 B 라고 믿으면 새 프롬프트를 고치는
   동안 옛 프롬프트의 실패 목록을 봅니다. 화면에는 아무 표시가 없습니다.
② **재실행이 무엇을 기준으로 도는가.** 팔이 `_RUNS` 에 등록되지 않으면 "골라서 다시
   돌리기" 가 기준을 못 찾고, 등록됐지만 뒤바뀌면 다른 팔의 실패를 돌립니다.

**API 도 LiveKit 도 부르지 않습니다.** `run_eval` 을 즉시 끝나는 것으로 바꿔서 배선만
태웁니다(진짜로 돌리면 골든셋 두 바퀴에 몇십 분이 걸립니다).
"""
from __future__ import annotations

import importlib.util
import time
from pathlib import Path

import pytest

from tests.test_ab_compare import case, report

ROOT = Path(__file__).resolve().parents[1]


@pytest.fixture(scope="module")
def dev_server():
    """`scripts/dev_server.py` 는 패키지가 아니라 스크립트라 경로로 읽어 옵니다.

    `sys.path` 에 `scripts/` 를 끼워 넣지 않는 이유는, 거기 있는 다른 파일 이름이
    테스트 import 와 부딪히면 원인을 찾기 어려운 종류의 사고가 되기 때문입니다.
    """
    spec = importlib.util.spec_from_file_location(
        "dev_server_under_test", ROOT / "scripts" / "dev_server.py"
    )
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


@pytest.fixture(autouse=True)
def _no_folder_check(monkeypatch):
    """폴더 존재 검사를 끕니다.

    이 파일이 재는 것은 **배선**이고, 배선을 재려면 두 팔의 폴더 이름이 달라야 합니다
    (같으면 어느 팔이 화면에 떴는지 구분할 수 없습니다). 저장소에는 `prompts` 하나뿐이라
    없는 이름을 씁니다 — 검사 자체는 `test_ab_compare.py` 가 따로 지킵니다.
    """
    import evals.runner as runner

    monkeypatch.setattr(runner, "require_prompt_dir", lambda _dir: None)


@pytest.fixture
def instant_eval(monkeypatch):
    """`run_eval` 을 즉시 끝나는 것으로 바꿉니다. 폴더 이름은 리포트에 그대로 실립니다."""
    import evals.runner as runner

    def fake(*, prompt_dir, **kw):
        rows = [case("g01", ok=True), case("g02", ok=prompt_dir.endswith("v2"))]
        return report(rows, prompt_dir=prompt_dir)

    monkeypatch.setattr(runner, "run_eval", fake)
    # 디스크에 쓰지 않습니다. `save_ab` 는 기록을 돌려주는 계약이라 그것만 지킵니다 —
    # 여기서 진짜로 쓰면 개발자의 `evals/ab_history/` 에 테스트 결과가 쌓입니다.
    monkeypatch.setattr(runner, "save_ab", lambda result, **kw: runner.ab_record(result))
    return fake


def wait(state: dict, seconds: float = 10.0) -> dict:
    deadline = time.monotonic() + seconds
    while not state["finished"] and time.monotonic() < deadline:
        time.sleep(0.02)
    assert state["finished"], "A/B 가 끝나지 않았습니다"
    return state


def test_the_ab_run_lands_the_new_arm_in_the_report_slot(dev_server, instant_eval):
    """①의 회귀 테스트 — 아래 카드에 뜨는 것은 **B**(새 폴더)다."""
    state = wait(dev_server._start_eval(
        {"mode": "ab", "prompt_dir": "prompts", "prompt_dir_b": "prompts_v2", "repeat": 1}
    ))

    assert state["error"] is None
    assert state["report"]["meta"]["prompt_dir"] == "prompts_v2", "A 를 띄워 놓고 있습니다"
    assert state["ab"]["compare"]["arms"]["a"]["prompt_dir"] == "prompts"
    assert state["ab"]["compare"]["arms"]["b"]["prompt_dir"] == "prompts_v2"
    # 진행 중 표시가 마지막 팔에서 멈춰 있어야 합니다(화면이 "B (prompts_v2)" 로 씁니다).
    assert state["arm"] == "B (prompts_v2)"


def test_each_arm_is_registered_so_the_rerun_can_target_it(dev_server, instant_eval):
    """②의 회귀 테스트 — 두 팔이 각자 실행으로 남고, 재실행이 그 팔을 기준으로 돈다."""
    state = wait(dev_server._start_eval(
        {"mode": "ab", "prompt_dir": "prompts", "prompt_dir_b": "prompts_v2", "repeat": 1}
    ))

    arms = state["arms"]
    assert set(arms) == {"a", "b"}
    assert dev_server._RUNS[arms["a"]]["report"]["meta"]["prompt_dir"] == "prompts"
    assert dev_server._RUNS[arms["b"]]["report"]["meta"]["prompt_dir"] == "prompts_v2"
    assert dev_server._RUNS[arms["a"]]["finished"] is True

    # A 팔을 기준으로 재실행 — `g02` 가 A 에서 실패였으므로 그 한 건이 골라집니다.
    rerun = wait(dev_server._start_eval({"rerun_of": arms["a"], "pick": ["failed"]}))
    assert rerun["error"] is None
    assert rerun["report"]["meta"]["prompt_dir"] == "prompts"


def test_a_missing_second_folder_is_refused_before_anything_runs(dev_server, instant_eval):
    """폴더 한쪽이 비면 시작하지 않는다.

    기본값으로 메우면 조용히 A/A 가 돌아 몇 분을 쓰고 "차이 없음" 을 봅니다 — A/A 는
    **일부러** 고를 때만 의미가 있습니다(잡음 크기 측정).
    """
    refused = dev_server._start_eval({"mode": "ab", "prompt_dir": "prompts"})
    assert refused["id"] is None
    assert "두 프롬프트 폴더" in refused["error"]


def test_a_stopped_first_arm_leaves_the_partial_report_visible(dev_server, monkeypatch):
    """A 를 중지하면 비교표는 없지만 **A 리포트는 화면에 남는다.**

    `error` 로 처리하면 화면이 리포트를 버리고 빨간 상자만 그립니다. 중지는 실패가
    아니고, 그때까지 돈 A 는 볼 값어치가 있습니다.
    """
    import evals.runner as runner

    monkeypatch.setattr(
        runner, "run_eval",
        lambda *, prompt_dir, **kw: report([case("g01", ok=True)],
                                           prompt_dir=prompt_dir, stopped=True),
    )
    state = wait(dev_server._start_eval(
        {"mode": "ab", "prompt_dir": "prompts", "prompt_dir_b": "prompts_v2"}
    ))

    assert state["error"] is None, "중지를 오류로 올리면 리포트가 버려집니다"
    assert state["ab"] is None
    assert "B 는 돌지 않았습니다" in state["ab_note"]
    assert state["report"]["meta"]["prompt_dir"] == "prompts"
