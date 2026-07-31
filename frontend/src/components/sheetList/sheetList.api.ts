import { loadSheetDetail } from '../sheetDetail/sheetDetail.data'
import { sheetAchievementRate } from '../sheetDetail/sheetDetail.utils'
import { MY_SHEETS } from './sheetList.data'
import type { SheetSummary } from './sheetList.types'

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

/**
 * 친구의 만다라트 목록. 공개된 시트만 담는다.
 */
export async function fetchFriendSheets(_friendId: number): Promise<SheetSummary[]> {
  const sheets = await Promise.resolve(MY_SHEETS)
  return sheets.filter((sheet) => sheet.isOpen)
}
