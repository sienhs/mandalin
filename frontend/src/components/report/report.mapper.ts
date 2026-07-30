import type {
  AiReport,
  ReportApiResponse,
  ReportMetric,
  ReportPeriod,
  ReportProgress,
  ReportProgressResponse,
} from './report.types'

const METRIC_TONES: ReportMetric['tone'][] = ['mint', 'blue', 'orange']
const PROGRESS_COLORS = ['#14b8a6', '#f59e0b', '#3b82f6', '#ef4444']

const REPORT_LABELS: Record<
  ReportPeriod,
  Pick<
    AiReport,
    | 'eyebrow'
    | 'strengthTitle'
    | 'improvementTitle'
    | 'trendTitle'
    | 'categoryTitle'
  >
> = {
  weekly: {
    eyebrow: '종합 퍼포먼스 요약 · 이번 주',
    strengthTitle: '강점',
    improvementTitle: '개선점',
    trendTitle: undefined,
    categoryTitle: '카테고리별 실천율',
  },
  monthly: {
    eyebrow: '종합 퍼포먼스 요약 · 이번 달',
    strengthTitle: '이번 달의 강점',
    improvementTitle: '이번 달의 개선점',
    trendTitle: '주차별 달성률 추이',
    categoryTitle: '카테고리별 월 평균 실천율',
  },
}

function toProgressRows(rows: ReportProgressResponse[]): ReportProgress[] {
  return rows.map((row, index) => ({
    ...row,
    color: PROGRESS_COLORS[index % PROGRESS_COLORS.length],
  }))
}

/**
 * 서버 데이터에 화면 전용 라벨과 색상을 결합한다.
 * 이 변환을 통해 API 응답 타입이 UI 디자인에 의존하지 않도록 한다.
 */
export function toAiReport(
  response: ReportApiResponse,
  period: ReportPeriod,
): AiReport {
  const labels = REPORT_LABELS[period]

  return {
    ...response,
    ...labels,
    metrics: response.metrics.map((metric, index) => ({
      ...metric,
      tone: METRIC_TONES[index % METRIC_TONES.length],
    })),
    trends: response.trends ? toProgressRows(response.trends) : undefined,
    categories: toProgressRows(response.categories),
  }
}
