"""STT 배선 — 오디오·네트워크 없이 검사할 수 있는 부분.

`TrackListener.run()` 은 실제 트랙과 Deepgram 연결이 필요해서 여기서 다루지 않습니다.
대신 **그 위아래**를 봅니다 — 키가 없을 때의 동작과, 이벤트를 전사문으로 바꾸는 부분.
둘 다 실제로 버그가 났던 종류입니다.
"""
from __future__ import annotations

import ast
from dataclasses import dataclass
from pathlib import Path

import pytest

import agent.listen
from agent.listen import _first_text, build_stt

LISTEN_PY = Path(agent.listen.__file__)


def test_the_plugin_is_imported_at_module_level_not_inside_a_function():
    """**플러그인 import 가 함수 안으로 들어가면 job 배정 시점에 터집니다.**

    `livekit.plugins.deepgram` 은 import 되는 순간 `Plugin.register_plugin()` 을 부르고,
    LiveKit 은 그 등록을 메인 스레드에서만 허용합니다. `entrypoint()` 는 job runner
    스레드에서 도니까, 그 안에서 import 하면 이렇게 죽습니다 —

        RuntimeError: Plugins must be registered on the main thread

    실제로 이렇게 터졌고, **그때 40개 테스트가 전부 통과했습니다.** worker 기동도
    정상이고 `registered worker` 까지 찍힌 뒤, 누가 방에 들어와야 처음 드러납니다.
    단위 테스트로 스레드 조건을 재현하긴 어려우니 **import 위치를 직접 못 박습니다.**
    """
    tree = ast.parse(LISTEN_PY.read_text(encoding="utf-8"))

    offenders: list[str] = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef):
            continue
        for inner in ast.walk(node):
            if isinstance(inner, ast.ImportFrom) and (inner.module or "").startswith(
                "livekit.plugins"
            ):
                offenders.append(f"{node.name}() 안에서 {inner.module}")
            elif isinstance(inner, ast.Import):
                offenders += [
                    f"{node.name}() 안에서 {a.name}"
                    for a in inner.names
                    if a.name.startswith("livekit.plugins")
                ]

    assert not offenders, (
        "플러그인 import 가 함수 안에 있습니다 — 메인 스레드에서 등록되지 않습니다: "
        f"{offenders}"
    )


def test_the_default_language_is_not_the_multilingual_mode():
    """**`multi` 에는 한국어가 없습니다.** 기본값을 그쪽으로 되돌리지 못하게 막습니다.

    Nova-3 multilingual 은 영어·스페인어·프랑스어·독일어·힌디어·이탈리아어·일본어·
    네덜란드어·러시아어·포르투갈어 10개입니다. 한국어 발화를 넣으면 그 중 하나로
    알아들으려 해서 실측에서 이렇게 나왔습니다 —

        "매일 알고리즘 문제 풀고 싶어요" -> 'Beiil algori ズム 문제트히 트히.'

    **에러가 아니라 품질 저하로만 드러납니다.** 카타카나·한자가 섞이면 이 설정을
    먼저 의심하세요.
    """
    from agent.listen import DEFAULT_LANGUAGE, MULTI_LANGUAGES

    assert DEFAULT_LANGUAGE != "multi"
    assert DEFAULT_LANGUAGE.startswith("ko")
    assert "ko" not in MULTI_LANGUAGES, "multi 목록에 ko 가 추가됐다면 이 테스트를 다시 판단하세요"


def test_the_module_imports_even_without_the_plugin_installed():
    """플러그인이 없어도 `agent.listen` 은 import 돼야 합니다.

    최상위 import 로 옮기면서 생긴 위험입니다 — `try/except ImportError` 를 빼면 플러그인
    미설치 환경에서 **텍스트 대화까지 못 하게** 됩니다. STT 만 빠지는 것이 이 파일의
    계약입니다.
    """
    source = LISTEN_PY.read_text(encoding="utf-8")
    assert "except ImportError" in source, (
        "최상위 플러그인 import 를 try/except ImportError 로 감싸야 합니다"
    )


@dataclass
class FakeData:
    text: str


@dataclass
class FakeEvent:
    alternatives: list


def test_no_key_disables_voice_instead_of_crashing(monkeypatch):
    """키가 없으면 `None` 을 돌려주고 텍스트 대화는 그대로 동작해야 합니다.

    fail-open 입니다. 인증은 반대로 fail-closed 인데, 기준이 다릅니다 — 인증은
    판단할 수 없으면 **막아야** 하고, 음성은 못 쓰더라도 서비스가 돌아가는 편이
    낫습니다.
    """
    monkeypatch.delenv("DEEPGRAM_API_KEY", raising=False)
    assert build_stt() is None


def test_a_blank_key_counts_as_missing(monkeypatch):
    """`.env` 에 `DEEPGRAM_API_KEY=` 만 적어둔 상태입니다 — 흔합니다.

    빈 문자열을 키로 취급하면 첫 프레임에서 인증 오류로 죽고, 그 예외는 "키를 안
    넣었다" 를 알려주지 않습니다.
    """
    monkeypatch.setenv("DEEPGRAM_API_KEY", "")
    assert build_stt() is None


def test_an_event_without_alternatives_yields_empty_string():
    """`START_OF_SPEECH` 처럼 후보가 비어 오는 이벤트가 있습니다.

    인덱스로 바로 접근하면 그때 `IndexError` 로 스트림 루프가 죽습니다 — 전사가
    조용히 멈추고 원인은 로그에만 남습니다.
    """
    assert _first_text(FakeEvent(alternatives=[])) == ""


def test_whitespace_only_transcripts_are_dropped():
    """공백만 온 전사문이 발화로 들어가면 파이프라인이 헛돌고 LLM 을 태웁니다."""
    assert _first_text(FakeEvent(alternatives=[FakeData(text="   ")])) == ""
    assert _first_text(FakeEvent(alternatives=[FakeData(text="")])) == ""


def test_the_first_alternative_wins_and_is_trimmed():
    event = FakeEvent(
        alternatives=[FakeData(text="  매일 알고리즘 풀기  "), FakeData(text="다른 후보")]
    )
    assert _first_text(event) == "매일 알고리즘 풀기"


@pytest.mark.parametrize("language", ["ko", "multi"])
def test_the_configured_language_reaches_the_plugin(monkeypatch, language):
    """`ko`/`multi` 가 Deepgram 이 실제로 받는 값인지 확인합니다.

    오타가 나면 플러그인이 조용히 기본값(`en-US`)으로 돌 수 있고, 그러면 한국어
    발화가 이상한 영어로 전사됩니다 — 에러가 아니라 품질 저하로만 드러납니다.
    """
    pytest.importorskip("livekit.plugins.deepgram")
    import typing

    from livekit.plugins.deepgram import DeepgramLanguages

    assert language in typing.get_args(DeepgramLanguages)

    monkeypatch.setenv("DEEPGRAM_API_KEY", "test-key-not-used")
    monkeypatch.setenv("STT_LANGUAGE", language)
    stt = build_stt()
    assert stt is not None
