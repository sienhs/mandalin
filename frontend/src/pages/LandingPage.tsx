import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../data/store'
import { showcaseSheet } from '../data/showcaseSheet'
import Button from '../components/common/ActionButton'
import { LogoLockup } from '../components/common/Logo'
import {
  IconChart,
  IconCheck,
  IconCoach,
  IconFriends,
  IconGrid,
  IconMoon,
  IconShop,
  IconSun,
  IconVillage,
} from '../components/common/Icons'
import Reveal from '../features/landing/Reveal'
import { BrowserFrame } from '../features/landing/DeviceFrame'
import {
  HomeScreen,
  LeaderboardScreen,
  ReportScreen,
  SheetScreen,
  ShopScreen,
  CoachScreen,
  TodoScreen,
} from '../features/landing/screens'
import { useInView, useMediaQuery, useScrollProgress } from '../features/landing/scroll'
import { cn } from '../utils/cn'

/**
 * 소개 페이지.
 *
 * <p>토스(toss.im)의 짜임을 참고했다. 그 화면의 핵심은 장식이 아니라 <b>절제</b>다 —
 * 한 화면에 메시지 하나, 큰 여백, 큰 글자, 그리고 실제 제품 화면. 스크롤을 내리면
 * 문장과 화면이 차례로 떠오르고, 한 대목에서는 기기를 고정해 둔 채 설명만 바뀐다.
 *
 * <p><b>사진을 쓰지 않는다.</b> 화면 자리에는 앱이 실제로 쓰는 컴포넌트를 그대로 렌더링한다
 * (`features/landing/screens.tsx`). 스크린샷은 찍는 순간부터 낡고, 다크 모드도 따라오지
 * 못하며, 확대하면 뭉개진다. 살아 있는 화면은 그 셋이 전부 해결된다.
 */

/* ─────────────────────────  글 조각  ───────────────────────── */

/**
 * 한 화면 = 한 메시지. 위아래로 크게 띄우는 것이 이 페이지의 리듬이다.
 *
 * <p>여백을 클래스가 아니라 인라인 스타일로 준다. Tailwind v4 는 important 수식어가
 * 접미사(`pb-0!`)로 바뀌어 예전 접두사(`!pb-0`)가 조용히 무시되는데, 무시돼도 화면이
 * 깨지지 않고 여백만 어긋나 알아채기 어렵다. 이어 붙는 구간(제목만 있는 절)은 애초에
 * 값으로 받는다.
 */
function Section({
  children,
  className,
  pad = 'both',
}: {
  children: ReactNode
  className?: string
  /** 다음 구간과 이어 붙일 때 한쪽 여백을 접는다. */
  pad?: 'both' | 'top' | 'bottom'
}) {
  const full = 'clamp(84px, 13vh, 150px)'
  const short = 'clamp(40px, 6vh, 64px)'

  return (
    <section
      className={cn('px-6', className)}
      style={{
        /*
          구간마다 색을 갈아 끼우지 않는다. 앱과 같은 바탕(흰색)으로 끝까지 가야
          로그인 버튼을 누르는 순간 배경이 바뀌지 않는다 — 소개 페이지와 앱이
          한 제품으로 읽히는 것은 그 연속성에서 온다.

          <p>구간을 나누는 일은 여백(위 `full`·`short`)과 큰 글자가 이미 하고 있다.
        */
        background: 'var(--surface-page)',
        paddingTop: pad === 'bottom' ? short : full,
        paddingBottom: pad === 'top' ? short : full,
      }}
    >
      <div className="mx-auto w-full max-w-[1080px]">{children}</div>
    </section>
  )
}

function Headline({
  eyebrow,
  title,
  body,
  align = 'left',
}: {
  eyebrow?: string
  title: ReactNode
  body?: ReactNode
  align?: 'left' | 'center'
}) {
  return (
    <div className={align === 'center' ? 'text-center' : undefined}>
      {eyebrow && (
        <Reveal>
          <p className="m-0 mb-4 text-[13.5px] font-black tracking-[0.02em] text-brand-600 dark:text-brand-400">
            {eyebrow}
          </p>
        </Reveal>
      )}
      <Reveal delay={0.06}>
        <h2 className="m-0 text-[clamp(28px,4.2vw,48px)] font-black leading-[1.24] tracking-[-0.045em]">
          {title}
        </h2>
      </Reveal>
      {body && (
        <Reveal delay={0.12}>
          <p
            className={cn(
              'muted mt-5 text-[clamp(15px,1.5vw,18px)] font-semibold leading-[1.75]',
              align === 'center' ? 'mx-auto max-w-[580px]' : 'max-w-[540px]',
            )}
          >
            {body}
          </p>
        </Reveal>
      )}
    </div>
  )
}

