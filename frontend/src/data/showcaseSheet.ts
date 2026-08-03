import type { Period, Sheet } from './types'

/**
 * 로그인 전 화면(소개·로그인)이 보여 주는 견본 만다라트.
 *
 * <p>비로그인 상태라 서버를 부를 수 없어 화면에서 직접 만든다. <b>두 화면이 같은 것을
 * 써야 한다</b> — 각자 만들면 진행률이나 도메인 이름이 갈라져 어느 쪽이 이 서비스의
 * 모습인지 알 수 없게 된다.
 *
 * <p>과제 이름은 실제로 쓸 법한 문장으로 채운다. 소개 페이지가 이 데이터를 진짜
 * 만다라트 화면(`MandalartGrid`)과 마을(`IsoVillage`)에 그대로 흘려 보내기 때문에,
 * "운동 과제 1" 같은 자리표시자가 들어가면 방문자가 보는 것이 곧 가짜 화면이 된다.
 */

type Row = readonly [title: string, period: Period]

/** 8개 세부 목표 × 8개 실천 과제. 목업 게이트웨이의 건강 시트와 같은 어휘를 쓴다. */
const DOMAINS: ReadonlyArray<{ title: string; ratio: number; subjects: readonly Row[] }> = [
  {
    title: '규칙적인 운동',
    ratio: 78,
    subjects: [
      ['아침 스트레칭 10분', 'DAILY'],
      ['주 3회 웨이트 트레이닝', 'WEEKLY'],
      ['퇴근길 한 정거장 걷기', 'DAILY'],
      ['주말 등산 가기', 'WEEKLY'],
      ['플랭크 3분 버티기', 'DAILY'],
      ['수영 강습 등록하기', 'NONE'],
      ['계단으로 올라가기', 'DAILY'],
      ['운동 일지 기록', 'DAILY'],
    ],
  },
  {
    title: '바른 식습관',
    ratio: 64,
    subjects: [
      ['하루 물 2L 마시기', 'DAILY'],
      ['아침 거르지 않기', 'DAILY'],
      ['야식 끊기', 'DAILY'],
      ['채소 한 접시 챙기기', 'DAILY'],
      ['단백질 챙겨 먹기', 'DAILY'],
      ['식단 사진으로 남기기', 'DAILY'],
      ['외식 주 2회 이하', 'WEEKLY'],
      ['설탕 음료 줄이기', 'DAILY'],
    ],
  },
  {
    title: '충분한 수면',
    ratio: 42,
    subjects: [
      ['12시 전에 잠들기', 'DAILY'],
      ['자기 전 휴대폰 멀리 두기', 'DAILY'],
      ['기상 시간 고정하기', 'DAILY'],
      ['낮잠 20분 이내', 'DAILY'],
      ['침실 조도 낮추기', 'NONE'],
      ['카페인 오후 2시 이후 금지', 'DAILY'],
      ['수면 기록 확인', 'WEEKLY'],
      ['주말에도 같은 시간 기상', 'WEEKLY'],
    ],
  },
  {
    title: '스트레스 관리',
    ratio: 30,
    subjects: [
      ['명상 10분', 'DAILY'],
      ['감사 일기 쓰기', 'DAILY'],
      ['산책하며 통화하기', 'WEEKLY'],
      ['취미 시간 확보', 'WEEKLY'],
      ['일과 분리하기', 'DAILY'],
      ['상담 받아보기', 'NONE'],
      ['호흡 운동 배우기', 'NONE'],
      ['주말 디지털 디톡스', 'WEEKLY'],
    ],
  },
  {
    title: '체중 관리',
    ratio: 55,
    subjects: [
      ['매일 아침 체중 재기', 'DAILY'],
      ['목표 체중 -5kg', 'NONE'],
      ['체지방률 기록', 'WEEKLY'],
      ['간식 칼로리 확인', 'DAILY'],
      ['한 달 사진 비교', 'MONTHLY'],
      ['인바디 측정', 'MONTHLY'],
      ['식사량 손바닥 기준', 'DAILY'],
      ['체중 정체기 기록', 'WEEKLY'],
    ],
  },
  {
    title: '꾸준한 습관',
    ratio: 70,
    subjects: [
      ['아침 루틴 지키기', 'DAILY'],
      ['하루 마무리 정리', 'DAILY'],
      ['주간 회고 쓰기', 'WEEKLY'],
      ['알람 한 번에 일어나기', 'DAILY'],
      ['정해진 시간에 운동', 'DAILY'],
      ['습관 체크리스트 갱신', 'WEEKLY'],
      ['빠진 날 이유 적기', 'WEEKLY'],
      ['한 달 개근 도전', 'MONTHLY'],
    ],
  },
  {
    title: '정기 검진',
    ratio: 88,
    subjects: [
      ['건강검진 예약', 'NONE'],
      ['치과 스케일링', 'NONE'],
      ['시력 검사', 'NONE'],
      ['혈압 기록', 'WEEKLY'],
      ['영양제 챙겨 먹기', 'DAILY'],
      ['가족력 정리', 'NONE'],
      ['검진 결과 기록', 'NONE'],
      ['예방접종 확인', 'NONE'],
    ],
  },
  {
    title: '활동적인 일상',
    ratio: 60,
    subjects: [
      ['하루 8천 보 걷기', 'DAILY'],
      ['엘리베이터 대신 계단', 'DAILY'],
      ['주말 자전거 타기', 'WEEKLY'],
      ['1시간마다 일어나기', 'DAILY'],
      ['걷기 좋은 길 찾기', 'NONE'],
      ['근처 공원 산책', 'WEEKLY'],
      ['러닝 크루 참여', 'WEEKLY'],
      ['활동량 주간 비교', 'WEEKLY'],
    ],
  },
]

/** 주기별 전체 기간 목표 횟수. 화면에 "12/30" 같은 숫자가 그럴듯하게 찍히도록. */
const TARGET: Record<Period, number> = { DAILY: 30, WEEKLY: 12, MONTHLY: 6, NONE: 1 }

export function showcaseSheet(): Sheet {
  return {
    id: 0,
    title: '건강한 몸 만들기',
    isOpen: true,
    likeCount: 42,
    isLiked: false,
    achievementRate: 61,
    createdAt: '2026-06-01T00:00:00',
    expiredAt: '2026-12-31T00:00:00',
    terrain: 'GRASS_PATH',
    domains: DOMAINS.map((domain, i) => ({
      id: i,
      position: i,
      title: domain.title,
      subjects: domain.subjects.map(([title, period], j) => {
        /*
          같은 구역 안에서도 칸마다 진행률이 달라야 마을이 살아 있어 보인다.
          난수를 쓰면 새로고침마다 도시 모양이 바뀌므로, 좌표로 흔든다.
        */
        const progress = Math.max(0, Math.min(100, domain.ratio + ((i * 7 + j * 13) % 40) - 20))
        const targetCount = TARGET[period]
        return {
          id: i * 10 + j,
          position: j,
          title,
          period,
          point: 10,
          targetCount,
          tryCount: Math.round((progress / 100) * targetCount),
          isDone: progress >= 100,
          isDonePeriod: false,
          progress,
        }
      }),
    })),
  }
}
