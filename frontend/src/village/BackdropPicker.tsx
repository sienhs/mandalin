import Modal from '../components/common/Modal'
import { cn } from '../utils/cn'
import { skyGradientCss } from './SkyBackdrop'
import { BACKDROPS, NO_BACKDROP, backdropThumb, type BackdropKey } from './backdrops'
import type { Terrain } from './villageApi'

interface Props {
  open: boolean
  value: BackdropKey
  /** 지금 지형. '기본' 칸에 지금 하늘색을 그대로 보여 주는 데 쓴다. */
  terrain: Terrain
  onChange: (next: BackdropKey) => void
  onClose: () => void
}

/**
 * 배경 고르기.
 *
 * <p><b>고르면 바로 적용하고 닫지 않는다.</b> 배경은 취향이라 몇 장을 번갈아 보고 정하는
 * 일이 흔한데, 고를 때마다 닫히면 매번 다시 열어야 한다. 모달이 화면 아래쪽(모바일)·
 * 가운데(데스크톱)에 뜨고 마을은 그 뒤에서 바로 바뀌므로, 누르고 뒤를 보면 된다.
 *
 *
 * <p>썸네일은 384px 짜리 별도 파일이다. 본 사진(2048px)을 축소해 쓰면 열한 칸을 그리려고
 * 15MB 를 받는다.
 */
export function BackdropPicker({ open, value, terrain, onChange, onClose }: Props) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="배경 고르기"
      description="3D 마을 뒤에 깔 그림입니다. 마을과 지형은 그대로 두고 배경만 바뀝니다."
      size="lg"
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Tile
          label="기본"
          selected={value === NO_BACKDROP}
          onClick={() => onChange(NO_BACKDROP)}
          preview={
            <span className="block size-full" style={{ background: skyGradientCss(terrain) }} />
          }
        />

        {BACKDROPS.map((b) => (
          <Tile
            key={b.key}
            label={b.label}
            selected={value === b.key}
            onClick={() => onChange(b.key)}
            preview={
              <img
                src={backdropThumb(b.key)}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover"
                style={{ background: b.tint }}
              />
            }
          />
        ))}
      </div>
    </Modal>
  )
}

function Tile({
  label,
  selected,
  preview,
  onClick,
}: {
  label: string
  selected: boolean
  preview: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="group flex flex-col gap-2 rounded-2xl border-0 bg-transparent p-0 text-left transition-transform hover:-translate-y-0.5"
    >
      <span
        className={cn(
          'relative block aspect-[2/1] w-full overflow-hidden rounded-xl border',
          selected && 'ring-2 ring-brand-500 ring-offset-2 ring-offset-[var(--surface-card)]',
        )}
        style={{ borderColor: 'var(--border-hairline)' }}
      >
        {preview}

        {/* 고른 칸에 체크. 테두리만으로는 어두운 사진 위에서 잘 안 읽힌다. */}
        {selected && (
          <span className="absolute right-1.5 bottom-1.5 grid size-6 place-items-center rounded-full bg-brand-600 text-[13px] leading-none font-black text-white shadow-md">
            ✓
          </span>
        )}
      </span>

      <span
        className={cn(
          'truncate px-0.5 text-[12.5px] font-bold',
          selected ? 'text-[var(--text-strong)]' : 'text-[var(--text-muted)]',
        )}
      >
        {label}
      </span>
    </button>
  )
}
