/** 좋아요 순으로 정렬된 공개 만다라트 한 건. */
export type LeaderboardEntry = {
  sheetId: number
  title: string
  ownerName: string
  ownerProfileImageUrl: string | null
  likeCount: number
}

