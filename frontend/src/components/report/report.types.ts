/** 서버에서 전달받는 리포트 지표 데이터 */
export type ReportMetricResponse = {
  value?: string | number | null
  label?: string | null
}

/** 서버에서 전달받는 달성률 데이터 */
export type ReportProgressResponse = {
  label?: string | null
  value?: number | null
}

/**
 * 서버에서 전달받는 시트별 달성률 데이터.
 * completedCount / targetCount 는 과제 개수가 아니라 **수행 횟수**다 —
 * 매일 과제는 한 주에 7 회까지 쌓이므로 분모도 그 기준으로 온다.
 */
export type ReportSheetResponse = {
  sheetId?: number | null
  title?: string | null
  completedCount?: number | null
  targetCount?: number | null
  achievementRate?: number | null
  domains?: ReportProgressResponse[] | null
}

/**
 * 리포트 조회 API 응답
 * 색상과 화면 섹션명 등 표현 정보는 포함하지 않는다.
 */
export type ReportApiResponse = {
  title?: string | null
  summary?: string | null
  metrics?: ReportMetricResponse[] | null
  strengths?: string[] | null
  improvements?: string[] | null
  sheets?: ReportSheetResponse[] | null
}

/** 화면에 표시할 지표 모델 */
export type ReportMetric = {
  value: string
  label: string
  tone: 'mint' | 'blue' | 'orange'
}

/** 화면에 표시할 달성률 모델. 색은 CSS(--progress-accent)가 정한다 */
export type ReportProgress = {
  label: string
  value: number
}

/** 화면에 표시할 시트 모델. domains 는 그 시트에 속한 도메인별 달성률이다 */
export type ReportSheet = {
  id: string
  title: string
  value: number
  /** "12 / 30 완료" 처럼 분모까지 보여주는 문구. 서버가 수치를 안 주면 빈 문자열 */
  caption: string
  domains: ReportProgress[]
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
  sheetTitle: string
  sheets: ReportSheet[]
}
