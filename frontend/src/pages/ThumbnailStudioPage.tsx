import { useState } from 'react'
import { TopBar } from '../components/TopBar'
import { BuildingImage } from '../village/BuildingImage'
import { ThumbnailBakery, getCachedThumbnail } from '../village/thumbnailBaker'
import { BUILDING_LIST, type BuildingKey, type Stage } from '../village/catalog'
import { localParts } from '../village/localCatalog'

const STAGES: Stage[] = [1, 2, 3]

/**
 * 썸네일 스튜디오 (/thumbnails) — 개발/운영 유틸.
 * 모든 건물을 <img>(ThumbnailBakery가 구운 dataURL)로 표시하고 PNG로 저장.
 * 저장한 PNG를 `public/thumbnails/`에 커밋하면 상점/피커가 static <img>로 가벼워짐.
 */
export default function ThumbnailStudioPage() {
  const [stage, setStage] = useState<Stage>(3)

  const download = (key: BuildingKey) => {
    const url = getCachedThumbnail(key, stage)
    if (!url) {
      alert('아직 렌더 중이에요. 잠시 후 다시 시도해 주세요.')
      return
    }
    const a = document.createElement('a')
    a.href = url
    a.download = `${key}_s${stage}.png`
    a.click()
  }

  const downloadAll = () => {
    const ready = BUILDING_LIST.filter((b) => getCachedThumbnail(b.key, stage))
    if (ready.length < BUILDING_LIST.length) {
      alert(`${ready.length}/${BUILDING_LIST.length}개 준비됨. 나머지는 렌더 후 다시 눌러주세요.`)
    }
    ready.forEach((b, i) => setTimeout(() => download(b.key), i * 150))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f5', fontFamily: 'system-ui, sans-serif', padding: '64px 24px 24px' }}>
      <TopBar />
      <ThumbnailBakery />

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>🏙 건물 썸네일 스튜디오</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              style={{
                padding: '6px 12px', borderRadius: 8, cursor: 'pointer', border: '1px solid #cbd5db',
                background: stage === s ? '#2b6cb0' : '#fff', color: stage === s ? '#fff' : '#333',
              }}
            >
              {s}단계
            </button>
          ))}
        </div>
        <button
          onClick={downloadAll}
          style={{ padding: '6px 14px', borderRadius: 8, cursor: 'pointer', border: 'none', background: '#2f9e44', color: '#fff', fontWeight: 600 }}
        >
          전체 PNG 저장 ({BUILDING_LIST.length})
        </button>
        <span style={{ fontSize: 12, color: '#8a97a0' }}>저장한 PNG를 public/thumbnails/ 에 넣으면 static 이미지로 전환</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        {BUILDING_LIST.map((b) => (
          <div key={b.key} style={{ background: '#fff', borderRadius: 12, padding: 12, boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ borderRadius: 10, overflow: 'hidden', marginBottom: 8, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#eaf4f8,#f6f9fb)' }}>
              <BuildingImage k={b.key} parts={localParts(b.key)} stage={stage} size={150} alt={b.label} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{b.label}</div>
            <div style={{ fontSize: 11, color: '#8a97a0', marginBottom: 8 }}>{b.key} · {b.group === 'village' ? '마을풍' : '도시풍'}</div>
            <button
              onClick={() => download(b.key)}
              style={{ width: '100%', padding: '6px', borderRadius: 8, cursor: 'pointer', border: '1px solid #cbd5db', background: '#f6f8f9', fontSize: 12 }}
            >
              PNG 저장
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
