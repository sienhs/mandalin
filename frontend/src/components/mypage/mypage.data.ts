import type { MyPageData, MyPageStatisticsSource, MyPageStats } from './mypage.types'

/**
 * 마이페이지 데이터가 아직 전달되지 않았을 때 사용하는 빈 응답.
 * 통계 필드는 각각 subject_log, inventory, item, subject 집계 결과에 대응한다.
 *
 * 이 집계를 내려주는 API 가 아직 없어서 전부 0 이다. 화면 확인용 값을 여기에 적지 않는다 —
 * 연동 전까지 마이페이지 통계 카드는 0 으로 보이는 것이 맞다.
 */
export const EMPTY_MY_PAGE_DATA: MyPageData = {
  user: {
    id: 0,
    name: '',
    uuid: '',
    point: 0,
    profileImageUrl: null,
  },
  statistics: {
    subjectLogCount: 0,
    inventoryCount: 0,
    itemCount: 0,
    completedSubjectCount: 0,
    subjectCount: 0,
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
