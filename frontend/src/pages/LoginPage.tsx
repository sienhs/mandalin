import { API_BASE_URL } from '../api'

export default function LoginPage() {
  const handleKakaoLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/kakao`
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        background: '#ffffff',
      }}
    >
      <button
        type="button"
        onClick={handleKakaoLogin}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '300px',
          height: '48px',
          border: 'none',
          borderRadius: '8px',
          background: '#FEE500',
          color: '#181600',
          fontSize: '16px',
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        카카오 로그인
      </button>
    </div>
  )
}
