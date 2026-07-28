export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

/** 카카오 OAuth 교환 응답. 사용자 정보는 ERD `user` 컬럼을 camelCase로 변환한 형태 */
export type OAuthExchangeResponse = {
  success: boolean
  message: string
  data: {
    accessToken: string
    id: number
    kakaoId: string
    name: string
    uuid: string
    point: number
    profileImageUrl: string | null
    createdAt: string
    deletedAt: string | null
  }
}

export async function exchangeOAuthCode(code: string): Promise<OAuthExchangeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/oauth/exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ code }),
  })

  if (!response.ok) {
    throw new Error(`OAuth exchange failed with status ${response.status}`)
  }

  return response.json()
}

export async function reissueAccessToken(): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/api/auth/reissue`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error(`Access token reissue failed with status ${response.status}`)
  }

  const result: { data: string } = await response.json()
  return result.data
}
