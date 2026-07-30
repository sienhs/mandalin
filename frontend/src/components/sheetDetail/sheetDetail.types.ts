/**
 * 만다라트 상세 화면의 데이터 타입.
 *
 * 시트 · 도메인 · 과제는 생성 화면(components/sheet/sheet.types)과 같은 타입을 그대로 쓴다.
 * 상세 화면은 그 세 가지를 한 덩어리로 들고 다니는 타입과, 사이드 패널이 그릴
 * '선택한 과제' 한 건만 따로 정의한다.
 */

import type { Domain, Sheet, Subject } from '../sheet/sheet.types'

/**
 * 상세 조회로 받는 과제 한 건.
 *
 * isDonePeriod 는 저장된 값이 아니라 서버(SheetDetailResponse.SubjectDetailResponse)가
 * 요청 시각을 기준으로 계산해 내려주는 값이라, 생성 화면과 공유하는 Subject 에는 두지 않고
 * 상세 화면에서만 얹는다.
 */
export type DetailSubject = Subject & {
  /**
   * 이번 기간(매일 = 오늘, 매주 = 이번 주)에 이미 수행했는지.
   * true 면 이 기간 안에는 다시 수행할 수 없다. 완료된 과제(isDone)도 항상 true 다.
   */
  isDonePeriod: boolean
  /**
   * 과제 하나의 진행률 0~100.
   * tryCount/targetCount 로 클라이언트가 계산하지 않는다 — 목표 횟수 산정 규칙이 서버에만
   * 있어서, 계산을 양쪽에 두면 규칙이 바뀔 때 조용히 어긋난다.
   */
  progress: number
}

/**
 * 만다라트 한 장의 전체 내용.
 *
 */
export type SheetDetail = {
  sheet: Sheet
  domains: (Domain | null)[]
  subjects: (DetailSubject | null)[][]
}

/** 사이드 패널이 그리는, 2D 뷰에서 선택한 칸 하나. */
export type SelectedTask = {
  /** 칸 종류. 패널의 머리말과 보여줄 내용이 이 값으로 갈린다. */
  kind: 'sheet' | 'domain' | 'subject'
  /** 칸에 적힌 글자 */
  title: string
  /** 과제 칸이 속한 도메인명. 도메인 칸 · 핵심 목표 칸이면 null. */
  domainTitle: string | null
  /** 과제 칸이면 그 과제. 도메인 칸 · 핵심 목표 칸이면 null. */
  subject: DetailSubject | null
  /**
   * 선택한 칸의 진행률 0~100. 값이 없는 빈 칸이면 null.
   * 과제 칸은 그 과제의 progress, 도메인 칸은 과제 8개의 평균, 핵심 목표 칸은 64개의 평균이다.
   */
  progressRate: number | null
}
