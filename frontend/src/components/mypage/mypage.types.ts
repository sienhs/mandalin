/**
 * ERD `user`에서 마이페이지 표시에 필요한 컬럼만 camelCase로 변환한 모델.
 * kakao_id와 삭제 일시는 마이페이지 화면에 필요하지 않아 제외한다.
 */
export type MyPageUser = {
  id: number
  name: string
  uuid: string
  point: number
  profileImageUrl: string | null
}

/**
 * ERD 테이블을 집계한 마이페이지 통계 원본.
 * 대량의 로그·아이템 행을 프론트로 보내지 않고 백엔드가 COUNT 결과만 전달하는 형태다.
 */
export type MyPageStatisticsSource = {
  subjectLogCount: number
  inventoryCount: number
  itemCount: number
  completedSubjectCount: number
  subjectCount: number
}

export type MyPageData = {
  user: MyPageUser
  statistics: MyPageStatisticsSource
}

export type MyPageStats = {
  completedTasks: number
  ownedBuildings: number
  totalBuildings: number
  achievementRate: number
}
