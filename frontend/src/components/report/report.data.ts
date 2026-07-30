import type { AiReport, ReportPeriod } from './report.types'

/**
 * API 연동 전 화면 확인용 데이터.
 * 백엔드 리포트 API가 준비되면 이 객체 대신 응답을 AiReport 형태로 변환해 사용한다.
 */
export const REPORTS: Record<ReportPeriod, AiReport> = {
  weekly: {
    eyebrow: '종합 퍼포먼스 요약 · 6월 2주차',
    title: '이번 주는 ‘운동’이 도시를 이끌었어요',
    summary:
      '총 38개 과제를 완료해 지난주보다 +18% 성장했습니다. 12일 연속 스트릭을 유지 중이며, 아침 루틴 카테고리가 특히 안정적이에요.',
    metrics: [
      { value: '71%', label: '주간 달성률', tone: 'mint' },
      { value: '38', label: '완료 과제', tone: 'blue' },
      { value: '12일', label: '연속 스트릭', tone: 'orange' },
    ],
    strengthTitle: '강점',
    strengths: [
      '운동 카테고리 실천율 92% — 최근 2주 연속 목표 초과 달성',
      '아침 루틴이 안정적으로 자리잡음',
    ],
    improvementTitle: '개선점',
    improvements: [
      '수면 과제 실천율 41% — 취침 시간이 자정을 자주 넘김',
      '주말에 과제 완료율이 평일 대비 34% 하락',
    ],
    categoryTitle: '카테고리별 실천율',
    categories: [
      { label: '운동', value: 92, color: '#19b8a6' },
      { label: '식단', value: 76, color: '#f5a000' },
      { label: '일반과제', value: 64, color: '#4285f4' },
      { label: '수면', value: 41, color: '#ff5158' },
    ],
  },
  monthly: {
    eyebrow: '종합 퍼포먼스 요약 · 6월',
    title: '6월 한 달, 도시가 눈에 띄게 성장했어요',
    summary:
      '총 162만 포인트를 완료해 지난달보다 +24% 상승했습니다. 최고 연속 스트릭 21일을 기록했고, 1주차 62%에서 4주차 81%로 갈수록 실천율이 꾸준히 올랐어요.',
    metrics: [
      { value: '74%', label: '월간 달성률', tone: 'orange' },
      { value: '162', label: '완료 과제', tone: 'blue' },
      { value: '21일', label: '최고 스트릭', tone: 'mint' },
    ],
    strengthTitle: '이달의 강점',
    strengths: [
      '운동 카테고리 월 평균 실천율 89% — 4주 연속 목표 달성',
      '3주차부터 실천율이 꾸준히 상승하는 추세',
    ],
    improvementTitle: '이달의 개선점',
    improvements: [
      '수면 과제 월 평균 실천율 45% — 여전히 가장 낮은 카테고리',
      '매월 1주차 초반 실천율이 낮게 시작하는 패턴이 반복됨',
    ],
    trendTitle: '주차별 달성률 추이',
    trends: [
      { label: '1주차', value: 62, color: '#94a3b8' },
      { label: '2주차', value: 71, color: '#f5a000' },
      { label: '3주차', value: 78, color: '#4285f4' },
      { label: '4주차', value: 81, color: '#19b8a6' },
    ],
    categoryTitle: '카테고리별 월 평균 실천율',
    categories: [
      { label: '운동', value: 89, color: '#19b8a6' },
      { label: '식단', value: 79, color: '#f5a000' },
      { label: '일반과제', value: 68, color: '#4285f4' },
      { label: '수면', value: 45, color: '#ff5158' },
    ],
  },
}
