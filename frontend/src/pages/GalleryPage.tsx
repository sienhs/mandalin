import { useState } from 'react'
import { Link } from 'react-router-dom'
import { TopBar } from '../components/TopBar'
import { BuildingImage } from '../village/BuildingImage'
import { ThumbnailBakery } from '../village/thumbnailBaker'
import { BUILDING_LIST, type Stage } from '../village/catalog'
import { localParts } from '../village/localCatalog'

const STAGES: { v: Stage; label: string }[] = [
  { v: 1, label: '1·일관화' },
  { v: 2, label: '2·형태' },
  { v: 3, label: '3·완성' },
]

/**
 * 건물 카탈로그 모아보기 (/gallery) — 읽기 전용.
 * 상점/인벤토리 로직 없이 전체 건물을 마을풍/도시풍으로 모아서 보여줌.
 * BuildingImage 사용 → static PNG 우선, 없으면 라이브 3D 폴백.
 */
export default function GalleryPage() {
  const [stage, setStage] = useState<Stage>(3)
  const village = BUILDING_LIST.filter((b) => b.group === 'village')
  const city = BUILDING_LIST.filter((b) => b.group === 'city')

  const Section = ({ title, items }: { title: string; items: typeof BUILDING_LIST }) => (
    <section style={{ marginBottom: 28 }}>
      <h2 style={{ fontSize: 16, margin: '0 0 12px', color: '#33424d' }}>{title} <span style={{ color: '#9aa7b0', fontWeight: 400 }}>({items.length})</span></h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {items.map((b) => (
          <div key={b.key} style={{ background: '#fff', borderRadius: 12, padding: 10, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', textAlign: 'center' }}>
            <div
              style={{
                borderRadius: 10, overflow: 'hidden', marginBottom: 8, height: 150,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(180deg, #eaf4f8, #f6f9fb)',
              }}
            >
              <BuildingImage k={b.key} parts={localParts(b.key)} stage={stage} size={150} alt={b.label} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{b.label}</div>
            <div style={{ fontSize: 11, color: '#9aa7b0' }}>{b.key}</div>
          </div>
        ))}
      </div>
    </section>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f5', fontFamily: 'system-ui, sans-serif', padding: '64px 24px 24px' }}>
      <TopBar />
      <ThumbnailBakery />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>🏘 건물 모아보기</h1>
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
          <Link to="/village" style={{ color: '#2b6cb0' }}>마을 보기 →</Link>
          <Link to="/thumbnails" style={{ color: '#2b6cb0' }}>썸네일 스튜디오 →</Link>
        </div>
      </div>

      <Section title="🏡 마을풍" items={village} />
      <Section title="🏙 도시풍" items={city} />
    </div>
  )
}
