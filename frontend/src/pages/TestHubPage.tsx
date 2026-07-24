import { Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'

/**
 * 임시 테스트 허브 (/test) — 지금까지 만든 3개 화면 진입점.
 * (실서비스 랜딩 아님. 테스트 편의용)
 */
const CARDS = [
  { to: '/village', emoji: '🏡', title: '마을', desc: '만다라트 3D 마을 — 블록·건물·상세 패널, 회전/줌' },
  { to: '/gallery', emoji: '🏘', title: '건물 모아보기', desc: '전체 건물 카탈로그 (마을풍/도시풍, 단계별)' },
  { to: '/thumbnails', emoji: '🖼', title: '썸네일 스튜디오', desc: '건물 PNG 썸네일 추출 유틸' },
]

export default function TestHubPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#cfe8f0,#eef2f5)', fontFamily: 'system-ui, sans-serif' }}>
      <TopBar />
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '96px 24px 48px' }}>
        <h1 style={{ fontSize: 30, margin: '0 0 6px', color: '#1e2a33' }}>🧪 만다린 · 테스트 허브</h1>
        <p style={{ color: '#5a6b76', margin: '0 0 28px' }}>지금까지 만든 3D 마을 관련 화면 모음 (임시)</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {CARDS.map((c) => (
            <Link
              key={c.to}
              to={c.to}
              style={{
                display: 'block', textDecoration: 'none', color: 'inherit',
                background: '#fff', borderRadius: 16, padding: 20,
                boxShadow: '0 4px 18px rgba(0,0,0,0.10)',
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 8 }}>{c.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>{c.title}</div>
              <div style={{ fontSize: 13, color: '#5a6b76', lineHeight: 1.5 }}>{c.desc}</div>
            </Link>
          ))}
        </div>

        <p style={{ marginTop: 28, fontSize: 12, color: '#8a97a0' }}>
          상단 바로 언제든 이동 가능 · 실서비스 진입점(로그인)은 <Link to="/" style={{ color: '#2b6cb0' }}>/</Link>
        </p>
      </div>
    </div>
  )
}
