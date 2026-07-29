import { DOMAIN_COLORS, DOMAIN_COUNT, PLACEHOLDER, TOTAL_CELLS } from './sheet.data'
import type { Domain, GridCell, Period, Subject } from './sheet.types'

/** 날짜를 'YYYY-MM-DD' 형식으로 출력 */
export const formatDate = (date: Date): string => date.toLocaleDateString('sv-SE')

/** 만다라트의 기본 기간. 현재와 1달 후를 기본으로 한다. */
export const defaultPeriod = () => {
  const start = new Date()
  const end = new Date()
  end.setMonth(start.getMonth() + 1)
  return { start: formatDate(start), end: formatDate(end) }
}

/** 9칸(0~8) 중 중앙(4)을 뺀 8칸 기준 인덱스(0~7)로 옮긴다. */
const skipCenter = (index: number): number => (index < 4 ? index : index - 1)

/** 블록 b, 칸 c 위치의 배경색 클래스. 중앙 블록과 각 블록의 중앙 칸이 라벨 칸이다. */
export const getCellColor = (b: number, c: number): string => {
  if (b === 4) {
    if (c === 4) return 'bg-ink-900 text-white font-extrabold'
    return `${DOMAIN_COLORS[c]?.dark || 'bg-ink-300'} font-extrabold`
  }
  if (c === 4) {
    return `${DOMAIN_COLORS[b]?.dark || 'bg-ink-300'} font-extrabold`
  }
  return DOMAIN_COLORS[b]?.light || 'bg-ink-100'
}

/**
 * 줄바꿈 함수. 6글자 이상이면 두 줄로 나눈다.
 * 중간에 띄어쓰기가 있으면 가운데에 가장 가까운 띄어쓰기를 기준으로, 아니면 반반으로 나눈다.
 */
export const wrapCellText = (text: string): string[] => {
  if (!text || text.length < 6) return [text]

  if (text.includes(' ')) {
    const midIdx = Math.floor(text.length / 2)
    let splitIdx = text.indexOf(' ')
    for (let i = splitIdx + 1; i < text.length; i++) {
      if (text[i] === ' ' && Math.abs(midIdx - i) < Math.abs(midIdx - splitIdx)) {
        splitIdx = i
      }
    }
    return [text.slice(0, splitIdx), text.slice(splitIdx + 1)]
  }

  const mid = Math.ceil(text.length / 2)
  return [text.slice(0, mid), text.slice(mid)]
}

/** 저장된 Sheet · Domain · Subject 로 화면에 그릴 가상의 9x9 배열을 만든다. */
export const buildGrid = (
  sheetTitle: string,
  domains: (Domain | null)[],
  subjects: (Subject | null)[][],
): GridCell[][] =>
  Array.from({ length: 9 }, (_, b) =>
    Array.from({ length: 9 }, (_, c): GridCell => {
      // 중앙 블록의 중앙 칸 = 핵심 목표
      if (b === 4 && c === 4) {
        return {
          task: sheetTitle,
          isSheet: true,
          isDomain: false,
          isSubject: false,
          domainIndex: -1,
          subjectIndex: -1,
          subject: null,
        }
      }

      // 중앙 블록의 나머지 칸, 그리고 각 블록의 중앙 칸 = 도메인 라벨
      if (b === 4 || c === 4) {
        const dIndex = skipCenter(b === 4 ? c : b)
        const d = domains[dIndex]
        return {
          task: d ? d.title : PLACEHOLDER.domain,
          isSheet: false,
          isDomain: true,
          isSubject: false,
          domainIndex: dIndex,
          subjectIndex: -1,
          subject: null,
        }
      }

      const dIndex = skipCenter(b)
      const sIndex = skipCenter(c)
      const s = subjects[dIndex]?.[sIndex] ?? null
      return {
        task: s ? s.title : PLACEHOLDER.subject,
        isSheet: false,
        isDomain: false,
        isSubject: true,
        domainIndex: dIndex,
        subjectIndex: sIndex,
        subject: s,
      }
    }),
  )

/** 입력된 태스크 수 확인 함수. 안내 문구가 남아 있는 칸은 비어 있는 것으로 센다. */
export const countFilledCells = (grid: GridCell[][]): number => {
  const placeholders: string[] = [PLACEHOLDER.sheet, PLACEHOLDER.domain, PLACEHOLDER.subject]
  const empty = grid.flat().filter((cell) => placeholders.includes(cell.task)).length
  return TOTAL_CELLS - empty
}

/** 기간 설정에 따라 수행횟수를 자동으로 계산하는 함수. */
export const calcTargetCount = (period: Period, startDate: string, endDate: string): number => {
  if (period === 'none') return 1
  const diffTime = new Date(endDate).getTime() - new Date(startDate).getTime()
  if (diffTime < 0) return 0
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1
  return period === 'daily' ? diffDays : Math.floor(diffDays / 7)
}

/** 아직 값이 없는 도메인 칸을 처음 저장할 때 쓰는 기본값. */
export const createDomain = (domainIndex: number): Domain => ({
  sheetId: 1,
  domainTemplateId: 1, // dummy
  title: '',
  position: domainIndex,
  createdAt: formatDate(new Date()),
  subjectCount: 0,
})

/** 아직 값이 없는 과제 칸을 처음 저장할 때 쓰는 기본값. */
export const createSubject = (domainIndex: number, subjectIndex: number): Subject => ({
  domainId: domainIndex + 1,
  userId: 1,
  title: '',
  period: 'none',
  point: 10,
  targetCount: 1,
  tryCount: 0,
  position: subjectIndex,
  isDone: false,
  createdAt: formatDate(new Date()),
  updatedAt: formatDate(new Date()),
})

/** 도메인 8개 × 과제 8개의 빈 상태 */
export const emptySubjects = (): (Subject | null)[][] =>
  Array.from({ length: DOMAIN_COUNT }, () => Array<Subject | null>(DOMAIN_COUNT).fill(null))

/** 도메인 8개의 빈 상태 */
export const emptyDomains = (): (Domain | null)[] =>
  Array.from({ length: DOMAIN_COUNT }, () => null)
