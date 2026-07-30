import { useEffect, useState } from 'react'
import type { CellPos, GridCell } from '../sheet/sheet.types'
import { buildGrid, formatDate } from '../sheet/sheet.utils'
import { loadSheetDetail } from './sheetDetail.data'
import type { SelectedTask } from './sheetDetail.types'
import {
  countDoneSubjects,
  domainProgressOf,
  rateOf,
  sheetAchievementRate,
} from './sheetDetail.utils'

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
  /**
   * 좋아요 상태. 표시할 값을 그대로 들고 있고, 여기에 무엇도 더하지 않는다.
   *
   * count 에 내 좋아요를 더하는 식으로 만들면 안 된다 — 서버가 주는 likeCount 는 내 좋아요를
   * 이미 포함하므로 이중 계산이 된다(내가 누른 시트를 다시 열 때마다 1 크게 보인다).
   * 연동 시 초기값은 상세 응답의 likeCount · isLiked 로, 토글 뒤에는 토글 응답
   * (SheetLikeResponse)의 두 값으로 덮어쓴다.
   */
  const [like, setLike] = useState(() => ({ liked: false, count: detail.sheet.like }))

  // 목록에서 다른 시트로 바로 이동하면(주소만 바뀌고 화면은 그대로) 내용을 다시 불러온다.
  useEffect(() => {
    const next = loadSheetDetail(sheetId)
    setDetail(next)
    setSelectedCell(FIRST_CELL)
    setLike({ liked: false, count: next.sheet.like })
  }, [sheetId])

  const { sheet, domains, subjects } = detail

  const grid = buildGrid(sheet.title, domains, subjects)
  const cell = grid[selectedCell.b][selectedCell.c]
  /**
   * 선택한 과제. 그리드가 아니라 원본 상태에서 꺼낸다 — 그리드의 칸은 생성 화면과 공용인
   * Subject 라서, 상세에만 있는 isDonePeriod 가 타입에서 지워진다.
   */
  const selectedSubject = cell.isSubject
    ? (subjects[cell.domainIndex]?.[cell.subjectIndex] ?? null)
    : null

  // 사이드 패널의 3x3 확대 그리드. 선택한 칸이 속한 블록을 보여준다.
  const selectedBlockIndex = selectedCell.b
  const miniGrid = grid[selectedBlockIndex]

  /**
   * 좋아요 토글.
   *
   * 목업이라 서버가 할 계산을 여기서 흉내낸다. 연동하면 아래 한 줄을
   * `const res = await toggleSheetLike(sheetId); setLike({ liked: res.isLiked, count: res.likeCount })`
   * 로 바꾸면 된다 — 응답을 그대로 담으므로 표시값에 손을 대지 않는다.
   */
  const toggleLike = () => {
    setLike((prev) => ({ liked: !prev.liked, count: prev.count + (prev.liked ? -1 : 1) }))
  }

  const doneCount = countDoneSubjects(subjects)
  /** 시트 달성률. 서버 값을 쓰지 않고 과제 진행률의 평균으로 계산한다. */
  const achievementRate = sheetAchievementRate(subjects)

  /**
   * 2D 뷰 · 3x3 확대 그리드의 체크(✓) 기준.
   * 이번 기간에 수행을 마친 과제(isDonePeriod)에 붙는다 — 매일 · 매주 과제는 목표 횟수를
   * 다 채우기 전이라도 이번 기간 몫을 했으면 체크가 보여야 한다.
   * 그리드의 칸은 isDonePeriod 를 모르는 공용 Subject 라서 원본 상태에서 다시 찾는다.
   */
  const isChecked = (cell: GridCell): boolean =>
    cell.isSubject && subjects[cell.domainIndex]?.[cell.subjectIndex]?.isDonePeriod === true

  /**
   * 선택한 칸의 진행률.
   *
   * 과제 칸은 서버가 내려준 그 과제의 progress 를 그대로 쓰고, 도메인 · 핵심 목표 칸은
   * 그 칸이 포함하는 과제(8개 · 64개)의 평균을 계산해서 쓴다 — 묶음 단위 값은 서버가
   * 따로 내려주지 않는다.
   */
  const progressRateOfCell = (): number | null => {
    if (cell.isSheet) return achievementRate
    if (cell.isDomain) return domainProgressOf(subjects[cell.domainIndex] ?? [])
    return selectedSubject?.progress ?? null
  }

  const selectedTask: SelectedTask = {
    kind: cell.isSheet ? 'sheet' : cell.isDomain ? 'domain' : 'subject',
    title: cell.task,
    domainTitle: cell.isSubject ? (domains[cell.domainIndex]?.title ?? null) : null,
    subject: selectedSubject,
    progressRate: progressRateOfCell(),
  }

  /**
   * 선택한 과제를 한 번 수행한 것으로 기록한다.
   *
   * 수행 횟수는 한 번에 1회만 오르고, 목표 횟수를 채운 순간 완료(isDone)로 넘어간다 —
   * 매일 · 매주 과제는 여러 번 수행해야 과제 하나가 끝난다.
   * 수행한 뒤에는 isDonePeriod 가 true 가 되어 이번 기간에는 더 누를 수 없다.
   */
  const completeTask = () => {
    if (!selectedSubject || selectedSubject.isDone || selectedSubject.isDonePeriod) return

    const { domainIndex, subjectIndex } = cell
    setDetail((prev) => {
      const next = prev.subjects.map((row) => [...row])
      const base = next[domainIndex][subjectIndex]
      if (!base) return prev
      const tryCount = base.tryCount + 1
      next[domainIndex][subjectIndex] = {
        ...base,
        isDone: tryCount >= base.targetCount,
        isDonePeriod: true,
        tryCount,
        // 서버라면 응답에 담아 내려줄 값. 도메인 진행도가 이 값의 평균이라 같이 올려준다.
        progress: rateOf(tryCount, base.targetCount),
        updatedAt: formatDate(new Date()),
      }
      // 달성률은 subjects 에서 파생되므로 따로 갱신할 게 없다.
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
    isChecked,
    selectedBlockIndex,
    doneCount,
    achievementRate,

    // 좋아요
    liked: like.liked,
    likeCount: like.count,
    toggleLike,
    selectedTask,

    // 2D 뷰
    selectedCell,
    setSelectedCell,

    // 사이드 패널
    completeTask,
  }
}
