import { BuildingImage } from './BuildingImage'
import { BUILDING_LIST, type BuildingKey } from './catalog'

interface Props {
  /** 현재 선택값 ('auto' 또는 건물 key) */
  value: BuildingKey | 'auto'
  onPick: (v: BuildingKey | 'auto') => void
  onClose: () => void
  title?: string
}

/**
 * 건물 썸네일 그리드 선택 모달.
 * BuildingImage 사용 → static PNG 우선, 없으면 라이브 3D 폴백.
 * (라이브 폴백 시 WebGL 컨텍스트가 여러 개 뜨므로, /thumbnails에서 PNG를 뽑아두면 가장 부드러움)
 */
export function BuildingPicker({ value, onPick, onClose, title = '건물 선택' }: Props) {
  const village = BUILDING_LIST.filter((b) => b.group === 'village')
  const city = BUILDING_LIST.filter((b) => b.group === 'city')

  const cardStyle = (selected: boolean): React.CSSProperties => ({
    border: selected ? '2px solid #2b6cb0' : '1px solid #dde3e8',
    background: selected ? '#eef7ff' : '#fff',
    borderRadius: 12, padding: 8, cursor: 'pointer', textAlign: 'center',
  })

  const pick = (v: BuildingKey | 'auto') => {
    onPick(v)
    onClose()
  }

  const Grid = ({ items }: { items: typeof BUILDING_LIST }) => (
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
        style={{ width: 'min(560px, 100%)', maxHeight: '86vh', overflowY: 'auto', background: '#fff', borderRadius: 16, padding: 20, boxShadow: '0 12px 40px rgba(0,0,0,0.3)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 17 }}>{title}</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        {/* 자동 */}
        <button
          onClick={() => pick('auto')}
          style={{ ...cardStyle(value === 'auto'), width: '100%', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, padding: '12px 14px', textAlign: 'left' }}
        >
          <span style={{ fontSize: 22 }}>✨</span>
          <span>
            <div style={{ fontSize: 14, fontWeight: 700 }}>자동 (기본 배치)</div>
            <div style={{ fontSize: 11, color: '#5a6b76' }}>진행률·마을/도시풍에 따라 자동 결정</div>
          </span>
        </button>

        <div style={{ fontSize: 12, fontWeight: 700, color: '#33424d', margin: '0 0 8px' }}>🏡 마을풍</div>
        <Grid items={village} />
        <div style={{ fontSize: 12, fontWeight: 700, color: '#33424d', margin: '0 0 8px' }}>🏙 도시풍</div>
        <Grid items={city} />
      </div>
    </div>
  )
}
