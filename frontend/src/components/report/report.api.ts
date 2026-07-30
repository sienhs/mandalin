import { apiFetch } from '../../api'
import { toAiReport } from './report.mapper'
import type {
  AiReport,
  ReportApiResponse,
  ReportPeriod,
} from './report.types'

/**
 * 기간별 AI 리포트를 조회한 뒤 화면용 모델로 변환한다.
 * 서버 응답 DTO가 변경되면 ReportApiResponse와 매퍼만 조정한다.
 */
export async function fetchAiReport(
  period: ReportPeriod,
  signal?: AbortSignal,
): Promise<AiReport> {
  const response = await apiFetch<ReportApiResponse>(
    `/api/v1/reports?type=${period}`,
    { signal },
  )

  return toAiReport(response, period)
}
