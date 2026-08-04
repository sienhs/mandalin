"""worker 가 자기 부하를 재는 기준 — **버스터블 인스턴스에 맞춰 조인 값들입니다.**

이 값들이 사라졌을 때의 증상이 코드에 없습니다. `load_threshold` 를 기본값(0.7)으로
되돌리면 worker 는 더 잘 도는 것처럼 보입니다 — job 을 더 많이 받고, 에러도 없고, 로그도
평온합니다. 대가는 **CPU 크레딧 초과 청구서**로만 나타납니다(T3 는 기본이 Unlimited
모드입니다). 테스트가 없으면 "왜 이 숫자였지" 하고 지우게 되는 종류입니다.

숫자의 근거는 `agent/entrypoint.py` 의 `server = AgentServer(...)` 주석에 있습니다.
요약하면 t3.small 은 2 vCPU / 2 GiB 이고 baseline 이 0.4 vCPU 라, 전체 CPU 대비
비율로 표현하면 **0.2** 입니다.

**인스턴스를 바꾸면 이 테스트가 실패합니다.** 그게 의도입니다 — 그때 두 값을 새 스펙에
맞춰 다시 계산하고 여기 숫자도 같이 고치세요.
"""
from __future__ import annotations

import math

from livekit.agents.worker import ServerEnvOption

from agent.entrypoint import server

#: t3.small: vCPU 당 baseline 20%. 전체 대비 비율이라 vCPU 수와 무관하게 0.2 입니다.
T3_SMALL_BASELINE = 0.2


def _prod(option: object) -> object:
    """운영 모드에서 실제로 쓰이는 값.

    공개 접근자가 없어서 private 을 읽습니다(`AgentServer` 에 `load_threshold` 프로퍼티가
    없습니다). 라이브러리가 프로퍼티를 추가하면 그쪽으로 바꾸세요.
    """
    return ServerEnvOption.getvalue(option, devmode=False)


def _dev(option: object) -> object:
    return ServerEnvOption.getvalue(option, devmode=True)


def test_the_cpu_guard_matches_the_burstable_baseline():
    """0.7(기본값)은 baseline 의 3.5배입니다 — 그 상태로는 worker 가 크레딧을 태웁니다."""
    assert _prod(server._load_threshold) == T3_SMALL_BASELINE


def test_local_development_is_not_throttled():
    """dev 는 무제한이어야 합니다.

    로컬에서 0.2 로 조이면 다른 프로세스가 CPU 를 쓰는 동안 job 이 거절되고, 증상은
    "브라우저는 붙는데 AI 만 안 들어옴" 입니다 — `admit()` 의 방 수 상한과 구분되지
    않아서 진단이 어렵습니다.
    """
    assert _dev(server._load_threshold) == math.inf


def test_only_one_process_is_prewarmed():
    """리눅스는 job 하나가 프로세스 하나입니다 — 2 GiB 에서 유휴 한 칸은 세션 하나만큼."""
    assert _prod(server._num_idle_processes) == 1


def test_a_job_memory_limit_is_not_guessed():
    """**상한을 짐작으로 걸지 않습니다.**

    세션당 실제 사용량(Pss)을 재기 전에 값을 넣으면 정상 job 이 죽습니다. 실측한 뒤
    켜는 것은 좋은 선택이고, 그때 이 테스트를 그 값으로 바꾸세요 — 0 은 "아직 안 쟀다" 는
    뜻이지 "필요 없다" 가 아닙니다.
    """
    assert server._job_memory_limit_mb == 0
