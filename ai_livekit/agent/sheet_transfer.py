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
from dataclasses import dataclass

from pydantic import BaseModel, Field, ValidationError, field_validator

from agent.reuse import (
    MAX_DOMAINS,
    MAX_SHEET_TITLE_LENGTH,
    DomainRef,
    drop_untitled_domains,
)

logger = logging.getLogger(__name__)

#: 세션 중 시트 변경을 받는 텍스트 스트림 토픽.
SHEET_TOPIC = "mandarin.sheet"

#: participant metadata 대신 attributes 에 실렸을 때 볼 키.
#: metadata 를 다른 용도로 이미 쓰고 있는 경우를 위한 우회로입니다.
SHEET_ATTRIBUTE = "mandarin.sheet"


class SheetPayload(BaseModel):
    """시트 봉투 — 최종목표(`title`)와 `domains` 배열입니다.

    `max_length` 로 **거부**합니다(잘라내지 않습니다). `MAX_DOMAINS` 를 넘는다는 것은
    시트 자체가 이상하다는 신호이고, 조용히 앞쪽만 쓰면 잘린 칸의 과제가 중복 검사에서
    빠져 "가끔 중복 과제를 만든다" 로만 드러납니다. 과제 개수는 반대로 잘라냅니다 —
    양쪽 판단 근거는 `mandarin_goal/sheet.py` 의 상수 주석에 있습니다.
    """

    #: 만다라트 가운데 칸 — **사용자의 최종목표**입니다.
    #:
    #: 이름이 `title` 인 이유는 Spring 의 `GET /api/v1/sheets/{sheetId}` 응답
    #: (`SheetDetailResponse.title`)을 **그대로 실어 보낼 수 있어야** 하기 때문입니다.
    #: 이 봉투가 `domains` 를 그 응답에서 그대로 받는 것과 같은 이유입니다.
    #:
    #: 없어도 됩니다. 편집기를 거치지 않고 대화부터 시작하면 아직 목표가 없고, 그때는
    #: 모델이 목표를 지어내지 않고 되묻습니다(`prompts/system.md` 규칙 2).
    title: str | None = None
    domains: list[DomainRef] = Field(default_factory=list, max_length=MAX_DOMAINS)

    @field_validator("title")
    @classmethod
    def _trim_title(cls, v: str | None) -> str | None:
        """공백만 온 것은 없는 것으로, 긴 것은 자릅니다.

        빈 문자열을 그대로 두면 프롬프트에 `<final_goal></final_goal>` 이 실려서
        "목표가 있는데 빈 값" 처럼 보입니다 — 없는 것과 구분되지 않아야 합니다.
        """
        if v is None:
            return None
        trimmed = v.strip()[:MAX_SHEET_TITLE_LENGTH]
        return trimmed or None

    @field_validator("domains")
    @classmethod
    def _drop_untitled(cls, v: list[DomainRef]) -> list[DomainRef]:
        return drop_untitled_domains(v)


@dataclass(frozen=True)
class Sheet:
    """파싱한 시트 봉투. **최종목표와 칸 목록을 함께** 나릅니다."""

    title: str | None
    domains: list[DomainRef]


#: 파싱이 실패했거나 실려 온 것이 없을 때. **예외가 아니라 이 값입니다**(fail-open).
EMPTY_SHEET = Sheet(title=None, domains=[])


def parse_sheet(raw: str | None, *, source: str = "?") -> list[DomainRef]:
    """시트 JSON 문자열을 `DomainRef` 목록으로. **최종목표는 버립니다.**

    최종목표까지 필요하면 `parse_sheet_envelope()` 를 쓰세요. 이 함수를 남겨 둔 이유는
    칸 목록만 보는 자리가 여전히 많고(테스트 포함), 반환형을 바꾸면 그 전부가 봉투에서
    `.domains` 를 꺼내는 모양으로 바뀌기 때문입니다 — 얻는 것 없이 변경만 넓어집니다.
    """
    return parse_sheet_envelope(raw, source=source).domains


def parse_sheet_envelope(raw: str | None, *, source: str = "?") -> Sheet:
    """시트 JSON 문자열을 `Sheet`(최종목표 + 칸 목록)로.

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
        return EMPTY_SHEET
    try:
        decoded = json.loads(raw)
    except json.JSONDecodeError as exc:
        logger.warning("시트 JSON 파싱 실패 source=%s: %s", source, exc)
        return EMPTY_SHEET

    if isinstance(decoded, list):
        decoded = {"domains": decoded}
    if not isinstance(decoded, dict):
        logger.warning(
            "시트가 객체도 배열도 아닙니다 source=%s type=%s", source, type(decoded).__name__
        )
        return EMPTY_SHEET

    try:
        payload = SheetPayload.model_validate(decoded)
    except ValidationError as exc:
        # 상한 초과(`MAX_DOMAINS`)와 필드 오류가 여기로 모입니다. 어느 쪽인지는
        # 메시지에 남기고, 동작은 같습니다 — 시트 없이 진행합니다.
        logger.warning("시트 검증 실패 source=%s: %s", source, exc.errors()[:3])
        return EMPTY_SHEET

    logger.info(
        "시트 수신 source=%s 최종목표=%r 도메인=%d개 과제=%d개",
        source,
        payload.title,
        len(payload.domains),
        sum(len(d.subjects) for d in payload.domains),
    )
    return Sheet(title=payload.title, domains=payload.domains)


def sheet_envelope_from_participant(
    metadata: str | None, attributes: dict[str, str] | None
) -> Sheet:
    """입장 시점의 시트. **metadata 가 우선이고 attributes 가 우회로입니다.**

    둘 다 Spring 이 access token 에 실을 수 있는 자리입니다. metadata 를 먼저 보는
    이유는 자유 문자열이라 크기 제약이 덜하기 때문입니다 — 시트는
    `MAX_DOMAINS` x `MAX_SUBJECTS_PER_DOMAIN` 이라 attributes 의 값 하나에 담기엔
    클 수 있습니다.

    **둘 다 비어 있는 것은 오류가 아닙니다.** 시트가 아직 빈 사용자이거나, 시트를
    아직 안 실어 보내는 클라이언트입니다. 그때 AI 는 모든 도메인을 새 칸으로
    제안하고, 중복 검사만 빠집니다.
    """
    sheet = parse_sheet_envelope(metadata, source="participant.metadata")
    if sheet.domains:
        return sheet
    if attributes:
        fallback = parse_sheet_envelope(
            attributes.get(SHEET_ATTRIBUTE), source=f"attributes[{SHEET_ATTRIBUTE}]"
        )
        # **최종목표는 잃지 않습니다.** metadata 에 목표만 있고 칸이 비어 있는 경우가
        # 있습니다(편집기에서 가운데 칸만 적은 사용자). 칸은 우회로에서 가져오되 목표는
        # 있는 쪽을 씁니다 — 통째로 갈아치우면 그 사용자의 목표가 조용히 사라집니다.
        return Sheet(title=fallback.title or sheet.title, domains=fallback.domains)
    return sheet


def sheet_from_participant(
    metadata: str | None, attributes: dict[str, str] | None
) -> list[DomainRef]:
    """칸 목록만 필요한 자리를 위한 껍데기(`parse_sheet` 와 같은 이유)."""
    return sheet_envelope_from_participant(metadata, attributes).domains
