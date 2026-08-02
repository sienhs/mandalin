"""사용자 시트에 이미 담긴 과제에서 후보를 고릅니다.

목표 설계 프롬프트의 `<existing_subjects>` 슬롯을 채우는 자리입니다.
**"이미 담아 둔 것과 겹치는지" 를 모델이 판단하려면 그 목록이 프롬프트 안에
들어와 있어야 하고, 그 목록을 고르는 건 LLM 이 할 일이 아닙니다.** 그래서
2단계는 모델 호출이 아니라 검색입니다.

**예전에는 서버가 들고 있는 예시 과제 카탈로그를 검색했습니다**
(`prompts/templates.json` + `TemplateStore`). 카탈로그는 도메인이 고정 8칸이던
시절의 자산이라, 도메인이 사용자마다 다른 자유 이름이 된 뒤로 칸 이름 체계가
어긋났습니다 — "유산소 운동" 을 카탈로그의 `건강` 과 매칭하면 `운동하기` 칸을
가진 사용자에게 `건강` 칸을 새로 만들어 주는 식입니다. 후보를 사용자 시트에서
뽑으면 후보의 도메인이 처음부터 사용자 칸이라 그 문제가 성립하지 않습니다.

**여기 들어 있는 랭커는 의미 검색이 아닙니다.** 임베딩 모델도 벡터 DB 도 없이
글자 바이그램 자카드 유사도로 순위를 매깁니다. "알고리즘 풀기" 처럼 표현이
겹치면 잘 찾지만, "코테 준비" 같은 의역은 못 잡습니다.

의도한 것은 **시임(seam)** 입니다. 나중에 pgvector/FAISS 로 바꿀 때 갈아끼울
곳은 `search()` 하나이고, 프롬프트도 파이프라인도 그대로입니다.
"""
from __future__ import annotations

import logging
from collections.abc import Sequence
from dataclasses import dataclass

from mandarin_goal.sheet import FREQUENCIES, DomainRef

logger = logging.getLogger(__name__)


#: 과제를 실천하는 주기. **`mission`/`mindset` 구분과 `is_recurring` 을 대체합니다.**
#:
#: 예전에는 과제를 성격(달성형 `mission` / 태도형 `mindset`)으로 나누고 반복 여부를
#: 따로 뒀습니다. 두 축이 사실상 같은 것을 두 번 말하고 있었고 — 태도형은 늘 반복,
#: 달성형은 둘 다 가능 — 사용자가 실제로 정하는 건 "얼마나 자주 하느냐" 하나라서
#: 이 필드 하나로 합쳤습니다. 옛 `mindset` 과제는 대부분 `daily` 로 흡수됩니다.
#:
#: 값은 세 개뿐입니다. **월간·분기 같은 중간 주기는 표현할 수 없습니다** — 그런
#: 과제는 가장 가까운 값으로 내려앉습니다(월 1회 → `none`).
#:
#: `Candidate` 가 이 어휘를 쓰는 쪽이라 여기 둡니다. `goal.py` 가 스키마와 채팅
#: 문구를 만들 때 가져다 씁니다(반대 방향으로 import 하면 순환입니다).
#: 라벨은 `web/app.js` 의 `FREQUENCY_LABELS` 와 같은 문자열입니다. 채팅 말풍선과 왼쪽 보드에
#: 같은 과제가 다른 이름으로 보이면 안 됩니다.
#: **어휘 자체는 `mandarin_goal/sheet.py` 의 `FREQUENCIES` 가 정본입니다.** 여기 있는 것은 라벨
#: (사람이 읽는 문구)이고, 데이터 제약은 그쪽입니다 — `SubjectRef` 가 클라이언트 입력을
#: 검증해야 해서 어휘가 상류로 올라갔습니다.
FREQUENCY_LABELS: dict[str, str] = {
    "daily": "일간 · 주 7회",
    "weekly": "주간 · 주 1회",
    "none": "없음 · 한 번만",
}

