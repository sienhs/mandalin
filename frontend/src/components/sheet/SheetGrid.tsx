import { cn } from '../../utils/cn'
import SheetCellText from './SheetCellText'
import type { CellPos, GridCell } from './sheet.types'
import { getCellColor } from './sheet.utils'

type SheetGridProps = {
  grid: GridCell[][]
  selectedCell: CellPos | null
  /** 한 번 클릭: 칸 선택 */
  onSelect: (pos: CellPos) => void
  /** 두 번 클릭: 과제 설정 팝업 열기. 넘기지 않으면 두 번 클릭에 반응하지 않는다(상세 화면). */
  onOpen?: (pos: CellPos) => void
  /** 그리드 위 제목과 안내 문구. null 이면 머리말 없이 그리드만 그린다(상세 화면). */
  heading?: { title: string; hint: string } | null
  /**
   * 칸에 체크(✓)를 붙일지 판단한다. 넘기지 않으면 체크를 그리지 않는다 —
   * 아직 수행한 적이 없는 생성 화면에는 표시할 게 없다.
   */
  isChecked?: (cell: GridCell) => boolean
  /**
   * 3x3 블록마다 덧붙일 클래스. 블록 하나가 도메인 하나라서, 도메인 단위로 표시할 것이
   * 있는 화면(그룹 합류 화면의 '고른 도메인')이 쓴다.
   */
  blockClassName?: (blockIndex: number) => string
  /** 부모 그리드 안에서의 배치 */
  className?: string
}

/** 생성 화면의 머리말. 칸을 채워야 하는 건 생성 화면뿐이라 기본값으로 둔다. */
const CREATE_HEADING = { title: '2D 뷰 (과제)', hint: '칸을 클릭해 과제를 채워보세요' }

/** 2D 뷰: 3x3 블록 9개 × 각 블록의 3x3 칸 = 9x9 과제 그리드 */
export default function SheetGrid({
  grid,
  selectedCell,
  onSelect,
  onOpen,
  heading = CREATE_HEADING,
  isChecked,
  blockClassName,
  className = 'col-start-1 row-start-1 row-span-2',
}: SheetGridProps) {
  return (
    <section aria-labelledby={heading ? 'view-2d' : undefined} className={className}>
      {heading && (
        <div className="mb-3.5 flex items-center justify-between gap-3">
          <h2 id="view-2d" className="section-title m-0 text-sm">
            {heading.title}
          </h2>
          <p className="m-0 text-[11.5px] text-ink-400">{heading.hint}</p>
        </div>
      )}

      <ul
        // 폭 고정: w-full 로 두면 컨테이너가 좁아질 때 칸이 눌려 글자가 칸을 넘친다.
        className="mx-auto my-0 grid w-[500px] list-none grid-cols-3 gap-2 p-0 self-start"
        aria-label="만다라트 9x9 과제 그리드"
      >
        {grid.map((block, b) => (
          <li key={b} className={cn('list-none', blockClassName?.(b))}>
            <ul className="m-0 grid list-none grid-cols-3 gap-1 p-0">
              {block.map((cell, c) => {
                const isSelected = selectedCell?.b === b && selectedCell?.c === c
                return (
                  <li key={c} className="aspect-square">
                    <button
                      type="button"
                      onClick={() => onSelect({ b, c })}
                      onDoubleClick={onOpen && (() => onOpen({ b, c }))}
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
                      {isChecked?.(cell) && (
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
