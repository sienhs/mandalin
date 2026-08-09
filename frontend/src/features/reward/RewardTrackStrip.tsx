import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconCheck, IconGift, IconLock } from '../../components/common/Icons'
import type { RewardMilestone, RewardTrack } from '../../data/types'
import { cn } from '../../utils/cn'
import { pct } from './rewardLabels'
import RewardMilestonePopover from './RewardMilestonePopover'

/**
 * 구간 막대 사이 여백(px).
 *
 * <p>격자의 열 간격이자 <b>마커를 미는 거리의 근거</b>다. 두 곳이 같은 값을 봐야 마커가
 * 여백 한가운데에 선다 — 한쪽만 고치면 절반만큼 어긋나고, 그 어긋남은 눈으로 재기 전까지
 * 잘 보이지 않는다(실제로 3px 밀린 채로 한 번 나갔다).
 */
const SEGMENT_GAP = 6

type Props = {
  track: RewardTrack
  /** 지금 보고 있는 시트. 판정 시트와 다르면 구간 아이콘을 그리지 않는다. */
  viewingSheetId: number
  /** 수령 중인 구간 번호. 버튼을 잠그고 문구를 바꾸는 데 쓴다. */
  claimingMilestone: number | null
  /** 수령을 맡긴다. 성공하면 팝오버를 닫는다 — 결과는 페이지가 모달로 알린다. */
  onClaim: (milestone: number) => Promise<boolean>
}

/**
 * 진행률 바 + 12.5% 구간 아이콘 8개.
 *
 * <h3>왜 절대 위치가 아니라 8칸 격자인가</h3>
 * <p>구간은 12.5% 간격이라 마지막 아이콘이 정확히 100% 지점, 즉 바의 오른쪽 <b>끝</b>에 온다.
 * 아이콘을 퍼센트 좌표로 얹으면 첫 아이콘과 마지막 아이콘이 바 밖으로 반씩 삐져나가고, 그걸
 * 음수 여백으로 막으면 카드 폭이 바뀔 때마다 다시 어긋난다. 바 자체를 구간 8개로 쪼개
 * 같은 격자에 두면 아이콘과 구간이 <b>구조적으로</b> 붙어 어긋날 수 없다.
 *
 * <h3>보상 내용은 왜 항상 보이지 않는가</h3>
 * <p>예전에는 구간마다 아이콘·퍼센트·보상명 3줄짜리 상자를 늘어놓았다. 여덟 개가 헤더의
 * 절반을 차지해 시트 제목과 달성률보다 무거웠다. 지금은 <b>상태만</b>(달성·미달성·수령완료)
 * 아이콘과 바 색으로 남기고, 내용과 받기 버튼은 가리키는 구간에만 팝오버로 띄운다.
 *
 * <h3>왜 다른 시트에서는 아이콘을 안 그리는가</h3>
 * <p>보상은 계정당 구간별 1회이고 판정은 <b>가장 먼저 만든 시트</b>로만 한다. 모든 시트에
 * 아이콘을 그리면 시트마다 따로 받을 수 있는 것처럼 보이는데, 실제로는 한 시트에서 받으면
 * 나머지에서 전부 닫힌다. 그래서 판정 시트가 아니면 바와 안내만 남긴다.
 *
 * <h3>이 퍼센트는 바로 위 진행률 링과 같은 값이다</h3>
 * <p>서버는 시트마다 두 수를 준다({@code SheetRepositoryCustomImpl}).
 * <ul>
 *   <li>{@code progress} — 64개 과제 <b>개별 진행률의 평균</b>. 헤더의 큰 링이 이걸 쓴다.</li>
 *   <li>{@code achievementRate} — <b>완전히 끝낸 과제</b> 수 / 64.</li>
 * </ul>
 * <p>보상 판정은 <b>{@code progress}</b> 를 쓴다. 랜드마크 성장 단계도 같은 값을 보므로
 * "구간을 넘길 때마다 랜드마크가 한 단계 자라고 보상이 하나 열린다" 가 성립한다
 * ({@code RewardTrack.java} 참고).
 *
 * <p>한동안 판정만 {@code achievementRate} 였다. 반쯤 한 과제가 많으면 두 수가 두 배 가까이
 * 벌어져(47.5% 대 23.4%) <b>링은 48% 인데 12.5% 구간만 열리는</b> 상태가 됐다. 그래서 이 바가
 * 헤더의 링보다 덜 차 보이면 <b>지금은 버그다</b> — 서버의
 * {@code RewardTrackService.rewardRateOf} 가 무엇을 읽는지부터 본다.
 *
 * <p>{@code track.achievementRate} 라는 필드명은 <b>값이 아니라 이름만</b> 예전 것이다.
 */
