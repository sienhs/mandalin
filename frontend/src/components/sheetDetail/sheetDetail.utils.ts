import { DOMAIN_COUNT } from '../sheet/sheet.data'
import type { Period, Subject } from '../sheet/sheet.types'

/** 만다라트 한 장의 과제 칸 수. 도메인 8개 × 과제 8개 = 64. */
export const TOTAL_SUBJECTS = DOMAIN_COUNT * DOMAIN_COUNT

/** 완료한 과제 수 */
export const countDoneSubjects = (subjects: (Subject | null)[][]): number =>
  subjects.flat().filter((subject) => subject?.isDone).length

/**
 * 달성률(0~100).
 * 목록 화면의 achievementRate 를 그대로 쓰지 않는 이유: 상세 화면에서 '수행 완료'를 누르면
 * 그 자리에서 값이 올라가야 하므로, 화면이 들고 있는 과제 상태에서 매번 다시 계산한다.
 */
export const achievementRateOf = (doneCount: number): number =>
  Math.round((doneCount / TOTAL_SUBJECTS) * 100)

/** 기간 설정 표기 */
export const PERIOD_LABEL: Record<Period, string> = {
  daily: '매일',
  weekly: '매주',
  none: '한 번',
}