# 라벨과 어휘가 어긋나면 검증은 통과하는데 화면에 빈도가 안 나오는 조합이 생깁니다.
# 기동 시점에 잡습니다 — 테스트가 없는 배포에서도 걸립니다.
assert tuple(FREQUENCY_LABELS) == FREQUENCIES, (
    f"FREQUENCY_LABELS {tuple(FREQUENCY_LABELS)} 와 "
    f"mandarin_goal.sheet.FREQUENCIES {FREQUENCIES} 가 어긋납니다"
)

def frequency_label(value: str | None) -> str | None:
    """사람이 읽을 빈도 표시. 모르는 값이면 `None` 이라 호출하는 쪽이 생략합니다.

    **서버에는 기본값이 없습니다.** 예전에는 `DEFAULT_FREQUENCY = "none"` 이 있었고
    카탈로그 항목이 빈도를 빠뜨렸을 때 쓰였는데, 카탈로그가 없어지면서 쓰는 곳이
    사라졌습니다. 되살리지 마세요 — 모르는 값을 `none`("한 번만")으로 단정하면
    매일 해야 할 일이 한 번짜리로 담깁니다. 여기서 `None` 을 돌려주면 `render()` 의
    `titled()` 가 빈도 표시만 조용히 생략합니다.

    폴백이 필요한 곳은 브라우저 보드뿐입니다(`web/app.js`). 거기서는 칩에 무언가는
    그려야 하기 때문입니다.
    """
    return FREQUENCY_LABELS.get((value or "").strip())


@dataclass(frozen=True)
class Candidate:
    """후보 한 건 — 사용자 시트의 과제 하나입니다."""

    #: `subject` 테이블의 PK. **모델은 이 값으로만 과제를 지목합니다.**
    id: int
    #: 사용자 칸 이름. 카탈로그 시절과 달리 **이미 사용자 시트의 이름**이라
    #: `_resolve_match` 가 이 값으로 도메인을 덮어써도 새 칸이 생기지 않습니다.
    domain: str
    title: str
    #: 담을 때 정한 주기. 시트에 없으면 `None` 이고, 그때는 채팅 문구에서
    #: 빈도 표시만 생략됩니다 — 모르는 값을 `none` 으로 단정하지 않습니다.
    frequency: str | None = None

    def as_prompt_line(self) -> str:
        parts = [f'"subject_id": {self.id}', f'"domain": "{self.domain}"']
        parts.append(f'"title": "{self.title}"')
        if self.frequency:
            parts.append(f'"frequency": "{self.frequency}"')
        return "- {" + ", ".join(parts) + "}"


def _bigrams(text: str) -> set[str]:
    """공백을 지운 글자 바이그램.

    한국어는 어절 단위로 잘라 비교하면 조사 때문에 잘 안 맞습니다("알고리즘을"
    vs "알고리즘"). 글자 단위로 겹치면 그 문제가 사라집니다.
    """
    packed = "".join(text.split())
    if len(packed) < 2:
        return {packed} if packed else set()
    return {packed[i : i + 2] for i in range(len(packed) - 1)}


#: 같은 도메인에 주는 가점. 유사도(0~1)와 같은 축에서 비교되는 값입니다.
#:
#: 0.15 인 이유: 유사도가 전부 0 인 흔한 경우에는 도메인이 순서를 정해야 하고,
#: 반대로 다른 도메인에 0.3 짜리 확실한 매칭이 있으면 그게 이겨야 합니다.
#: 두 조건을 만족하는 가장 작은 값 근처입니다.
DOMAIN_BONUS = 0.15

