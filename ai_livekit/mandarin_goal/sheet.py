"""사용자 시트의 데이터 모델 — 도메인 칸과 그 안에 담긴 과제.

**전송 방식과 무관한 값입니다.** `../ai` 에서는 이 두 모델이 WebRTC 시그널링 계약
(`app/schemas.py`) 안에 함께 있었고, `bot/` 이 `DomainRef` 하나를 쓰려고 전송 계층을
import 하는 유일한 실이 그것이었습니다. 갈라내고 나니 **전송 계층을 통째로 갈아치우는
일이 실제로 가능해졌습니다** — 이 패키지가 SFU 없이 LiveKit 위에서 그대로 도는 근거가
여기입니다. 시트의 모양은 WebSocket 으로 오든 토큰 metadata 로 오든 같습니다.

**여기서 `livekit` 도 `aiortc` 도 `fastapi` 도 import 하지 마세요.** pydantic 만 씁니다.

필드 이름이 파이썬 관례(`snake_case`)와 다른 것은 의도한 것입니다. Spring 의
`GET /api/v1/sheets/{sheetId}` 응답을 프론트가 **그대로** 실어 보낼 수 있어야
매핑 코드가 한 겹 줄어듭니다.
"""
from __future__ import annotations

import logging

from pydantic import AliasChoices, BaseModel, ConfigDict, Field, field_validator

logger = logging.getLogger(__name__)

#: 시트가 실어 보낼 도메인 개수 상한.
#:
#: **이 값들은 그대로 LLM 프롬프트에 들어갑니다.** 태그 위조는 `escape_slot_value`
#: 가 막지만 분량은 막지 못합니다 — 개수와 길이를 여기서 자르지 않으면 클라이언트가
#: 도메인 1,000개를 보내 진짜 지시문을 모델 주의 밖으로 밀어낼 수 있고, 그 비용은
#: 매 발화마다 청구됩니다.
MAX_DOMAINS = 16
MAX_DOMAIN_TITLE_LENGTH = 40

#: 칸 하나가 실어 보낼 수 있는 과제 개수와 제목 길이.
#:
#: 8 은 만다라트 정원(9x9 이중 3x3)과 같은 값입니다. 시트가 그보다 많이 담을 수
#: 없으므로 이 상한에 걸리는 건 클라이언트가 잘못 보냈을 때뿐입니다.
#:
#: **초과분은 거부가 아니라 잘라냅니다.** `domains` 는 `max_length` 로 거부하는데,
#: 그건 개수가 어긋나면 시트 자체가 이상하다는 신호라서입니다. 과제는 다릅니다 —
#: 9번째 과제 하나 때문에 입장 전체를 실패시키면 사용자는 AI 를 아예 못 씁니다.
MAX_SUBJECTS_PER_DOMAIN = 8
MAX_SUBJECT_TITLE_LENGTH = 60

#: 실천 빈도의 **어휘**. 라벨(사람이 읽는 문구)은 `bot/subjects.py` 의
#: `FREQUENCY_LABELS` 이고, 이쪽은 데이터 제약입니다.
#:
#: **여기 있는 이유는 검증 위치 때문입니다.** 예전에는 어휘가 `subjects.py` 에만 있어서
#: `SubjectRef` 가 참조할 수 없었습니다(그쪽이 `sheet.py` 를 import 하므로 반대 방향은
#: 순환). 그래서 **클라이언트가 보낸 빈도가 검증되지 않고 프롬프트까지 갔습니다** —
#: 모델 출력은 `responseSchema` 의 enum 으로 묶여 있는데 입력은 아무 문자열이나
#: 통과하는 비대칭이었습니다.
#:
#: 왜 위험한가: 후보 줄에 `"frequency": "매월"` 이 실려 가면 **모델이 그걸 읽고 배웁니다.**
#: 표현할 수 없는 주기를 따라 만들기 시작하고, 그건 에러가 아니라 품질 저하로만
#: 드러납니다(→ `../ai/LEARNING.md` 15절의 `UNEXPRESSIBLE_CADENCE` 와 같은 문제).
FREQUENCIES: tuple[str, ...] = ("daily", "weekly", "none")


