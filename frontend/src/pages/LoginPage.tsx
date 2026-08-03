import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { showcaseSheet } from '../data/showcaseSheet'
import Button from '../components/common/ActionButton'
import IsoVillage from '../features/village/IsoVillage'

export default function Login() {
  const { startKakaoLogin, enterMockSession } = useStore()
  const navigate = useNavigate()
  const showcase = useMemo(showcaseSheet, [])

  return (
    /*
      7:3. 로그인 자체는 버튼 하나라 넓은 자리가 필요 없다. 반씩 나누면 오른쪽 절반이
      대부분 빈 여백이 되어, 정작 눈에 남는 건 텅 빈 화면이 된다.
    */
    <div className="grid min-h-dvh lg:grid-cols-[7fr_3fr]">
      {/* 왼쪽 — 서비스가 무엇인지 */}
      <section
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{
          background: 'linear-gradient(150deg, var(--color-brand-600), var(--color-brand-800))',
        }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-24 top-10 size-80 rounded-full bg-white/[.08]"
        />

        <div className="relative pt-6">
          <h1 className="m-0 text-[44px] font-black leading-[1.14] tracking-[-0.05em] text-white">
            목표를 세우면,
            <br />
            도시가 자랍니다.
          </h1>
          <p className="mt-5 max-w-[440px] text-[15px] font-semibold leading-[1.7] text-white/75">
            81칸 만다라트에 매일의 과제를 채우면 3D 도시의 건물이 한 층씩 완성돼요.
          </p>
        </div>

        {/*
          남은 아래 공간을 마을로 채운다. 그라데이션 위에 그대로 얹으면 파스텔 마을이
          붉은 배경과 부딪히므로, 마을 자신의 하늘색 배경을 그대로 살리되 아래쪽으로
          갈수록 그라데이션에 잠기도록 마스크를 씌운다 — 배경 위에 떠 있는 판이 아니라
          거기서 솟아난 것처럼 보인다.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative -mx-12 -mb-12 mt-8"
          style={{
            maskImage: 'linear-gradient(to bottom, #000 58%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 58%, transparent 100%)',
          }}
        >
          <IsoVillage sheet={showcase} compact className="h-[clamp(260px,42vh,460px)] w-full" />
        </div>
      </section>

      {/* 오른쪽 — 입장 방법 */}
      <section
        className="flex flex-col items-center justify-center px-8 py-14"
        style={{ background: 'var(--surface-card)' }}
      >
        <div className="w-full max-w-[360px]">
          <h2 className="m-0 text-2xl font-extrabold tracking-[-0.04em]">시작하기</h2>
          <p className="muted m-0 mt-3 text-[13.5px] font-semibold leading-relaxed">
            카카오 계정으로 로그인하면 자동으로 가입됩니다.
          </p>

          <button
            type="button"
            onClick={startKakaoLogin}
            className="mt-7 flex h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl border-0 bg-[#FEE500] text-[15.5px] font-extrabold text-[#181600] transition hover:-translate-y-0.5 hover:brightness-[.97]"
          >
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true" fill="currentColor">
              <path d="M12 3C6.9 3 2.8 6.3 2.8 10.3c0 2.6 1.7 4.9 4.3 6.2l-1.1 4c-.1.4.3.7.6.5l4.7-3.1c.2 0 .5.1.7.1 5.1 0 9.2-3.3 9.2-7.7S17.1 3 12 3Z" />
            </svg>
            카카오로 로그인하기
          </button>

          <Button
            variant="quiet"
            full
            className="mt-3"
            onClick={() => {
              enterMockSession()
              navigate('/app', { replace: true })
            }}
          >
            목업 데이터로 화면 보기
          </Button>
        </div>
      </section>
    </div>
  )
}
