import type {
  AiReport,
  ReportApiResponse,
  ReportMetric,
  ReportMetricResponse,
  ReportProgress,
  ReportProgressResponse,
  ReportSheet,
  ReportSheetResponse,
} from './report.types'

const METRIC_TONES: ReportMetric['tone'][] = ['mint', 'blue', 'orange']

// 서버가 주간 리포트만 만든다. 월간이 생기면 여기부터 기간별로 갈라야 한다
const REPORT_LABELS: Pick<
  AiReport,
  'eyebrow' | 'strengthTitle' | 'improvementTitle' | 'sheetTitle'
> = {
  eyebrow: '종합 퍼포먼스 요약 · 이번 주',
  strengthTitle: '강점',
  improvementTitle: '개선점',
  sheetTitle: '시트별 달성률',
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
  // 지표 타일 색에만 쓴다. 달성률 막대는 라벨 해시로 색을 고르면
  // 75% 가 빨강으로 나오는 식이라, 색을 값의 신호로 오해하게 된다
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
    }]
  })
}

function clampRate(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0

  return Math.min(100, Math.max(0, value))
}

function normalizeCount(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null

  return Math.max(0, Math.trunc(value))
}

/** 달성률이 비어 있어도 시트는 지우지 않는다 — 기록이 없는 시트는 0% 로 보여야 한다. */
function toSheetRows(rows: ReportSheetResponse[]): ReportSheet[] {
  return rows.flatMap((row, index) => {
    const title = normalizeText(row.title)

    if (!title) return []

    const completedCount = normalizeCount(row.completedCount)
    const targetCount = normalizeCount(row.targetCount)

    return [{
      id: row.sheetId != null ? String(row.sheetId) : `${title}-${index}`,
      title,
      value: clampRate(row.achievementRate),
      caption:
        completedCount != null && targetCount != null
          ? `${completedCount} / ${targetCount}회 수행`
          : '',
      domains: toProgressRows(normalizeArray(row.domains)),
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
export function toAiReport(response: ReportApiResponse): AiReport {
  return {
    title: normalizeText(response.title) || '이번 주 AI 리포트',
    summary:
      normalizeText(response.summary) ||
      '아직 표시할 리포트 요약이 없습니다.',
    ...REPORT_LABELS,
    metrics: toMetrics(normalizeArray(response.metrics)),
    strengths: normalizeStringList(response.strengths),
    improvements: normalizeStringList(response.improvements),
    sheets: toSheetRows(normalizeArray(response.sheets)),
  }
}
