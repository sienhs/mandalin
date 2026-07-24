import { useRef, useState } from 'react'
import { BuildingThumbnail } from '../village/BuildingThumbnail'
import { BUILDING_LIST, type BuildingKey, type Stage } from '../village/catalog'

const STAGES: Stage[] = [1, 2, 3]

/**
 * 썸네일 스튜디오 (개발/운영 유틸) — /thumbnails
 * 모든 건물을 카드로 렌더하고 PNG로 뽑는다.
 * 뽑은 PNG를 static 에셋으로 커밋 → 상점은 <img>로 가볍게 목록 표시(수백 개여도 부담 X).
 * (상점 라이브 프리뷰가 필요하면 같은 BuildingThumbnail을 그대로 쓰면 됨)
 */
export default function ThumbnailStudioPage() {
  const canvases = useRef<Record<string, HTMLCanvasElement>>({})
  const [stage, setStage] = useState<Stage>(3)
  const [bg, setBg] = useState<string>('transparent')

  const setCanvas = (key: string) => (el: HTMLCanvasElement) => {
    canvases.current[key] = el
  }

  const download = (key: string) => {
    const el = canvases.current[key]
    if (!el) return
    const a = document.createElement('a')
    a.href = el.toDataURL('image/png')
    a.download = `${key}_s${stage}.png`
    a.click()
  }

  const downloadAll = () => {
    // 브라우저 다중 다운로드 안정성 위해 약간씩 텀을 둠
    BUILDING_LIST.forEach((b, i) => setTimeout(() => download(b.key), i * 180))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f5', fontFamily: 'system-ui, sans-serif', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>🏙 건물 썸네일 스튜디오</h1>
        <div style={{ display: 'flex', gap: 6 }}>
          {STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setStage(s)}
              style={{
                padding: '6px 12px', borderRadius: 8, cursor: 'pointer',
                border: '1px solid #cbd5db',
                background: stage === s ? '#2b6cb0' : '#fff',
                color: stage === s ? '#fff' : '#333',
              }}
            >
              {s}단계
            </button>
          ))}
        </div>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          카드 배경
          <select value={bg} onChange={(e) => setBg(e.target.value)} style={{ padding: '5px 8px', borderRadius: 8, border: '1px solid #cbd5db' }}>
            <option value="transparent">투명(체커)</option>
            <option value="#ffffff">화이트</option>
            <option value="#cfe8f0">스카이</option>
            <option value="#1e2530">다크</option>
          </select>
        </label>
        <button
          onClick={downloadAll}
          style={{ padding: '6px 14px', borderRadius: 8, cursor: 'pointer', border: 'none', background: '#2f9e44', color: '#fff', fontWeight: 600 }}
        >
          전체 PNG 저장 ({BUILDING_LIST.length})
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
        {BUILDING_LIST.map((b) => (
          <div
            key={b.key}
            style={{
              background: '#fff', borderRadius: 12, padding: 12,
              boxShadow: '0 2px 10px rgba(0,0,0,0.08)', textAlign: 'center',
            }}
          >
            <div
              style={{
                borderRadius: 10, overflow: 'hidden', marginBottom: 8,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                background:
                  bg === 'transparent'
                    ? 'repeating-conic-gradient(#e9edf0 0% 25%, #f7f9fa 0% 50%) 50% / 20px 20px'
                    : bg,
              }}
            >
              <ThumbnailKey key={`${b.key}-${stage}`} k={b.key} stage={stage} onCanvas={setCanvas(b.key)} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{b.label}</div>
            <div style={{ fontSize: 11, color: '#8a97a0', marginBottom: 8 }}>
              {b.key} · {b.group === 'village' ? '마을풍' : '도시풍'}
            </div>
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

/** stage 변경 시 재마운트되도록 key 분리한 래퍼. */
function ThumbnailKey({ k, stage, onCanvas }: { k: BuildingKey; stage: Stage; onCanvas: (el: HTMLCanvasElement) => void }) {
  return <BuildingThumbnail k={k} stage={stage} size={150} onCanvas={onCanvas} />
}
