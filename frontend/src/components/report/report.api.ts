import { apiFetch } from '../../api/client'
import { toAiReport } from './report.mapper'
import type { AiReport, ReportApiResponse } from './report.types'

function toReport(response: ReportApiResponse | null): AiReport | null {
  // 서버는 아직 만들지 않은 리포트를 data: null 로 내려준다 — 실패가 아니다
  if (response == null) return null

  if (typeof response !== 'object' || Array.isArray(response)) {
    throw new Error('표시할 리포트 데이터가 없습니다.')
  }
  return toAiReport(response)
}

/** 저장된 주간 리포트를 가져온다. 아직 생성 전이면 null. */
export async function fetchAiReport(signal?: AbortSignal): Promise<AiReport | null> {
  return toReport(await apiFetch<ReportApiResponse | null>('/api/v1/reports', { signal }))
}

/** 주간 리포트를 새로 만든다. AI 호출이 끼어 있어 조회보다 오래 걸린다. */
export async function createAiReport(signal?: AbortSignal): Promise<AiReport> {
  const report = toReport(
    await apiFetch<ReportApiResponse | null>('/api/v1/reports', {
      method: 'POST',
      signal,
    }),
  )

  if (!report) {
    throw new Error('리포트를 만들지 못했습니다.')
  }
  return report
}
