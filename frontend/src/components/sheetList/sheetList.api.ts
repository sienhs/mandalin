import { loadSheetDetail } from '../sheetDetail/sheetDetail.data'
import { sheetAchievementRate } from '../sheetDetail/sheetDetail.utils'

/**
 * 목록 카드에 보여줄 달성률.
 *
 * 달성률은 과제 progress 의 평균인데 목록 응답에는 과제가 없어서, 시트마다 상세를 받아 직접 계산한다. 
 */
export async function fetchAchievementRates(sheetIds: number[]): Promise<Map<number, number>> {
  const entries = await Promise.all(
    sheetIds.map(async (sheetId) => {
      const detail = await Promise.resolve(loadSheetDetail(sheetId))
      return [sheetId, sheetAchievementRate(detail.subjects)] as const
    }),
  )
  return new Map(entries)
}
