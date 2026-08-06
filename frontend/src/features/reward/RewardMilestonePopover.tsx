import { useLayoutEffect, useRef, useState } from 'react'
import Button from '../../components/common/ActionButton'
import { IconCheck } from '../../components/common/Icons'
import type { RewardMilestone } from '../../data/types'
import { cn } from '../../utils/cn'
import { num } from '../../utils/format'
import { pct, rewardLong } from './rewardLabels'

/** 화면 가장자리에서 최소 이만큼 띄운다. */
const EDGE_MARGIN = 8

/** 이름 칩을 몇 개까지 늘어놓을지. 마지막 구간은 13종이 올 수 있어 다 그리면 팝오버가 길어진다. */
const NAME_CHIP_LIMIT = 4

type Props = {
  milestone: RewardMilestone
  /** 마지막 구간(100%)인가 — 남은 랜드마크를 전종 주는 구간. */
  isFinal: boolean
  claiming: boolean
  onClaim: () => void
}

/**
 * 구간 아이콘에 붙는 팝오버 — 보상 내용과 받기 버튼이 그 자리에 뜬다.
 *
 * <h3>왜 위치를 재서 밀어 주는가</h3>
 * <p>구간은 8개이고 첫째·마지막은 카드의 좌우 끝에 붙는다. 폭 240px 짜리 패널을 마커
 * 중앙에 두면 그 둘은 화면 밖으로 반쯤 나간다. 그래서 <b>그려 본 뒤 실제 좌표를 재서</b>
 * 안쪽으로 밀어 넣는다 — CSS 만으로는 뷰포트 경계를 알 수 없다.
 *
 * <p>보정은 이미 적용된 위치에서 다시 재는 방식이라 한 번 더 렌더된 뒤 수렴한다(어긋난
 * 만큼만 더하고, 들어오면 delta 가 0 이라 멈춘다). 패널이 뷰포트보다 넓으면 좌우가 서로를
 * 밀어 진동할 수 있어 그때는 보정을 포기한다.
 *
 * <p>위로 열 자리가 없으면 아래로 뒤집는다. 한 번 뒤집으면 되돌리지 않는다 — 되돌리면
 * 뒤집힌 자리에서 다시 "위가 좁다" 가 되어 깜빡인다. 닫힐 때 컴포넌트가 사라지므로
 * 다음 열림에는 다시 위쪽부터 시도한다.
 */
export default function RewardMilestonePopover({
  milestone,
  isFinal,
  claiming,
  onClaim,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [shift, setShift] = useState(0)
  const [below, setBelow] = useState(false)

  useLayoutEffect(() => {
    const panel = panelRef.current
    if (!panel) return

    const rect = panel.getBoundingClientRect()

    // 패널이 뷰포트보다 넓으면 좌우 보정이 서로를 밀어낸다. 그때는 그대로 둔다.
    if (rect.width <= window.innerWidth - EDGE_MARGIN * 2) {
      const overLeft = EDGE_MARGIN - rect.left
      const overRight = rect.right - (window.innerWidth - EDGE_MARGIN)
      const delta = overLeft > 0 ? overLeft : overRight > 0 ? -overRight : 0
      if (delta !== 0) setShift((prev) => prev + delta)
    }

    if (!below && rect.top < EDGE_MARGIN) setBelow(true)
  }, [shift, below])

  /* 창 크기가 바뀌면 보정값이 무의미해진다. 0 으로 돌려 위 효과가 다시 재게 한다. */
  useLayoutEffect(() => {
    const onResize = () => setShift(0)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const claimable = milestone.reached && !milestone.claimed
  const names = milestone.grantedNames
  const shownNames = names.slice(0, NAME_CHIP_LIMIT)
  const hiddenCount = names.length - shownNames.length

  return (
    <div
      /*
        패딩이 마커와 패널 사이의 빈 틈을 덮는다. 여백을 margin 으로 주면 마우스가 그
        틈을 지나는 순간 wrapper 를 벗어나 팝오버가 닫히고, 받기 버튼까지 갈 수 없다.
      */
      className={cn(
        'absolute left-1/2 z-30 w-[240px]',
        below ? 'top-full pt-2' : 'bottom-full pb-2',
      )}
      style={{ transform: `translateX(calc(-50% + ${shift}px))` }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-label={`${pct(milestone.percent)}% 구간 보상`}
        className="animate-pop rounded-2xl border p-3.5 text-left"
        style={{
          background: 'var(--surface-card)',
          borderColor: 'var(--border-hairline)',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-[11.5px] font-black tabular-nums">
            {pct(milestone.percent)}%
          </span>
          <span
            className={cn(
              'text-[11.5px] font-bold',
              milestone.claimed
                ? 'text-emerald-600 dark:text-emerald-400'
                : claimable
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-[var(--text-muted)]',
            )}
          >
            {milestone.claimed ? '수령 완료' : claimable ? '받을 수 있어요' : '잠김'}
          </span>
        </div>

        {milestone.claimed ? (
          /*
            받은 것을 그린다. 종류(kind)로 갈라서는 안 된다 — 랜드마크 구간인데 전종을
            이미 보유해 크레딧으로 대체된 경우 kind 는 그대로 LANDMARK 이고 이름만 비어 있다.
          */
          names.length > 0 ? (
            <ul className="m-0 mt-2 flex list-none flex-wrap gap-1 p-0">
              {shownNames.map((name) => (
                <li
                  key={name}
                  className="rounded-full bg-[var(--surface-sunken)] px-2 py-0.5 text-[11.5px] font-bold"
                >
                  {name}
                </li>
              ))}
              {hiddenCount > 0 && (
                <li className="rounded-full bg-[var(--surface-sunken)] px-2 py-0.5 text-[11.5px] font-bold">
                  +{hiddenCount}종
                </li>
              )}
            </ul>
          ) : (
            <p className="m-0 mt-1.5 text-[15px] font-black tracking-[-0.03em]">
              +{num(milestone.grantedPoint ?? 0)}P
            </p>
          )
        ) : (
          <p className="m-0 mt-1.5 text-[13.5px] font-extrabold tracking-[-0.02em]">
            {rewardLong(milestone, isFinal)}
          </p>
        )}

        {milestone.claimed ? (
          <p className="muted m-0 mt-2 flex items-center gap-1 text-[11px] font-semibold">
            <IconCheck className="size-3 shrink-0" />
            구간별 한 번만 받을 수 있어요
          </p>
        ) : (
          <>
            <Button
              size="xs"
              full
              variant={claimable ? 'primary' : 'quiet'}
              className="mt-2.5"
              disabled={!claimable || claiming}
              /* 잠긴 구간의 버튼은 비활성이라 title 이 유일한 설명이다. */
              title={claimable ? undefined : `달성률 ${pct(milestone.percent)}% 를 넘기면 열려요`}
              onClick={onClaim}
            >
              {claiming ? '받는 중…' : '받기'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
