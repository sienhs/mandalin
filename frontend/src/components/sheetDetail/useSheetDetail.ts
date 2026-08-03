import { useEffect, useState } from 'react'
import type { CellPos, GridCell } from '../sheet/sheet.types'
import { completeSubjects, toggleSheetLike } from '../sheet/sheet.api'
import { buildGrid } from '../sheet/sheet.utils'
import { fetchSheetDetailView } from './sheetDetail.api'
import type { SelectedTask, SheetDetail } from './sheetDetail.types'
import { countDoneSubjects, domainProgressOf, sheetAchievementRate } from './sheetDetail.utils'

/** 처음 열었을 때 선택돼 있는 칸. 첫 블록의 첫 과제. */
const FIRST_CELL: CellPos = { b: 0, c: 0 }

/**
 * 불러오기 전에 보여줄 빈 만다라트.
 *
 * null 로 두고 화면에서 분기하지 않는다 — 그러면 상세 화면 전체가 "데이터가 있을 때만"
 * 그려지는 모양이 되어, 로딩이 끝날 때마다 레이아웃이 통째로 튄다. 빈 그리드를 먼저 그리고
 * 내용만 채운다.
 */
const EMPTY_DETAIL: SheetDetail = {
  sheet: { userId: 0, title: '', isOpen: false, like: 0, createdAt: '', expiredAt: '' },
  domains: Array.from({ length: 8 }, () => null),
  subjects: Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => null)),
  liked: false,
}

/**
 * 만다라트 상세 화면의 상태를 한곳에서 관리한다.
 * 생성 화면(useSheetEditor)과 마찬가지로 Sheet · Domain · Subject 세 상태에서
 * 파생된 9x9 그리드만 화면에 그린다. 다른 점은 칸을 편집하지 않고, 과제를 완료 처리한다는 것.
 */
export function useSheetDetail(sheetId: number) {
  const [detail, setDetail] = useState<SheetDetail>(EMPTY_DETAIL)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCell, setSelectedCell] = useState<CellPos>(FIRST_CELL)
  /**
   * 좋아요 상태. 표시할 값을 그대로 들고 있고, 여기에 무엇도 더하지 않는다.
   *
   * 초기값은 상세 응답의 likeCount · isLiked 이고, 토글 뒤에는 토글 응답
   * (SheetLikeResponse)의 두 값으로 덮어쓴다.
   */
  const [like, setLike] = useState({ liked: false, count: 0 })
  /** 응답을 기다리는 중. 연타로 같은 요청이 두 번 나가지 않게 막는다(좋아요는 토글이라 되돌아간다). */
  const [liking, setLiking] = useState(false)
  const [completing, setCompleting] = useState(false)
  /**
   * 수행 보상을 받은 뒤의 보유 포인트. 아직 안 받았으면 null — 그때는 로그인 정보의 값을 쓴다.
   *
   * `기존 + 보상` 으로 더하지 않는다. 서버가 보상을 반영한 잔액(totalUserPoint)을 주므로
   * 그 값만 믿는다 — 다른 탭에서 쓰거나 벌었을 수 있다(상점 화면도 같은 방식이다).
   */
  const [userPoint, setUserPoint] = useState<number | null>(null)

  // 목록에서 다른 시트로 바로 이동하면(주소만 바뀌고 화면은 그대로) 내용을 다시 불러온다.
  useEffect(() => {
    // 응답이 늦게 도착한 이전 시트가 지금 시트를 덮어쓰지 않게 막는다.
    let canceled = false

    setLoading(true)
    setError(null)
    fetchSheetDetailView(sheetId)
      .then((next) => {
        if (canceled) return
        setDetail(next)
        setSelectedCell(FIRST_CELL)
        setLike({ liked: next.liked, count: next.sheet.like })
      })
      .catch((cause: unknown) => {
        if (canceled) return
        // 빈 그리드가 남는다 — 없는 시트를 있는 것처럼 보여주지 않는다.
        setDetail(EMPTY_DETAIL)
        setError(cause instanceof Error ? cause.message : '만다라트를 불러오지 못했습니다.')
      })
      .finally(() => {
        if (!canceled) setLoading(false)
      })

    return () => {
      canceled = true
    }
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
   * 누른 즉시 화면을 바꾸지 않고 응답을 기다린다 — 같은 엔드포인트가 토글이라, 먼저 뒤집었다가
   * 실패하면 서버와 반대인 상태로 남는다. 응답의 두 값을 그대로 담으므로 개수를 세지 않는다.
   */
  const toggleLike = async () => {
    if (liking) return
    setLiking(true)
    try {
      const result = await toggleSheetLike(sheetId)
      setLike({ liked: result.isLiked, count: result.likeCount })
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : '좋아요를 반영하지 못했습니다.')
    } finally {
      setLiking(false)
    }
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
   *
   * 수행 응답은 완료 처리된 아이디와 포인트만 준다. 바뀐 과제 상태(tryCount · progress ·
   * isDonePeriod)는 서버가 정하는 값이라 여기서 계산하지 않고 상세를 다시 받아 맞춘다.
   */
  const completeTask = async () => {
    if (!selectedSubject || selectedSubject.isDone || selectedSubject.isDonePeriod) return
    if (completing) return

    setCompleting(true)
    try {
      const result = await completeSubjects(sheetId, [selectedSubject.subjectId])
      setUserPoint(result.totalUserPoint)
      setDetail(await fetchSheetDetailView(sheetId))
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : '수행을 기록하지 못했습니다.')
    } finally {
      setCompleting(false)
    }
  }

  return {
    // 불러오기 상태
    loading,
    error,
    /** 수행 보상을 받은 뒤의 보유 포인트. 아직 없으면 null. */
    userPoint,

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
