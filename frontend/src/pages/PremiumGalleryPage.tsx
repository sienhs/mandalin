import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { BuildingImage } from '../village/BuildingImage'
import { ThumbnailBakery } from '../village/thumbnailBaker'
import { PREMIUM_THEMES, PREMIUM_CONFIGS, type PremiumKey } from '../village/premium'
import type { Stage } from '../village/catalog'

const STAGES: { v: Stage; label: string }[] = [
  { v: 1, label: '1·일관화' },
  { v: 2, label: '2·형태' },
  { v: 3, label: '3·완성' },
]

/**
 * 프리미엄 테마 건물 뷰어 (/premium) — 읽기 전용.
 * 테마별 섹션으로 그룹핑, 각 건물 썸네일 + label + key, 단계 토글(1/2/3).
 * BuildingImage(단일 캔버스 베이커) 사용 → WebGL 컨텍스트는 2개로 고정.
 */
export default function PremiumGalleryPage() {
  const [stage, setStage] = useState<Stage>(3)
  // ?theme=<id> 로 한 테마만 렌더(검증 부하 감소). 없으면 전체.
  const onlyTheme = new URLSearchParams(window.location.search).get('theme')
  const themes = onlyTheme ? PREMIUM_THEMES.filter((t) => t.id === onlyTheme) : PREMIUM_THEMES
  const total = PREMIUM_THEMES.reduce((n, t) => n + t.keys.length, 0)

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f5', fontFamily: 'system-ui, sans-serif', padding: '64px 24px 24px' }}>
      <TopBar />
      <ThumbnailBakery />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>💎 프리미엄 건물 <span style={{ color: '#9aa7b0', fontWeight: 400, fontSize: 15 }}>({total})</span></h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {STAGES.map((s) => (
            <button
              key={s.v}
              onClick={() => setStage(s.v)}
              style={{
                padding: '6px 12px', borderRadius: 8, cursor: 'pointer', border: '1px solid #cbd5db',
                background: stage === s.v ? '#2b6cb0' : '#fff', color: stage === s.v ? '#fff' : '#333', fontSize: 13,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, fontSize: 13 }}>
          <Link to="/gallery" style={{ color: '#2b6cb0' }}>기본 모아보기 →</Link>
          <Link to="/village" style={{ color: '#2b6cb0' }}>마을 보기 →</Link>
        </div>
      </div>

      {themes.map((t) => (
        <section key={t.id} style={{ marginBottom: 32 }} id={`theme-${t.id}`}>
          <h2 style={{ fontSize: 17, margin: '0 0 12px', color: '#33424d' }}>
            {t.label} <span style={{ color: '#9aa7b0', fontWeight: 400, fontSize: 13 }}>({t.keys.length})</span>
          </h2>
          {t.keys.length === 0 ? (
            <div style={{ color: '#9aa7b0', fontSize: 13, padding: '8px 0' }}>아직 없음 (작성 예정)</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
              {t.keys.map((key) => (
                <div key={key} style={{ background: '#fff', borderRadius: 12, padding: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', textAlign: 'center' }}>
                  <div
                    style={{
                      borderRadius: 10, overflow: 'hidden', marginBottom: 8, height: 150,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'linear-gradient(180deg, #eaf4f8, #f6f9fb)',
                    }}
                  >
                    <BuildingImage k={key as PremiumKey} stage={stage} size={150} alt={PREMIUM_CONFIGS[key as PremiumKey].label} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{PREMIUM_CONFIGS[key as PremiumKey].label}</div>
                  <div style={{ fontSize: 11, color: '#9aa7b0' }}>{key}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}
