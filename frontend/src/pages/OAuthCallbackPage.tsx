import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { exchangeOAuthCode } from '../api'

type Status = 'loading' | 'success' | 'error'

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<Status>('loading')
  const [name, setName] = useState<string | null>(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      setStatus('error')
      return
    }

    exchangeOAuthCode(code)
      .then((result) => {
        setName(result.data.name)
        setStatus('success')
      })
      .catch(() => setStatus('error'))
  }, [searchParams])

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
      {status === 'success' && <p>로그인 성공{name ? ` (${name})` : ''}</p>}
      {status === 'error' && <p>로그인 실패</p>}
    </div>
  )
}
