import { useState } from 'react'
import { INITIAL_MAIN_GOAL, PLACEHOLDER, TASK_RECOMMEND } from './sheet.data'
import type { CellPos, Domain, Period, Sheet, Subject, SubjectTemplate, TaskDraft } from './sheet.types'
import {
  buildGrid,
  calcTargetCount,
  countFilledCells,
  createDomain,
  createSubject,
  defaultPeriod,
  emptyDomains,
  emptySubjects,
  formatDate,
} from './sheet.utils'

const DEFAULT_PERIOD = defaultPeriod()

/**
 * 만다라트 생성 화면의 상태를 한곳에서 관리한다.
 * 화면은 Sheet · Domain · Subject 세 상태에서 파생된 9x9 그리드(grid)만 그린다.
 */
export function useSheetEditor() {
  const [sheetData, setSheetData] = useState<Sheet>({
    userId: 1,
    title: INITIAL_MAIN_GOAL,
    isOpen: true,
    like: 0,
    createdAt: DEFAULT_PERIOD.start,
    expiredAt: DEFAULT_PERIOD.end,
  })
  const [domains, setDomains] = useState<(Domain | null)[]>(emptyDomains)
  const [subjects, setSubjects] = useState<(Subject | null)[][]>(emptySubjects)

  // 2D 뷰에서 선택된 칸
  const [selectedCell, setSelectedCell] = useState<CellPos | null>(null)

  // 추가할 수 있는 과제 패널
  const [taskSearch, setTaskSearch] = useState('')
  const [page, setPage] = useState('1')

  // 태스크 설정 팝업
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [draft, setDraft] = useState<TaskDraft | null>(null)

  // 기본 설정 패널의 값은 별도 상태를 두지 않고 sheetData 한곳에만 저장한다.
  /** 핵심 목표. 비우면 그리드에 안내 문구가 남도록 플레이스홀더를 저장한다. */
  const mainGoal = sheetData.title === PLACEHOLDER.sheet ? '' : sheetData.title
  const startDate = sheetData.createdAt
  const endDate = sheetData.expiredAt
  const isPublic = sheetData.isOpen

  const changeMainGoal = (value: string) => {
    setSheetData((prev) => ({ ...prev, title: value || PLACEHOLDER.sheet }))
  }
  const changeStartDate = (value: string) => {
    setSheetData((prev) => ({ ...prev, createdAt: value }))
  }
  const changeEndDate = (value: string) => {
    setSheetData((prev) => ({ ...prev, expiredAt: value }))
  }
  const changePublic = (value: boolean) => {
    setSheetData((prev) => ({ ...prev, isOpen: value }))
  }

  const grid = buildGrid(sheetData.title, domains, subjects)
  const filledCount = countFilledCells(grid)
  // 선택된 블록을 우측 3x3 확대 그리드에 반영한다.
  const selectedBlockIndex = selectedCell ? selectedCell.b : 0
  const miniGrid = grid[selectedBlockIndex]

  const recommendedTasks = TASK_RECOMMEND.filter(
    (t) => t.title?.includes(taskSearch) || t.domainName?.includes(taskSearch),
  )

  /** 현재 설정된 기간에서 해당 주기의 목표 횟수 */
  const targetCountOf = (period: Period) => calcTargetCount(period, startDate, endDate)

  /** 도메인 칸 하나의 이름을 덮어쓴다. 값이 없던 칸이면 기본값을 만들어 채운다. */
  const writeDomain = (domainIndex: number, title: string) => {
    setDomains((prev) => {
      const next = [...prev]
      next[domainIndex] = { ...(next[domainIndex] ?? createDomain(domainIndex)), title }
      return next
    })
  }

  /** 과제 칸 하나를 갱신한다. 값이 없던 칸이면 기본값을 만들어 patch에 넘긴다. */
  const writeSubject = (
    domainIndex: number,
    subjectIndex: number,
    patch: (base: Subject) => Subject,
  ) => {
    setSubjects((prev) => {
      const next = [...prev]
      next[domainIndex] = [...next[domainIndex]]
      const base = next[domainIndex][subjectIndex] ?? createSubject(domainIndex, subjectIndex)
      next[domainIndex][subjectIndex] = patch(base)
      return next
    })
  }

  /** 칸을 클릭하고 추천 과제의 추가를 누르면 해당 칸에 과제를 자동 입력한다. */
  const addRecommendedTask = (template: SubjectTemplate) => {
    if (!selectedCell) {
      alert('태스크를 추가할 빈칸을 먼저 선택해주세요.')
      return
    }

    const cell = grid[selectedCell.b][selectedCell.c]
    if (cell.isSheet) {
      alert('핵심 목표 칸에는 태스크를 추가할 수 없습니다.')
      return
    }
    if (cell.isDomain) {
      alert('도메인 칸에는 태스크를 추가할 수 없습니다.')
      return
    }

    const period = template.period ?? 'none'
    writeSubject(cell.domainIndex, cell.subjectIndex, (base) => ({
      ...base,
      title: template.title ?? '',
      period,
      targetCount: targetCountOf(period),
      updatedAt: formatDate(new Date()),
    }))
  }

  /** 칸을 더블클릭하면 현재 값을 채운 태스크 설정 팝업을 연다. */
  const openTaskDialog = ({ b, c }: CellPos) => {
    const cell = grid[b][c]
    if (cell.isSheet) return // 중앙의 핵심목표는 좌측 패널에서 수정

    const domainTitle = cell.isSubject ? domains[cell.domainIndex]?.title : undefined
    setDraft({
      cell: { b, c },
      original: cell.task,
      task: cell.task,
      domain: domainTitle && domainTitle !== PLACEHOLDER.domain ? domainTitle : '미지정',
      period: cell.subject?.period ?? 'none',
      done: cell.subject?.isDone,
    })
    setTaskDialogOpen(true)
  }

  const updateDraft = (patch: Partial<TaskDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  const closeTaskDialog = () => setTaskDialogOpen(false)

  /** 팝업의 임시 값을 실제 도메인 · 과제 상태에 반영한다. */
  const saveTaskDialog = () => {
    if (!draft) return
    const cell = grid[draft.cell.b][draft.cell.c]
    // 입력을 비운 채 저장하면 열었을 때의 값을 유지한다.
    const title = draft.task || draft.original

    if (cell.isDomain) {
      writeDomain(cell.domainIndex, title || PLACEHOLDER.domain)
    } else if (cell.isSubject) {
      writeSubject(cell.domainIndex, cell.subjectIndex, (base) => ({
        ...base,
        title,
        period: draft.period,
        targetCount: targetCountOf(draft.period),
        isDone: draft.done ?? base.isDone,
        updatedAt: formatDate(new Date()),
      }))
    }

    setTaskDialogOpen(false)
  }

  return {
    // 저장할 원본 데이터
    sheetData,
    domains,
    subjects,

    // 파생 데이터
    grid,
    miniGrid,
    selectedBlockIndex,
    filledCount,
    recommendedTasks,
    targetCountOf,

    // 기본 설정
    mainGoal,
    changeMainGoal,
    startDate,
    changeStartDate,
    endDate,
    changeEndDate,
    isPublic,
    changePublic,

    // 2D 뷰
    selectedCell,
    setSelectedCell,

    // 추가할 수 있는 과제
    taskSearch,
    setTaskSearch,
    page,
    setPage,
    addRecommendedTask,

    // 태스크 설정 팝업
    taskDialogOpen,
    draft,
    openTaskDialog,
    updateDraft,
    closeTaskDialog,
    saveTaskDialog,
  }
}
