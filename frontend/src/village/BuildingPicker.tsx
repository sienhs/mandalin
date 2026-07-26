import { useState } from 'react'
import { BuildingImage } from './BuildingImage'
import { BUILDING_LIST } from './catalog'
import type { AnyBuildingKey } from './buildings'
import { PREMIUM_THEMES, PREMIUM_CONFIGS, type PremiumKey } from './premium'

interface Props {
  /** 현재 선택값 ('auto' 또는 건물 key) */
  value: AnyBuildingKey | 'auto'
  onPick: (v: AnyBuildingKey | 'auto') => void
  onClose: () => void
  title?: string
}

type Item = { key: AnyBuildingKey; label: string }

/** 탭: 기본(마을/도시) + 12개 프리미엄 테마. */
const BASE_TAB = { id: 'base', label: '🏙 기본' }
const TABS = [BASE_TAB, ...PREMIUM_THEMES.map((t) => ({ id: t.id, label: t.label }))]

/**
 * 건물 썸네일 그리드 선택 모달 — 기본 15종 + 프리미엄 241종.
 * 테마 탭으로 한 번에 한 그룹만 렌더 → 썸네일 베이킹 부하를 ~20개로 제한.
 */
export function BuildingPicker({ value, onPick, onClose, title = '건물 선택' }: Props) {
  const [tab, setTab] = useState<string>('base')

  const cardStyle = (selected: boolean): React.CSSProperties => ({
    border: selected ? '2px solid #2b6cb0' : '1px solid #dde3e8',
    background: selected ? '#eef7ff' : '#fff',
    borderRadius: 12, padding: 8, cursor: 'pointer', textAlign: 'center',
  })

  const pick = (v: AnyBuildingKey | 'auto') => {
    onPick(v)
    onClose()
  }

  const Grid = ({ items }: { items: Item[] }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(92px, 1fr))', gap: 8, marginBottom: 14 }}>
      {items.map((b) => (
        <button key={b.key} onClick={() => pick(b.key)} style={cardStyle(value === b.key)}>
          <div style={{ height: 84, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#eaf4f8,#f6f9fb)', borderRadius: 8, marginBottom: 6, overflow: 'hidden' }}>
            <BuildingImage k={b.key} stage={3} size={84} alt={b.label} />
          </div>
          <div style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>{b.label}</div>
        </button>
      ))}
    </div>
  )

  // 현재 탭의 건물 목록
  let sections: { title: string; items: Item[] }[]
  if (tab === 'base') {
    sections = [
      { title: '🏡 마을풍', items: BUILDING_LIST.filter((b) => b.group === 'village').map((b) => ({ key: b.key as AnyBuildingKey, label: b.label })) },
      { title: '🏙 도시풍', items: BUILDING_LIST.filter((b) => b.group === 'city').map((b) => ({ key: b.key as AnyBuildingKey, label: b.label })) },
    ]
  } else {
    const theme = PREMIUM_THEMES.find((t) => t.id === tab)!
    sections = [
      { title: theme.label, items: theme.keys.map((k) => ({ key: k as AnyBuildingKey, label: PREMIUM_CONFIGS[k as PremiumKey].label })) },
    ]
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(20,28,35,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: 'min(600px, 100%)', maxHeight: '88vh', display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* 테마 탭 */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 10, borderBottom: '1px solid #eef1f4' }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: '0 0 auto', padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
                border: '1px solid ' + (tab === t.id ? '#2b6cb0' : '#d0d7dc'),
                background: tab === t.id ? '#2b6cb0' : '#fff',
                color: tab === t.id ? '#fff' : '#33424d',
                fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={{ overflowY: 'auto', paddingRight: 4 }}>
          {/* 자동 (기본 탭에서만) */}
          {tab === 'base' && (
            <button
              onClick={() => pick('auto')}
              style={{ ...cardStyle(value === 'auto'), width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '12px 14px', textAlign: 'left' }}
            >
              <span style={{ fontSize: 22 }}>✨</span>
              <span>
                <div style={{ fontSize: 14, fontWeight: 700 }}>자동 (기본 배치)</div>
                <div style={{ fontSize: 11, color: '#5a6b76' }}>진행률·마을/도시풍에 따라 자동 결정</div>
              </span>
            </button>
          )}

          {sections.map((s) => (
            <div key={s.title}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#33424d', margin: '0 0 8px' }}>{s.title}</div>
              <Grid items={s.items} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
