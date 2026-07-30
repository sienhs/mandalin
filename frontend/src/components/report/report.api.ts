import { apiFetch } from '../../api'
import type { AiReport, ReportPeriod } from './report.types'

/**
 * 기간별 AI 리포트를 조회한다.
 * 백엔드 DTO가 확정되면 AiReport 타입을 실제 응답 필드에 맞춰 조정
 */
export function fetchAiReport(
  period: ReportPeriod,
  signal?: AbortSignal,
): Promise<AiReport> {
  return apiFetch<AiReport>(`/api/v1/reports?type=${period}`, { signal })
}
