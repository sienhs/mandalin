/**
 * 만다라트 상세 화면의 데이터 타입.
 *
 * 시트 · 도메인 · 과제는 생성 화면(components/sheet/sheet.types)과 같은 타입을 그대로 쓴다.
 * 상세 화면은 그 세 가지를 한 덩어리로 들고 다니는 타입과, 사이드 패널이 그릴
 * '선택한 과제' 한 건만 따로 정의한다.
 */

import type { Domain, Sheet, Subject } from '../sheet/sheet.types'

/** 만다라트 한 장의 전체 내용. 도메인 8개 × 과제 8개. */
export type SheetDetail = {
  sheet: Sheet
  domains: (Domain | null)[]
  subjects: (Subject | null)[][]
}

/** 사이드 패널이 그리는, 2D 뷰에서 선택한 칸 하나. */
export type SelectedTask = {
  /** 칸에 적힌 글자 */
  title: string
  /** 과제 칸이 속한 도메인명. 도메인 칸 · 핵심 목표 칸이면 null. */
  domainTitle: string | null
  /** 과제 칸이면 그 과제. 도메인 칸 · 핵심 목표 칸이면 null. */
  subject: Subject | null
}