class SubjectRef(BaseModel):
    """사용자 시트에 **이미 담겨 있는** 과제 하나.

    프롬프트의 `<existing_subjects>` 슬롯을 채웁니다. 목적은 추천이 아니라
    **중복 방지**입니다 — 이 목록이 없으면 AI 는 사용자가 이미 담아 둔 것과 거의
    같은 과제를 다시 만들어 줍니다.

    예전에는 이 자리에 서버가 들고 있는 예시 과제 카탈로그(`prompts/templates.json`)
    가 들어갔습니다. 카탈로그는 도메인이 고정 8칸이던 시절의 것이라, 도메인이
    사용자마다 다른 자유 이름이 된 뒤로는 **카탈로그의 칸 이름이 사용자 시트에
    없는 칸을 새로 만들게** 만들었습니다(유산소 운동 → "건강" 칸 신설). 사용자
    시트에서 후보를 뽑으면 그 문제가 성립하지 않습니다.
    """

    #: 필드 이름은 `DomainRef` 와 같은 이유로 Spring 응답에 맞췄습니다.
    model_config = ConfigDict(populate_by_name=True)

    #: `subject` 테이블의 PK. **`recommend` 는 이 값으로만 과제를 지목합니다** —
    #: 제목을 베끼게 두면 그 필드에서 생성이 무너지는 일이 있었습니다(`_resolve_match`).
    #: 없는 과제는 후보에서 빠집니다. 시트에 저장된 과제에는 항상 있습니다.
    subjectId: int | None = Field(
        default=None, validation_alias=AliasChoices("subjectId", "id")
    )
    title: str
    #: 담을 때 정한 실천 주기. `recommend` 응답의 빈도는 모델이 추측하지 않고
    #: 이 값을 그대로 씁니다. 없으면 채팅 문구에서 빈도 표시만 생략됩니다.
    #:
    #: **전송 이름은 `period` 가 정본입니다.** Spring 이 이 값을
    #: `SheetDetailResponse.SubjectDetailResponse.period`(enum `SubjectPeriod`)로
    #: 내보냅니다. 시트 응답에서 이름이 어긋나는 필드는 이거 하나뿐이었고, 그래서
    #: 응답을 그대로 실어 보내면 **빈도만 조용히 `None` 이 됐습니다** — 검증기도 안
    #: 걸리고(값이 애초에 안 들어옴) 에러도 없이 빈도 표시와 `FREQUENCY_BONUS` 가
    #: 같이 죽습니다. `domainId`/`id` 를 양쪽 받는 이유와 같은 종류입니다.
    #:
    #: `SubjectPeriod` 는 `@JsonValue` 로 소문자(`daily`/`weekly`/`none`)를 내보내므로
    #: `FREQUENCIES` 와 값이 그대로 맞습니다 — 변환이 필요 없습니다.
    #:
    #: **필드 이름을 `period` 로 바꾸지 않은 이유는 `frequency` 가 이 저장소의 내부
    #: 이름이 아니라 모델과의 계약 이름이기 때문입니다** — `GOAL_SCHEMA` ·
    #: `CLASSIFY_SCHEMA` 의 필드 이름이고 `prompts/system.md` 의 `task_frequency`
    #: 규칙과 `<examples>` JSON 이 같은 낱말을 씁니다. 통일하려면 프롬프트와
    #: responseSchema 를 같이 고쳐야 하는데, 그건 얻는 것이 이름 정돈뿐인데도
    #: 실서버 재검증이 필요한 자리입니다(`LEARNING.md` 15절). 브라우저 두 곳
    #: (`../ai/static/js` · `ai_livekit/web`)도 이미 `frequency` 로 보냅니다.
    frequency: str | None = Field(
        default=None, validation_alias=AliasChoices("period", "frequency")
    )

    @field_validator("title")
    @classmethod
    def _clean_title(cls, v: str) -> str:
        return v.strip()[:MAX_SUBJECT_TITLE_LENGTH]

    @field_validator("frequency")
    @classmethod
    def _known_frequency(cls, v: str | None) -> str | None:
        """모르는 빈도는 **버립니다**(거부가 아니라 `None`).

        거부하면 빈도 하나 때문에 과제가 후보에서 빠지고, 그러면 중복 검사가 조용히
        약해집니다. `None` 으로 두면 `frequency_label()` 이 표시만 생략하고
        `as_prompt_line()` 도 필드를 싣지 않습니다 — 이미 있는 우아한 경로입니다.

        **`none` 으로 떨어뜨리지 않는 것이 중요합니다.** 모르는 값을 "한 번만" 으로
        단정하면 매일 해야 할 일이 한 번짜리로 굳습니다(`frequency_label` 주석 참고).
        """
        if v is None:
            return None
        cleaned = v.strip()
        if not cleaned:
            return None
        if cleaned not in FREQUENCIES:
            # 조용히 버리면 "왜 빈도가 안 보이지" 를 프롬프트에서 찾게 됩니다.
            logger.warning(
                "모르는 빈도 %r 를 버렸습니다 (허용: %s)", cleaned[:20], ", ".join(FREQUENCIES)
            )
            return None
        return cleaned