#: 발화가 **명시한** 주기와 후보의 주기가 같을 때 주는 가점.
#:
#: 도메인 가점보다 작습니다. 도메인은 사용자 시트의 어휘라 신뢰도가 높은데, 주기는
#: 발화에 나온 경우에만 채워지는 값이라 근거가 얇습니다.
#:
#: **이 값이 실제로 일하는 자리는 제목이 거의 같고 주기만 다른 후보들입니다** —
#: "주 1회 산책" 과 "매일 산책" 은 바이그램 유사도가 사실상 같아서 순서가 임의로
#: 정해지고, `BOT_CANDIDATE_COUNT` 상한에서 맞는 쪽이 잘려 나갈 수 있습니다.
#:
#: **불일치에 감점은 주지 않습니다.** 주기가 다른 후보도 프롬프트에 남아야 합니다 —
#: 판단은 모델이 하고(`prompts/system.md`: "행동과 빈도가 둘 다 같아야 겹친다"),
#: 검색이 미리 지우면 모델이 "비슷하지만 주기가 다른 것이 있다" 를 알 수 없습니다.
FREQUENCY_BONUS = 0.10


def similarity(a: str, b: str) -> float:
    """자카드 유사도 0.0~1.0."""
    left, right = _bigrams(a.lower()), _bigrams(b.lower())
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


def to_candidates(domains: Sequence[DomainRef]) -> list[Candidate]:
    """`join` 이 실어 보낸 시트를 후보 목록으로 폅니다.

    **`subjectId` 가 없는 과제는 버립니다.** 모델이 지목할 방법이 없어서입니다 —
    제목으로 지목하게 두면 그 필드에서 생성이 무너지는 사고를 다시 부릅니다
    (`_resolve_match` 주석 참고). 시트에 저장된 과제에는 항상 PK 가 있으므로,
    이 경로로 버려지는 건 클라이언트가 id 를 빠뜨렸을 때뿐입니다.
    """
    out: list[Candidate] = []
    dropped = 0
    for domain in domains:
        for subject in domain.subjects:
            if subject.subjectId is None:
                dropped += 1
                continue
            out.append(
                Candidate(
                    id=subject.subjectId,
                    domain=domain.title,
                    title=subject.title,
                    frequency=subject.frequency,
                )
            )
    if dropped:
        # 조용히 지나가면 "중복 검사가 왜 안 되지" 를 프롬프트에서 찾게 됩니다.
        logger.warning(
            "subjectId 가 없는 과제 %d건을 후보에서 제외했습니다 "
            "(클라이언트가 join 에 id 를 실어야 합니다)", dropped
        )
    return out


def search(
    domains: Sequence[DomainRef],
    domain: str | None,
    query: str,
    limit: int,
    *,
    frequency: str | None = None,
) -> list[Candidate]:
    """질의와 비슷한 순으로 상위 `limit` 개. 같은 도메인·주기를 우대합니다.

    **도메인으로 걸러내지 않고 가점만 줍니다.** 1단계의 도메인 판단이 사용자
    칸 이름과 어긋나면 정답이 후보에서 아예 빠지기 때문입니다. 카탈로그 시절의
    실제 사례 —

        발화 "정보처리기사 따기", 1단계 판단 `학습`
        후보: 알고리즘·기술서적·사이드프로젝트·블로그 (유사도 전부 0.00)
        빠진 것: "정보처리기사 필기 기출 5개년 풀기" (0.31, 커리어)

    매칭할 게 없으니 모델은 `generate` 로 갔고, 새 제목을 쓰다 응답이
    무너졌습니다. 도메인 판단 하나가 틀리면 그 뒤가 전부 어긋나는 구조였습니다.

    `frequency` 도 같은 규칙입니다 — **가점이고 필터가 아닙니다**(`FREQUENCY_BONUS`).
    발화가 주기를 말하지 않았으면 `None` 이고 순위에 영향을 주지 않습니다.

    `query` 는 원문보다 **정규화된 실천 내용**(1단계의 `what`)이 낫습니다. 원문은
    조사·어미·군말이 섞여 바이그램 유사도를 희석합니다.
    """
    candidates = to_candidates(domains)
    if not candidates:
        return []
    ranked = sorted(
        candidates,
        key=lambda c: similarity(query, c.title)
        + (DOMAIN_BONUS if c.domain == domain else 0.0)
        + (FREQUENCY_BONUS if frequency and c.frequency == frequency else 0.0),
        reverse=True,
    )
    return ranked[: max(0, limit)]
