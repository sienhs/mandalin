import { apiFetch } from '../../api'

/**
 * 시연용 API.
 *
 * 과제 수행 체크와 포인트 적립이 아직 없어 마을이 자라지도, 건물을 살 수도 없다. 발표에서
 * 그 흐름을 보여주기 위한 임시 통로다.
 *
 * 백엔드가 `app.demo.enabled` 로 켜고 끄며(기본 true), 끄면 이 경로들이 404 가 된다.
 * 시연 화면(/test)에서만 쓴다 — 정식 서비스 전에 제거 대상이다.
 */

type DemoProgressBody = {
  /** 0~100. random 이 true 면 무시된다. */
  progress?: number
  /** 과제마다 임의값을 넣을지. */
  random?: boolean
  /** 특정 도메인만 바꿀 때의 position(0~7). 비우면 시트 전체. */
  domainPosition?: number | null
}

/** 시트(또는 한 도메인) 전체를 한 번에 바꾼다. 바뀐 과제 수를 돌려준다. */
export function applySheetProgress(sheetId: number, body: DemoProgressBody): Promise<number> {
  return apiFetch<number>(`/api/v1/demo/sheets/${sheetId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

/** 과제 한 건을 바꾼다. */
export function applySubjectProgress(subjectId: number, progress: number): Promise<void> {
  return apiFetch<void>(`/api/v1/demo/subjects/${subjectId}/progress`, {
    method: 'PATCH',
    body: JSON.stringify({ progress }),
  })
}

/** 내 계정에 포인트를 지급한다. 지급 후 잔액을 돌려준다. */
export function grantDemoPoint(amount: number): Promise<number> {
  return apiFetch<number>('/api/v1/demo/points', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  })
}
