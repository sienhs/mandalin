export type ReportPeriod = 'weekly' | 'monthly'

export type ReportMetric = {
  value: string
  label: string
  tone: 'mint' | 'blue' | 'orange'
}

export type ReportProgress = {
  label: string
  value: number
  color: string
}

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
