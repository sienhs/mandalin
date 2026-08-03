import type { ZoomLevel } from './IsoCamera'

/**
 * 카메라 조작 버튼 (Canvas 밖 HTML).
 *
 * <p>자유 회전을 90° 스냅으로 묶으면서 마우스 드래그로 돌리는 길이 사라졌다. 대신 버튼을
 * 둔다 — 어차피 네 방향뿐이라 드래그보다 정확하고, 어느 방향을 보고 있는지도 함께 보여줄 수 있다.
 *
 * <p>Canvas 안에 두지 않는 이유는 3D 텍스트가 각도에 따라 뒤집히고 겹치기 때문이다.
 * HTML 로 두면 2D 화면과 같은 타이포·간격을 그대로 쓴다.
 */

const FACING_LABEL = ['남동', '남서', '북서', '북동'] as const
const ZOOM_LABEL = ['멀리', '보통', '가까이'] as const

type Props = {
  facing: number
  zoom: ZoomLevel
  onRotateCCW: () => void
  onRotateCW: () => void
  onZoom: (level: ZoomLevel) => void
}

const panel: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  padding: 4,
  borderRadius: 999,
  background: 'var(--surface-card)',
  boxShadow: 'var(--shadow-card)',
  backdropFilter: 'blur(6px)',
  fontFamily: 'system-ui, sans-serif',
}

const button: React.CSSProperties = {
  display: 'grid',
  placeItems: 'center',
  width: 34,
  height: 34,
  border: 0,
  borderRadius: 999,
  background: 'transparent',
  color: 'var(--text-strong)',
  fontSize: 15,
  cursor: 'pointer',
}

export function CameraControls({ facing, zoom, onRotateCCW, onRotateCW, onZoom }: Props) {
  return (
    /*
      우하단에 둔다. 좌하단은 지형 스위처가 쓰고 있어서 겹쳤다 —
      두 패널이 같은 자리에 그려지면서 마을 화면이 깨져 보였다.
    */
    <div
      style={{
        position: 'absolute',
        right: 16,
        bottom: 16,
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        gap: 8,
        zIndex: 20,
      }}
    >
      {/* 회전 */}
      <div style={panel}>
        <button
          type="button"
          onClick={onRotateCCW}
          style={button}
          aria-label="왼쪽으로 돌리기"
          title="왼쪽으로 90° 돌리기"
        >
          ↺
        </button>
        <span
          style={{
            minWidth: 34,
            textAlign: 'center',
            fontSize: 11.5,
            fontWeight: 800,
            color: 'var(--text-muted)',
          }}
        >
          {FACING_LABEL[facing % 4]}
        </span>
        <button
          type="button"
          onClick={onRotateCW}
          style={button}
          aria-label="오른쪽으로 돌리기"
          title="오른쪽으로 90° 돌리기"
        >
          ↻
        </button>
      </div>

      {/* 줌 */}
      <div style={panel} role="group" aria-label="확대 수준">
        {ZOOM_LABEL.map((label, i) => {
          const active = zoom === i
          return (
            <button
              key={label}
              type="button"
              onClick={() => onZoom(i as ZoomLevel)}
              aria-pressed={active}
              style={{
                ...button,
                width: 'auto',
                padding: '0 12px',
                fontSize: 12,
                fontWeight: 800,
                background: active ? 'var(--color-brand-600)' : 'transparent',
                color: active ? '#fff' : 'var(--text-muted)',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
