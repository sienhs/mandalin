"""사용자 시트의 데이터 모델 — 도메인 칸과 그 안에 담긴 과제."""
from __future__ import annotations

import logging

from pydantic import (
    AliasChoices,
    BaseModel,
    ConfigDict,
    Field,
    field_validator,
    model_validator,
)

logger = logging.getLogger(__name__)

#: 시트가 실어 보낼 도메인 개수 상한.
#:
#: **이 값들은 그대로 LLM 프롬프트에 들어갑니다.** 태그 위조는 `escape_slot_value`
#: 가 막지만 분량은 막지 못합니다 — 자르지 않으면 도메인 1,000개로 진짜 지시문을
#: 모델 주의 밖으로 밀어낼 수 있고, 그 비용은 매 발화마다 청구됩니다.
#:
#: **16 은 만다라트 8칸의 두 배입니다.** 정원이 아니라 남용 천장이라 여유를 뒀습니다 —
#: 초과는 잘라내지 않고 거부하므로(`agent/sheet_transfer.py` 의 `SheetPayload`) 8 에 딱
#: 맞추면 클라이언트가 조금만 어긋나도 시트가 통째로 버려지고 중복 검사가 조용히
#: 죽습니다.
MAX_DOMAINS = 16
MAX_DOMAIN_TITLE_LENGTH = 40

#: 만다라트의 세부 목표 **정원**. `MAX_DOMAINS`(전송 상한)와 다른 값이고 다른 일을 합니다 —
#: 그쪽은 남용을 막는 천장이고, 이쪽은 "새 칸을 지어도 되는가" 를 가릅니다.
#:
#: AI 는 시트에 없는 칸을 새로 제안할 수 있습니다. 그 권한의 유일한 경계가 이 값입니다:
#: 자리가 남았으면 지어도 되고, 8칸이 찼으면 지을 수 없습니다(담을 자리가 없으므로
#: 담기가 취소되고 되묻게 됩니다 — `bot/goal.py` 의 `_unknown_domain`).
#:
#: **셀 수 있는 규칙이라 프롬프트에 넣습니다.** 셀 수 없는 규칙은 근거 없는 지시일 뿐이라
#: 토큰만 씁니다(`_capacity_context` 의 같은 판단).
DOMAIN_SLOTS = 8

#: 칸 하나가 실어 보낼 수 있는 과제 개수와 제목 길이.
#: 8 은 만다라트 정원(9x9 이중 3x3)과 같은 값입니다. 시트가 그보다 많이 담을 수
#: 없으므로 이 상한에 걸리는 건 클라이언트가 잘못 보냈을 때뿐입니다.
#:
#: **전송 상한과 정원이 같은 값이라 하나로 씁니다.** `MAX_DOMAINS`(16) 와
#: `DOMAIN_SLOTS`(8) 를 가른 것과 다른 경우입니다 — 그쪽은 남용 천장과 정원이 실제로
#: 다른 값이지만, 여기는 둘 다 "3x3 한 블록의 바깥 8칸" 이라는 같은 사실입니다.
#: 두 상수로 두면 8 이 두 곳에 적히고 한쪽만 고치는 날이 옵니다.
#:
#: 정원으로 쓰는 곳은 `bot/goal.py` 의 `_settle_capacity` 입니다 — 남은 자리보다 많이
#: 만든 턴을 잘라냅니다. 프롬프트에도 같은 규칙이 있지만(`prompts/fragments/
#: domain_capacity.md`) 프롬프트는 어겨도 조용히 통과합니다.
MAX_SUBJECTS_PER_DOMAIN = 8
MAX_SUBJECT_TITLE_LENGTH = 60

#: 실천 빈도의 어휘. 라벨(사람이 읽는 문구)은 `bot/subjects.py` 의`FREQUENCY_LABELS`
# 이고, 이쪽은 데이터 제약입니다.
#: 왜 위험한가: 후보 줄에 `"frequency": "매월"` 이 실려 가면 **모델이 그걸 읽고 배웁니다.**
#: 표현할 수 없는 주기를 따라 만들기 시작하고, 그건 에러가 아니라 품질 저하로만
#: 드러납니다.
FREQUENCIES: tuple[str, ...] = ("daily", "weekly", "monthly", "none")

