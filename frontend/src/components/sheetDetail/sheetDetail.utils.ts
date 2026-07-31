import { DOMAIN_COUNT } from '../sheet/sheet.data'
import type { Period, Subject } from '../sheet/sheet.types'
import type { DetailSubject } from './sheetDetail.types'

/** 만다라트 한 장의 과제 칸 수. 도메인 8개 × 과제 8개 = 64. */
export const TOTAL_SUBJECTS = DOMAIN_COUNT * DOMAIN_COUNT

/** 도메인 하나가 가지는 과제 수 */
export const SUBJECTS_PER_DOMAIN = DOMAIN_COUNT

/** 과제 목록에서 완료한 과제 수 */
export const countDone = (subjects: (Subject | null)[]): number =>
  subjects.filter((subject) => subject?.isDone).length

/** 만다라트 전체에서 완료한 과제 수 */
export const countDoneSubjects = (subjects: (Subject | null)[][]): number =>
  countDone(subjects.flat())

/** 비율(0~100) */
export const rateOf = (doneCount: number, totalCount: number): number =>
  totalCount === 0 ? 0 : Math.round((doneCount / totalCount) * 100)

/**
 * 과제 progress 의 평균(0~100).
 *
 * 완료한 과제 수로 세지 않는 이유: 매일 · 매주 과제는 목표 횟수를 절반쯤 채운 상태가
 * 대부분이라, 완료 개수만 보면 한참 수행했는데도 진행도가 0으로 보인다.
 * 나누는 값은 실제 과제 수가 아니라 칸 수(totalCount) 다 — 아직 만들지 않은 칸은 0으로 센다.
 */
export const averageProgress = (
  subjects: (DetailSubject | null)[],
  totalCount: number,
): number => {
  if (totalCount === 0) return 0
  const sum = subjects.reduce((total, subject) => total + (subject?.progress ?? 0), 0)
  return Math.round(sum / totalCount)
}

/** 도메인 하나의 진행률(0~100). 그 도메인에 달린 과제 8개의 평균. */
export const domainProgressOf = (domainSubjects: (DetailSubject | null)[]): number =>
  averageProgress(domainSubjects, SUBJECTS_PER_DOMAIN)

/**
 * 시트 한 장의 달성률(0~100). 과제 64칸 진행률의 평균이다.
 *
 * 서버도 achievementRate 를 내려주지만 쓰지 않는다 — 서버 값은 '완료한 과제 수 / 64' 라서
 * 목표를 절반 채운 과제를 0으로 세고, 도메인 진행도(과제 진행률 평균)와 기준이 어긋난다.
 * 목록 화면도 이 함수를 써야 두 화면의 달성률이 같아진다.
 */
export const sheetAchievementRate = (subjects: (DetailSubject | null)[][]): number =>
  averageProgress(subjects.flat(), TOTAL_SUBJECTS)

/** 기간 설정 표기 */
export const PERIOD_LABEL: Record<Period, string> = {
  daily: '매일',
  weekly: '매주',
  none: '한 번',
}

/**
 * '이번 기간'을 가리키는 말. isDonePeriod 가 true 인 과제에 왜 못 누르는지 알려줄 때 쓴다.
 * 주기가 없는 과제(none)는 한 번 수행하면 그대로 완료라 이 문구까지 오지 않는다.
 */
export const PERIOD_TERM: Record<Period, string> = {
  daily: '오늘',
  weekly: '이번 주',
  none: '이번',
}
