import { NavLink } from 'react-router-dom'

/**
 * 임시 테스트용 상단 네비게이션 (가운데 pill).
 * 마을 3D 캔버스 위에 떠도 좌상단 타이틀/우상단 패널과 안 겹치도록 top-center 배치.
 */
const LINKS = [
  { to: '/test', label: '🏠 홈' },
  { to: '/village', label: '🏡 마을' },
  { to: '/gallery', label: '🏘 모아보기' },
  { to: '/premium', label: '💎 프리미엄' },
  { to: '/thumbnails', label: '🖼 스튜디오' },
]

export function TopBar() {
  return (
    <nav
      style={{
        position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, display: 'flex', gap: 4, padding: 4,
        background: 'rgba(255,255,255,0.92)', borderRadius: 999,
        boxShadow: '0 4px 18px rgba(0,0,0,0.15)', backdropFilter: 'blur(6px)',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          style={({ isActive }) => ({
            padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            textDecoration: 'none',
            color: isActive ? '#fff' : '#33424d',
            background: isActive ? '#2b6cb0' : 'transparent',
          })}
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  )
}