/** 화면에 들어오면 0 에서 목표값까지 세어 올라가는 숫자. */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [ref, inView] = useInView<HTMLSpanElement>()
  const [value, setValue] = useState(0)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    if (!inView) return
    const start = performance.now()
    const duration = 1100

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // ease-out-quint. 끝에서 천천히 멎어야 숫자가 "도착"한 느낌이 난다.
      const eased = 1 - Math.pow(1 - t, 5)
      setValue(Math.round(to * eased))
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current)
    }
  }, [inView, to])

  return (
    <span ref={ref} className="tabular-nums">
      {value.toLocaleString('ko-KR')}
      {suffix}
    </span>
  )
}

/* ─────────────────────────  내용  ───────────────────────── */

const STEPS = [
  {
    no: '01',
    icon: IconGrid,
    title: '큰 목표를 81칸으로 쪼갭니다',
    body: '핵심 목표 하나에서 세부 목표 8개로, 다시 실천 과제 64개로. 막연한 다짐이 오늘 할 일이 됩니다.',
    hint: '만다라트 · 9 × 9',
  },
  {
    no: '02',
    icon: IconCoach,
    title: '64칸, AI가 대신 채웁니다',
    /* 설명은 두 줄까지. 세 줄이 되면 아래 진행 표시와 겹친다(고정 구간의 높이가 정해져 있다). */
    body: '“건강해지고 싶어요” 한마디면 코치가 과제를 뽑아 줍니다. 마음에 드는 것만 담으면 64칸이 순식간에 채워져요.',
    hint: 'AI 코치',
  },
  {
    no: '03',
    icon: IconCheck,
    title: '매일 과제를 체크합니다',
    body: '완료할 때마다 포인트가 쌓이고, 그 칸이 아래에서부터 차오릅니다. 오늘 할 일만 따로 모아 보여 줘요.',
    hint: '오늘의 할 일',
  },
  {
    no: '04',
    icon: IconVillage,
    title: '포인트로 도시를 짓습니다',
    body: '건물을 사서 마을에 세우면, 과제가 진행될수록 건물도 한 층씩 자랍니다. 진행률이 곧 도시의 크기예요.',
    hint: '상점 · 3D 마을',
  },
] as const

const FEATURES = [
  {
    icon: IconChart,
    title: '주간 리포트',
    body: '지난주에 무엇을 잘했고 어디가 비었는지 AI 가 정리해 줍니다.',
  },
  /* AI 코치는 위의 주요 단계(02)로 올렸다 — 여기 다시 두면 같은 말을 두 번 한다. */
  {
    icon: IconGrid,
    title: '공개 만다라트',
    body: '내 계획을 공개하면 리더보드에 오르고, 남의 81칸도 구경할 수 있어요.',
  },
  {
    icon: IconFriends,
    title: '친구와 함께',
    body: '친구를 추가하고 공개한 만다라트를 서로 구경하며 좋아요를 남겨요.',
  },
  {
    icon: IconShop,
    title: '건물 상점',
    body: '모은 포인트로 테마별 건물을 사고, 원하는 칸에 직접 배치합니다.',
  },
] as const

/** 만든 사람들. 푸터에만 쓴다. */
const TEAM = ['정희성', '황우찬', '김재현', '권병수', '이성현', '지상근'] as const

const FAQ = [
  {
    q: '만다라트가 뭔가요?',
    a: '가운데에 핵심 목표를 적고, 그 둘레 8칸에 세부 목표를, 다시 각 세부 목표마다 실천 과제 8개를 적는 9×9 계획표예요. 큰 목표를 오늘 할 수 있는 크기까지 쪼개는 것이 핵심입니다.',
  },
  {
    q: '한 번 만들면 고칠 수 있나요?',
    a: '제목과 과제 내용은 생성 이후 바꿀 수 없습니다. 계획을 계속 고치면 달성률이 의미를 잃기 때문이에요. 공개 여부는 언제든 바꿀 수 있고, 시트 자체를 지우고 새로 만들 수도 있습니다.',
  },
  {
    q: '과제는 하루에 몇 번까지 체크되나요?',
    a: '주기에 따라 다릅니다. 매일 과제는 하루 한 번, 주간 과제는 정한 횟수만큼(주 3회 등), 한번 과제는 기간 내 딱 한 번입니다.',
  },
  {
    q: '가입 절차가 따로 있나요?',
    a: '없습니다. 카카오 계정으로 로그인하면 그 자리에서 가입까지 끝나고, 가입 축하 포인트를 드려요.',
  },
] as const