export default function RewardTrackStrip({
  track,
  viewingSheetId,
  claimingMilestone,
  onClaim,
}: Props) {
  /** 팝오버가 열린 구간. 마우스·탭·키보드가 모두 이 하나를 바꾼다. */
  const [active, setActive] = useState<number | null>(null)

  /**
   * 마지막으로 눌린 포인터 종류.
   *
   * <p>마우스는 hover 로 이미 열려 있으므로 클릭이 토글이면 <b>누르는 순간 닫힌다.</b>
   * 터치는 hover 가 없어 탭이 유일한 통로라 토글이어야 한다. 둘을 구분하려면 클릭 시점에
   * 어느 쪽이었는지를 알아야 하는데, click 이벤트에는 그 정보가 없다.
   */
  const pointerKind = useRef<string>('mouse')

  /** 바깥 클릭 판정에 쓴다 — 이 안을 눌렀으면 닫지 않는다. */
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setActive(null), [])

  /* ESC 로 닫는다. 열려 있을 때만 듣는다. */
  useEffect(() => {
    if (active == null) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [active, close])

  /*
    바깥을 누르면 닫는다 — 터치·클릭으로 연 팝오버는 포인터가 떠나도 남기 때문에
    이 통로가 없으면 다른 곳을 눌러도 계속 떠 있다.
  */
  useEffect(() => {
    if (active == null) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (target instanceof Node && containerRef.current?.contains(target)) return
      close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [active, close])

  // 시트가 없으면(가입 직후) 판정할 대상이 없다. 트랙을 그릴 이유도 없다.
  if (track.sheetId == null || track.milestones.length === 0) return null

  const isBound = track.sheetId === viewingSheetId
  /* 구간 폭은 서버 표에서 읽는다 — 여기서 100/8 로 다시 계산하면 표를 고칠 때 어긋난다. */
  const step = track.milestones[0].percent
  const rate = track.achievementRate
  const claimableCount = track.milestones.filter((m) => m.reached && !m.claimed).length

  /** 구간 하나가 얼마나 채워졌는지(0~100). 바를 8토막으로 쪼개 그리기 때문에 필요하다. */
  const fillOf = (milestone: RewardMilestone) =>
    Math.max(0, Math.min(100, ((rate - (milestone.percent - step)) / step) * 100))

  const claim = async (milestone: number) => {
    const ok = await onClaim(milestone)
    // 실패하면 열어 둔다 — 토스트만 뜨고 팝오버가 사라지면 무엇에 실패했는지 알 수 없다.
    if (ok) close()
  }

  return (
    <div
      ref={containerRef}
      className="w-full border-t pt-4"
      style={{ borderColor: 'var(--border-hairline)' }}
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <p className="m-0 text-[12.5px] font-extrabold">보상 트랙</p>
        <p className="muted m-0 text-[11.5px] font-semibold">계정당 구간별 1회</p>
        {isBound && claimableCount > 0 && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-2.5 py-1 text-[11.5px] font-bold text-white">
            받을 보상 {claimableCount}개
          </span>
        )}
      </div>

      <div
        className="mt-3 grid grid-cols-8 gap-y-1.5"
        style={{ columnGap: `${SEGMENT_GAP}px` }}
      >
        {/* 1행 — 구간 아이콘. 판정 시트에서만 그린다. */}
        {isBound &&
          track.milestones.map((milestone) => {
            const claimable = milestone.reached && !milestone.claimed
            const open = active === milestone.milestone
            const isLast = milestone.milestone === track.milestones.length

            return (
              <div
                key={`icon-${milestone.milestone}`}
                /*
                  구간의 <b>오른쪽 여백</b> 위에 놓는다. 구간 N 의 달성 지점(12.5·25…100%)이
                  칸의 오른쪽 끝이라, 가운데에 두면 마커가 가리키는 퍼센트와 실제 도달선이
                  구간 폭의 절반만큼 어긋난다.

                  <p>`justify-self-end` + `translateX(50%)` 은 마커 중심을 칸의 오른쪽 끝에
                  세우는데, 그 지점은 <b>여백의 한가운데가 아니라 여백이 시작되는 자리</b>다.
                  그래서 여백의 절반을 더 민다. 마지막 구간은 오른쪽에 여백이 없고 바의 끝이라
                  더 밀지 않는다 — 밀면 바 밖으로 혼자 튀어나간다.

                  <p>격자 칸을 통째로 쓰지 않고 내용 폭(마커 28px)만 차지하게 두는 것도 중요하다.
                  칸 전체가 가리킴 대상이면 마커는 오른쪽 끝에 있는데 칸 왼쪽 빈 자리에 마우스가
                  닿는 순간 팝오버가 뜬다. 히트 영역은 눈에 보이는 마커와 같아야 한다.
                */
                className="relative justify-self-end"
                style={{
                  transform: `translateX(calc(50% + ${isLast ? 0 : SEGMENT_GAP / 2}px))`,
                }}
                onPointerEnter={(event) => {
                  pointerKind.current = event.pointerType
                  // 터치는 pointerenter 도 쏘는 기기가 있다. 탭 처리와 겹치지 않게 마우스만 받는다.
                  if (event.pointerType === 'mouse') setActive(milestone.milestone)
                }}
                onPointerDown={(event) => {
                  pointerKind.current = event.pointerType
                }}
                onPointerLeave={(event) => {
                  if (event.pointerType === 'mouse') close()
                }}
                /* focus/blur 는 focusin/focusout 이라 버블한다 — 팝오버 안 버튼으로 초점이
                   옮겨가도 이 wrapper 가 받는다. */
                onFocus={() => setActive(milestone.milestone)}
                onBlur={(event) => {
                  // 초점이 이 구간 안에 남아 있으면(마커 → 받기 버튼) 닫지 않는다.
                  if (event.currentTarget.contains(event.relatedTarget)) return
                  close()
                }}
              >
                {claimable && (
                  /*
                    받을 것이 있다는 신호. 예전에는 선물 이모지를 튀게 했는데, 이모지는
                    글꼴에 따라 모양·색·크기가 제각각이라 나머지 라인 아이콘과 섞이지 않았다.
                    퍼지는 후광은 아이콘을 건드리지 않고 시선만 끌고, 배경 뒤에 깔려 있어
                    아이콘 자체는 또렷하게 남는다.
                  */
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 rounded-full bg-brand-500/50 motion-safe:animate-ping"
                  />
                )}

                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={open}
                  aria-label={`${pct(milestone.percent)}% 구간 보상 ${
                    milestone.claimed ? '수령 완료' : claimable ? '받을 수 있음' : '잠김'
                  }`}
                  onClick={(event) => {
                    /*
                      키보드로 누른 click 은 detail 이 0 이다. 마우스는 hover 로 이미 열려
                      있으니 다시 열기만 하고(닫지 않는다), 터치·키보드는 토글한다.
                    */
                    const byKeyboard = event.detail === 0
                    if (byKeyboard || pointerKind.current !== 'mouse') {
                      setActive((prev) =>
                        prev === milestone.milestone ? null : milestone.milestone,
                      )
                    } else {
                      setActive(milestone.milestone)
                    }
                  }}
                  className={cn(
                    'relative grid size-7 place-items-center rounded-full transition-all duration-200',
                    'ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
                    milestone.claimed &&
                      'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-[0_2px_6px_-2px_rgba(5,150,105,.7)]',
                    claimable &&
                      'bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-[0_2px_6px_-2px_rgba(232,57,12,.7)]',
                    /* 잠긴 구간은 채우지 않는다 — 테두리만 남기면 "아직 비어 있는 자리" 로 읽힌다. */
                    !milestone.reached &&
                      'border border-dashed bg-[var(--surface-card)] text-[var(--text-muted)]',
                    open && 'ring-2 ring-brand-400/60 ring-offset-1 ring-offset-[var(--surface-card)]',
                  )}
                  style={
                    milestone.reached ? undefined : { borderColor: 'var(--border-hairline)' }
                  }
                >
                  {milestone.claimed ? (
                    <IconCheck className="size-3.5" />
                  ) : claimable ? (
                    <IconGift className="size-3.5" />
                  ) : (
                    <IconLock className="size-3.5" />
                  )}
                </button>

                {open && (
                  <RewardMilestonePopover
                    milestone={milestone}
                    isFinal={isLast}
                    claiming={claimingMilestone === milestone.milestone}
                    onClaim={() => void claim(milestone.milestone)}
                  />
                )}
              </div>
            )
          })}

        {/* 2행 — 구간 8토막으로 쪼갠 진행률 바. 색이 상태를 한 번 더 말한다. */}
        {track.milestones.map((milestone) => (
          <div
            key={`bar-${milestone.milestone}`}
            className="h-2 overflow-hidden rounded-full bg-[var(--surface-sunken)]"
            /* 8개가 모여 하나의 진행 표시라, 막대마다 progressbar 역할을 주면 스크린리더가
               같은 값을 여덟 번 읽는다. 상태는 구간 아이콘의 aria-label 이 말한다. */
            aria-hidden="true"
          >
            <div
              className={cn(
                'h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
                milestone.claimed
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                  : 'bg-gradient-to-r from-brand-600 to-brand-400',
              )}
              style={{ width: `${fillOf(milestone)}%` }}
            />
          </div>
        ))}
      </div>

      {/*
        판정 시트에서는 요약 문구를 두지 않는다 — 상태는 아이콘과 바 색이 이미 말하고,
        구간별 내용은 가리키면 팝오버가 말한다.

        판정 시트가 아닐 때만 남긴다. 이쪽은 안내가 아니라 <b>왜 여기엔 아이콘이 없는지</b>와
        어디로 가야 받을 수 있는지를 알려주는 유일한 통로다.
      */}
      {!isBound && (
        <p className="muted m-0 mt-2 text-[11.5px] font-semibold">
          보상은 가장 먼저 만든 만다라트의 진행률로 열려요 ·{' '}
          <Link to={`/app/sheets/${track.sheetId}`} className="font-bold text-brand-600">
            그 만다라트로 가기
          </Link>
        </p>
      )}
    </div>
  )
}
