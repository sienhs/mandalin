import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { exchangeOAuthCode } from '../api'
import { useSession } from '../auth/useSession'
import { consumeIntendedPath } from '../auth/redirectTo'

type Status = 'loading' | 'success' | 'error'

/** 되돌아갈 곳을 기억하지 못했을 때 보낼 기본 경로. */
const DEFAULT_LANDING = '/village'

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { signIn } = useSession()
  const [status, setStatus] = useState<Status>('loading')
  const [name, setName] = useState<string | null>(null)
  const exchanged = useRef(false)

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error || !code) {
      setStatus('error')
      return
    }

    // code 는 1회용(TTL 60초)이다. StrictMode 가 effect 를 두 번 돌리면 두 번째 교환이
    // 반드시 실패해 방금 성공한 로그인을 에러로 덮어쓴다.
    if (exchanged.current) return
    exchanged.current = true

    exchangeOAuthCode(code)
      .then((result) => {
        // 여기서 세션을 열지 않으면 이후 API 호출에 Authorization 이 붙지 않는다.
        signIn(result)
        setName(result.name)
        setStatus('success')
        // replace — 뒤로 가기로 이 콜백 URL(이미 소진된 code)로 돌아오면 안 된다.
        navigate(consumeIntendedPath() ?? DEFAULT_LANDING, { replace: true })
      })
      .catch(() => setStatus('error'))
  }, [searchParams, signIn, navigate])

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
