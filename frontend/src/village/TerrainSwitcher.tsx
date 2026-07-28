import { useState } from 'react'
import { TERRAINS, TERRAIN_META, type Terrain } from './villageApi'

interface Props {
  current: Terrain
  /** 마우스를 올린 지형(미리보기). null 이면 현재 지형. */
  onPreview: (terrain: Terrain | null) => void
  onPick: (terrain: Terrain) => void
  /** 저장 중인 지형. 카드에 진행 표시를 띄운다. */
  pending: Terrain | null
  error: string | null
}

/** 카드 미리보기용 색 띠 (지면 → 길 → 포인트). */
const SWATCH: Record<Terrain, [string, string, string]> = {
  CITY_ROAD: ['#8a94a3', '#2b2e35', '#e8e6da'],
  DIRT_ROAD: ['#6b4a2a', '#c4a561', '#d6cbb0'],
  GRASS_PATH: ['#4a8c39', '#c4a561', '#d94f6a'],
  WATER_WAY: ['#2f6fa8', '#7a5230', '#4d9c5a'],
}

/**
 * 마을 지형 전환 — 좌측 플로팅 버튼 + 펼침 패널.
 *
 * 도메인 상세 패널(우측)과 자리를 다투지 않게 왼쪽에 둔다.
 * 카드에 마우스를 올리면 뒤의 3D 마을이 그 지형으로 즉시 미리보기된다.
 */
export function TerrainSwitcher({ current, onPreview, onPick, pending, error }: Props) {
  const [open, setOpen] = useState(false)
  const meta = TERRAIN_META[current]

  const close = () => {
    setOpen(false)
    onPreview(null)
  }

  return (
    <div style={{ position: 'absolute', left: 20, bottom: 24, fontFamily: 'system-ui, sans-serif' }}>
      {open && (
        <div
          onMouseLeave={() => onPreview(null)}
          style={{
            width: 260, marginBottom: 10, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.97)',
            boxShadow: '0 10px 34px rgba(0,0,0,0.22)', backdropFilter: 'blur(6px)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700 }}>마을 지형</div>
            <button
              onClick={close}
              style={{ border: 'none', background: 'transparent', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>
          <div style={{ fontSize: 11, color: '#5a6b76', marginBottom: 10 }}>
            건물이 놓이는 바닥과 길의 분위기입니다.
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {TERRAINS.map((t) => {
              const m = TERRAIN_META[t]
              const on = current === t
              const busy = pending === t
              return (
                <button
                  key={t}
                  disabled={pending !== null}
                  onMouseEnter={() => onPreview(t)}
                  onFocus={() => onPreview(t)}
                  onClick={() => onPick(t)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left',
                    padding: '8px 10px', borderRadius: 10,
                    cursor: pending !== null ? 'progress' : 'pointer',
                    border: '1px solid ' + (on ? '#2b6cb0' : '#d0d7dc'),
                    background: on ? '#eef7ff' : '#fff',
                    opacity: pending !== null && !busy ? 0.55 : 1,
                  }}
                >
                  <span style={{ display: 'flex', width: 34, height: 34, borderRadius: 8, overflow: 'hidden', flex: '0 0 auto' }}>
                    {SWATCH[t].map((c, i) => (
                      <span key={c} style={{ background: c, flex: i === 0 ? 3 : i === 1 ? 2 : 1 }} />
                    ))}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700 }}>{m.emoji} {m.label}</div>
                    <div style={{ fontSize: 10.5, color: '#5a6b76', lineHeight: 1.35 }}>
                      {busy ? '적용 중…' : m.desc}
                    </div>
                  </span>
                </button>
              )
            })}
          </div>

          {error && <div style={{ marginTop: 10, fontSize: 11.5, color: '#c92a2a' }}>{error}</div>}
        </div>
      )}

      <button
        onClick={() => (open ? close() : setOpen(true))}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', borderRadius: 999,
          border: '1px solid #d0d7dc', background: 'rgba(255,255,255,0.96)', cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(0,0,0,0.16)', fontSize: 13, fontWeight: 600, color: '#33424d',
        }}
      >
        <span style={{ fontSize: 15 }}>{meta.emoji}</span>
        {meta.label}
        <span style={{ color: '#8a97a0', fontSize: 11 }}>{open ? '▾' : '▴'}</span>
      </button>
    </div>
  )
}
