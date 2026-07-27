import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeOAuthCode } from '../api'
import { useAuth } from '../contexts/auth'

type Status = 'loading' | 'success' | 'error'

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setSession } = useAuth()
  const [status, setStatus] = useState<Status>('loading')
  const hasRequestedExchange = useRef(false)

  useEffect(() => {
    if (hasRequestedExchange.current) return
    hasRequestedExchange.current = true

    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      setStatus('error')
      return
    }

    exchangeOAuthCode(code)
      .then((result) => {
        setSession(result.data)
        setStatus('success')
        navigate('/home', { replace: true })
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
