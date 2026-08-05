import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { showcaseSheet } from '../data/showcaseSheet'
import { auth } from '../api/endpoints'
import type { TestAccountDto } from '../api/types'
import Button from '../components/common/ActionButton'
import Logo from '../components/common/Logo'
import IsoVillage from '../features/village/IsoVillage'
import { cn } from '../utils/cn'

export default function Login() {
  const { startKakaoLogin, enterMockSession, loginAsTester } = useStore()
  const navigate = useNavigate()
  const showcase = useMemo(showcaseSheet, [])

  /*
    테스트 계정 입구.

    목록을 받아오지 못하면(백엔드 스위치가 꺼져 404, 또는 백엔드를 안 띄운 로컬) 입구를 아예
    그리지 않는다. 오류를 띄우지 않는 이유: 이건 실패가 아니라 <b>그 기능이 없는 환경</b>이다.
    정식 서비스에서 스위치를 끄면 이 화면도 저절로 카카오 로그인만 남는다.
  */
  const [testers, setTesters] = useState<TestAccountDto[]>([])
  const [pendingSlot, setPendingSlot] = useState<number | null>(null)

  useEffect(() => {
    let alive = true
    auth
      .testAccounts()
      .then((list) => {
        if (alive) setTesters(list)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])

  const enterAsTester = async (slot: number) => {
    if (pendingSlot !== null) return
    setPendingSlot(slot)
    // 성공하면 화면이 통째로 넘어가므로 여기로 돌아오지 않는다. 실패했을 때만 잠금을 푼다.
    const ok = await loginAsTester(slot)
    if (!ok) setPendingSlot(null)
  }

  return (
    /*
      7:3. 로그인 자체는 버튼 하나라 넓은 자리가 필요 없다. 반씩 나누면 오른쪽 절반이
      대부분 빈 여백이 되어, 정작 눈에 남는 건 텅 빈 화면이 된다.
    */
    <div className="grid min-h-dvh lg:grid-cols-[7fr_3fr]">
      {/* 왼쪽 — 서비스가 무엇인지 */}
      {/*
        브랜드 원색(brand-600 → 800)을 그대로 깔면 화면 절반이 고채도 빨강이라 눈이 아프다.
        같은 색상각(hue)은 유지한 채 채도만 내리고 조금 어둡게 눌렀다 — 큰 면적은 밝히는
        것보다 낮추는 쪽이 편하다. 다만 너무 빼면 갈색이 되어 브랜드색으로 읽히지 않으므로,
        원색(S90/79)과 완전히 죽인 값(S48/45) 사이인 S62/58 로 잡았다.

        ⚠️ 여기서만 바꾼다. `--color-brand-*` 토큰을 건드리면 버튼·강조 텍스트까지 같이
        흐려져 앱 전체의 대비가 무너진다.
      */}
      <section
        className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex"
        style={{ background: 'linear-gradient(150deg, #ba482c, #71291e)' }}
      >
        <div
          aria-hidden="true"
          className="absolute -right-24 top-10 size-80 rounded-full bg-white/[.08]"
        />

        <div className="relative pt-6">
          {/* currentColor 를 타는 인라인 심볼이라 붉은 패널 위에서는 흰색으로 나온다. */}
          <span className="flex items-center gap-2.5 text-white">
            <Logo flat className="size-9 shrink-0" />
            <strong className="text-[19px] font-black tracking-[-0.04em]">만다린</strong>
          </span>

          <h1 className="m-0 mt-9 text-[44px] font-black leading-[1.14] tracking-[-0.05em] text-white">
            목표를 세우면,
            <br />
            도시가 자랍니다.
          </h1>
          {/* 배경을 어둡게 눌렀으니 흐린 흰색은 한 단계 올려 준다 — 대비가 같이 떨어진다. */}
          <p className="mt-5 max-w-[440px] text-[15px] font-semibold leading-[1.7] text-white/85">
            81칸 만다라트에 매일의 과제를 채우면 3D 도시의 건물이 한 층씩 완성돼요.
          </p>
        </div>

        {/*
          남은 아래 공간을 마을로 채운다. 마을이 자기 하늘을 칠하면 붉은 그라데이션 위에
          밝은 사각형 판이 떠 버리므로(경계가 그대로 보인다) `transparent` 로 하늘을 끄고
          배경이 그대로 비치게 한다. 아래쪽은 마스크로 그라데이션에 잠기게 해서, 얹어 둔
          그림이 아니라 배경에서 솟아난 것처럼 보이게 한다.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none relative -mx-12 -mb-12 mt-8"
          style={{
            maskImage: 'linear-gradient(to bottom, #000 66%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, #000 66%, transparent 100%)',
            /*
              건물 8색도 이 화면에서만 눌러 준다. 도메인 색은 만다라트 칸·리포트 막대가
              함께 쓰는 공용 팔레트라 값을 고치면 앱 전체가 흐려지므로, 팔레트는 그대로 두고
              여기서 필터로만 낮춘다.
            */
            filter: 'saturate(0.8) brightness(0.98)',
          }}
        >
          <IsoVillage
            sheet={showcase}
            compact
            transparent
            className="h-[clamp(260px,42vh,460px)] w-full"
          />
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

          {/*
            테스트 계정 입구.

            카카오 버튼과 <b>같은 무게로 두지 않는다.</b> 실제 사용자가 쓸 입구는 위의 하나뿐이고
            이건 평가용이라, 구분선 아래로 내리고 글자도 한 단계 작게 잡았다. 그렇다고 숨기지도
            않는다 — 숨긴 기능은 켜 뒀는지 확인하려고 매번 코드를 열게 된다.
          */}
          {testers.length > 0 && (
            <div className="mt-9 border-t pt-7" style={{ borderColor: 'var(--border-hairline)' }}>
              <h3 className="m-0 text-[13.5px] font-extrabold tracking-[-0.02em]">
                테스트 계정으로 둘러보기
              </h3>
              <p className="muted m-0 mt-1.5 text-[12px] font-semibold leading-relaxed">
                만다라트 2장과 건물이 채워진 계정입니다. 카카오 로그인과 똑같이 시작해요.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {testers.map((tester) => {
                  const busy = pendingSlot === tester.slot
                  return (
                    <button
                      key={tester.slot}
                      type="button"
                      onClick={() => void enterAsTester(tester.slot)}
                      disabled={pendingSlot !== null}
                      title={`친구 코드 ${tester.uuid}`}
                      className={cn(
                        'grid h-[46px] place-items-center rounded-xl border text-[13px] font-extrabold transition',
                        'hover:-translate-y-px hover:border-brand-400 hover:text-brand-600',
                        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
                      )}
                      style={{
                        borderColor: 'var(--border-hairline)',
                        background: 'var(--surface-sunken)',
                      }}
                    >
                      {busy ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      ) : (
                        tester.name
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
