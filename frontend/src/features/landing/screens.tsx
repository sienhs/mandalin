import type { ReactNode } from 'react'
import type { Sheet, Subject } from '../../data/types'
import { PERIOD_LABEL } from '../../data/types'
import { domainColor, ProgressRing } from '../../components/common/Primitives'
import {
  IconBell,
  IconCheck,
  IconCoach,
  IconCoin,
  IconPlus,
  IconSend,
  IconTrophy,
} from '../../components/common/Icons'
import Logo from '../../components/common/Logo'
import MandalartGrid from '../sheet/MandalartGrid'
import IsoVillage from '../village/IsoVillage'
import { cn } from '../../utils/cn'

/**
 * 소개 페이지가 보여 주는 <b>실제 제품 화면</b>.
 *
 * <p>스크린샷 이미지를 쓰지 않는다. 만다라트 격자와 마을은 앱이 쓰는 바로 그 컴포넌트
 * ({@link MandalartGrid}, {@link IsoVillage})를 그대로 부르고, 나머지 카드도 앱과 같은
 * 토큰(surface·hairline·brand)으로 짠다. 그래서
 *
 * <ul>
 *   <li>어느 배율에서도 뭉개지지 않고,
 *   <li>다크 모드가 저절로 따라오고,
 *   <li>제품 UI 가 바뀌면 소개 페이지도 같이 바뀐다 — 낡은 스크린샷이 남지 않는다.
 * </ul>
 *
 * <p>데이터는 {@code showcaseSheet()} 하나에서 온다. 화면마다 숫자를 따로 지어내면
 * 같은 페이지 안에서 포인트와 달성률이 서로 어긋난다.
 */

/* ─────────────────────────  공통 조각  ───────────────────────── */

/** 앱 상단 바(포인트·알림·아바타). AppShell 헤더의 축약이다. */
function TopBar({ point }: { point: number }) {
  return (
    <div
      className="flex items-center gap-2.5 border-b px-4 py-3"
      style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-card)' }}
    >
      <Logo className="size-[22px] shrink-0 text-brand-500" />
      <strong className="text-[13px] font-black tracking-[-0.04em]">만다린</strong>

      <span className="ml-auto flex items-center gap-1.5 rounded-full bg-[var(--color-points-bg)] px-2.5 py-1 text-[11.5px] font-black text-[var(--color-points-text)]">
        <IconCoin className="size-[13px]" />
        <span className="tabular-nums">{point.toLocaleString('ko-KR')}</span>
      </span>
      <span className="relative text-[var(--color-gold)]" aria-hidden="true">
        <IconBell className="size-[17px]" />
        <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-[var(--color-alert)]" />
      </span>
      <span
        className="grid size-7 place-items-center rounded-full text-[11px] font-black"
        style={{ background: 'var(--surface-sunken)' }}
        aria-hidden="true"
      >
        정
      </span>
    </div>
  )
}

/** 카드 한 장의 제목 줄. */
function CardHead({ title, caption }: { title: string; caption?: string }) {
  return (
    <div>
      <h3 className="m-0 text-[13.5px] font-black tracking-[-0.03em]">{title}</h3>
      {caption && <p className="muted m-0 mt-0.5 text-[11px] font-semibold">{caption}</p>}
    </div>
  )
}

function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn('rounded-2xl border p-4', className)}
      style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-card)' }}
    >
      {children}
    </div>
  )
}

/* ─────────────────────────  오늘의 할 일  ───────────────────────── */

/**
 * 오늘 해야 할 과제를 고른다. 매일 주기이면서 아직 안 끝난 것.
 *
 * <p>세부 목표를 <b>돌아가며</b> 하나씩 집는다. 순서대로 잘라 오면 앞 목표의 과제만
 * 여덟 개 나와서, 실제 화면(여러 목표의 오늘 할 일이 섞여 뜬다)과 달라 보인다.
 */
function todayRows(sheet: Sheet, count: number) {
  const byDomain = (sheet.domains ?? []).map((domain) =>
    domain.subjects
      .filter((subject) => subject.period === 'DAILY' && subject.progress < 100)
      .map((subject) => ({
        subject,
        domainTitle: domain.title,
        domainIndex: domain.position,
      })),
  )

  const rows: Array<{ subject: Subject; domainTitle: string; domainIndex: number }> = []
  for (let depth = 0; rows.length < count; depth += 1) {
    // 어느 목표에도 더 뽑을 것이 없으면 멈춘다 — 아니면 무한히 돈다.
    if (byDomain.every((list) => depth >= list.length)) break
    for (const list of byDomain) {
      if (rows.length >= count) break
      if (depth < list.length) rows.push(list[depth])
    }
  }
  return rows
}

