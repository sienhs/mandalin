"""사용자 시트를 LiveKit 경로로 받습니다.

시트가 들어오는 자리는 둘입니다.

    입장 시점   participant metadata (Spring 이 서명한 access token 에 실림)
    세션 중     텍스트 스트림 토픽 `mandarin.sheet` (전체 목록을 통째로)

**모델은 `mandarin_goal/sheet.py` 의 것을 그대로 씁니다.** `DomainRef` 가 전송 형식과
무관하므로 같은 JSON 을 같은 모델로 파싱하면 끝이고, 검증기(제목 정리 · 8개 절단 ·
`id` 별칭 · 빈 칸 제거)가 전부 따라옵니다. 이 파일에 있는 것은 **껍데기 하나**뿐입니다.

## 왜 클라이언트가 아니라 토큰에서 받는가

Spring 이 access token 을 어차피 서명하므로 거기 실을 수 있습니다.

시트는 **AI 가 중복을 판단하는 근거**입니다. 클라이언트가 정하게 두면 사용자가 이미
담아 둔 과제를 숨겨 같은 과제를 다시 받을 수 있습니다. 피해가 크지는 않지만, 표시
이름을 티켓에서 가져오는 것과 같은 종류입니다 —
**서버가 아는 사실은 서버에서 옵니다.**

세션 중 변경(담기·삭제)만 클라이언트에서 받습니다. 그건 방금 사용자가 한 행동이라
클라이언트가 유일한 출처입니다.
"""
from __future__ import annotations

import json
import logging

from pydantic import BaseModel, Field, ValidationError, field_validator

from agent.reuse import MAX_DOMAINS, DomainRef, drop_untitled_domains

logger = logging.getLogger(__name__)

#: 세션 중 시트 변경을 받는 텍스트 스트림 토픽.
SHEET_TOPIC = "mandarin.sheet"

#: participant metadata 대신 attributes 에 실렸을 때 볼 키.
#: metadata 를 다른 용도로 이미 쓰고 있는 경우를 위한 우회로입니다.
SHEET_ATTRIBUTE = "mandarin.sheet"


class SheetPayload(BaseModel):
    """시트 봉투 — 실려 오는 `domains` 배열입니다.

    `max_length` 로 **거부**합니다(잘라내지 않습니다). `MAX_DOMAINS` 를 넘는다는 것은
    시트 자체가 이상하다는 신호이고, 조용히 앞쪽만 쓰면 잘린 칸의 과제가 중복 검사에서
    빠져 "가끔 중복 과제를 만든다" 로만 드러납니다. 과제 개수는 반대로 잘라냅니다 —
    양쪽 판단 근거는 `mandarin_goal/sheet.py` 의 상수 주석에 있습니다.
    """

    domains: list[DomainRef] = Field(default_factory=list, max_length=MAX_DOMAINS)

    @field_validator("domains")
    @classmethod
    def _drop_untitled(cls, v: list[DomainRef]) -> list[DomainRef]:
        return drop_untitled_domains(v)


def parse_sheet(raw: str | None, *, source: str = "?") -> list[DomainRef]:
    """시트 JSON 문자열을 `DomainRef` 목록으로.

    두 모양을 다 받습니다 — Spring 의 `GET /api/v1/sheets/{sheetId}` 응답을 그대로
    실어 보낼 수 있어야 하기 때문입니다.

        {"domains": [...]}      ← Spring 응답 모양
        [...]                   ← domains 배열만

    **실패하면 빈 목록입니다(fail-open).** 시트가 없으면 AI 는 모든 도메인을 새 칸으로
    제안합니다 — 파싱 실패로 입장 자체를 막으면 사용자는 AI 를 아예 못 씁니다. 대신
    **반드시 경고를 남깁니다.** 조용히 비면
    "중복 검사가 왜 안 되지" 를 프롬프트에서 찾게 됩니다(`to_candidates` 와 같은 이유).

    `source` 는 어디서 온 값인지 로그에 남기기 위한 것입니다. metadata·attributes·
    토픽 셋 중 어느 경로가 깨졌는지 구분하지 못하면 진단이 불가능합니다.
    """
    if not raw or not raw.strip():
        return []
    try:
        decoded = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.warning("시트 JSON 파싱 실패 source=%s: %s", source, exc)
        return []

    if isinstance(decoded, list):
        decoded = {"domains": decoded}
    if not isinstance(decoded, dict):
        logger.warning(
            "시트가 객체도 배열도 아닙니다 source=%s type=%s", source, type(decoded).__name__
        )
        return []

    try:
        payload = SheetPayload.model_validate(decoded)
    except ValidationError as exc:
        # 상한 초과(`MAX_DOMAINS`)와 필드 오류가 여기로 모입니다. 어느 쪽인지는
        # 메시지에 남기고, 동작은 같습니다 — 시트 없이 진행합니다.
        logger.warning("시트 검증 실패 source=%s: %s", source, exc.errors()[:3])
        return []

    logger.info(
        "시트 수신 source=%s 도메인=%d개 과제=%d개",
        source,
        len(payload.domains),
        sum(len(d.subjects) for d in payload.domains),
    )
    return payload.domains


def sheet_from_participant(
    metadata: str | None, attributes: dict[str, str] | None
) -> list[DomainRef]:
    """입장 시점의 시트. **metadata 가 우선이고 attributes 가 우회로입니다.**

    둘 다 Spring 이 access token 에 실을 수 있는 자리입니다. metadata 를 먼저 보는
    이유는 자유 문자열이라 크기 제약이 덜하기 때문입니다 — 시트는
    `MAX_DOMAINS` x `MAX_SUBJECTS_PER_DOMAIN` 이라 attributes 의 값 하나에 담기엔
    클 수 있습니다.

    **둘 다 비어 있는 것은 오류가 아닙니다.** 시트가 아직 빈 사용자이거나, 시트를
    아직 안 실어 보내는 클라이언트입니다. 그때 AI 는 모든 도메인을 새 칸으로
    제안하고, 중복 검사만 빠집니다.
    """
    domains = parse_sheet(metadata, source="participant.metadata")
    if domains:
        return domains
    if attributes:
        return parse_sheet(attributes.get(SHEET_ATTRIBUTE), source=f"attributes[{SHEET_ATTRIBUTE}]")
    return []