#: 한 주기에 몇 번까지 수행할 수 있는가 — `subject.count_per_period` 의 상한입니다.
#:
#: **정본은 Spring 의 `SubjectPeriod` 이고 프론트의 `PERIOD_MAX_COUNT` 와 같은 표입니다.**
#: 1 인 값은 사용자가 정할 것이 없습니다(하루 1회, 기간 내 1회) — "고정" 이라 부르는 쪽입니다.
#:
#: **범위를 서버가 걸어 주지 않습니다.** `SheetCreateRequest` 의 어노테이션은
#: `@Min(1) @Max(30)` 뿐이고(상한이 `period` 값에 달려 있어서 못 박을 수 없습니다),
#: 주석에 *"화면이 주기에 맞는 상한을 걸어 보낸다"* 고 적혀 있습니다. AI 도 화면과 같은
#: 자리에 있으므로 **여기서 걸어야 합니다** — 안 걸면 모델이 "주 10회" 를 내는 날
#: 그대로 저장되고, 그건 에러가 아니라 사용자가 못 채우는 목표로만 드러납니다.
FREQUENCY_MAX_COUNT: dict[str, int] = {
    "daily": 1,
    "weekly": 7,
    "monthly": 30,
    "none": 1,
}

# 어휘와 상한 표가 어긋나면 `normalise_count` 가 모르는 주기를 만나 조용히 1 로
# 떨어뜨립니다. 기동 시점에 잡습니다 — `bot/subjects.py` 의 라벨 검사와 같은 이유입니다.
assert tuple(FREQUENCY_MAX_COUNT) == FREQUENCIES, (
    f"FREQUENCY_MAX_COUNT {tuple(FREQUENCY_MAX_COUNT)} 와 FREQUENCIES {FREQUENCIES} 가 어긋납니다"
)


def normalise_count(frequency: str | None, count: object) -> int | None:
    """`count_per_period` 를 그 주기에서 **실제로 가능한 값**으로 맞춥니다.

    셋을 한 함수에 모은 이유는 세 곳이 같은 규칙을 따라야 하기 때문입니다 —
    시트로 들어오는 값(`SubjectRef`), 모델이 만든 값(`bot/goal.py`), 그리고 후보 줄에
    실려 모델이 배우는 값(`bot/subjects.py`).

      - 주기를 모르면 `None`. 횟수만 아는 것은 쓸 데가 없고, 기본값 1 을 붙이면
        "한 번만" 인지 "모른다" 인지 구분이 사라집니다.
      - **고정 주기는 값을 무시하고 1 입니다.** daily·none 은 사용자도 못 바꾸는
        자리라, 모델이 3 을 내밀어도 그건 제안이 아니라 오류입니다.
      - 나머지는 1..상한으로 **자릅니다**(거부하지 않습니다). 거부하면 횟수 하나
        때문에 과제가 통째로 사라지는데, 자르면 사용자가 편집기에서 고칠 수 있는
        형태로 남습니다.
      - 값이 없거나 숫자가 아니면 1. 여기서만은 기본값을 둡니다 — 주기를 아는 이상
        "최소 한 번" 은 확실하고, `NOT NULL DEFAULT 1` 인 컬럼이기도 합니다.
    """
    if not frequency or frequency not in FREQUENCY_MAX_COUNT:
        return None
    ceiling = FREQUENCY_MAX_COUNT[frequency]
    if ceiling == 1:
        return 1
    try:
        wanted = int(count)  # type: ignore[arg-type]
    except (TypeError, ValueError):
        return 1
    if wanted < 1:
        return 1
    if wanted > ceiling:
        logger.info(
            "%s 주기의 횟수 %d 는 상한 %d 을 넘어 잘랐습니다", frequency, wanted, ceiling
        )
        return ceiling
    return wanted


