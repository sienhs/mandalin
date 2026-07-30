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
 *
 * 아직 이런 엔드포인트가 없다 — 목록 API(GET /api/v1/sheets)는 세션 사용자로 고정이고,
 * 대상 사용자를 지정할 방법이 없다. 상세 조회는 공개 시트라면 남의 것도 허용하므로
 * (SheetService.getSheetDetail), 막히는 건 '이 친구의 시트가 무엇인지' 뿐이다.
 * 서버에 GET /api/v1/users/{userId}/sheets 가 생기면 이 함수 본문만 바꾸면 된다.
 *
 * 비공개 제외는 서버가 해야 한다. 여기서 한 번 더 거르는 건 목업 때문이고,
 * 연동 후에도 남겨 두면 서버가 실수로 내려준 비공개 시트가 화면에 새지 않는다.
 */
export async function fetchFriendSheets(_friendId: number): Promise<SheetSummary[]> {
  const sheets = await Promise.resolve(MY_SHEETS)
  return sheets.filter((sheet) => sheet.isOpen)
}
