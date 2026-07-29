import type { MyPageData, MyPageStatisticsSource, MyPageStats } from './mypage.types'

/**
 * 마이페이지 데이터가 아직 전달되지 않았을 때 사용하는 fallback 응답.
 * 통계 필드는 각각 subject_log, inventory, item, subject 집계 결과에 대응한다.
 */
export const EMPTY_MY_PAGE_DATA: MyPageData = {
  user: {
    id: 0,
    name: '귤',
    uuid: '',
    point: 0,
    profileImageUrl: null,
  },
  statistics: {
    subjectLogCount: 1284,
    inventoryCount: 28,
    itemCount: 42,
    completedSubjectCount: 68,
    subjectCount: 100,
  },
}

/** ERD 테이블 집계값을 화면에 필요한 통계 형태로 변환한다. */
export function toMyPageStats(source: MyPageStatisticsSource): MyPageStats {
  const achievementRate =
    source.subjectCount === 0
      ? 0
      : Math.round((source.completedSubjectCount / source.subjectCount) * 100)

  return {
    completedTasks: source.subjectLogCount,
    ownedBuildings: source.inventoryCount,
    totalBuildings: source.itemCount,
    achievementRate,
  }
}
