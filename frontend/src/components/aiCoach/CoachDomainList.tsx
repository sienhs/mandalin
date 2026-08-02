import { DOMAIN_COLORS, DOMAIN_COUNT } from '../sheet/sheet.data'
import type { Period } from '../sheet/sheet.types'
import { cn } from '../../utils/cn'

/**
 * 기간 표기. `SheetTaskDialog` 의 `PERIOD_OPTIONS` 와 같은 말을 쓴다 —
 * 여기서만 "매일" 이라고 쓰면 같은 값이 화면마다 다른 이름으로 보인다.
 *
 * 과제는 이름과 기간을 함께 가져야 구분된다. 이름만 보이면 "스트레칭" 이 매일 하는 것인지
 * 주 1회인지 알 수 없고, 이름이 같고 기간만 다른 두 과제도 같은 것으로 읽힌다.
 */
const PERIOD: Record<Period, { label: string; className: string }> = {
  daily: { label: '일간', className: 'bg-mint-100 text-mint-700' },
  weekly: { label: '주간', className: 'bg-[#fef3c7] text-[#b45309]' },
  none: { label: '없음', className: 'bg-ink-100 text-ink-500' },
}

function PeriodChip({ period, muted }: { period: Period; muted?: boolean }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded px-1 py-[1px] text-[10px] font-bold leading-[1.4]',
        muted ? 'bg-ink-100 text-ink-300' : PERIOD[period].className,
      )}
    >
      {PERIOD[period].label}
    </span>
  )
}

/** 목록 안의 작은 아이콘 버튼. 글자 크기가 12px 인 줄에 얹히므로 최소한만 차지한다. */
function RowButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        'shrink-0 cursor-pointer rounded border-0 bg-transparent px-[3px] text-[12px] leading-none',
        className,
      )}
    >
      {children}
    </button>
  )
}

/**
 * 도메인의 한 칸. **도메인은 언제나 8칸이다** — 과제가 없으면 빈 칸이 그 자리를 지킨다.
 * 지운다고 줄이 사라지지 않고, 담는다고 줄이 늘지도 않는다.
 */
export type CoachSlot =
  | { kind: 'subject'; slot: number; title: string; period: Period }
  | {
      kind: 'recommendation'
      slot: number
      id: number
      title: string
      period: Period
      picked: boolean
    }
  /**
   * 빈 칸. **원래 이 자리에 있던 과제가 지워진 것이면** 무엇이었는지와 함께 되돌리기를
   * 붙인다 — 지우기에는 확인만 있고 취소가 없어서, 잘못 지우면 되살릴 방법이 없었다.
   */
  | { kind: 'empty'; slot: number; restore?: { title: string; period: Period } }

export type CoachDomain = {
  index: number
  /**
   * 9x9 에서 이 도메인이 차지하는 블록 번호(0~8).
   *
   * **색은 도메인 번호가 아니라 이 값으로 고른다.** `getCellColor` 가 블록 번호로
   * `DOMAIN_COLORS` 를 찾기 때문에, 도메인 번호를 그대로 쓰면 가운데 블록을 건너뛰는
   * 만큼 다섯 번째 도메인부터 색이 한 칸씩 밀린다.
   */
  blockIndex: number
  title: string
  /** 항상 `DOMAIN_COUNT` 개 */
  slots: CoachSlot[]
  /** 채운 칸 수 */
  used: number
  /** 그중 담기로 고른 추천 수 */
  addedCount: number
  /** 앉힐 빈 칸이 없어 8칸 밖으로 밀린 추천 */
  blocked: { id: number; title: string; period: Period }[]
}

type CoachDomainListProps = {
  domains: CoachDomain[]
  onToggleRecommendation: (id: number) => void
  onDismissRecommendation: (id: number) => void
  onDeleteSubject: (domainIndex: number, slot: number) => void
  onRestoreSubject: (domainIndex: number, slot: number) => void
}

/**
 * 도메인별 과제 — **담긴 것과 AI 추천을 한 목록에서 본다.**
 *
 * 추천을 따로 떼어 두면 "이게 어느 칸으로 가는지" 를 사용자가 머릿속에서 이어붙여야 한다.
 * 도메인 안에 같이 두면 그 질문이 사라지고, 남은 칸 수(n/8)도 바로 옆에서 읽힌다.
 */
