import { useEffect, useState } from 'react'
import type { CellPos } from '../sheet/sheet.types'
import { buildGrid, formatDate } from '../sheet/sheet.utils'
import { loadSheetDetail } from './sheetDetail.data'
import type { SelectedTask } from './sheetDetail.types'
import { achievementRateOf, countDoneSubjects } from './sheetDetail.utils'

/** 처음 열었을 때 선택돼 있는 칸. 첫 블록의 첫 과제. */
const FIRST_CELL: CellPos = { b: 0, c: 0 }

/**
 * 만다라트 상세 화면의 상태를 한곳에서 관리한다.
 * 생성 화면(useSheetEditor)과 마찬가지로 Sheet · Domain · Subject 세 상태에서
 * 파생된 9x9 그리드만 화면에 그린다. 다른 점은 칸을 편집하지 않고, 과제를 완료 처리한다는 것.
 */
export function useSheetDetail(sheetId: number) {
  const [detail, setDetail] = useState(() => loadSheetDetail(sheetId))
  const [selectedCell, setSelectedCell] = useState<CellPos>(FIRST_CELL)

  // 목록에서 다른 시트로 바로 이동하면(주소만 바뀌고 화면은 그대로) 내용을 다시 불러온다.
  useEffect(() => {
    setDetail(loadSheetDetail(sheetId))
    setSelectedCell(FIRST_CELL)
  }, [sheetId])

  const { sheet, domains, subjects } = detail

  const grid = buildGrid(sheet.title, domains, subjects)
  const cell = grid[selectedCell.b][selectedCell.c]

  // 사이드 패널의 3x3 확대 그리드. 선택한 칸이 속한 블록을 보여준다.
  const selectedBlockIndex = selectedCell.b
  const miniGrid = grid[selectedBlockIndex]

  const doneCount = countDoneSubjects(subjects)
  const achievementRate = achievementRateOf(doneCount)

  const selectedTask: SelectedTask = {
    title: cell.task,
    domainTitle: cell.isSubject ? (domains[cell.domainIndex]?.title ?? null) : null,
    subject: cell.subject,
  }

  /**
   * 선택한 과제를 완료 처리한다.
   * 수행 횟수는 목표 횟수까지 채운다 — 완료 표시와 횟수가 어긋나면 어느 쪽이 맞는지 알 수 없다.
   */
  const completeTask = () => {
    if (!cell.isSubject || !cell.subject || cell.subject.isDone) return

    const { domainIndex, subjectIndex } = cell
    setDetail((prev) => {
      const next = prev.subjects.map((row) => [...row])
      const base = next[domainIndex][subjectIndex]
      if (!base) return prev
      next[domainIndex][subjectIndex] = {
        ...base,
        isDone: true,
        tryCount: base.targetCount,
        updatedAt: formatDate(new Date()),
      }
      return { ...prev, subjects: next }
    })
  }

  return {
    // 원본 데이터
    sheet,
    domains,
    subjects,

    // 파생 데이터
    grid,
    miniGrid,
    selectedBlockIndex,
    doneCount,
    achievementRate,
    selectedTask,

    // 2D 뷰
    selectedCell,
    setSelectedCell,

    // 사이드 패널
    completeTask,
  }
}