export function TodoList({
  sheet,
  count = 5,
  /** 앞의 몇 개를 이미 완료한 상태로 그릴지. 체크가 켜지는 연출에 쓴다. */
  doneCount = 0,
}: {
  sheet: Sheet
  count?: number
  doneCount?: number
}) {
  const rows = todayRows(sheet, count)

  return (
    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
      {rows.map((row, i) => {
        const done = i < doneCount
        const color = domainColor(row.domainIndex)

        return (
          <li key={row.subject.id}>
            <div
              className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors duration-500"
              style={{
                borderColor: done ? 'transparent' : 'var(--border-hairline)',
                background: done
                  ? 'color-mix(in oklab, var(--color-brand-500), var(--surface-card) 90%)'
                  : 'var(--surface-card)',
              }}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'grid size-[19px] shrink-0 place-items-center rounded-md border-2 transition-all duration-500',
                  done && 'border-transparent',
                )}
                style={{
                  borderColor: done ? undefined : 'var(--border-hairline)',
                  background: done ? 'var(--color-brand-500)' : 'transparent',
                  color: '#fff',
                }}
              >
                {done && <IconCheck className="size-3" />}
              </span>

              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block truncate text-[12.5px] font-bold transition-opacity duration-500',
                    done && 'line-through opacity-55',
                  )}
                >
                  {row.subject.title}
                </span>
                <span className="muted mt-0.5 flex items-center gap-1.5 text-[10.5px] font-semibold">
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ background: color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{row.domainTitle}</span>
                  <span
                    className="shrink-0 rounded-full px-1.5 py-px text-[9.5px] font-bold"
                    style={{ background: 'var(--surface-sunken)' }}
                  >
                    {PERIOD_LABEL[row.subject.period]}
                  </span>
                </span>
              </span>

              <span className="shrink-0 text-right">
                <span className="block text-[10.5px] font-black tabular-nums">
                  {row.subject.tryCount}/{row.subject.targetCount}
                </span>
                <span className="muted block text-[9.5px] font-bold">+{row.subject.point}P</span>
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

/* ─────────────────────────  화면들  ───────────────────────── */

/**
 * 앱 첫 화면. 왼쪽에 오늘 할 일, 오른쪽에 내 마을 —
 * 실제 `HomePage` 의 2단 배치를 그대로 따른다.
 */
export function HomeScreen({
  sheet,
  point = 1_240,
  doneCount = 0,
  /**
   * 할 일 줄 수. 고정 구간처럼 세로가 빠듯한 자리에서는 줄여 쓴다 —
   * 세 화면을 겹쳐 놓는 곳에서는 가장 큰 화면이 액자 높이를 정하기 때문이다.
   */
  todoCount = 5,
}: {
  sheet: Sheet
  point?: number
  doneCount?: number
  todoCount?: number
}) {
  return (
    <div>
      <TopBar point={point} />

      <div className="p-4">
        {/* 요약 줄 */}
        <Card className="flex items-center gap-4">
          <ProgressRing value={sheet.achievementRate} size={52} stroke={6}>
            <span className="text-[12px] font-black tabular-nums">{sheet.achievementRate}%</span>
          </ProgressRing>
          <div className="min-w-0">
            <h2 className="m-0 truncate text-[15px] font-black tracking-[-0.04em]">
              {sheet.title}
            </h2>
            <p className="muted m-0 mt-1 text-[11.5px] font-semibold">
              오늘 남은 과제 <strong className="text-brand-600 dark:text-brand-400">5개</strong> ·
              이번 주 <strong className="text-brand-600 dark:text-brand-400">18개</strong> 완료
            </p>
          </div>
        </Card>

        <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <Card>
            <CardHead title="오늘의 할 일" caption="체크하면 포인트가 쌓여요" />
            <div className="mt-3">
              <TodoList sheet={sheet} count={todoCount} doneCount={doneCount} />
            </div>
          </Card>

          <Card className="flex flex-col">
            <CardHead title="내 마을" caption={sheet.title} />
            {/* 앱의 마을 뷰를 그대로 부른다 — 이미지가 아니다. */}
            <IsoVillage sheet={sheet} compact className="mt-2 min-h-[168px] w-full flex-1" />
          </Card>
        </div>
      </div>
    </div>
  )
}

/**
 * 오늘의 할 일 화면. 64개 중 오늘 주기가 돌아온 것만 추려 보여 주는 자리다.
 *
 * <p>{@link HomeScreen} 의 왼쪽 카드와 같은 목록이지만, 이쪽은 목록이 주인공이라
 * 마을을 빼고 폭을 다 내준다.
 */
export function TodoScreen({
  sheet,
  point = 1_240,
  count = 6,
  doneCount = 2,
}: {
  sheet: Sheet
  point?: number
  count?: number
  doneCount?: number
}) {
  const remaining = Math.max(0, count - doneCount)

  return (
    <div>
      <TopBar point={point} />

      <div className="p-4">
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <CardHead title="오늘의 할 일" caption="체크하면 포인트가 쌓여요" />
            <span className="ml-auto flex items-center gap-2 text-[11px] font-bold">
              <span className="rounded-full bg-brand-500/12 px-2.5 py-1 text-brand-600 dark:text-brand-400">
                {doneCount}개 완료
              </span>
              <span
                className="muted rounded-full px-2.5 py-1"
                style={{ background: 'var(--surface-sunken)' }}
              >
                {remaining}개 남음
              </span>
            </span>
          </div>

          <div className="mt-3">
            <TodoList sheet={sheet} count={count} doneCount={doneCount} />
          </div>
        </Card>
      </div>
    </div>
  )
}

/**
 * AI 코치. 목표를 말하면 실천 과제를 뽑아 만다라트에 담아 주는 화면.
 *
 * <p>실제 `AiCoachPage` 의 짜임을 그대로 따른다 — 코치 머리말, 오른쪽에 붙는 내 말풍선,
 * 왼쪽에 붙는 코치 답변, 그 아래 세부 목표별 과제 카드, 맨 아래 입력줄.
 */
export function CoachScreen({ point = 1_240 }: { point?: number }) {
  const picks = [
    { title: '아침 스트레칭 10분', period: '매일', why: '기상 직후라 빠뜨리기 어렵습니다' },
    { title: '주 3회 웨이트 트레이닝', period: '주간', why: '근력은 주 단위가 현실적입니다' },
  ]

  return (
    <div>
      <TopBar point={point} />

      <div className="p-4">
        <Card className="p-0">
          {/* 코치 머리말 */}
          <div
            className="flex items-center gap-3 border-b px-4 py-3"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <IconCoach className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <strong className="block text-[12.5px] font-black tracking-[-0.02em]">
                만다린 코치
              </strong>
              <span className="muted flex items-center gap-1.5 text-[10.5px] font-bold">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                대화로 과제를 모아 만다라트로
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 px-4 py-4">
            {/* 내 말 */}
            <div className="flex justify-end">
              <p
                className="m-0 max-w-[76%] rounded-[16px] rounded-br-md px-3.5 py-2.5 text-[12.5px] font-semibold leading-relaxed text-white"
                style={{ background: 'var(--color-brand-600)' }}
              >
                올해는 건강해지고 싶어요. 뭐부터 해야 할까요?
              </p>
            </div>

            {/* 코치 답변 */}
            <div className="flex gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center rounded-full bg-brand-500/12 text-brand-600 dark:text-brand-400">
                <IconCoach className="size-[15px]" />
              </span>
              <p
                className="m-0 max-w-[80%] rounded-[16px] rounded-tl-md px-3.5 py-2.5 text-[12.5px] font-semibold leading-relaxed"
                style={{ background: 'var(--surface-sunken)' }}
              >
                몸을 만드는 목표군요. 처음부터 강도를 올리면 오래 못 가니, 매일 할 수 있는
                작은 것과 주 단위 큰 것을 섞어 잡아봤어요.
              </p>
            </div>

            {/* 뽑아 준 과제 */}
            <div className="ml-[38px]">
              <p className="muted m-0 mb-2 text-[10.5px] font-bold">
                세부 목표 “규칙적인 운동” 에 담을 과제
              </p>
              <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
                {picks.map((pick) => (
                  <li
                    key={pick.title}
                    className="flex flex-col rounded-xl border p-3"
                    style={{
                      borderColor: 'var(--border-hairline)',
                      background: 'var(--surface-card)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <strong className="text-[11.5px] font-black leading-snug">
                        {pick.title}
                      </strong>
                      <span
                        className="shrink-0 rounded-full px-1.5 py-px text-[9.5px] font-bold"
                        style={{ background: 'var(--surface-sunken)' }}
                      >
                        {pick.period}
                      </span>
                    </div>
                    <p className="muted m-0 mt-1.5 text-[10.5px] font-medium leading-relaxed">
                      {pick.why}
                    </p>
                    <span className="mt-2.5 flex items-center gap-1 text-[10.5px] font-black text-brand-600 dark:text-brand-400">
                      <IconPlus className="size-3" /> 담기
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 입력줄 */}
          <div
            className="flex items-center gap-2 border-t px-3 py-2.5"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <span
              className="grid h-9 min-w-0 flex-1 items-center rounded-full border px-3.5 text-[11.5px] font-semibold"
              style={{
                borderColor: 'var(--border-hairline)',
                background: 'var(--surface-sunken)',
                color: 'var(--text-muted)',
              }}
            >
              이루고 싶은 것을 편하게 말해 주세요
            </span>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
              <IconSend className="size-[16px]" />
            </span>
          </div>
        </Card>
      </div>
    </div>
  )
}

/**
 * 만다라트 상세. 실제 81칸 격자 컴포넌트 그대로.
 *
 * <p>상단 바를 함께 그린다. 실제 앱에서도 이 화면 위에 헤더가 있고, 소개 페이지에서
 * 다른 화면들과 번갈아 보여 줄 때 헤더가 있고 없고가 갈리면 액자 안에서 내용이
 * 위아래로 튄다.
 */
export function SheetScreen({ sheet, point = 1_240 }: { sheet: Sheet; point?: number }) {
  return (
    <div>
      <TopBar point={point} />
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <h2 className="m-0 truncate text-[15px] font-black tracking-[-0.04em]">
              {sheet.title}
            </h2>
            <p className="muted m-0 mt-0.5 text-[11px] font-semibold">
              세부 목표 8 · 실천 과제 64 · 달성률 {sheet.achievementRate}%
            </p>
          </div>
          <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full bg-brand-500/12 px-2.5 py-1 text-[11px] font-black text-brand-600 dark:text-brand-400">
            공개
          </span>
        </div>

        {/*
          격자는 정사각형이라 폭이 곧 높이다. 액자 폭을 그대로 주면 세로가 액자를 넘어
          아래쪽 세 줄이 잘린다 — 폭을 묶어 높이를 붙든다.

          headingsOnly: 이 크기에서 81칸에 글자를 다 넣으면 4~5px 글씨가 빼곡해
          읽히지도 않고 구조만 가린다. 핵심 목표와 세부 목표 이름만 남긴다.
        */}
        <div className="mx-auto mt-3 w-full max-w-[420px]">
          <MandalartGrid sheet={sheet} headingsOnly />
        </div>
      </div>
    </div>
  )
}

/** 상점. 포인트로 건물을 사는 화면. */
export function ShopScreen({ sheet, point = 1_240 }: { sheet: Sheet; point?: number }) {
  const items = [
    { name: '벽돌 주택', theme: '기본', price: 120, owned: true },
    { name: '유리 사옥', theme: '도심', price: 480, owned: false },
    { name: '풍차 방앗간', theme: '전원', price: 320, owned: false },
    { name: '시계탑', theme: '랜드마크', price: 900, owned: false },
  ]

  return (
    <div>
      <TopBar point={point} />
      <div className="p-4">
        <CardHead title="상점" caption="과제로 모은 포인트로 건물을 삽니다" />

        {/*
          액자가 넓어지면 4칸이 그만큼 커지고, 썸네일이 정사각형이라 세로도 같이 자라
          화면 전체가 액자를 넘긴다. 상품 줄만 폭을 묶어 둔다.
        */}
        <div className="mx-auto mt-3 grid max-w-[620px] grid-cols-2 gap-2.5 sm:grid-cols-4">
          {items.map((item, i) => (
            <Card key={item.name} className="p-2.5">
              {/* 건물 자리 — 마을과 같은 색 체계로 칠한다. */}
              <div
                className="grid aspect-[4/3] place-items-center rounded-xl"
                style={{
                  background: `color-mix(in oklab, ${domainColor(i)}, var(--surface-sunken) 78%)`,
                }}
                aria-hidden="true"
              >
                <span
                  className="block rounded-[3px]"
                  style={{
                    width: 26,
                    height: 26 + i * 5,
                    background: domainColor(i),
                    boxShadow: `0 4px 0 color-mix(in oklab, ${domainColor(i)}, black 32%)`,
                  }}
                />
              </div>
              <p className="m-0 mt-2 truncate text-[11.5px] font-black">{item.name}</p>
              <p className="muted m-0 mt-0.5 text-[10px] font-semibold">{item.theme}</p>
              <p
                className={cn(
                  'm-0 mt-1.5 flex items-center gap-1 text-[11px] font-black tabular-nums',
                  item.owned ? 'muted' : 'text-brand-600 dark:text-brand-400',
                )}
              >
                {item.owned ? '보유 중' : `${item.price.toLocaleString('ko-KR')}P`}
              </p>
            </Card>
          ))}
        </div>

        {/*
          마을 SVG 는 4:3 비율을 지키며 높이에 맞춰 줄어든다 — 넓은 액자에 그냥 두면
          가운데 우표처럼 작게 떠 보인다. 폭을 채우는 패널 안에 담아 "구획"으로 읽히게 한다.
        */}
        <div
          className="mt-3 rounded-2xl border px-4 py-3"
          style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-sunken)' }}
        >
          <p className="muted m-0 text-[10.5px] font-bold">
            산 건물은 내 마을의 원하는 칸에 세울 수 있어요
          </p>
          {/* 패널 배경(sunken)과 마을 하늘색이 부딪히므로 하늘을 끄고 패널색을 그대로 쓴다. */}
          <IsoVillage sheet={sheet} compact transparent className="mt-1 h-[110px] w-full" />
        </div>
      </div>
    </div>
  )
}

/** 주간 리포트. AI 가 지난주를 요약해 준다. */
export function ReportScreen({ sheet }: { sheet: Sheet }) {
  const metrics = [
    ['완료한 과제', '38회'],
    ['적립 포인트', '380P'],
    ['가장 꾸준한 목표', '정기 검진'],
  ] as const

  const domains = (sheet.domains ?? []).slice(0, 5)

  return (
    <div className="p-4">
      <CardHead title="주간 리포트" caption="6월 24일 – 6월 30일" />

      <Card className="mt-3">
        <p className="m-0 text-[12.5px] font-bold leading-[1.7]">
          이번 주는 <strong className="text-brand-600 dark:text-brand-400">운동과 검진</strong>이
          특히 좋았어요. 다만 <strong>수면</strong>은 3일 연속 비어 있습니다 — 취침 시간을 30분만
          당겨 보는 건 어떨까요?
        </p>
      </Card>

      <div className="mt-2.5 grid grid-cols-3 gap-2.5">
        {metrics.map(([label, value]) => (
          <Card key={label} className="p-3">
            <p className="muted m-0 text-[10px] font-bold">{label}</p>
            <p className="m-0 mt-1 text-[14px] font-black tabular-nums tracking-[-0.03em]">
              {value}
            </p>
          </Card>
        ))}
      </div>

      <Card className="mt-2.5">
        <CardHead title="목표별 달성률" />
        <ul className="m-0 mt-2.5 flex list-none flex-col gap-2 p-0">
          {domains.map((domain) => {
            const rate = Math.round(
              domain.subjects.reduce((sum, s) => sum + s.progress, 0) /
                Math.max(1, domain.subjects.length),
            )
            return (
              <li key={domain.id} className="flex items-center gap-2.5">
                <span className="w-[74px] shrink-0 truncate text-[11px] font-bold">
                  {domain.title}
                </span>
                <span
                  className="h-1.5 flex-1 overflow-hidden rounded-full"
                  style={{ background: 'var(--surface-sunken)' }}
                >
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${rate}%`,
                      background: domainColor(domain.position),
                    }}
                  />
                </span>
                <span className="muted w-8 shrink-0 text-right text-[10.5px] font-black tabular-nums">
                  {rate}%
                </span>
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}

/** 리더보드. 공개한 만다라트가 좋아요 순으로 줄을 선다. */
export function LeaderboardScreen() {
  const rows = [
    ['1일 1커밋 챌린지', '김서연', 128],
    ['건강한 몸 만들기', '정희성', 96],
    ['토익 900 만들기', '박도윤', 74],
    ['반년 안에 이직하기', '이하준', 51],
  ] as const

  return (
    <div className="p-4">
      <CardHead title="리더보드" caption="공개 만다라트 좋아요 순위" />
      <ul className="m-0 mt-3 flex list-none flex-col gap-1.5 p-0">
        {rows.map(([title, name, likes], i) => (
          <li key={title}>
            <Card className="flex items-center gap-3 py-2.5">
              <span
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-lg text-[11px] font-black',
                  i === 0 ? 'text-white' : 'muted',
                )}
                style={{
                  background: i === 0 ? 'var(--color-brand-500)' : 'var(--surface-sunken)',
                }}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[12px] font-black">{title}</span>
                <span className="muted block text-[10.5px] font-semibold">{name}</span>
              </span>
              <span className="flex shrink-0 items-center gap-1 text-[11px] font-black text-brand-600 tabular-nums dark:text-brand-400">
                <IconTrophy className="size-3.5" />
                {likes}
              </span>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  )
}
