"""발화 하나를 받아 응답 문자열을 만듭니다 — **LiveKit 을 모릅니다.**

방·채팅·미디어를 아는 조립 지점(`entrypoint.py`)과 갈라 둡니다. **대화 규율**은
전송 방식과 무관하기 때문입니다.

    히스토리 관리 · 동시성 제어 · 실패 시에도 무언가 말하기

이 파일을 `entrypoint.py` 에서 분리한 이유는 **테스트 가능성**입니다. `livekit.agents`
를 import 하는 순간 그 패키지가 설치된 환경에서만 테스트할 수 있게 되는데, 위 세 가지가
정작 버그가 나는 곳입니다.
"""
from __future__ import annotations

import asyncio
import logging

from agent.reuse import (
    DomainRef,
    GoalPipeline,
    GoalResult,
    LlmError,
    LlmRateLimitedError,
    Turn,
)

logger = logging.getLogger(__name__)

#: 히스토리 상한의 **폴백**. 실제 값은 `BOT_HISTORY_TURNS` 설정입니다.
#:
#: **정본은 `bot_history_turns` 설정입니다.** 이 상수는 주입이 없을 때만 씁니다 —
#: 같은 개념을 두 곳에서 정하면 값이 어긋납니다.
DEFAULT_HISTORY_TURNS = 12

#: 파이프라인이 실패했을 때 히스토리에 남길 문구. 실패한 응답을 그대로 남기면
#: 다음 턴에 모델이 자기 오류 메시지를 맥락으로 읽습니다.
FAILURE_NOTE = "(응답 실패)"

#: 사용자에게 보이는 실패 문구. **침묵하지 않는 것이 규율입니다** — 아무 말도 없으면
#: 사용자는 AI 가 죽었는지 생각 중인지 알 수 없습니다.
FAILURE_REPLY = "지금 답을 만들지 못했어요. 다시 말씀해 주시겠어요?"
TIMEOUT_REPLY = "응답이 늦어져서 취소했어요. 다시 말씀해 주세요."

#: 429(혼잡) 전용 문구. **원문을 보여주지 않는 유일한 `LlmError` 갈래입니다** —
#: 다른 실패는 원인이 키·할당량·설정이라 사용자나 관리자가 볼 값이 있지만, 혼잡은
#: 할 수 있는 일이 기다리는 것뿐입니다.
BUSY_REPLY = "지금 요청이 몰려 있어요. 잠시 후에 다시 말씀해 주세요."

#: LLM 실패는 **원인을 그대로 보여줍니다.**
#:
#: `LlmError` 의 docstring 이 "방에 그대로 노출해도 되는 실패 … 키 오류·할당량 초과·안전
#: 필터 차단 등은 사용자가 봐야 원인을 알 수 있으므로 삼키지 않고 채팅 메시지로
#: 띄웁니다" 라고 적어 둔 예외입니다. 일반 `Exception` 으로 뭉개면 안 됩니다.
#:
#: **뭉개면 안 되는 이유**: `BOT_API_KEY` 가 비었거나 할당량이 끝난 경우 "다시 말씀해
#: 주세요" 는 거짓말입니다 — 몇 번 말해도 안 됩니다. 사용자는 서버 설정 문제라는 것을
#: 알아야 하고, 그건 개발자에게 알릴 유일한 경로이기도 합니다.
LLM_FAILURE_PREFIX = "AI 응답 실패"


