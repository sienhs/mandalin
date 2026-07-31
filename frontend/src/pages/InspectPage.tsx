import { InspectBakery, useInspectShot } from '../village/inspectBaker'
import { PREMIUM_THEMES } from '../village/premium'
import { LANDMARK_VIEWER_THEME } from '../village/landmarks'
import { localLabel, type AnyBuildingKey } from '../village/localCatalog'
import type { LandmarkStage, Stage } from '../village/partTypes'

/**
 * 검수 페이지 (/inspect) — 건물을 4방면(0/90/180/270°)으로 구워 정렬/적층 이상을 확인.
 * `?theme=<id>` : 그 테마 전체. `?keys=a,b,c` : 지정 건물들. `?stage=3`.
 */
const AZ = [0, 90, 180, 270]
const AZ_LABEL = ['0°', '90°', '180°', '270°']

type AnyStage = Stage | LandmarkStage

function Row({ k, label, stage, cell }: { k: AnyBuildingKey; label: string; stage: AnyStage; cell: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, borderBottom: '1px solid #e6ebee', padding: '4px 0' }}>
      <div style={{ width: 150, fontSize: 12, flex: '0 0 150px' }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ color: '#9aa7b0', fontSize: 10 }}>{k}</div>
      </div>
      {AZ.map((az, i) => (
        <Cell key={az} k={k} stage={stage} az={az} label={AZ_LABEL[i]} cell={cell} />
      ))}
    </div>
  )
}

function Cell({ k, stage, az, label, cell }: { k: AnyBuildingKey; stage: AnyStage; az: number; label: string; cell: number }) {
  const url = useInspectShot(k, stage, az)
  return (
    <div style={{ width: cell, textAlign: 'center' }}>
      <div style={{ height: cell, background: 'linear-gradient(180deg,#eef4f7,#f7fafb)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {url ? <img src={url} width={cell} height={cell} alt={`${k} ${label}`} /> : <span style={{ fontSize: 10, color: '#9aa7b0' }}>굽는 중…</span>}
      </div>
      <div style={{ fontSize: 10, color: '#8a97a0' }}>{label}</div>
    </div>
  )
}

export default function InspectPage() {
  const q = new URLSearchParams(window.location.search)
  // 랜드마크는 1~8 단계라 상한을 3 으로 묶지 않는다. ?stage=6 이면 랜드마크는 6단계,
  // 일반 건물은 (렌더러가 3 초과를 완성으로 다루므로) 완성 상태로 나온다.
  const stage = (Number(q.get('stage')) || 3) as AnyStage
  const themeId = q.get('theme')
  const keysParam = q.get('keys')
  const cell = Number(q.get('cell')) || 132

  let items: { key: AnyBuildingKey; label: string }[] = []
  if (keysParam) {
    items = keysParam.split(',').map((k) => k.trim()).filter(Boolean).map((k) => ({
      key: k as AnyBuildingKey,
      label: localLabel(k),
    }))
  } else {
    const all = [...PREMIUM_THEMES, LANDMARK_VIEWER_THEME]
    const theme = all.find((t) => t.id === themeId) ?? all[0]
    items = theme.keys.map((k) => ({ key: k as AnyBuildingKey, label: localLabel(k) }))
  }

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f5', fontFamily: 'system-ui, sans-serif', padding: 16 }}>
      <InspectBakery />
      <h1 style={{ fontSize: 16, margin: '0 0 10px' }}>
        🔎 4방면 검수 · {themeId ?? 'keys'} · stage {stage} <span style={{ color: '#9aa7b0', fontWeight: 400 }}>({items.length})</span>
      </h1>
      <div style={{ background: '#fff', borderRadius: 10, padding: '4px 10px' }}>
        {items.map((it) => (
          <Row key={it.key} k={it.key} label={it.label} stage={stage} cell={cell} />
        ))}
      </div>
    </div>
  )
}
