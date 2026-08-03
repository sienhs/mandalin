import { apiFetch } from '../../api'
import type { LeaderboardEntry } from './leaderboard.types'

/**
 * 공개 만다라트를 좋아요 수 내림차순으로 조회한다.
 *
 * 현재 백엔드 SheetRepository에는 공개 시트를 좋아요 순으로 조회하는
 * findByIsOpenTrueOrderByLikeCountDesc()가 준비되어 있다. 컨트롤러에 아래
 * 조회 API가 추가되면 이 함수와 바로 연결할 수 있다.
 *
 * GET /api/v1/leaderboard
 *
 * ApiResponse.data에는 화면 표시를 위해 sheetId, title, ownerName,
 * ownerProfileImageUrl, likeCount가 필요하다.
 */
export function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  return apiFetch<LeaderboardEntry[]>('/api/v1/leaderboard?page=0&size=10')
}