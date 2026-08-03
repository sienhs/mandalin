import type { SheetSummary } from './sheetList.types'

/**
 * 목록 화면이 쓰는 조회. **아직 서버에 붙어 있지 않다.**
 *
 * 목업을 걷어내면서 화면 확인용 데이터를 돌려주던 구현을 지웠다. 지금은 빈 값을 돌려주므로
 * 목록은 비어 있고 달성률은 '—%' 로 보인다. 아래 주석의 엔드포인트로 각각 바꾸면 된다.
 */

/**
 * 목록 카드에 보여줄 달성률.
 *
 * 달성률은 과제 progress 의 평균인데 목록 응답에는 과제가 없어서, 시트마다 상세를 받아
 * 직접 계산해야 한다 — `GET /api/v1/sheets/{sheetId}` 를 시트 수만큼 부르고
 * sheetDetail.utils 의 sheetAchievementRate 로 평균을 낸다.
 */
export async function fetchAchievementRates(_sheetIds: number[]): Promise<Map<number, number>> {
  return new Map()
}

/**
 * 친구의 만다라트 목록. 공개된 시트(isOpen)만 담는다.
 *
 * 연동: `GET /api/v1/sheets?userId={friendId}` — 서버가 공개 여부로 걸러 주지 않으면
 * 받은 뒤 isOpen 으로 한 번 더 거른다.
 */
export async function fetchFriendSheets(_friendId: number): Promise<SheetSummary[]> {
  return []
}
