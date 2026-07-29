import type { SheetCreatePayload } from './sheet.api'
import { DOMAIN_COUNT } from './sheet.data'

/**
 * 시연용 샘플 만다라트.
 *
 * 마을 건물은 과제에서 나오므로 만다라트가 없으면 3D 마을을 볼 수 없다. 발표에서 81칸을
 * 손으로 채우고 있을 수는 없어서, 한 번 눌러 실제 데이터를 만드는 통로를 둔다.
 *
 * mock 을 되살리지 않는 이유: 진행률은 서버가 계산해 내려주므로 클라이언트 mock 마을은
 * 진행률 조작에 반응하지 않는다. 실제로 저장해야 마을이 자라는 걸 보여줄 수 있다.
 */

/** 도메인 8개 × 과제 8개. 실제 만다라트처럼 읽히도록 문구를 채워 둔다. */
const SAMPLE: { domain: string; subjects: string[] }[] = [
  {
    domain: '건강',
    subjects: ['아침 스트레칭', '주 3회 러닝', '물 2L 마시기', '계단 이용하기',
      '취침 12시 전', '주 1회 등산', '체중 기록', '금주 챌린지'],
  },
  {
    domain: '커리어',
    subjects: ['이력서 갱신', '포트폴리오 정리', '기술 블로그 1편', '사이드 프로젝트',
      '코딩테스트 3문제', '모의 면접', '링크드인 정리', '컨퍼런스 참석'],
  },
  {
    domain: '학습',
    subjects: ['알고리즘 1일 1문제', 'CS 정리 노트', '영어 단어 30개', '기술서 1권',
      '강의 완주', '스터디 참여', '주간 회고', 'TIL 작성'],
  },
  {
    domain: '관계',
    subjects: ['부모님께 전화', '친구 만나기', '감사 메시지', '생일 챙기기',
      '동료와 커피챗', '봉사활동', '편지 쓰기', '가족 식사'],
  },
  {
    domain: '재정',
    subjects: ['가계부 작성', '고정지출 점검', '적금 자동이체', '불필요 구독 해지',
      '투자 공부', '비상금 모으기', '연말정산 준비', '주간 예산 지키기'],
  },
  {
    domain: '취미',
    subjects: ['기타 연습', '사진 찍기', '요리 도전', '보드게임 모임',
      '영화 감상', '드로잉', '전시 관람', '악기 합주'],
  },
  {
    domain: '멘탈',
    subjects: ['명상 10분', '감사일기', '디지털 디톡스', '산책하기',
      '심호흡 연습', '주간 계획 세우기', '독서 30분', '수면 루틴'],
  },
  {
    domain: '환경',
    subjects: ['책상 정리', '주 1회 대청소', '분리수거', '텀블러 사용',
      '옷장 비우기', '식물 키우기', '침구 교체', '서류 정리'],
  },
]

/** 오늘부터 30일 뒤. targetCount 산정(daily=기간일수)에 쓰이므로 미래여야 한다. */
function expiryAfterDays(days: number): string {
  const end = new Date()
  end.setDate(end.getDate() + days)
  // 'YYYY-MM-DDT00:00:00' — 서버 expiredAt 이 LocalDateTime 이라 시각이 필요하다.
  return `${end.toLocaleDateString('sv-SE')}T00:00:00`
}

/**
 * 샘플 만다라트 요청 본문.
 *
 * 주기를 daily/weekly/none 으로 섞어 둔다 — targetCount 가 주기마다 다르게 산정되므로
 * 진행률 계산이 제대로 도는지 시연 중에 같이 확인할 수 있다.
 */
export function buildSampleSheetPayload(): SheetCreatePayload {
  return {
    title: `시연용 만다라트 ${new Date().toLocaleTimeString('ko-KR')}`,
    isOpen: false,
    expiredAt: expiryAfterDays(30),
    domains: SAMPLE.slice(0, DOMAIN_COUNT).map((entry, d) => ({
      position: d,
      title: entry.domain,
      subjects: entry.subjects.slice(0, DOMAIN_COUNT).map((title, s) => ({
        position: s,
        title,
        period: s % 3 === 0 ? 'daily' : s % 3 === 1 ? 'weekly' : 'none',
        point: 100,
        targetCount: 0, // 0 이면 서버가 주기에 맞춰 자동 산정한다
      })),
    })),
  }
}
