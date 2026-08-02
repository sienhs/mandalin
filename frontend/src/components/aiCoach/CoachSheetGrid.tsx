import SheetCellText from '../sheet/SheetCellText'
import { PLACEHOLDER } from '../sheet/sheet.data'
import type { GridCell } from '../sheet/sheet.types'
import { getCellColor } from '../sheet/sheet.utils'
import { cn } from '../../utils/cn'

const PLACEHOLDERS: string[] = [PLACEHOLDER.sheet, PLACEHOLDER.domain, PLACEHOLDER.subject]

/** 안내 문구가 남아 있는 칸은 아직 안 채운 칸이다(`countFilledCells` 와 같은 기준). */
const isFilled = (cell: GridCell) => !PLACEHOLDERS.includes(cell.task)

/**
 * AI 코치 화면의 만다라트 축소판. **채워진 칸이 어디인지**만 보여준다.
 *
 * **`SheetGrid` 를 고쳐 쓰지 않고 따로 둔다.** 저쪽은 생성·상세·그룹 화면 네 곳이 함께
 * 쓰는 편집용 그리드라, 크기나 칸 표시를 위해 손대면 그 네 화면이 같이 흔들린다.
 * 여기는 읽기 전용이고 요구도 다르다.
 *
 * 색과 줄바꿈은 `getCellColor` · `SheetCellText` 를 그대로 빌려 쓴다 — 두 그리드가
 * 다른 색으로 보이면 같은 시트라는 것이 읽히지 않는다.
 *
 * 크기는 `.coach-grid` 가 화면 높이에 맞춰 정한다(→ ai-coach.css). **글자도 폭에 비례해
 * 같이 커진다** — 폭만 바꾸면 칸 대비 글자 비율이 틀어져 두 줄짜리 과제명이 칸을 넘친다
 * (칸에는 overflow 가 걸려 있지 않다). 그래서 칸은 글자 크기를 물려받기만 한다.
 */
export default function CoachSheetGrid({ grid }: { grid: GridCell[][] }) {
  return (
    <ul
      className="coach-grid mx-auto my-0 grid list-none grid-cols-3 gap-1.5 p-0"
      aria-label="만다라트 9x9 과제 그리드 (축소판)"
    >
      {grid.map((block, b) => (
        <li key={b} className="list-none">
          <ul className="m-0 grid list-none grid-cols-3 gap-[3px] p-0">
            {block.map((cell, c) => {
              const filled = isFilled(cell)
              return (
                <li key={c} className="aspect-square">
                  <div
                    className={cn(
                      'Sheet h-full w-full break-keep px-[1px] text-[length:inherit] leading-[1.15]',
                      // 빈 칸은 색을 빼고 눕힌다. 안 채운 칸까지 도메인 색으로 칠하면
                      // 어디까지 채웠는지가 한눈에 안 들어온다 — 이 축소판의 유일한 목적이다.
                      filled ? getCellColor(b, c) : 'bg-ink-100/70 shadow-none',
                    )}
                  >
                    {/* 빈 칸의 '+과제 추가' 는 6px 에서 읽히지도 않으면서 화면만 시끄럽다. */}
                    {filled && (
                      <span>
                        <SheetCellText text={cell.task} />
                      </span>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </li>
      ))}
    </ul>
  )
}
