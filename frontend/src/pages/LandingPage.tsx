import { useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../data/store'
import { showcaseSheet } from '../data/showcaseSheet'
import Button from '../components/common/ActionButton'
import { IconMoon, IconSun } from '../components/common/Icons'
import IsoVillage from '../features/village/IsoVillage'
import { cn } from '../utils/cn'

/**
 * 소개 페이지.
 *
 * <p>토스(toss.im)의 짜임을 참고했다. 그 화면의 핵심은 장식이 아니라 <b>절제</b>다 —
 * 한 화면에 메시지 하나, 큰 여백, 큰 글자, 그리고 실제 제품 화면. 기능을 카드로 늘어놓는
 * 대신 "무엇이 달라지는가"를 한 문장씩 보여 준다. 색만 파랑에서 우리 빨강으로 바꾸고
 * 나머지 어휘(여백·타이포·순서)는 그대로 가져왔다.
 *
 * <p>사진 자리는 <b>비워 둔다.</b> 직접 촬영한 것을 넣을 예정이라, 임시 이미지를 채워
 * 두면 나중에 무엇을 갈아 끼워야 하는지 찾기 어려워진다. {@link Shot} 이 그 자리를
 * 눈에 띄게 표시한다.
 */

/** 한 화면 = 한 메시지. 위아래로 크게 띄우는 것이 이 페이지의 리듬이다. */
function Section({
  children,
  className,
  tone = 'page',
}: {
  children: ReactNode
  className?: string
  tone?: 'page' | 'sunken'
}) {
  return (
    <section
      className={cn('px-6 py-[clamp(80px,12vh,140px)]', className)}
      style={{ background: tone === 'sunken' ? 'var(--surface-sunken)' : 'var(--surface-page)' }}
    >
      <div className="mx-auto w-full max-w-[1080px]">{children}</div>
    </section>
  )
}

/**
 * 직접 촬영한 사진이 들어갈 자리.
 *
 * <p>비어 있다는 것이 <b>보여야</b> 한다. 회색 사각형만 두면 디자인의 일부처럼 보여
 * 그대로 배포되기 쉽다. 무엇을 넣을 자리인지 적어 두면 빠뜨릴 수 없다.
 */
function Shot({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        'grid place-items-center overflow-hidden rounded-[28px] border border-dashed',
        className,
      )}
      style={{ borderColor: 'var(--border-hairline)', background: 'var(--surface-sunken)' }}
    >
      <div className="px-6 py-10 text-center">
        <p className="muted m-0 text-[12px] font-black tracking-[0.08em]">사진 자리</p>
        <p className="muted m-0 mt-2 text-[13px] font-semibold leading-relaxed">{label}</p>
      </div>
    </div>
  )
}

/** 큰 문장 하나 + 설명 한 줄. 토스가 각 화면에서 반복하는 형태다. */
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
        <p className="m-0 mb-4 text-[13.5px] font-black tracking-[0.02em] text-brand-600 dark:text-brand-400">
          {eyebrow}
        </p>
      )}
      <h2 className="m-0 text-[clamp(28px,4vw,46px)] font-black leading-[1.24] tracking-[-0.045em]">
        {title}
      </h2>
      {body && (
        <p
          className={cn(
            'muted mt-5 text-[clamp(15px,1.5vw,18px)] font-semibold leading-[1.75]',
            align === 'center' ? 'mx-auto max-w-[560px]' : 'max-w-[520px]',
          )}
        >
          {body}
        </p>
      )}
    </div>
  )
}

const STEPS = [
  {
    no: '01',
    title: '큰 목표를 81칸으로 쪼갭니다',
    body: '핵심 목표 하나에서 세부 목표 8개로, 다시 실천 과제 64개로. 막연한 다짐이 오늘 할 일이 됩니다.',
  },
  {
    no: '02',
    title: '매일 과제를 체크합니다',
    body: '완료할 때마다 포인트가 쌓이고, 만다라트 칸이 아래에서부터 차오릅니다.',
  },
  {
    no: '03',
    title: '포인트로 도시를 짓습니다',
    body: '건물을 사서 마을에 세우면, 과제가 진행될수록 건물도 함께 자랍니다.',
  },
]

