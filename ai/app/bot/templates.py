"""예시 과제(subject template) 후보 검색.

목표 설계 프롬프트의 `<subject_template_candidates>` 슬롯을 채우는 자리입니다.
**"이미 있는 과제와 매칭할지, 새로 만들지" 를 모델이 판단하려면 후보 목록이
프롬프트 안에 들어와 있어야 하고, 그 목록을 고르는 건 LLM 이 할 일이 아닙니다.**
그래서 2단계는 모델 호출이 아니라 검색입니다.

**여기 들어 있는 랭커는 의미 검색이 아닙니다.** 임베딩 모델도 벡터 DB 도 없이
글자 바이그램 자카드 유사도로 순위를 매깁니다. "정보처리기사 준비" 처럼 표현이
겹치면 잘 찾지만, "자격증 하나 따고 싶어" 같은 의역은 못 잡습니다.

의도한 것은 **시임(seam)** 입니다. 나중에 pgvector/FAISS 로 바꿀 때 갈아끼울
곳은 `TemplateStore.search` 하나이고, 프롬프트도 파이프라인도 그대로입니다.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from pathlib import Path

from app.bot.prompt import PROJECT_ROOT

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
#: `Template` 이 이 어휘를 쓰는 쪽이라 여기 둡니다. `goal.py` 가 스키마와 채팅
#: 문구를 만들 때 가져다 씁니다(반대 방향으로 import 하면 순환입니다).
#: 라벨은 `static/js/board.js` 와 같은 문자열입니다. 채팅 말풍선과 왼쪽 보드에
#: 같은 과제가 다른 이름으로 보이면 안 됩니다.
FREQUENCY_LABELS: dict[str, str] = {
    "daily": "일간 · 주 7회",
    "weekly": "주간 · 주 1회",
    "none": "없음 · 한 번만",
}

#: 빈도를 못 읽었을 때. 반복을 임의로 만들어내지 않는 쪽으로 기웁니다 —
#: 하지 않아도 될 일을 매일 하라고 하는 것보다 낫습니다.
DEFAULT_FREQUENCY = "none"


def frequency_label(value: str | None) -> str | None:
    """사람이 읽을 빈도 표시. 모르는 값이면 `None` 이라 호출하는 쪽이 생략합니다."""
    return FREQUENCY_LABELS.get((value or "").strip())


@dataclass(frozen=True)
class Template:
    id: str
    domain: str
    title: str
    #: 카탈로그가 빈도의 출처입니다. 모델이 `recommend` 로 고른 과제에도 빈도가
    #: 있어야 보드에 제대로 담기는데, 제목만 보고 매번 추측하게 두면 같은 과제가
    #: 부를 때마다 다른 주기로 담깁니다.
    frequency: str = DEFAULT_FREQUENCY

    def as_prompt_line(self) -> str:
        return (
            f'- {{"template_id": "{self.id}", '
            f'"domain": "{self.domain}", "title": "{self.title}", '
            f'"frequency": "{self.frequency}"}}'
        )


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


def similarity(a: str, b: str) -> float:
    """자카드 유사도 0.0~1.0."""
    left, right = _bigrams(a.lower()), _bigrams(b.lower())
    if not left or not right:
        return 0.0
    return len(left & right) / len(left | right)


class TemplateStore:
    """JSON 파일에서 읽는 예시 과제 목록.

    프롬프트 파일과 같은 이유로 파일에 둡니다 — 콘텐츠라서 자주 바뀌고,
    바꿀 때마다 서버를 재시작하고 싶지 않습니다.
    """

    def __init__(self, path: str | None) -> None:
        self._path = self._resolve(path)
        self._key: tuple[int, int] | None = None
        self._items: list[Template] = []
        self._warned = False

    @staticmethod
    def _resolve(raw: str | None) -> Path | None:
        if not raw or not raw.strip():
            return None
        path = Path(raw.strip()).expanduser()
        return path if path.is_absolute() else PROJECT_ROOT / path

    @property
    def path(self) -> Path | None:
        return self._path

    def all(self) -> list[Template]:
        self._refresh()
        return list(self._items)

    def search(self, domain: str | None, query: str, limit: int) -> list[Template]:
        """질의와 비슷한 순으로 상위 `limit` 개. 같은 도메인을 우대합니다.

        **도메인으로 걸러내지 않고 가점만 줍니다.** 예전에는 도메인이 일치하는
        것만 후보로 삼았는데, 1단계의 도메인 판단이 카탈로그와 어긋나면 정답이
        후보에서 아예 빠졌습니다. 실제 사례 —

            발화 "정보처리기사 따기", 1단계 판단 `학습`
            후보: 알고리즘·기술서적·사이드프로젝트·블로그 (유사도 전부 0.00)
            빠진 것: tpl_010 "정보처리기사 필기 기출 5개년 풀기" (0.31, 커리어)

        매칭할 게 없으니 모델은 `generate` 로 갔고, 새 제목을 쓰다 응답이
        무너졌습니다. 도메인 판단 하나가 틀리면 그 뒤가 전부 어긋나는 구조였습니다.

        가점 방식이면 같은 도메인이 기본적으로 앞서지만(유사도가 모두 0 이어도),
        다른 도메인의 확실한 매칭은 밀려나지 않습니다.
        """
        self._refresh()
        ranked = sorted(
            self._items,
            key=lambda t: similarity(query, t.title)
            + (DOMAIN_BONUS if t.domain == domain else 0.0),
            reverse=True,
        )
        return ranked[: max(0, limit)]

    # 도메인별 개수를 세는 헬퍼는 **일부러 두지 않았습니다.**
    #
    # 여기서 세면 `{"학습": 4}` 처럼 `<existing_domain_tasks>` 가 기대하는 것과
    # 똑같은 모양이 나와서 그대로 꽂고 싶어집니다. 그러면 용량 규칙(도메인당
    # 8칸)이 **사용자 보드가 아니라 카탈로그 크기**로 걸립니다 — 템플릿이 8개
    # 넘는 도메인은 모든 사용자에게 신규 과제가 막힙니다.
    #
    # 두 값은 범위가 다릅니다. 카탈로그는 전역이고, 보드 점유는 사용자별입니다.
    # `<existing_domain_tasks>` 는 `GoalPipeline(task_counts=...)` 로 DB 에서
    # 받아야 합니다.

    # -- 내부 ---------------------------------------------------------------
    def _refresh(self) -> None:
        if self._path is None:
            return
        try:
            stat = self._path.stat()
        except OSError:
            if not self._warned:
                self._warned = True
                logger.warning("예시 과제 파일을 찾을 수 없습니다: %s", self._path)
            return

        key = (stat.st_mtime_ns, stat.st_size)
        if key == self._key:
            return  # 변경 없음

        try:
            raw = json.loads(self._path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            # 후보가 없으면 모델은 "새로 만들자" 로 기웁니다. 조용히 넘어가면
            # 중복 과제가 쌓이는 형태로만 드러나서 원인을 찾기 어렵습니다.
            logger.warning("예시 과제 파일을 읽지 못했습니다: %s", self._path, exc_info=True)
            return

        self._key = key
        self._warned = False
        self._items = [
            Template(
                id=str(row.get("id", "")),
                domain=str(row.get("domain", "")),
                title=str(row.get("title", "")),
                frequency=self._frequency(row),
            )
            for row in raw
            if isinstance(row, dict) and row.get("id") and row.get("title")
        ]
        logger.info("예시 과제 %d 건 로드: %s", len(self._items), self._path)

    @staticmethod
    def _frequency(row: dict) -> str:
        """카탈로그의 빈도 값. 모르는 값이면 경고하고 기본값으로 둡니다.

        조용히 넘기면 오타 하나가 "추천 과제만 항상 한 번짜리로 담긴다" 는
        증상으로 나타나서 원인을 찾기 어렵습니다.
        """
        value = str(row.get("frequency", "")).strip()
        if not value:
            return DEFAULT_FREQUENCY
        if value not in FREQUENCY_LABELS:
            logger.warning(
                "예시 과제 %s 의 frequency 가 %r 입니다. %s 중 하나여야 합니다",
                row.get("id"), value, "/".join(FREQUENCY_LABELS),
            )
            return DEFAULT_FREQUENCY
        return value
