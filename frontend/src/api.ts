export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

export type OAuthExchangeResponse = {
  success: boolean
  message: string
  data: {
    userId: number
    accessToken: string
    name: string
    email: string
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