export default function Landing() {
  const { theme, toggleTheme, session } = useStore()
  const showcase = useMemo(showcaseSheet, [])
  const authed = session === 'authed'
  const home = authed ? '/app' : '/login'

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
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-base font-black text-white">
              만
            </span>
            <strong className="text-[17px] font-black tracking-[-0.04em]">만다린</strong>
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
      <section className="px-6 pb-[clamp(60px,9vh,110px)] pt-[clamp(72px,12vh,150px)]">
        <div className="mx-auto w-full max-w-[1080px] text-center">
          <h1 className="m-0 text-[clamp(36px,6.4vw,76px)] font-black leading-[1.1] tracking-[-0.055em]">
            목표를 세우면,
            <br />
            <span className="text-brand-600 dark:text-brand-400">도시가 자랍니다.</span>
          </h1>

          <p className="muted mx-auto mt-7 max-w-[540px] text-[clamp(15px,1.7vw,19px)] font-semibold leading-[1.7]">
            81칸 만다라트에 매일의 과제를 채우면
            <br className="hidden sm:block" /> 3D 도시의 건물이 한 층씩 완성돼요.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" to={home}>
              {authed ? '내 도시로 가기' : '무료로 시작하기'}
            </Button>
            <Button size="lg" variant="quiet" to="/login">
              둘러보기
            </Button>
          </div>

          {/* 첫 화면의 주인공. 큰 사진 한 장으로 "이게 무엇인지"를 설명 없이 보여 준다. */}
          <Shot
            label="앱 첫 화면 — 오늘의 할 일과 내 마을이 함께 보이는 모습"
            className="mt-[clamp(48px,7vh,88px)] aspect-[16/9] w-full"
          />
        </div>
      </section>

      {/* ───────── 문제 제기 ───────── */}
      <Section tone="sunken">
        <Headline
          align="center"
          title={
            <>
              계획은 늘 세우는데,
              <br />왜 다음 주면 사라질까요.
            </>
          }
          body="할 일이 눈에 보이지 않으면 미루게 됩니다. 만다린은 목표를 81칸으로 나누고, 그 진행을 눈에 보이는 도시로 바꿉니다."
        />
      </Section>

      {/* ───────── 단계 ───────── */}
      <Section>
        <Headline eyebrow="어떻게 쓰나요" title="세 단계면 충분합니다." />

        <div className="mt-[clamp(40px,6vh,72px)] flex flex-col gap-[clamp(48px,7vh,96px)]">
          {STEPS.map((step, i) => (
            <div
              key={step.no}
              className={cn(
                'grid items-center gap-[clamp(28px,4vw,64px)] md:grid-cols-2',
                // 좌우를 번갈아 둔다. 같은 방향으로만 쌓으면 세 칸이 한 덩어리로 읽힌다.
                i % 2 === 1 && 'md:[&>*:first-child]:order-2',
              )}
            >
              <div>
                <span className="text-[13px] font-black tracking-[0.1em] text-brand-600 dark:text-brand-400">
                  {step.no}
                </span>
                <h3 className="m-0 mt-3 text-[clamp(22px,2.8vw,32px)] font-black leading-[1.3] tracking-[-0.04em]">
                  {step.title}
                </h3>
                <p className="muted m-0 mt-4 max-w-[440px] text-[15px] font-semibold leading-[1.75]">
                  {step.body}
                </p>
              </div>

              <Shot label={`${step.no} 단계 화면`} className="aspect-[4/3] w-full" />
            </div>
          ))}
        </div>
      </Section>

      {/* ───────── 마을 ───────── */}
      <Section tone="sunken">
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
          body="과제 하나가 건물 한 채입니다. 빈 땅에서 공사, 완공까지 진행률이 그대로 보입니다."
        />

        {/*
          여기만 사진 자리가 아니라 실제 마을을 그린다. 이 서비스가 무엇을 만들어 주는지
          보여 주는 대목이라, 준비된 사진보다 진짜 화면이 낫다.
        */}
        <div
          className="card mx-auto mt-[clamp(40px,6vh,72px)] max-w-[820px] overflow-hidden p-0"
          style={{ boxShadow: 'var(--shadow-card)' }}
        >
          <IsoVillage sheet={showcase} compact className="aspect-[16/10] w-full" />
        </div>

        <div className="mx-auto mt-8 flex max-w-[820px] flex-wrap justify-center gap-x-7 gap-y-3 text-[13px] font-bold">
          {[
            ['#e8590c', '완공'],
            ['#f4a261', '공사 중'],
            ['#c9d3da', '빈 땅'],
          ].map(([color, label]) => (
            <span key={label} className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-sm"
                style={{ background: color }}
                aria-hidden="true"
              />
              {label}
            </span>
          ))}
        </div>
      </Section>

      {/* ───────── 마무리 ───────── */}
      <Section>
        <div className="text-center">
          <h2 className="m-0 text-[clamp(30px,4.6vw,52px)] font-black leading-[1.2] tracking-[-0.05em]">
            첫 칸을 채워 볼까요?
          </h2>
          <p className="muted mx-auto mt-5 max-w-[460px] text-[clamp(15px,1.5vw,18px)] font-semibold leading-[1.75]">
            카카오 계정만 있으면 바로 시작할 수 있어요.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" to={home}>
              {authed ? '내 도시로 가기' : '무료로 시작하기'}
            </Button>
          </div>
        </div>
      </Section>

      <footer className="border-t px-6 py-10" style={{ borderColor: 'var(--border-hairline)' }}>
        <div className="mx-auto flex w-full max-w-[1080px] flex-wrap items-center gap-x-6 gap-y-3">
          <span className="text-[13px] font-black tracking-[-0.03em]">만다린</span>
          <span className="muted text-[12.5px] font-semibold">목표를 도시로 짓다</span>
          <Link
            to="/login"
            className="muted ml-auto text-[12.5px] font-bold no-underline hover:text-brand-600"
          >
            시작하기
          </Link>
        </div>
      </footer>
    </div>
  )
}
