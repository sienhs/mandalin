import { cn } from '../../utils/cn'
import SheetCellText from './SheetCellText'
import type { GridCell } from './sheet.types'
import { getCellColor } from './sheet.utils'

type SheetMiniGridProps = {
  blockIndex: number
  cells: GridCell[]
  /** 칸에 체크(✓)를 붙일지 판단한다. 2D 뷰와 같은 기준을 넘겨 두 그리드를 맞춘다. */
  isChecked?: (cell: GridCell) => boolean
}

/** 사이드 패널: 2D 뷰에서 선택한 블록의 3x3 확대 그리드 */
export default function SheetMiniGrid({ blockIndex, cells, isChecked }: SheetMiniGridProps) {
  return (
    <section
      aria-labelledby="mini-3x3"
      className="card rounded-2xl border-[3px] border-[#e9f6e8] bg-white p-3 shadow-[0_4px_12px_rgba(0,0,0,0.03)]"
    >
      <ul className="mgrid m-0 list-none grid-cols-3 gap-[5px] p-0">
        {cells.map((cell, i) => (
          <li
            key={i}
            className={cn(
              'cell relative break-keep text-[13px] font-bold',
              getCellColor(blockIndex, i),
            )}
          >
            <SheetCellText text={cell.task} />
            {/* 체크 표시는 9x9 2D 뷰와 같은 기준으로 붙인다 — 두 그리드가 다르게 보이면 안 된다. */}
            {isChecked?.(cell) && (
              <span className="absolute right-1.5 top-1 text-[12px] leading-none">✓</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
