import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeOAuthCode } from '../api'
import { useAuth } from '../contexts/auth'

type Status = 'loading' | 'success' | 'error'

/** 로그인 후 보낼 기본 경로. */
const DEFAULT_LANDING = '/home'

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [status, setStatus] = useState<Status>('loading')
  // code 는 1회용(TTL 60초)이다. StrictMode 가 effect 를 두 번 돌리면 두 번째 교환이
  // 반드시 실패해 방금 성공한 로그인을 에러로 덮어쓴다.
  const hasRequestedExchange = useRef(false)

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      setStatus('error')
      return
    }

    if (hasRequestedExchange.current) return
    hasRequestedExchange.current = true

    exchangeOAuthCode(code)
      .then((data) => {
        setSession(data)
        setStatus('success')
        // replace — 뒤로 가기로 이 콜백 URL(이미 소진된 code)로 돌아오면 안 된다.
        navigate(DEFAULT_LANDING, { replace: true })
      })
      .catch(() => setStatus('error'))
  }, [navigate, searchParams, setSession])

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#ffffff',
        fontSize: '18px',
      }}
    >
      {status === 'loading' && <p>로그인 처리 중...</p>}
      {status === 'success' && <p>로그인 성공</p>}
      {status === 'error' && <p>로그인 실패</p>}
    </div>
  )
}
