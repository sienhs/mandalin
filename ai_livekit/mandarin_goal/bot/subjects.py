"""사용자 시트에 이미 담긴 과제에서 후보를 고릅니다.

목표 설계 프롬프트의 `<existing_subjects>` 슬롯을 채우는 자리입니다.
**"이미 담아 둔 것과 겹치는지" 를 모델이 판단하려면 그 목록이 프롬프트 안에
들어와 있어야 하고, 그 목록을 고르는 건 LLM 이 할 일이 아닙니다.** 그래서
2단계는 모델 호출이 아니라 검색입니다.

**후보는 반드시 사용자 시트에서 뽑습니다.** 서버가 들고 있는 예시 목록에서 뽑으면
그 목록의 칸 이름이 사용자 시트에 없는 칸을 새로 만들게 됩니다 — "유산소 운동" 을
`건강` 과 매칭하면 `운동하기` 칸을 가진 사용자에게 `건강` 칸이 생기는 식입니다.
사용자 시트에서 뽑으면 후보의 도메인이 처음부터 사용자 칸이라 그 문제가 성립하지
않습니다.

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


#: 과제를 실천하는 주기. **사용자가 정하는 축은 "얼마나 자주 하느냐" 하나입니다** —
#: 과제 성격(달성형/태도형)과 반복 여부를 따로 두면 같은 것을 두 번 말하게 됩니다.
#:
#: 값은 네 개입니다 — 일간·주간·월간·한번만. **주기와 횟수가 짝입니다**: 주기는 "얼마나
#: 자주 세느냐" 이고, 횟수(`count_per_period`)는 "그 안에서 몇 번" 입니다.
#: 일간과 한번만은 횟수가 1 로 **고정**이라 사용자도 바꾸지 못하고, 주간(1~7)과
#: 월간(1~30)만 범위 안에서 정할 수 있습니다(`sheet.FREQUENCY_MAX_COUNT`).
#:
#: **라벨에 횟수를 박아 두지 않습니다.** 예전에는 `"weekly": "주간 · 주 1회"` 였는데,
#: 주간이 1~7회가 된 뒤로 그 문자열은 주 3회짜리 과제를 **주 1회로 표시합니다** —
#: 값은 맞는데 화면만 틀리는, 제일 찾기 어려운 종류입니다. 횟수는
#: `frequency_label()` 이 받아 붙입니다.
#:
#: `Candidate` 가 이 어휘를 쓰는 쪽이라 여기 둡니다. `goal.py` 가 스키마와 채팅
#: 문구를 만들 때 가져다 씁니다(반대 방향으로 import 하면 순환입니다).
#: 라벨은 `web/app.js` 의 `FREQUENCY_LABELS` 와 같은 문자열입니다. 채팅 말풍선과 왼쪽 보드에
#: 같은 과제가 다른 이름으로 보이면 안 됩니다.
#: **어휘 자체는 `mandarin_goal/sheet.py` 의 `FREQUENCIES` 가 정본입니다.** 여기 있는 것은 라벨
#: (사람이 읽는 문구)이고, 데이터 제약은 그쪽입니다 — `SubjectRef` 가 클라이언트 입력을
#: 검증해야 해서 어휘가 상류로 올라갔습니다.
FREQUENCY_LABELS: dict[str, str] = {
    "daily": "일간",
    "weekly": "주간",
    "monthly": "월간",
    "none": "한번만",
}

#: 횟수를 붙일 때 쓰는 단위. `daily`/`none` 은 고정 1 이라 셀 것이 없어 문장으로 씁니다.
FREQUENCY_COUNT_SUFFIX: dict[str, str] = {
    "daily": "하루 1회",
    "weekly": "주 {n}회",
    "monthly": "월 {n}회",
    "none": "기간 내 1회",
}

# 라벨과 어휘가 어긋나면 검증은 통과하는데 화면에 빈도가 안 나오는 조합이 생깁니다.
# 기동 시점에 잡습니다 — 테스트가 없는 배포에서도 걸립니다.
assert tuple(FREQUENCY_LABELS) == FREQUENCIES, (
    f"FREQUENCY_LABELS {tuple(FREQUENCY_LABELS)} 와 "
    f"mandarin_goal.sheet.FREQUENCIES {FREQUENCIES} 가 어긋납니다"
)

def frequency_label(value: str | None, count: int | None = None) -> str | None:
    """사람이 읽을 빈도 표시. 모르는 값이면 `None` 이라 호출하는 쪽이 생략합니다.

    `frequency_label("weekly", 3)` → `"주간 · 주 3회"`,
    `frequency_label("daily")` → `"일간 · 하루 1회"`.

    **횟수를 모르면 주기만 씁니다** — 없는 값을 1 로 단정하지 않습니다. 주 3회짜리
    과제를 "주 1회" 로 보여 주면 사용자는 화면을 믿고 잘못 실천합니다. 고정 주기
    (일간·한번만)는 애초에 셀 것이 없으므로 횟수 없이도 문장이 완성됩니다.

    **서버에 기본값을 두지 마세요.** 모르는 주기를 `none`("한 번만")으로 단정하면 매일
    해야 할 일이 한 번짜리로 담깁니다. 여기서 `None` 을 돌려주면 `render()` 의
    `titled()` 가 빈도 표시만 조용히 생략합니다.

    폴백이 필요한 곳은 브라우저 보드뿐입니다(`web/app.js`). 거기서는 칩에 무언가는
    그려야 하기 때문입니다.
    """
    key = (value or "").strip()
    label = FREQUENCY_LABELS.get(key)
    if label is None:
        return None
    suffix = FREQUENCY_COUNT_SUFFIX[key]
    if "{n}" not in suffix:
        return f"{label} · {suffix}"
    if count is None:
        return label
    return f"{label} · {suffix.format(n=count)}"


def compact_frequency(value: str | None, count: int | None = None) -> str:
    """빈도를 **짧게**. `"daily"` → `"일간"`, `("weekly", 3)` → `"주3"`.

    `frequency_label()` 과 같은 어휘를 쓰지만 길이가 다릅니다. 저쪽은 사람이 읽는
    말풍선용이라 `"주간 · 주 3회"` 로 풀어 쓰는데, 이 함수가 쓰이는 자리는 **시트
    전체를 프롬프트에 싣는 목록**(`_capacity_context`)이라 과제 하나에 몇 글자가
    64배로 늘어납니다. 그래서 주기 이름 + 횟수만 붙입니다.

    모르는 주기는 빈 문자열입니다 — `frequency_label()` 처럼 `None` 으로 두고 호출하는
    쪽에서 갈라 쓰게 하면 목록 조립이 지저분해지고, 여기서 빠지는 것은 괄호 한 짝뿐입니다.
    """
    key = (value or "").strip()
    label = FREQUENCY_LABELS.get(key)
    if label is None:
        return ""
    # 고정 주기(일간·한번만)는 셀 것이 없어 주기 이름이 곧 빈도입니다.
    if "{n}" not in FREQUENCY_COUNT_SUFFIX[key]:
        return label
    # 주간·월간은 횟수가 빈도의 일부입니다 — 빼면 "주 1회" 와 "주 5회" 가 같은 줄이 됩니다.
    return label if count is None else f"{label[0]}{count}"


@dataclass(frozen=True)
class Candidate:
    """후보 한 건 — 사용자 시트의 과제 하나입니다."""

    #: `subject` 테이블의 PK. **모델은 이 값으로만 과제를 지목합니다.**
    id: int
    #: 사용자 칸 이름. **이미 사용자 시트에 있는 이름**이라 `_resolve_match` 가
    #: 이 값으로 도메인을 덮어써도 새 칸이 생기지 않습니다.
    domain: str
    title: str
    #: 담을 때 정한 주기. 시트에 없으면 `None` 이고, 그때는 채팅 문구에서
    #: 빈도 표시만 생략됩니다 — 모르는 값을 `none` 으로 단정하지 않습니다.
    frequency: str | None = None
    #: 그 주기 안의 횟수("주 3회" 의 3). 주기가 없으면 이 값도 없습니다.
    count: int | None = None

    def as_prompt_line(self) -> str:
        """후보 한 줄. **횟수까지 싣습니다.**

        중복 판정의 기준이 "행동과 빈도가 둘 다 같아야 겹친다" 인데, 주간이 1~7회로
        갈라진 뒤로는 주기만으로 빈도가 정해지지 않습니다 — 횟수를 빼면 모델에게
        "주 1회 러닝" 과 "주 5회 러닝" 이 같은 줄로 보입니다.
        """
        parts = [f'"subject_id": {self.id}', f'"domain": "{self.domain}"']
        parts.append(f'"title": "{self.title}"')
        if self.frequency:
            parts.append(f'"frequency": "{self.frequency}"')
            if self.count is not None:
                parts.append(f'"count": {self.count}')
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

#: 발화가 **명시한** 빈도와 후보의 빈도가 같을 때 주는 가점 — 주기와 횟수 둘 다.
#:
#: 도메인 가점보다 작습니다. 도메인은 사용자 시트의 어휘라 신뢰도가 높은데, 빈도는
#: 발화에 나온 경우에만 채워지는 값이라 근거가 얇습니다.
#:
#: **이 값이 실제로 일하는 자리는 제목이 거의 같고 빈도만 다른 후보들입니다** —
#: "주 1회 산책" 과 "매일 산책" 은 바이그램 유사도가 사실상 같아서 순서가 임의로
#: 정해지고, `BOT_CANDIDATE_COUNT` 상한에서 맞는 쪽이 잘려 나갈 수 있습니다.
#:
#: **불일치에 감점은 주지 않습니다.** 빈도가 다른 후보도 프롬프트에 남아야 합니다 —
#: 판단은 모델이 하고(`prompts/system.md`: "행동과 빈도가 둘 다 같아야 겹친다"),
#: 검색이 미리 지우면 모델이 "비슷하지만 빈도가 다른 것이 있다" 를 알 수 없습니다.
FREQUENCY_BONUS = 0.10

#: 주기는 같고 **횟수만** 다를 때 주는 가점.
#:
#: **왜 필요한가.** 주기만 보던 동안 "주 1회 러닝" 과 "주 5회 러닝" 은 점수가 **완전히
#: 같았습니다** — 제목 바이그램도 같고 주기(weekly)도 같아서, 순서가 임의로 정해지고
#: `BOT_CANDIDATE_COUNT`(기본 5) 상한에서 맞는 쪽이 잘려 나갈 수 있었습니다. 주기가
#: 1~7회로 갈라진 뒤로 생긴 구멍이고, 프롬프트는 그 사이 "횟수도 빈도의 일부" 라고
#: 말하고 있었습니다(`prompts/system.md` 규칙 4).
#:
#: **`FREQUENCY_BONUS` 를 넘지 않게 나눕니다 — 더하지 않습니다.** 두 가점을 합치면
#: 최대가 `DOMAIN_BONUS`(0.15)에 닿아, "다른 도메인의 확실한 매칭보다 같은 도메인이
#: 이긴다" 는 그 값의 근거가 무너집니다. 횟수는 주기가 이미 맞은 뒤의 **미세 조정**이라
#: 같은 예산 안에서 갈라 쓰는 것이 맞습니다.
#:
#: 값이 0 이 아닌 이유: 횟수가 달라도 "주 1회 러닝" 은 주기가 다른 후보보다 여전히
#: 가까운 후보입니다. 0 으로 두면 그 순위가 주기 불일치와 같아집니다.
FREQUENCY_PARTIAL_BONUS = 0.06


def similarity(a: str, b: str) -> float:
    """자카드 유사도 0.0~1.0."""
    left, right = _bigrams(a.lower()), _bigrams(b.lower())
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


def frequency_score(
    candidate: Candidate, frequency: str | None, count: int | None
) -> float:
    """빈도 가점. 주기가 맞아야 시작하고, 횟수가 그 안에서 등급을 가릅니다.

    `count` 가 `None` 인 것은 **"발화가 횟수를 말하지 않았다"** 이고, 그때는 주기까지만
    본 값(`FREQUENCY_BONUS`)을 그대로 줍니다 — 말하지 않은 것을 1 로 단정하면 "러닝하고
    싶어" 가 주 5회 러닝을 **강등시킵니다.** (`normalise_count` 가 `None` 을 1 로 떨어뜨리는
    것과 갈라야 하는 자리라 호출하는 쪽이 미리 가려서 넘깁니다 — `goal.py` 의 `_run`.)

    후보 쪽 `count` 가 없는 경우도 같습니다. 시트에 주기는 있고 횟수가 없는 과제라,
    다르다고 볼 근거가 없습니다.

    고정 주기(daily·none)는 횟수가 1 로 고정이라 이 갈래가 사실상 타지 않습니다.
    """
    if not frequency or candidate.frequency != frequency:
        # 주기가 다르면 가점 없음. **감점도 없습니다**(`FREQUENCY_BONUS` 주석).
        return 0.0
    if count is None or candidate.count is None:
        return FREQUENCY_BONUS
    return FREQUENCY_BONUS if candidate.count == count else FREQUENCY_PARTIAL_BONUS


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
                    # `SubjectRef` 가 이미 주기에 맞춰 놓은 값입니다(`_settle_count`).
                    count=subject.count,
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
    count: int | None = None,
) -> list[Candidate]:
    """질의와 비슷한 순으로 상위 `limit` 개. 같은 도메인·빈도를 우대합니다.

    **도메인으로 걸러내지 않고 가점만 줍니다.** 1단계의 도메인 판단이 사용자
    칸 이름과 어긋나면 정답이 후보에서 아예 빠지기 때문입니다. 실제 사례 —

        발화 "정보처리기사 따기", 1단계 판단 `학습`
        후보: 알고리즘·기술서적·사이드프로젝트·블로그 (유사도 전부 0.00)
        빠진 것: "정보처리기사 필기 기출 5개년 풀기" (0.31, 커리어)

    매칭할 게 없으니 모델은 `generate` 로 갔고, 새 제목을 쓰다 응답이
    무너졌습니다. 도메인 판단 하나가 틀리면 그 뒤가 전부 어긋나는 구조였습니다.

    `frequency`·`count` 도 같은 규칙입니다 — **가점이고 필터가 아닙니다**
    (`FREQUENCY_BONUS`). 발화가 말하지 않았으면 `None` 이고 순위에 영향을 주지 않습니다.

    **`count` 를 보는 이유**는 주기만으로 빈도가 정해지지 않아서입니다. 주간이 1~7회로
    갈라진 뒤 "주 1회 러닝" 과 "주 5회 러닝" 은 점수가 완전히 같아졌고, 그러면 `limit`
    상한에서 맞는 쪽이 임의로 잘려 나갑니다(`FREQUENCY_PARTIAL_BONUS`).

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
        + frequency_score(c, frequency, count),
        reverse=True,
    )
    return ranked[: max(0, limit)]
