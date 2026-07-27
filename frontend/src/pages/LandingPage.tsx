import { Link } from 'react-router-dom'
import PublicHeader from '../components/common/PublicHeader'
import IsometricCity from '../components/landing/IsometricCity'

const STEPS = [
  {
    icon: '🧩',
    iconBg: '#ECFBF1',
    title: '1. 81?칸 만다라트 생성',
    description: '핵심 목표를 8개 세부 목표로, 다시 8개 실천 과제로 잘게 나눠요.',
  },
  {
    icon: '✅',
    iconBg: '#E9FAF6',
    title: '2. 매일 과제 완료',
    description: '오늘 할 일을 체크하면 만다라트 칸이 채워지고 포인트가 쌓여요.',
  },
  {
    icon: '🏙️',
    iconBg: '#FFF0F1',
    title: '3. 나만의 도시 완공',
    description: '포인트로 건물을 사서 도시에 배치하고, 친구의 마을도 구경해요.',
  },
] as const

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F4F7F9] text-slate-950">
      <PublicHeader />

      <main className="mx-auto w-full max-w-[1240px] px-5 py-12 sm:px-8 lg:py-16">
        <section className="grid overflow-hidden rounded-[22px] bg-[#FFF1EC] px-7 py-10 sm:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-12 lg:px-16 lg:py-14">
          <div className="z-10">
            <span className="inline-flex rounded-full bg-[#FFF0B8] px-4 py-1.5 text-xs font-bold text-[#D48B33]">
              목표를 도시로 짓다(약간 어색한거같음)
            </span>
            <h1 className="mt-5 text-[34px] font-black leading-[1.18] tracking-[-0.055em] sm:text-[42px] lg:text-[46px]">
              매일 작은 실천이
              <br />
              한 채(하나)의 건물이 됩니다.
            </h1>
            <p className="mt-5 max-w-[480px] text-[15px] font-semibold leading-7 tracking-[-0.02em] text-slate-400 sm:text-base">
              만다라트로 큰 목표를 잘게 나누고, 과제를 완료할 때마다
              <br className="hidden sm:block" /> 나의 3D 만다라트가 완성돼요.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex rounded-xl bg-[#70CFA5] px-8 py-3.5 text-lg font-extrabold text-white no-underline shadow-sm transition hover:-translate-y-0.5 hover:bg-[#5FC397] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#50AA88]"
            >
              시작하기
            </Link>
          </div>

          <div className="mt-10 grid min-h-[280px] place-items-center rounded-2xl bg-white/95 lg:mt-0">
            <IsometricCity />
          </div>
        </section>

        <section className="pb-6 pt-16 sm:pt-20">
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-[-0.04em] sm:text-[28px]">
              3단계면 충분해요
            </h2>
            <p className="mt-3 text-sm font-semibold text-slate-400 sm:text-[15px]">
              목표를 세우고, 매일 실천하고, 도시가 자라는 걸 지켜보세요.
            </p>
          </div>

          <ol className="mt-11 grid list-none gap-5 p-0 md:grid-cols-3">
            {STEPS.map((step) => (
              <li
                key={step.title}
                className="min-h-[190px] rounded-2xl bg-white p-8 shadow-[0_6px_20px_rgba(77,92,107,0.04)]"
              >
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-xl text-xl"
                  style={{ backgroundColor: step.iconBg }}
                >
                  {step.icon}
                </span>
                <h3 className="mt-5 text-base font-extrabold tracking-[-0.025em]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-6 tracking-[-0.02em] text-slate-400">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  )
}