export default function CoachDomainList({
  domains,
  onToggleRecommendation,
  onDismissRecommendation,
  onDeleteSubject,
  onRestoreSubject,
}: CoachDomainListProps) {
  return (
    // 남는 폭만큼 열이 늘어난다 — 페이지 폭을 고정하지 않으므로 2열로 못 박으면
    // 넓은 화면에서 한 줄이 지나치게 길어진다.
    <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-x-7 gap-y-4 p-0">
      {domains.map((domain) => (
        // min-w-0: 그리드 칸은 기본이 `min-width: auto` 라, 긴 과제명 한 줄이 칸을
        // 밀어내 옆 도메인 위로 넘친다.
        <li key={domain.blockIndex} className="min-w-0 border-t border-ink-100 pt-2.5">
          <div className="flex items-center gap-1.5">
            <span
              aria-hidden
              className={cn(
                'h-2.5 w-2.5 shrink-0 rounded-full',
                DOMAIN_COLORS[domain.blockIndex]?.dark,
              )}
            />
            <strong className="truncate text-[13px] font-extrabold text-ink-900">
              {domain.title}
            </strong>

            <span className="ml-auto shrink-0 text-[11px] font-bold text-ink-400">
              {domain.addedCount > 0 && <span className="text-mint-600">+{domain.addedCount} </span>}
              {domain.used}/{DOMAIN_COUNT}
            </span>
          </div>

          {/* flex 열로 둔다 — grid 로 두면 행마다 `min-width: auto` 가 살아 있어
              긴 과제명이 도메인 칸을 넘어 옆 열을 침범한다. */}
          <ul className="m-0 mt-1.5 flex list-none flex-col gap-1 p-0">
            {domain.slots.map((slot) => {
              if (slot.kind === 'subject') {
                return (
                  <li key={slot.slot} className="flex h-[21px] min-w-0 items-center gap-1">
                    <span className="min-w-0 flex-1 truncate text-[12px] text-ink-700">
                      · {slot.title}
                    </span>
                    <PeriodChip period={slot.period} />
                    <RowButton
                      label={`${slot.title} 지우기`}
                      onClick={() => onDeleteSubject(domain.index, slot.slot)}
                      className="text-ink-300 hover:text-[#be123c] focus-visible:text-[#be123c]"
                    >
                      ✕
                    </RowButton>
                  </li>
                )
              }

              if (slot.kind === 'recommendation') {
                return (
                  <li
                    key={slot.slot}
                    className={cn(
                      'flex h-[21px] min-w-0 items-center gap-1 rounded border px-1 transition-colors',
                      slot.picked
                        ? 'border-mint-500 bg-mint-100/50 text-mint-700'
                        : 'border-dashed border-ink-300 text-ink-500',
                    )}
                  >
                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={slot.picked}
                        onChange={() => onToggleRecommendation(slot.id)}
                        className="shrink-0 accent-mint-600"
                      />
                      <span className="min-w-0 flex-1 truncate text-[12px]">{slot.title}</span>
                    </label>
                    <PeriodChip period={slot.period} />
                    {/* 안 담을 추천은 지워서 칸을 비운다. 시트를 건드리는 게 아니라 제안을
                        물리는 것이라 "적용하기" 가 세는 변경에 들어가지 않는다. */}
                    <RowButton
                      label={`${slot.title} 추천 지우기`}
                      onClick={() => onDismissRecommendation(slot.id)}
                      className="text-ink-300 hover:text-[#be123c] focus-visible:text-[#be123c]"
                    >
                      ✕
                    </RowButton>
                  </li>
                )
              }

              // 지운 자리. 무엇이 있었는지 보여주고 되돌릴 수 있게 한다.
              if (slot.restore) {
                const { title, period } = slot.restore
                return (
                  <li key={slot.slot} className="flex h-[21px] min-w-0 items-center gap-1">
                    <span className="min-w-0 flex-1 truncate text-[12px] text-ink-300 line-through">
                      · {title}
                    </span>
                    <PeriodChip period={period} muted />
                    <RowButton
                      label={`${title} 되돌리기`}
                      onClick={() => onRestoreSubject(domain.index, slot.slot)}
                      className="text-[11px] font-bold text-mint-600 hover:text-mint-700 focus-visible:text-mint-700"
                    >
                      되돌리기
                    </RowButton>
                  </li>
                )
              }

              // 원래부터 비어 있던 칸. 자리만 지킨다 — 여기서 직접 만들지는 않는다.
              return (
                <li
                  key={slot.slot}
                  aria-hidden
                  className="h-[21px] rounded border border-dashed border-ink-100"
                />
              )
            })}

            {/* 8칸이 다 찼는데 남은 추천. 앉힐 자리가 없다는 것을 알려야 한다. */}
            {domain.blocked.map((item) => (
              <li
                key={item.id}
                className="flex h-[21px] min-w-0 items-center gap-1 rounded border border-ink-100 px-1 text-ink-300"
              >
                <span className="min-w-0 flex-1 truncate text-[12px]">
                  {item.title} <em className="text-[11px] not-italic">— 칸이 꽉 찼어요</em>
                </span>
                <PeriodChip period={item.period} muted />
                <RowButton
                  label={`${item.title} 추천 지우기`}
                  onClick={() => onDismissRecommendation(item.id)}
                  className="text-ink-300 hover:text-[#be123c] focus-visible:text-[#be123c]"
                >
                  ✕
                </RowButton>
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
