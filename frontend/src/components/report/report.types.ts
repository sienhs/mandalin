export type ReportPeriod = 'weekly' | 'monthly'

/** 서버에서 전달받는 리포트 지표 데이터 */
export type ReportMetricResponse = {
  value: string
  label: string
}

/** 서버에서 전달받는 달성률 데이터 */
export type ReportProgressResponse = {
  label: string
  value: number
}

/**
 * 리포트 조회 API 응답
 * 색상과 화면 섹션명 등 표현 정보는 포함하지 않는다.
 */
export type ReportApiResponse = {
  title: string
  summary: string
  metrics: ReportMetricResponse[]
  strengths: string[]
  improvements: string[]
  trends?: ReportProgressResponse[]
  categories: ReportProgressResponse[]
}

/** 화면에 표시할 지표 모델 */
export type ReportMetric = {
  value: string
  label: string
  tone: 'mint' | 'blue' | 'orange'
}

/** 화면에 표시할 달성률 모델 */
export type ReportProgress = {
  label: string
  value: number
  color: string
}

/** API 응답을 화면 표현에 맞게 변환한 뷰 모델 */
export type AiReport = {
  eyebrow: string
  title: string
  summary: string
  metrics: ReportMetric[]
  strengthTitle: string
  strengths: string[]
  improvementTitle: string
  improvements: string[]
  trendTitle?: string
  trends?: ReportProgress[]
  categoryTitle: string
  categories: ReportProgress[]
}