class SubjectRef(BaseModel):
    """사용자 시트에 **이미 담겨 있는** 과제 하나.

    프롬프트의 `<existing_subjects>` 슬롯을 채웁니다. 목적은 추천이 아니라
    **중복 방지**입니다 — 이 목록이 없으면 AI 는 사용자가 이미 담아 둔 것과 거의
    같은 과제를 다시 만들어 줍니다.

    후보는 반드시 사용자 시트에서 뽑습니다. 서버가 들고 있는 목록에서 뽑으면 그
    목록의 칸 이름이 사용자 시트에 없는 칸을 새로 만들게 됩니다(유산소 운동 →
    "건강" 칸 신설).
    """

    #: 필드 이름은 `DomainRef` 와 같은 이유로 Spring 응답에 맞췄습니다.
    model_config = ConfigDict(populate_by_name=True)

    #: `subject` 테이블의 PK. `recommend` 는 이 값으로만 과제를 지목합니다—
    subjectId: int | None = Field(
        default=None, validation_alias=AliasChoices("subjectId", "id")
    )
    title: str
    #: 담을 때 정한 실천 주기. `recommend` 응답의 빈도는 모델이 추측하지 않고
    #: 이 값을 그대로 씁니다. 없으면 채팅 문구에서 빈도 표시만 생략됩니다.
    #:
    #: **전송 이름은 `period` 가 정본입니다.** Spring 이 이 값을
    #: `SheetDetailResponse.SubjectDetailResponse.period`(enum `SubjectPeriod`)로
    #: 내보냅니다.
    #:
    #: `SubjectPeriod` 는 `@JsonValue` 로 소문자(`daily`/`weekly`/`none`)를 내보내므로
    #: `FREQUENCIES` 와 값이 그대로 맞습니다 — 변환이 필요 없습니다.
    #:
    #: **필드 이름을 `period` 로 바꾸지 않은 이유는 `frequency` 가 이 저장소의 내부
    #: 이름이 아니라 모델과의 계약 이름이기 때문입니다** — `GOAL_SCHEMA` ·
    #: `CLASSIFY_SCHEMA` 의 필드 이름이고 `prompts/system.md` 의 `task_frequency`
    #: 규칙과 `<examples>` JSON 이 같은 낱말을 씁니다. 통일하려면 프롬프트와
    #: responseSchema 를 같이 고쳐야 하는데, 그건 얻는 것이 이름 정돈뿐인데도
    #: 실서버 재검증이 필요한 자리입니다. 브라우저(`web/app.js`)도 이미
    #: `frequency` 로 보냅니다.
    frequency: str | None = Field(
        default=None, validation_alias=AliasChoices("period", "frequency")
    )

    #: 한 주기에 몇 번 하는가 — "주 3회" 의 3 입니다.
    #:
    #: **전송 이름은 `countPerPeriod` 가 정본입니다**(Spring 의 `Subject.countPerPeriod`,
    #: 컬럼 `count_per_period`). 스네이크와 짧은 `count` 도 받습니다 — 이 봉투를 만드는
    #: 곳이 셋(프론트·브라우저 데모·eval 픽스처)이라, 이름 하나가 어긋나면 값이 조용히
    #: `None` 이 되고 증상은 "주 3회가 주 1회로 담긴다" 뿐입니다.
    #:
    #: **빈도와 짝입니다.** 이 값만으로는 아무 뜻이 없어서 `_settle_count` 가 빈도를 보고
    #: 맞춥니다(고정 주기는 1, 나머지는 상한까지).
    count: int | None = Field(
        default=None,
        validation_alias=AliasChoices("countPerPeriod", "count_per_period", "count"),
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

    @model_validator(mode="after")
    def _settle_count(self) -> SubjectRef:
        """횟수를 빈도에 맞춥니다. **빈도를 본 뒤여야 하므로 모델 검증입니다.**

        `field_validator` 로는 못 합니다 — 필드 하나만 보면 `weekly` 인지 `daily` 인지
        모르고, 그러면 하루 1회짜리 과제에 "주 5회" 가 남습니다.
        """
        settled = normalise_count(self.frequency, self.count)
        if settled != self.count:
            object.__setattr__(self, "count", settled)
        return self


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
    #:
    #: 선택 필드입니다. 안 보내면 중복 검사만 빠지고 나머지는 그대로 동작합니다 —
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
