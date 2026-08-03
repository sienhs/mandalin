import { NavLink } from 'react-router-dom'

/**
 * **개발 전용** 상단 네비게이션 (가운데 pill).
 *
 * 사용자 화면은 AppShell 이 담당한다. 이 컴포넌트는 `/dev/*` 화면에서만 쓰인다 —
 * 예전에는 마을 화면(사용자 화면)에도 붙어 있어서 개발 도구가 정식 메뉴처럼 보였다.
 * 마을 3D 캔버스 위에 떠도 좌상단 타이틀/우상단 패널과 안 겹치도록 top-center 배치.
 */
const LINKS = [
  { to: '/dev', label: '개발 허브' },
  { to: '/app/village', label: '마을' },
  { to: '/dev/gallery', label: '모아보기' },
  { to: '/dev/premium', label: '프리미엄' },
  { to: '/dev/thumbnails', label: '스튜디오' },
]

export function TopBar() {
  return (
    <nav
      style={{
        position: 'fixed', top: 12, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100, display: 'flex', gap: 4, padding: 4,
        // 좁은 폭에서 링크가 아래로 접히면 3D 화면을 가린다. 한 줄을 유지하고
        // 넘치면 가로로 스크롤시킨다.
        flexWrap: 'nowrap', maxWidth: 'calc(100vw - 24px)', overflowX: 'auto',
        background: 'rgba(255,255,255,0.92)', borderRadius: 999,
        boxShadow: '0 4px 18px rgba(0,0,0,0.15)', backdropFilter: 'blur(6px)',
        fontFamily: 'system-ui, sans-serif',
        scrollbarWidth: 'none',
      }}
    >
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          style={({ isActive }) => ({
            flex: '0 0 auto',
            padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
            textDecoration: 'none', whiteSpace: 'nowrap',
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
