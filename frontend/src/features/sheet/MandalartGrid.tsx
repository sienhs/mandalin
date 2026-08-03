import { useMemo } from 'react'
import type { Sheet, Subject } from '../../data/types'
import { domainColor } from '../../components/common/Primitives'
import { cn } from '../../utils/cn'

export type CellRef =
  | { kind: 'core' }
  | { kind: 'domain'; domainIndex: number }
  | { kind: 'subject'; domainIndex: number; subjectIndex: number }
  | { kind: 'empty'; domainIndex: number; subjectIndex: number }

/** 블록 좌표 → 도메인 position. 마을(IsoVillage)과 같은 배치를 쓴다. */
const BLOCK_TO_DOMAIN: Record<string, number> = {
  '0,0': 0,
  '1,0': 1,
  '2,0': 2,
  '0,1': 3,
  '2,1': 4,
  '0,2': 5,
  '1,2': 6,
  '2,2': 7,
}

type Props = {
  sheet: Sheet
  selected?: CellRef | null
  onSelect?: (ref: CellRef) => void
  /** 목록 카드용 초소형 뷰 — 글자 없이 색만 */
  mini?: boolean
  className?: string
}

/**
 * 만다라트 9x9. 어느 화면에서든 정사각형을 유지하고 폭에 맞춰 글자가 줄어든다.
 * 칸의 채움 높이는 서버가 준 `progress`(0~100)를 그대로 쓴다.
 */
export default function MandalartGrid({ sheet, selected, onSelect, mini, className }: Props) {
  const cells = useMemo(() => {
    const domains = sheet.domains ?? []
    const byPosition = new Map(domains.map((d) => [d.position, d]))

    const rows: Array<{
      key: string
      ref: CellRef
      label: string
      domainIndex: number
      progress: number
      isBlockCenter: boolean
      isCore: boolean
    }> = []

    for (let gy = 0; gy < 9; gy += 1) {
      for (let gx = 0; gx < 9; gx += 1) {
        const bx = Math.floor(gx / 3)
        const by = Math.floor(gy / 3)
        const cx = gx % 3
        const cy = gy % 3
        const isCenterBlock = bx === 1 && by === 1
        const isBlockCenter = cx === 1 && cy === 1

        if (isCenterBlock && isBlockCenter) {
          rows.push({
            key: `${gx}-${gy}`,
            ref: { kind: 'core' },
            label: sheet.title || '핵심 목표',
            domainIndex: -1,
            progress: 0,
            isBlockCenter: true,
            isCore: true,
          })
          continue
        }

        if (isCenterBlock) {
          const localIndex = cy * 3 + cx
          const domainIndex = localIndex > 4 ? localIndex - 1 : localIndex
          rows.push({
            key: `${gx}-${gy}`,
            ref: { kind: 'domain', domainIndex },
            label: byPosition.get(domainIndex)?.title ?? '',
            domainIndex,
            progress: 0,
            isBlockCenter: false,
            isCore: false,
          })
          continue
        }

        const domainIndex = BLOCK_TO_DOMAIN[`${bx},${by}`]
        const domain = byPosition.get(domainIndex)

        if (isBlockCenter) {
          rows.push({
            key: `${gx}-${gy}`,
            ref: { kind: 'domain', domainIndex },
            label: domain?.title ?? '',
            domainIndex,
            progress: 0,
            isBlockCenter: true,
            isCore: false,
          })
          continue
        }

        const localIndex = cy * 3 + cx
        const subjectIndex = localIndex > 4 ? localIndex - 1 : localIndex
        const subject: Subject | undefined = domain?.subjects[subjectIndex]

        rows.push({
          key: `${gx}-${gy}`,
          ref: subject
            ? { kind: 'subject', domainIndex, subjectIndex }
            : { kind: 'empty', domainIndex, subjectIndex },
          label: subject?.title ?? '',
          domainIndex,
          progress: subject?.progress ?? 0,
          isBlockCenter: false,
          isCore: false,
        })
      }
    }
    return rows
  }, [sheet])

  const isSelected = (ref: CellRef) => {
    if (!selected || ref.kind !== selected.kind) return false
    if (ref.kind === 'core') return true
    if (ref.kind === 'domain' && selected.kind === 'domain')
      return ref.domainIndex === selected.domainIndex
    if (
      (ref.kind === 'subject' || ref.kind === 'empty') &&
      (selected.kind === 'subject' || selected.kind === 'empty')
    ) {
      return ref.domainIndex === selected.domainIndex && ref.subjectIndex === selected.subjectIndex
    }
    return false
  }

  return (
    <div
      className={cn(
        'grid aspect-square w-full select-none grid-cols-9 grid-rows-9',
        mini ? 'gap-px' : 'gap-[2px] sm:gap-[3px]',
        className,
      )}
    >
      {cells.map((cell) => {
        const color = cell.domainIndex >= 0 ? domainColor(cell.domainIndex) : '#f59f00'
        const active = isSelected(cell.ref)
        const filled = cell.label.trim().length > 0
        const interactive = Boolean(onSelect) && !mini

        return (
          <button
            key={cell.key}
            type="button"
            disabled={!interactive}
            aria-label={
              cell.isCore
                ? `핵심 목표 ${cell.label}`
                : cell.ref.kind === 'domain'
                  ? `세부 목표 ${cell.label || '비어 있음'}`
                  : `${cell.label || '빈 칸'}${cell.progress > 0 ? `, ${cell.progress}% 진행` : ''}`
            }
            aria-pressed={active}
            onClick={() => onSelect?.(cell.ref)}
            className={cn(
              'relative flex items-center justify-center overflow-hidden p-[2px] text-center',
              mini ? 'rounded-[2px]' : 'rounded-[5px] sm:rounded-[7px]',
              'transition-[transform,box-shadow] duration-200',
              interactive && 'hover:z-10 hover:scale-[1.06] hover:shadow-lg',
              active && 'z-10 scale-[1.06] shadow-lg',
            )}
            style={{
              background: cell.isCore
                ? 'linear-gradient(140deg, var(--color-brand-500), var(--color-brand-700))'
                : cell.isBlockCenter
                  ? color
                  : filled
                    ? `color-mix(in oklab, ${color}, var(--surface-card) 84%)`
                    : 'var(--surface-sunken)',
              boxShadow: active ? `0 0 0 2.5px ${color}` : undefined,
            }}
          >
            {!cell.isBlockCenter && !cell.isCore && cell.progress > 0 && (
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 transition-[height] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  height: `${Math.min(100, cell.progress)}%`,
                  background: `color-mix(in oklab, ${color}, transparent 62%)`,
                }}
              />
            )}

            {!mini && (
              <span
                className="relative z-10 line-clamp-3 break-keep font-bold leading-[1.15]"
                style={{
                  fontSize: cell.isCore
                    ? 'clamp(7px, 1.35vw, 15px)'
                    : cell.isBlockCenter
                      ? 'clamp(6px, 1.05vw, 12px)'
                      : 'clamp(5px, 0.92vw, 11px)',
                  color:
                    cell.isCore || cell.isBlockCenter
                      ? '#fff'
                      : filled
                        ? 'var(--text-strong)'
                        : 'var(--text-muted)',
                }}
              >
                {cell.label}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
