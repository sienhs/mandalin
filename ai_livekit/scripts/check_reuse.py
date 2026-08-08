"""이 저장소가 혼자 도는지 확인하는 스모크 체크.

`pytest` 를 돌리기 전에 **환경이 갖춰졌는지**부터 가릅니다. 가장 자주 막히는 곳이
의존성 설치를 빠뜨린 것이고, 그때 나오는 `ModuleNotFoundError: pydantic_settings`
는 무엇을 해야 하는지 알려주지 않습니다.

    python scripts/check_reuse.py

`tests/test_reuse.py` 와 중복이 아닙니다 — 이쪽은 **환경 진단**이고, 저쪽은
불변식입니다. 진단은 실패 이유를 사람이 읽을 수 있어야 해서 따로 둡니다.
"""
from __future__ import annotations

import sys
from pathlib import Path

# 저장소 어디서 실행해도 `agent` · `mandarin_goal` 을 찾을 수 있게 합니다.
# `pip install -e .` 를 요구하지 않는 이유는, 두 패키지가 이 폴더 안에 있어서
# worker 도 테스트도 CWD 만으로 도는 구조이기 때문입니다.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))


def fail(message: str, hint: str) -> None:
    print(f"  [실패] {message}")
    print(f"         → {hint}")
    sys.exit(1)


def main() -> None:
    print("ai_livekit 자립 체크")
    print("-" * 60)

    # ① 파이프라인이 import 되는가 (서드파티 셋: pydantic / pydantic-settings / httpx)
    try:
        from agent.reuse import (
            PIPELINE_MODES,
            PROJECT_ROOT,
            REUSED_MODULES,
            TRANSPORT_ONLY,
            DomainRef,
            GoalPipeline,
        )
    except ModuleNotFoundError as exc:
        fail(
            f"파이프라인 모듈을 import 할 수 없습니다: {exc.name}",
            "pip install -r requirements.txt  (pydantic / pydantic-settings / httpx)",
        )
    print(f"  [OK]  파이프라인 모듈 {len(REUSED_MODULES)}개 import (mandarin_goal/)")

    # ② 바깥 `app` 패키지에 기대고 있지 않은가
    #    이 venv 에 `app` 이 설치돼 있으면 **위험합니다** — 새 코드에 `from app.…` 을
    #    써도 이 환경에서는 통과해 버립니다.
    if "app" in sys.modules or _installed("app"):
        print("  [경고] 외부 `app` 패키지가 이 venv 에 설치돼 있습니다")
        print("         → pip uninstall webrtc-sfu   (없어야 자립이 실제로 검증됩니다)")
    else:
        print("  [OK]  외부 의존 없음 (`app` 패키지 미설치)")

    # ③ 전송 스택이 딸려 들어오지 않았는가. 파이프라인은 전송 계층을 모릅니다.
    leaked = sorted(m for m in sys.modules if m.split(".")[0] in TRANSPORT_ONLY)
    if leaked:
        print(f"  [경고] 전송 스택이 import 됐습니다: {leaked}")
        print("         → mandarin_goal/ 에 역방향 import 가 생겼습니다")
    else:
        print(f"  [OK]  전송 스택({'/'.join(TRANSPORT_ONLY)}) 미포함")

    # ④ 프롬프트가 어디서 읽히는가 — 상대 경로의 기준점을 실제 값으로 보여줍니다
    print(f"  [OK]  PROJECT_ROOT = {PROJECT_ROOT}")
    missing = [
        name
        for name in ("system.md", "classify.md")
        if not (PROJECT_ROOT / "prompts" / name).is_file()
    ]
    for name in ("system.md", "classify.md"):
        status = "없음" if name in missing else "존재"
        print(f"         prompts/{name} → {status}")
    if missing:
        print("         → 프롬프트가 없으면 조용히 코드 기본값으로 내려갑니다")
        print("           (분류 프롬프트의 인젝션·유해 발화 차단 규칙이 빠집니다)")

    # ⑤ 시트 모델이 Spring 모양의 payload 를 받는가
    ref = DomainRef.model_validate(
        {"id": 7, "title": " 학습 ", "subjects": [{"id": 3, "title": "매일 알고리즘 1문제 풀기"}]}
    )
    assert ref.domainId == 7 and ref.title == "학습"
    print("  [OK]  DomainRef 가 Spring 모양 payload 를 파싱")

    # ⑥ 파이프라인을 실제로 만들 수 있는가 (LLM 호출은 하지 않습니다)
    from agent.reuse import BACKENDS, build_backend, get_settings, normalize_provider

    settings = get_settings()
    GoalPipeline(settings, build_backend(settings))
    # `build_backend()` 는 모르는 provider 에도 예외를 내지 않습니다(방에 들어가기 전에
    # 죽으면 사용자에게 원인을 전할 수 없어서입니다). 그래서 오타 진단은 여기서 합니다 —
    # 안 그러면 `BOT_PROVIDER=gemmini` 가 [OK] 로 통과합니다.
    if normalize_provider(settings.bot_provider) not in BACKENDS:
        print(
            f"  [실패] 알 수 없는 BOT_PROVIDER={settings.bot_provider!r} "
            f"(가능: {', '.join(BACKENDS)}) — 발화가 전부 실패합니다"
        )
    else:
        print(f"  [OK]  GoalPipeline 생성 (BOT_PROVIDER={settings.bot_provider})")
    if settings.bot_mode not in PIPELINE_MODES:
        print(
            f"  [경고] BOT_MODE={settings.bot_mode} — 아는 값은 "
            f"{'/'.join(PIPELINE_MODES)} 뿐이라 과제를 만들지 않습니다"
        )

    # ⑦ 시트 전달 경로. LiveKit 없이 도는 부분입니다.
    from agent.sheet_transfer import sheet_from_participant

    sheet = sheet_from_participant('{"domains": [{"id": 7, "title": "학습"}]}', None)
    assert len(sheet) == 1 and sheet[0].domainId == 7
    print("  [OK]  participant metadata → DomainRef 파싱")

    # ⑧ livekit-agents 설치 여부. **없어도 로직은 전부 테스트됩니다** —
    #    엔트리포인트만 못 띄웁니다. 그래서 실패가 아니라 안내입니다.
    try:
        import livekit.agents  # noqa: F401
    except ModuleNotFoundError:
        print("  [안내] livekit-agents 미설치 — 로직 테스트는 되지만 worker 는 못 띄웁니다")
        print("         → pip install -r requirements.txt")
    else:
        from livekit.agents import AgentServer  # noqa: F401

        print("  [OK]  livekit-agents 설치됨 (AgentServer import 가능)")

    print("-" * 60)
    print("이 저장소만으로 파이프라인이 돕니다 · 시트 전달 경로 동작.")
    print("실서버 왕복 확인: scripts/smoke_client.py (서버 + worker 가 떠 있어야 합니다)")


def _installed(name: str) -> bool:
    """import 하지 않고 존재만 확인합니다 — 확인하려고 올려버리면 안 됩니다."""
    from importlib.util import find_spec

    try:
        return find_spec(name) is not None
    except (ImportError, ValueError):
        return False


if __name__ == "__main__":
    main()