class DomainRef(BaseModel):
    """사용자 시트의 도메인 칸 하나.

    **고정 목록이 아닙니다.** 도메인은 시트마다 다르고 사용자가 직접 만들 수 있어서,
    서버가 아는 유일한 방법은 클라이언트가 실어 보내는 것입니다. AI 는 이 목록에
    없는 도메인을 새로 제안할 수도 있습니다 — 그때 "새 칸인가" 는 모델에게 묻지
    않고 이 목록과 비교해 서버가 판단합니다.
    """

    #: 필드 이름은 Spring 의 `SheetDetailResponse.DomainDetailResponse` 와 맞췄습니다 —
    #: 프론트가 `GET /api/v1/sheets/{sheetId}` 응답의 `domains[]` 를 그대로 실어 보낼 수
    #: 있어야 매핑 코드가 한 겹 줄어듭니다.
    model_config = ConfigDict(populate_by_name=True)

    #: `domain` 테이블의 PK. 새로 만들 칸에는 없으므로 nullable 입니다.
    #: 담기 payload 에 실어 보내면 프론트가 `subject` 를 만들 때 그대로 씁니다.
    #:
    #: **`id` 로도 받습니다.** 이름이 어긋나면 값이 조용히 `None` 이 되고, 그러면 기존
    #: 칸을 새 칸으로 취급해 중복 생성으로 이어집니다 — 에러가 아니라 품질 저하로만
    #: 드러나는 종류라 양쪽을 다 받습니다.
    domainId: int | None = Field(
        default=None, validation_alias=AliasChoices("domainId", "id")
    )
    title: str
    #: 이 칸에 이미 담긴 과제 수. 프롬프트의 `<existing_domain_tasks>` 를 채웁니다.
    #:
    #: `subjects` 를 보내면 비워도 됩니다 — 그 길이로 셉니다(`_capacity_context`).
    #: 둘 다 보낼 때는 이 값이 우선입니다. 시트가 8개를 넘겨 잘린 경우에도 정원
    #: 계산은 실제 개수로 해야 하기 때문입니다.
    subjectCount: int = 0
    #: 이 칸에 담긴 과제들. **예전에는 받지 않던 값입니다** — "프롬프트에 넣지도
    #: 않을 값으로 본문만 커진다" 는 이유였는데, 이제 프롬프트에 들어갑니다.
    #:
    #: 선택 필드입니다. 안 보내면 중복 검사만 빠지고 나머지는 그대로 동작합니다 —
    #: 구버전 클라이언트가 입장 자체를 못 하게 만들지 않습니다.
    subjects: list[SubjectRef] = Field(default_factory=list)

    @field_validator("title")
    @classmethod
    def _clean_title(cls, v: str) -> str:
        return v.strip()[:MAX_DOMAIN_TITLE_LENGTH]

    @field_validator("subjectCount")
    @classmethod
    def _non_negative_count(cls, v: int) -> int:
        """음수는 0 으로. **상한은 두지 않습니다.**

        이 값은 프롬프트의 `<existing_domain_tasks>` 로 가서 "도메인당 8개" 정원 규칙의
        입력이 됩니다. 음수는 의미가 없어 0 으로 접습니다.

        8 로 자르지 않는 이유: `subjects` 는 `MAX_SUBJECTS_PER_DOMAIN` 으로 잘리지만
        **이 값은 잘린 뒤에도 실제 개수여야 합니다.** 시트에 9개가 있으면 모델은 "꽉 찼다"
        를 알아야 하고, 8 로 접으면 한 자리 남은 것처럼 보입니다.
        """
        return max(0, v)

    @field_validator("subjects")
    @classmethod
    def _clean_subjects(cls, v: list[SubjectRef]) -> list[SubjectRef]:
        # 제목이 빈 과제는 `domains` 의 빈 칸과 같은 이유로 버립니다 — 프롬프트에
        # 넣을 값이 없고, 모델이 그 빈 줄을 흉내내 빈 제안을 만듭니다.
        return [s for s in v if s.title][:MAX_SUBJECTS_PER_DOMAIN]


def drop_untitled_domains(domains: list[DomainRef]) -> list[DomainRef]:
    """제목이 빈 칸을 버립니다.

    프롬프트에 넣을 값이 없고, 모델이 그 빈 줄을 흉내내 **빈 도메인을 제안**하게
    만듭니다.

    시트를 실어 보내는 메시지가 둘(`join` · `sheet-update`)이라 여기 둡니다. 양쪽에
    같은 검증기를 복사해 두면 한쪽만 고치는 날이 옵니다 — 그때 증상은 에러가 아니라
    "가끔 빈 과제를 제안한다" 로만 드러납니다.
    """
    return [d for d in domains if d.title]
