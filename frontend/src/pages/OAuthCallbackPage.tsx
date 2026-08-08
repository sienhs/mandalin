import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { auth } from '../api/endpoints'
import { setAccessToken } from '../api/client'
import { clearMockSession } from '../data/store'
import Button from '../components/common/ActionButton'

/**
 * 카카오 로그인 뒤 백엔드가 1회용 code 를 달고 되돌려 보내는 자리.
 *
 * <p>돌아올 주소는 백엔드의 `FRONTEND_BASE_URL` 이 정한다(`OAuth2LoginSuccessHandler`).
 * 배포는 vercel 도메인, 로컬은 http://localhost:5173 이라 각자 자기 화면으로 돌아온다 —
 * 로컬에서 붙이려면 백엔드도 같이 띄워야 한다.
 */
export default function OAuthCallback() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [message, setMessage] = useState('')
  const requested = useRef(false)

  useEffect(() => {
    const code = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      setStatus('error')
      setMessage(error ?? '인가 코드가 없습니다.')
      return
    }
    // 개발 모드의 이중 마운트에서 code 를 두 번 쓰지 않게 한다(1회용이다).
    if (requested.current) return
    requested.current = true

    auth
      .exchange(code)
      .then((data) => {
        /*
          목업으로 화면을 보다가 카카오로 들어오면 저장분에 'mock' 이 남아 있어서, 로그인은
          됐는데 화면은 계속 브라우저 안 데이터를 보여준다. 실제 계정으로 들어오는 길목이
          여기와 테스트 계정 로그인 둘뿐이라, 양쪽에서 같이 지운다.
        */
        clearMockSession()
        setAccessToken(data.accessToken)
        // 세션 복원 로직이 토큰을 다시 읽도록 새로고침하며 들어간다.
        window.location.replace('/app')
      })
      .catch((cause: unknown) => {
        setStatus('error')
        setMessage(cause instanceof Error ? cause.message : '로그인에 실패했습니다.')
      })
  }, [params, navigate])

  return (
    <div
      className="grid min-h-dvh place-items-center px-6"
      style={{ background: 'var(--surface-page)' }}
    >
      <div className="w-full max-w-sm text-center">
        {status === 'loading' ? (
          <>
            <span className="mx-auto block size-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <p className="mt-5 text-sm font-bold">로그인 처리 중이에요…</p>
          </>
        ) : (
          <>
            <span
              aria-hidden="true"
              className="mx-auto grid size-14 place-items-center rounded-2xl text-2xl"
              style={{ background: 'var(--surface-sunken)' }}
            >
              ⚠️
            </span>
            <h1 className="mt-5 text-lg font-extrabold">로그인하지 못했어요</h1>
            <p className="muted mt-2 text-[13px] font-semibold leading-relaxed">{message}</p>
            <div className="mt-6 flex justify-center gap-2">
              <Button to="/login">로그인 화면으로</Button>
              <Link
                to="/"
                className="muted grid h-11 place-items-center px-4 text-sm font-bold no-underline"
              >
                소개 페이지
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
