import { MY_SHEETS } from '../sheetList/sheetList.data'
import type { Domain, Period, Sheet, Subject } from '../sheet/sheet.types'
import { calcTargetCount } from '../sheet/sheet.utils'
import type { SheetDetail } from './sheetDetail.types'

/**
 * 상세 화면 목업.
 *
 * 시트 제목 · 기간 · 공개 여부는 목록 화면과 같은 값을 써야 하므로 MY_SHEETS 에서 가져오고,
 * 도메인 · 과제는 아직 목록에 없는 정보라 아래 표에서 만들어 채운다.
 * 서버 연동 시 loadSheetDetail 만 API 호출로 바꾸면 화면은 그대로 돌아간다.
 */

/** 도메인 하나와 그 안의 과제 8개. doneCount = 앞에서부터 몇 개를 완료 처리할지. */
type DomainSeed = { title: string; subjects: string[]; doneCount: number }

/** 과제에 돌려 쓸 기간 설정. 목표 횟수가 주기마다 다르게 잡히는 걸 화면에서 확인하려고 섞어 둔다. */
const PERIODS: Period[] = ['daily', 'weekly', 'none']

/** 도메인 8개 × 과제 8개. doneCount 합계 26 → 달성률 41%(26/64). */
const DOMAIN_SEEDS: DomainSeed[] = [
  {
    title: '유산소',
    doneCount: 5,
    subjects: ['주 3회 러닝', '줄넘기 10분', '자전거 30분', '계단 오르기',
      '수영 1회', '걷기 8천보', '등산 월 2회', '인터벌 20분'],
  },
  {
    title: '근력운동',
    doneCount: 3,
    subjects: ['푸시업 20개', '데드리프트', '스쿼트 50개', '플랭크 3분',
      '턱걸이 10개', '덤벨 프레스', '코어 운동', '주 2회 헬스'],
  },
  {
    title: '식단',
    doneCount: 4,
    subjects: ['물 2L 마시기', '단백질 챙기기', '야식 금지', '채소 한 접시',
      '아침 챙기기', '천천히 먹기', '배달 줄이기', '간식 기록'],
  },
  {
    title: '수면',
    doneCount: 2,
    subjects: ['11시 취침', '수면일기', '취침 루틴', '알람 1개',
      '낮잠 20분', '자기 전 스트레칭', '카페인 줄이기', '침구 정리'],
  },
  {
    title: '멘탈케어',
    doneCount: 3,
    subjects: ['명상 10분', '감사일기', '산책하기', '심호흡 연습',
      '디지털 디톡스', '독서 30분', '주간 회고', '긍정 확언'],
  },
  {
    title: '습관',
    doneCount: 4,
    subjects: ['아침 스트레칭', '체중 기록', '주간 계획', '물병 챙기기',
      '자세 교정', '운동 기록', '주말 정리', '알림 끄기'],
  },
  {
    title: '유연성',
    doneCount: 3,
    subjects: ['요가 1회', '골반 스트레칭', '종아리 풀기', '어깨 돌리기',
      '폼롤러 5분', '발목 돌리기', '햄스트링 늘리기', '목 스트레칭'],
  },
  {
    title: '컨디션',
    doneCount: 2,
    subjects: ['호흡운동', '휴식시간', '반신욕', '마사지',
      '수분 체크', '건강 검진', '영양제 복용', '스트레스 점검'],
  },
]

/** 시트 아이디로 상세 내용을 불러온다. 없는 아이디면 첫 번째 시트를 보여준다. */
export function loadSheetDetail(sheetId: number): SheetDetail {
  const summary = MY_SHEETS.find((item) => item.sheetId === sheetId) ?? MY_SHEETS[0]

  const sheet: Sheet = {
    userId: 1,
    title: summary.title,
    isOpen: summary.isOpen,
    like: summary.likeCount,
    createdAt: summary.createdAt,
    expiredAt: summary.expiredAt,
  }

  const domains: Domain[] = DOMAIN_SEEDS.map((seed, d) => ({
    sheetId: summary.sheetId,
    domainTemplateId: d + 1,
    title: seed.title,
    position: d,
    createdAt: summary.createdAt,
    subjectCount: seed.doneCount,
  }))

  const subjects: Subject[][] = DOMAIN_SEEDS.map((seed, d) =>
    seed.subjects.map((title, s): Subject => {
      const period = PERIODS[s % PERIODS.length]
      const targetCount = calcTargetCount(period, summary.createdAt, summary.expiredAt)
      const isDone = s < seed.doneCount
      return {
        domainId: d + 1,
        userId: 1,
        title,
        period,
        point: 100,
        targetCount,
        tryCount: isDone ? targetCount : 0,
        position: s,
        isDone,
        createdAt: summary.createdAt,
        updatedAt: summary.createdAt,
      }
    }),
  )

  return { sheet, domains, subjects }
}
