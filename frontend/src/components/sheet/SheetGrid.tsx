import { cn } from '../../utils/cn'
import SheetCellText from './SheetCellText'
import type { CellPos, GridCell } from './sheet.types'
import { getCellColor } from './sheet.utils'

type SheetGridProps = {
  grid: GridCell[][]
  selectedCell: CellPos | null
  /** 한 번 클릭: 칸 선택 */
  onSelect: (pos: CellPos) => void
  /** 두 번 클릭: 태스크 설정 팝업 열기 */
  onOpen: (pos: CellPos) => void
}

/** 2D 뷰: 3x3 블록 9개 × 각 블록의 3x3 칸 = 9x9 태스크 그리드 */
export default function SheetGrid({ grid, selectedCell, onSelect, onOpen }: SheetGridProps) {
  return (
    <section aria-labelledby="view-2d" className="col-start-1 row-start-1 row-span-2">
      <div className="mb-3.5 flex items-center justify-between gap-3">
        <h2 id="view-2d" className="section-title m-0 text-sm">
          2D 뷰 (태스크)
        </h2>
        <p className="m-0 text-[11.5px] text-ink-400">칸을 클릭해 과제를 채워보세요</p>
      </div>

      <ul
        className="mx-auto my-0 grid w-full max-w-[500px] list-none grid-cols-3 gap-2 p-0 self-start"
        aria-label="만다라트 9x9 태스크 그리드"
      >
        {grid.map((block, b) => (
          <li key={b} className="list-none">
            <ul className="m-0 grid list-none grid-cols-3 gap-1 p-0">
              {block.map((cell, c) => {
                const isSelected = selectedCell?.b === b && selectedCell?.c === c
                return (
                  <li key={c} className="aspect-square">
                    <button
                      type="button"
                      onClick={() => onSelect({ b, c })}
                      onDoubleClick={() => onOpen({ b, c })}
                      aria-pressed={isSelected}
                      className={cn(
                        'Sheet h-full w-full cursor-pointer break-keep px-[2px] text-[8.5px] leading-[1.15]',
                        getCellColor(b, c),
                        isSelected && 'outline outline-2 outline-mint-700',
                      )}
                    >
                      <span>
                        <SheetCellText text={cell.task} />
                      </span>
                      {cell.subject?.isDone && (
                        <span className="absolute right-[3px] top-[2px] text-[7px]">✓</span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  )
}