/* ─────────────────────────  고정 구간  ───────────────────────── */

/**
 * 각 단계가 보여 줄 제품 화면. {@link STEPS} 와 <b>같은 순서</b>다.
 *
 * <p>고정 배치와 쌓기 배치가 이 함수를 같이 쓴다. 예전에는 쌓기 쪽이 `i === 0/1/2` 로
 * 화면을 직접 골랐는데, 단계를 하나 늘리자 네 번째 액자가 빈 채로 남았다 — 목록이 두
 * 군데로 갈라져 있으면 한쪽만 고치게 된다.
 */
function stepScreens(sheet: ReturnType<typeof showcaseSheet>) {
  return [
    <SheetScreen key="sheet" sheet={sheet} />,
    <CoachScreen key="coach" />,
    // 체크가 하나씩 켜진 상태를 보여 준다.
    <HomeScreen key="home" sheet={sheet} doneCount={3} todoCount={4} />,
    <ShopScreen key="shop" />,
  ]
}

/**
 * 기기를 화면에 붙여 둔 채 설명만 바꾸는 구간 — 이 페이지에서 가장 토스다운 대목이다.
 *
 * <p>바깥 컨테이너를 단계 수만큼의 화면 높이로 잡고 안쪽을 sticky 로 고정한다. 스크롤
 * 진행도를 단계 수로 나눠 지금 몇 번째 이야기인지 고른다. 화면 전환은 겹쳐 두고 투명도만
 * 바꾼다 — 갈아 끼우면 3D 마을이 매번 다시 그려져 끊긴다.
 */
function PinnedSteps({ sheet }: { sheet: ReturnType<typeof showcaseSheet> }) {
  const [ref, progress] = useScrollProgress<HTMLDivElement>()
  const active = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length))

  const screens = stepScreens(sheet)

  return (
    <div ref={ref} className="relative" style={{ height: `${STEPS.length * 100}vh` }}>
      {/*
        설명을 위, 제품 화면을 아래에 두고 둘 다 가운데 정렬한다. 좌우로 나누면 화면이
        기껏해야 절반 폭이라 실제 앱처럼 보이지 않는다 — 세로로 쌓으면 같은 자리에서
        화면을 두 배 가까이 넓게 쓸 수 있다.
      */}
      {/* pt-16: 상단 헤더가 sticky 로 이 구간 위에 겹쳐 있다. 그만큼 비워야 제목이 안 가린다. */}
      <div className="sticky top-0 flex h-dvh flex-col items-center justify-center overflow-hidden px-6 pt-16">
        {/*
          바뀌는 설명. 셋이 겹쳐 있어(absolute) 부모 높이가 0 이 되므로 가장 긴 글이
          들어갈 만큼 바닥을 깔아 준다. 화면이 짧을 때를 대비해 vh 로 줄어들게 둔다.
        */}
        <div className="relative w-full max-w-[720px] text-center h-[clamp(140px,19vh,180px)]">
          {STEPS.map((step, i) => (
            <div
              key={step.no}
              aria-hidden={i !== active}
              className="absolute inset-x-0 top-0 motion-safe:transition-[opacity,transform]"
              style={{
                opacity: i === active ? 1 : 0,
                transform: i === active ? 'none' : 'translate3d(0, 18px, 0)',
                transitionDuration: '520ms',
                transitionTimingFunction: 'var(--ease-out-quint)',
                // 겹쳐 둔 채 숨긴 것이 클릭을 가로채지 않게.
                pointerEvents: i === active ? undefined : 'none',
              }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-3 py-1.5 text-[12px] font-black text-white">
                <step.icon className="size-[15px]" />
                {step.hint}
              </span>
              <h3 className="m-0 mt-4 text-[clamp(24px,3.2vw,38px)] font-black leading-[1.24] tracking-[-0.045em]">
                {step.title}
              </h3>
              <p className="muted mx-auto m-0 mt-3.5 max-w-[560px] text-[clamp(14.5px,1.4vw,17px)] font-semibold leading-[1.7]">
                {step.body}
              </p>
            </div>
          ))}
        </div>

        {/* 진행 표시 — 지금 몇 번째인지, 얼마나 남았는지 */}
        <div className="mt-3 flex items-center gap-2">
          {STEPS.map((step, i) => (
            <span
              key={step.no}
              className="h-1 rounded-full transition-all duration-500"
              style={{
                width: i === active ? 34 : 14,
                background: i === active ? 'var(--color-brand-500)' : 'var(--border-hairline)',
              }}
            />
          ))}
        </div>

        {/*
          고정된 실제 화면. 세 화면을 같은 격자 칸에 포개 놓는다 — absolute 로 겹치면
          부모 높이가 0 이 되어 고정 높이를 따로 정해야 하고, 그러면 가장 큰 화면이
          잘린다. 격자 겹치기는 부모가 <b>가장 큰 화면에 맞춰</b> 늘어난다.
        */}
        <BrowserFrame className="mt-[clamp(20px,3.5vh,36px)] w-full max-w-[900px]">
          <div className="grid">
            {screens.map((screen, i) => (
              <div
                key={i}
                aria-hidden={i !== active}
                className="col-start-1 row-start-1 motion-safe:transition-opacity"
                style={{
                  opacity: i === active ? 1 : 0,
                  transitionDuration: '520ms',
                  pointerEvents: i === active ? undefined : 'none',
                }}
              >
                {screen}
              </div>
            ))}
          </div>
        </BrowserFrame>
      </div>
    </div>
  )
}

