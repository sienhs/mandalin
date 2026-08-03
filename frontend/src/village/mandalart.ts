import type { DomainDetail, SheetDetail } from '../components/sheet/sheet.api'
import type { Sheet as ModelSheet } from '../data/types'
import type { Domain, Mandalart, Task } from './types'

/**
 * 서버 시트 상세 → 마을이 쓰는 만다라트 모델.
 *
 * 두 모델의 모양이 다르다:
 *  - 서버는 도메인 8개(position 0~7)와 시트 제목(핵심 목표)을 따로 준다.
 *  - 마을은 3×3 블록 9개를 그리므로 domains 가 9개여야 하고, index 4 가 중앙 블록이다.
 *
 * 그래서 도메인 8개를 중앙을 비켜 배치하고(0,1,2,3 / 5,6,7,8), 중앙 블록에는 시트 제목과
 * "도메인별 요약"을 넣는다. 중앙 블록의 8개 건물이 각 도메인의 평균 진행률로 자라기 때문에
 * 마을 한가운데를 보면 전체 진척이 한눈에 읽힌다. 중앙을 비워두면 그 블록만 영원히 빈 땅으로
 * 남아 고장난 것처럼 보인다.
 */

/** 도메인 개수(중앙 제외). 마을 블록은 여기에 중앙 1개를 더한 9개다. */
const DOMAIN_COUNT = 8

/** 도메인 position(0~7) → 마을 블록 index(중앙 4를 비켜간다). */
function blockIndexOf(position: number): number {
  return position < 4 ? position : position + 1
}

/** 진행률 평균. 과제가 없으면 0 — 빈 도메인이 완성된 것처럼 보이면 안 된다. */
function averageProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0
  return Math.round(tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length)
}

function toTasks(domain: DomainDetail): Task[] {
  return [...domain.subjects]
    .sort((a, b) => a.position - b.position)
    .map((subject) => ({
      id: String(subject.subjectId),
      title: subject.title,
      // 서버가 계산해 준 값을 그대로 쓴다. targetCount/tryCount 로 다시 계산하면
      // 주기(daily/weekly) 규칙이 프론트에도 복제되어 서버와 어긋난다.
      progress: subject.progress,
    }))
}

export function toMandalart(detail: SheetDetail): Mandalart {
  // 서버가 position 순서를 보장하지만, 누락된 자리가 있어도 9칸이 채워지도록 자리부터 만든다.
  const blocks: (Domain | null)[] = Array.from({ length: 9 }, () => null)

  const summaries: Task[] = []

  for (const domain of detail.domains) {
    const tasks = toTasks(domain)
    const index = blockIndexOf(domain.position)
    if (index < 0 || index > 8 || index === 4) {
      // position 이 0~7 을 벗어나면 배치할 자리가 없다. 조용히 버리는 대신 건너뛴다.
      continue
    }

    blocks[index] = { id: String(domain.domainId), title: domain.title, tasks }
    summaries.push({
      id: `domain-${domain.domainId}`,
      title: domain.title,
      progress: averageProgress(tasks),
    })
  }

  // 중앙 블록 — 핵심 목표 아래에 도메인 8개 요약을 놓는다.
  blocks[4] = {
    id: `sheet-${detail.sheetId}`,
    title: detail.title,
    tasks: summaries.slice(0, DOMAIN_COUNT),
  }

  return {
    center: detail.title,
    domains: blocks.map((block, index) =>
      block ?? { id: `empty-${index}`, title: '', tasks: [] },
    ),
  }
}

/* ─────────────────────────────────────────────────────────────
   화면 모델(data/types.ts) → 3D 모델
   ───────────────────────────────────────────────────────────── */

/**
 * 스토어의 시트를 3D 마을이 읽는 형태로 바꾼다.
 *
 * <p>`toMandalart` 와 같은 일을 하지만 입력이 다르다 — 이쪽은 gateway 를 거친 화면 모델이라
 * 목업 모드에서도 동작한다. 서버 응답(`SheetDetail`)만 받으면 백엔드가 꺼진 상태에서
 * 마을을 볼 수 없었다.
 */
export function toMandalartFromModel(sheet: ModelSheet): Mandalart {
  const blocks: (Domain | null)[] = Array.from({ length: 9 }, () => null)
  const summaries: Task[] = []

  for (const domain of sheet.domains ?? []) {
    const tasks: Task[] = [...domain.subjects]
      .sort((a, b) => a.position - b.position)
      .map((subject) => ({
        id: String(subject.id),
        title: subject.title,
        // 서버가 확정한 값을 그대로 쓴다. 횟수로 다시 계산하면 주기 규칙이 프론트에 복제된다.
        progress: subject.progress,
      }))

    const index = blockIndexOf(domain.position)
    if (index < 0 || index > 8 || index === 4) continue

    blocks[index] = { id: String(domain.id), title: domain.title, tasks }
    summaries.push({
      id: `domain-${domain.id}`,
      title: domain.title,
      progress: averageProgress(tasks),
    })
  }

  blocks[4] = {
    id: `sheet-${sheet.id}`,
    title: sheet.title,
    tasks: summaries.slice(0, DOMAIN_COUNT),
  }

  return {
    center: sheet.title,
    domains: blocks.map((block, index) => block ?? { id: `empty-${index}`, title: '', tasks: [] }),
  }
}
