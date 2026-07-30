import type {
  AiReport,
  ReportApiResponse,
  ReportMetric,
  ReportMetricResponse,
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

function normalizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : null
}

function normalizeStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return []

  return value.flatMap((item) => {
    const normalized = normalizeText(item)
    return normalized ? [normalized] : []
  })
}

function normalizeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

/** 문자열을 목록 순서와 무관한 양수로 바꿔 같은 라벨에 같은 테마를 배정한다. */
function stableIndexOf(label: string, themeCount: number): number {
  let hash = 0

  for (const character of label.trim()) {
    hash = (hash * 31 + character.codePointAt(0)!) >>> 0
  }

  return hash % themeCount
}

function toProgressRows(rows: ReportProgressResponse[]): ReportProgress[] {
  return rows.flatMap((row) => {
    const label = normalizeText(row.label)

    if (!label || typeof row.value !== 'number' || !Number.isFinite(row.value)) {
      return []
    }

    return [{
      label,
      value: Math.min(100, Math.max(0, row.value)),
      color: PROGRESS_COLORS[stableIndexOf(label, PROGRESS_COLORS.length)],
    }]
  })
}

function toMetrics(rows: ReportMetricResponse[]): ReportMetric[] {
  return rows.flatMap((row) => {
    const label = normalizeText(row.label)

    if (!label || row.value == null) return []

    return [{
      label,
      value: String(row.value),
      tone: METRIC_TONES[stableIndexOf(label, METRIC_TONES.length)],
    }]
  })
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
    title:
      normalizeText(response.title) ||
      (period === 'weekly' ? '이번 주 AI 리포트' : '이번 달 AI 리포트'),
    summary:
      normalizeText(response.summary) ||
      '아직 표시할 리포트 요약이 없습니다.',
    ...labels,
    metrics: toMetrics(normalizeArray(response.metrics)),
    strengths: normalizeStringList(response.strengths),
    improvements: normalizeStringList(response.improvements),
    trends: (() => {
      const rows = toProgressRows(normalizeArray(response.trends))
      return rows.length > 0 ? rows : undefined
    })(),
    categories: toProgressRows(normalizeArray(response.categories)),
  }
}