/* ─────────────────────────  페이지  ───────────────────────── */

export default function Landing() {
  const { theme, toggleTheme, session } = useStore()
  const showcase = useMemo(showcaseSheet, [])
  const authed = session === 'authed'
  const home = authed ? '/app' : '/login'

  // 히어로의 기기가 스크롤에 따라 천천히 일어선다.
  const [heroRef, heroProgress] = useScrollProgress<HTMLDivElement>()
  const tilt = Math.max(0, 1 - heroProgress * 3)

  /*
    고정 구간은 넓고 <b>충분히 높은</b> 화면에서만 쓴다. 이 구간은 한 화면 안에 설명과
    제품 화면을 세로로 함께 담으므로, 세로가 짧으면 화면 아래가 잘린다. 조건에 못 미치면
    같은 내용을 평범하게 쌓아 항상 온전히 보이게 한다.
  */
  const wide = useMediaQuery('(min-width: 1024px) and (min-height: 880px)')

  // 쌓기 배치가 쓸 화면들. 고정 배치와 같은 목록(stepScreens)에서 온다.
  const stackedScreens = stepScreens(showcase)

  return (
    <div className="min-h-dvh" style={{ background: 'var(--surface-page)' }}>
      {/* ───────── 상단 ───────── */}
      <header
        className="sticky top-0 z-40 border-b backdrop-blur-xl"
        style={{
          background: 'color-mix(in oklab, var(--surface-page), transparent 20%)',
          borderColor: 'var(--border-hairline)',
        }}
      >
        <div className="mx-auto flex h-16 w-full max-w-[1080px] items-center gap-3 px-6">
          <Link to="/" className="no-underline">
            <LogoLockup />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? '밝은 테마로 전환' : '어두운 테마로 전환'}
              className="grid size-10 place-items-center rounded-full text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
            >
              {theme === 'dark' ? (
                <IconSun className="size-[18px]" />
              ) : (
                <IconMoon className="size-[18px]" />
              )}
            </button>
            <Button size="sm" to={home}>
              {authed ? '내 도시로' : '시작하기'}
            </Button>
          </div>
        </div>
      </header>

      {/* ───────── 히어로 ───────── */}
      <div ref={heroRef}>
        <section className="px-6 pb-[clamp(60px,9vh,110px)] pt-[clamp(64px,11vh,140px)]">
          <div className="mx-auto w-full max-w-[1080px] text-center">
            <Reveal>
              <h1 className="m-0 text-[clamp(36px,6.4vw,76px)] font-black leading-[1.1] tracking-[-0.055em]">
                목표를 세우면,
                <br />
                <span className="text-brand-600 dark:text-brand-400">도시가 자랍니다.</span>
              </h1>
            </Reveal>

            <Reveal delay={0.1}>
              <p className="muted mx-auto mt-7 max-w-[540px] text-[clamp(15px,1.7vw,19px)] font-semibold leading-[1.7]">
                81칸 만다라트에 매일의 과제를 채우면
                <br className="hidden sm:block" /> 3D 도시의 건물이 한 층씩 완성돼요.
              </p>
            </Reveal>

            <Reveal delay={0.18}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" to={home}>
                  {authed ? '내 도시로 가기' : '무료로 시작하기'}
                </Button>
                <Button size="lg" variant="quiet" to="/login">
                  둘러보기
                </Button>
              </div>
            </Reveal>

            {/*
              첫 화면의 주인공. 스크롤을 시작하면 기울어져 있던 화면이 정면으로 일어선다 —
              "제품을 향해 들어간다"는 인상을 만드는 대목이라 여기만 스크롤에 연동한다.
            */}
            <div
              className="mt-[clamp(44px,7vh,84px)]"
              style={{ perspective: '1400px', perspectiveOrigin: 'center top' }}
            >
              <Reveal variant="scale">
                <div
                  style={{
                    transform: `rotateX(${(tilt * 7).toFixed(2)}deg) scale(${(1 - tilt * 0.04).toFixed(3)})`,
                    transformOrigin: 'center top',
                  }}
                >
                  <BrowserFrame>
                    <HomeScreen sheet={showcase} />
                  </BrowserFrame>
                </div>
              </Reveal>
            </div>

            {/* 한눈에 보는 규모 */}
            <Reveal delay={0.1}>
              <dl className="mx-auto mt-[clamp(40px,6vh,72px)] grid max-w-[720px] grid-cols-3 gap-4">
                {[
                  { label: '한 시트의 칸', value: 81, suffix: '칸' },
                  { label: '실천 과제', value: 64, suffix: '개' },
                  { label: '마을 타일', value: 73, suffix: '칸' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <dt className="muted m-0 text-[12px] font-bold">{stat.label}</dt>
                    <dd className="m-0 mt-1.5 text-[clamp(22px,3.4vw,36px)] font-black tracking-[-0.05em]">
                      <CountUp to={stat.value} suffix={stat.suffix} />
                    </dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>
      </div>

      {/* ───────── 문제 제기 ───────── */}
      <Section>
        <Headline
          align="center"
          title={
            <>
              계획은 늘 세우는데,
              <br />왜 다음 주면 사라질까요.
            </>
          }
          body="할 일이 눈에 보이지 않으면 미루게 됩니다. 만다린은 목표를 81칸으로 나누고, 그 진행을 눈에 보이는 도시로 바꿉니다. 오늘 체크 하나가 건물 한 층이 되니까요."
        />
      </Section>

      {/* ───────── 네 단계 (큰 화면: 고정 / 작은 화면: 쌓기) ───────── */}
      <div style={{ background: 'var(--surface-page)' }}>
        <Section pad="top">
          <Headline eyebrow="어떻게 쓰나요" title="네 단계면 충분합니다." />
        </Section>

        {/* 큰 화면 — 기기를 고정해 두고 설명만 바뀐다 */}
        {wide ? (
          <PinnedSteps sheet={showcase} />
        ) : (
          /* 작은 화면 — 고정 구간은 손가락 스크롤과 싸운다. 평범하게 쌓는다. */
          <Section pad="bottom">
            <div className="flex flex-col gap-[clamp(56px,8vh,96px)]">
              {STEPS.map((step, i) => (
                <div key={step.no}>
                  <Reveal>
                    <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 px-3 py-1.5 text-[12px] font-black text-white">
                      <step.icon className="size-[15px]" />
                      {step.hint}
                    </span>
                    <h3 className="m-0 mt-4 text-[clamp(22px,5vw,30px)] font-black leading-[1.3] tracking-[-0.04em]">
                      {step.title}
                    </h3>
                    <p className="muted m-0 mt-3 text-[15px] font-semibold leading-[1.75]">
                      {step.body}
                    </p>
                  </Reveal>

                  <Reveal variant="scale" delay={0.08} className="mt-6">
                    <BrowserFrame>{stackedScreens[i]}</BrowserFrame>
                  </Reveal>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>

      {/* ───────── 오늘의 할 일 ───────── */}
      <Section>
        <div className="grid items-center gap-[clamp(32px,5vw,72px)] md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <div>
            <Headline
              eyebrow="매일 여는 화면"
              title={
                <>
                  오늘 할 일만
                  <br />
                  따로 모아 드려요.
                </>
              }
              body="64개를 매일 들여다볼 필요는 없습니다. 오늘 주기가 돌아온 과제만 추려서 보여 주고, 체크하는 순간 포인트와 진행률이 함께 올라갑니다."
            />
            <Reveal delay={0.18}>
              <ul className="mt-8 flex list-none flex-col gap-3 p-0">
                {[
                  '매일 · 주간 · 월간 · 한번 — 주기마다 다시 열립니다',
                  '여러 개를 한 번에 체크해도 포인트는 정확히 합산돼요',
                  '놓친 과제는 다음 주기에 그대로 다시 올라옵니다',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <span
                      className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-md text-white"
                      style={{ background: 'var(--color-brand-500)' }}
                      aria-hidden="true"
                    >
                      <IconCheck className="size-3" />
                    </span>
                    <span className="text-[14.5px] font-semibold leading-[1.6]">{line}</span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal variant="right" delay={0.1}>
            <BrowserFrame>
              <TodoScreen sheet={showcase} count={6} doneCount={2} />
            </BrowserFrame>
          </Reveal>
        </div>
      </Section>

      {/* ───────── 마을 ───────── */}
      <Section>
        <Headline
          align="center"
          eyebrow="결과"
          title={
            <>
              오늘 한 일이
              <br />
              도시로 남습니다.
            </>
          }
          body="과제 하나가 건물 한 채입니다. 빈 땅에서 공사, 완공까지 진행률이 그대로 보입니다. 마을 지도는 만다라트와 같은 9×9 배치라, 어느 구역이 비었는지 한눈에 들어와요."
        />

        <Reveal variant="scale" delay={0.1}>
          <div
            className="card mx-auto mt-[clamp(40px,6vh,72px)] max-w-[860px] overflow-hidden p-0"
            style={{ boxShadow: 'var(--shadow-pop)' }}
          >
            {/*
              3D 대신 그림 한 장. 이 자리는 "마을이 이렇게 남는다" 를 <b>보여주기만</b> 하면
              되는데, 실시간 렌더는 카탈로그와 three.js 를 랜딩까지 끌고 들어온다.

              <p>2배 크기(1720×1075)로 굽고 표시 폭은 860px 이라 레티나에서도 뭉개지지 않는다.
              PNG 는 같은 크기에서 2.5MB 라 첫 화면을 무겁게 만든다 — WebP 로 234KB.
            */}
            <img
              src="/images/landing-village.webp"
              alt="벚꽃에 둘러싸인 마을. 만다라트 배치를 따라 건물이 구역별로 들어서 있다."
              width={1720}
              height={1075}
              /* 첫 화면 아래라 미리 받지 않는다. 부모가 비율을 잡고 있어 늦게 와도 밀리지 않는다. */
              loading="lazy"
              decoding="async"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </Reveal>

      </Section>

      {/* ───────── 리포트 ───────── */}
      <Section>
        <div className="grid items-center gap-[clamp(32px,5vw,72px)] md:grid-cols-2">
          <Reveal variant="left">
            <BrowserFrame>
              <ReportScreen sheet={showcase} />
            </BrowserFrame>
          </Reveal>

          <Headline
            eyebrow="주간 리포트"
            title={
              <>
                한 주가 끝나면,
                <br />
                무엇이 남았는지 알려 줘요.
              </>
            }
            body="완료한 과제 수와 적립 포인트, 목표별 달성률을 정리하고 AI 가 다음 주 조언을 덧붙입니다. 잘한 것과 비어 있는 것을 같이 보여 주니까 다음 계획이 구체적으로 잡혀요."
          />
        </div>
      </Section>

      {/* ───────── 리더보드 · 친구 ───────── */}
      <Section>
        <div className="grid items-center gap-[clamp(32px,5vw,72px)] md:grid-cols-2">
          <Headline
            eyebrow="함께하기"
            title={
              <>
                혼자 하면 그만두고,
                <br />
                같이 하면 이어집니다.
              </>
            }
            body="만다라트를 공개하면 리더보드에 오르고 친구들이 좋아요를 남길 수 있어요. 친구의 공개 시트를 열어 어떤 과제를 세웠는지 그대로 볼 수도 있습니다."
          />

          <Reveal variant="right" delay={0.08}>
            <BrowserFrame>
              <LeaderboardScreen />
            </BrowserFrame>
          </Reveal>
        </div>
      </Section>

      {/* ───────── 기능 요약 ───────── */}
      <Section>
        <Headline align="center" eyebrow="더 있어요" title="이런 것도 준비했습니다." />

        <div className="mt-[clamp(36px,5vh,64px)] grid gap-4 sm:grid-cols-2">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 0.07}>
              <div
                className="h-full rounded-2xl border p-6"
                style={{
                  borderColor: 'var(--border-hairline)',
                  background: 'var(--surface-card)',
                }}
              >
                <span
                  className="grid size-11 place-items-center rounded-xl text-brand-600 dark:text-brand-400"
                  style={{ background: 'color-mix(in oklab, var(--color-brand-500), transparent 88%)' }}
                  aria-hidden="true"
                >
                  <feature.icon className="size-[21px]" />
                </span>
                <h3 className="m-0 mt-4 text-[17px] font-black tracking-[-0.035em]">
                  {feature.title}
                </h3>
                <p className="muted m-0 mt-2 text-[14px] font-semibold leading-[1.7]">
                  {feature.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ───────── 시작 가이드 ───────── */}
      <Section>
        <Headline
          align="center"
          eyebrow="시작하기"
          title="3분이면 첫 도시가 생깁니다."
          body="가입 절차는 따로 없어요. 카카오 로그인 한 번이면 그 자리에서 시작합니다."
        />

        <div className="mx-auto mt-[clamp(40px,6vh,72px)] max-w-[720px]">
          {[
            {
              title: '카카오로 로그인합니다',
              body: '별도 가입 없이 바로 시작하고, 가입 축하 포인트를 받습니다.',
            },
            {
              title: '핵심 목표 하나를 정합니다',
              body: '"건강한 몸 만들기"처럼 크게 잡아도 괜찮아요. 쪼개는 건 다음 단계입니다.',
            },
            {
              title: '세부 목표 8개와 과제 64개를 채웁니다',
              body: '막히면 AI 코치에게 목표만 말해도 됩니다. 초안을 대신 채워 줘요.',
            },
            {
              title: '오늘 할 일부터 체크합니다',
              body: '첫 체크와 동시에 포인트가 쌓이고 첫 건물이 올라갑니다.',
            },
          ].map((step, i, all) => (
            <Reveal key={step.title} delay={i * 0.06}>
              <div className="flex gap-4">
                {/* 세로 연결선 — 순서가 있는 일이라는 걸 선 하나로 말한다. */}
                <div className="flex flex-col items-center">
                  <span
                    className="grid size-9 shrink-0 place-items-center rounded-full text-[13px] font-black text-white"
                    style={{ background: 'var(--color-brand-500)' }}
                  >
                    {i + 1}
                  </span>
                  {i < all.length - 1 && (
                    <span
                      className="w-px flex-1"
                      style={{ background: 'var(--border-hairline)' }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <div className={cn('pt-1', i < all.length - 1 && 'pb-8')}>
                  <h3 className="m-0 text-[16.5px] font-black tracking-[-0.035em]">{step.title}</h3>
                  <p className="muted m-0 mt-1.5 text-[14px] font-semibold leading-[1.7]">
                    {step.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* ───────── 자주 묻는 질문 ───────── */}
      <Section>
        <Headline align="center" title="자주 묻는 질문" />

        <div className="mx-auto mt-[clamp(32px,5vh,56px)] max-w-[720px] flex flex-col gap-3">
          {FAQ.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.05}>
              <details
                className="group rounded-2xl border px-5 py-4"
                style={{
                  borderColor: 'var(--border-hairline)',
                  background: 'var(--surface-card)',
                }}
              >
                <summary className="flex cursor-pointer list-none items-center gap-3 text-[15px] font-black tracking-[-0.03em] [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    className="muted ml-auto shrink-0 text-[18px] font-black transition-transform duration-300 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="muted m-0 mt-3 text-[14px] font-semibold leading-[1.75]">{item.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Section>

      {/*
        마무리. 여기만 사진을 배경으로 깐다 — 앞 구간들이 전부 "제품 화면" 이라, 마지막에
        <b>그 화면을 실제로 쓰는 장면</b>을 두면 읽던 것이 현실로 넘어온다.

        <p>`Section` 을 쓰지 않고 직접 짠 이유: 그 컴포넌트는 배경을 토큰 두 가지(page·sunken)
        중에서만 고르고, 여기 필요한 것은 이미지 + 스크림 + 흰 글자라는 다른 층위다. 옵션을
        하나 더 뚫으면 다른 구간에서도 쓸 수 있는 것처럼 보이는데 쓸 자리가 여기뿐이다.
        여백 값은 `Section` 과 같은 값을 그대로 쓴다.
      */}
      <div className="relative isolate overflow-hidden">
        {/* alt 를 비운다 — 뜻을 나르지 않는 배경이라 읽어 주면 방해만 된다. */}
        <img
          src="/images/landing-cta.webp"
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 -z-10 size-full object-cover"
          /* 화면이 넓을수록 위아래가 잘린다. 가운데보다 조금 위를 잡아야 노트북 화면이 남는다. */
          style={{ objectPosition: 'center 38%' }}
        />

        {/*
          스크림. 사진 위에 글자를 그냥 얹으면 밝은 책상과 어두운 벽 위에서 읽힘이 제각각이라,
          어느 지점에 글자가 놓이든 대비가 확보되도록 전면을 한 겹 덮는다.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              'linear-gradient(180deg, rgba(12,14,18,.74) 0%, rgba(12,14,18,.62) 55%, rgba(12,14,18,.74) 100%)',
          }}
        />

        <section
          className="px-6"
          style={{
            paddingTop: 'clamp(84px, 13vh, 150px)',
            paddingBottom: 'clamp(56px, 8vh, 96px)',
          }}
        >
          <div className="mx-auto w-full max-w-[1080px] text-center">
            <Reveal>
              <h2 className="m-0 text-[clamp(30px,4.6vw,52px)] font-black leading-[1.2] tracking-[-0.05em] text-white">
                첫 칸을 채워 볼까요?
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mx-auto mt-5 max-w-[460px] text-[clamp(15px,1.5vw,18px)] font-semibold leading-[1.75] text-white/80">
                카카오 계정만 있으면 바로 시작할 수 있어요.
              </p>
            </Reveal>
            <Reveal delay={0.14}>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                <Button size="lg" to={home}>
                  {authed ? '내 도시로 가기' : '무료로 시작하기'}
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

      {/*
        만든 사람들. 로고 하나 아래에 소속 한 줄과 이름 여섯 개만 둔다 — 페이지 마지막이라
        여기서 새 정보를 더하면 방금 읽은 CTA 를 흐린다.

        이름은 칩으로 끊어 놓는다. 한 줄에 가운뎃점으로 이으면 좁은 화면에서 아무 데서나
        줄이 바뀌어 이름이 두 동강 나는데, 칩은 각자 통째로 다음 줄로 내려간다.
      */}
        {/*
          푸터도 같은 사진 위에 얹는다. 배경을 따로 칠하지 않고 위 CTA 와 한 컨테이너를
          공유하므로 사진이 끊기지 않고 페이지 끝까지 이어진다.

          <p>칩은 반투명 흰색이다. 불투명 흰 칩을 쓰면 사진 위에 스티커를 붙인 것처럼 뜨고,
          "사진이 보이게" 하려던 것이 칩 자리에서만 막힌다. 흰 글자 + 흰 테두리로 대비를
          만들고 배경은 사진이 비치게 둔다.
        */}
        <footer className="px-6 pb-14">
          <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-7 text-center">
            <Reveal>
              {/* 심볼은 브랜드색을 유지하고 글자만 흰색으로 — 어두운 사진 위에서 읽혀야 한다. */}
              <LogoLockup className="text-white" />
            </Reveal>

            <Reveal delay={0.06}>
              <div className="flex flex-col items-center gap-4">
                <span className="rounded-full bg-white/15 px-3.5 py-1.5 text-[12px] font-black tracking-[0.01em] text-white">
                  SSAFY 15기 · 구미 1반 · D106
                </span>

                <ul className="m-0 flex list-none flex-wrap justify-center gap-x-2 gap-y-2 p-0">
                  {TEAM.map((name) => (
                    <li key={name}>
                      <span className="block rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-[12.5px] font-bold text-white">
                        {name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </footer>
      </div>
    </div>
  )
}