class Conversation:
    """방 하나의 대화 상태.

    LiveKit 은 job 하나가 방 하나이므로 `dict[room_id, ...]` 로 들고 있을 필요가
    없습니다. 인스턴스 하나가 방 하나입니다.
    """

    def __init__(
        self,
        pipeline: GoalPipeline,
        *,
        timeout_seconds: float,
        history_turns: int = DEFAULT_HISTORY_TURNS,
    ) -> None:
        self._pipeline = pipeline
        self._timeout = timeout_seconds
        self._history_turns = max(1, history_turns)
        self._history: list[Turn] = []
        self._domains: list[DomainRef] = []
        #: 사용자의 최종목표(`set_goal`). 없을 수 있습니다.
        self._goal: str | None = None
        #: 생성 중에 들어온 발화를 **버리기** 위한 락. 큐에 쌓으면 한참 뒤에 답변이
        #: 몰려 나와 대화 흐름이 깨집니다. **버리는 것이 기능입니다.**
        self._lock = asyncio.Lock()

    @property
    def busy(self) -> bool:
        """지금 응답을 만들고 있는가. **이 동안의 발화는 버려집니다**(`respond`).

        `listen.py` 가 이걸 보고 STT 스트림을 닫습니다 — 버릴 오디오를 전사하면
        Deepgram 요금만 나갑니다.
        """
        return self._lock.locked()

    def set_domains(self, domains: list[DomainRef]) -> None:
        """시트를 갈아끼웁니다. 증분이 아니라 통째로 받습니다.

        증분은 순서가 어긋나거나 하나 유실되면 서버와 클라이언트가 조용히 갈라집니다.
        시트는 `MAX_DOMAINS` x `MAX_SUBJECTS_PER_DOMAIN` 이 상한이라 통째로 보내도
        작습니다.
        """
        self._domains = list(domains)

    def set_goal(self, title: str | None) -> None:
        """사용자의 **최종목표**(만다라트 가운데 칸)를 갈아끼웁니다.

        `set_domains` 와 따로 둔 이유는 출처가 같아도 **없을 수 있는 값**이기 때문입니다 —
        편집기를 거치지 않고 대화부터 시작하면 아직 목표가 없습니다. 그때는 `None` 이고,
        프롬프트의 `<final_goal>` 슬롯이 "없음" 으로 채워집니다.

        **모델에게 묻지 않습니다.** 예전에는 규칙 2가 "중심 목표는 대화의 첫 목표 발화"
        라고 추론하게 했는데, 히스토리 창(`BOT_HISTORY_TURNS`)이 두 왕복이면 그 발화가
        창 밖으로 밀려나 근거 자체가 사라집니다. 서버가 아는 값은 서버가 넘깁니다.
        """
        self._goal = (title or "").strip() or None

    async def respond(self, text: str) -> tuple[str, GoalResult | None]:
        """발화 하나에 대한 응답. 두 번째 값은 과제 카드를 그릴 구조화 결과입니다.

        **생성 중이면 빈 문자열을 돌려줍니다** — 호출하는 쪽이 아무것도 보내지 않으면
        됩니다. 예외로 만들지 않는 이유는 이게 정상 동작이라서입니다.
        """
        text = (text or "").strip()
        if not text:
            return "", None
        if self._lock.locked():
            logger.debug("생성 중이라 발화를 버립니다: %r", text[:40])
            return "", None

        async with self._lock:
            self._append(Turn(role="user", text=text))
            try:
                result = await asyncio.wait_for(
                    self._pipeline.run(list(self._history), self._domains, goal=self._goal),
                    timeout=self._timeout,
                )
            except TimeoutError:
                logger.warning("파이프라인 타임아웃 (%.1fs)", self._timeout)
                self._append(Turn(role="assistant", text=FAILURE_NOTE))
                return TIMEOUT_REPLY, None
            except LlmRateLimitedError:
                # **원문을 보여주지 않습니다.** 429 는 사용자가 할 수 있는 일이
                # 하나뿐이고(잠시 후 다시), 서버 JSON 을 보여줘도 도움이 안 됩니다.
                # 다른 `LlmError` 와 달리 원인이 사용자 쪽도 서버 설정 쪽도 아니라
                # **일시적 혼잡**이라 문구를 따로 둡니다. 파이프라인이 이미 한 번
                # 재시도한 뒤라(`_step`) 여기까지 왔으면 진짜로 붐비는 상태입니다.
                logger.warning("LLM 혼잡(429) — 재시도 후에도 실패")
                self._append(Turn(role="assistant", text=FAILURE_NOTE))
                return BUSY_REPLY, None
            except LlmError as exc:
                # 원인을 그대로 보여줍니다(위 `LLM_FAILURE_PREFIX` 주석).
                logger.warning("LLM 실패: %s", exc)
                self._append(Turn(role="assistant", text=FAILURE_NOTE))
                return f"({LLM_FAILURE_PREFIX}: {exc})", None
            # 봇 오류가 세션을 끊으면 안 됩니다. 광범위 except 인데 `BLE001` 이 안 걸리는
            # 이유는 아래에서 `logger.exception` 으로 트레이스백을 남기기 때문입니다 —
            # ruff 가 그 경우를 면제합니다. 로깅을 지우면 규칙이 살아납니다.
            except Exception:
                logger.exception("파이프라인 실패")
                self._append(Turn(role="assistant", text=FAILURE_NOTE))
                return FAILURE_REPLY, None

            self._append(Turn(role="assistant", text=result.text))
            return result.text, result

    def _append(self, turn: Turn) -> None:
        self._history.append(turn)
        if len(self._history) > self._history_turns:
            del self._history[: len(self._history) - self._history_turns]
