import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../data/store'
import { showcaseSheet } from '../data/showcaseSheet'
import { auth } from '../api/endpoints'
import type { TestAccountDto } from '../api/types'
import Button from '../components/common/ActionButton'
import { IconChevronDown } from '../components/common/Icons'
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
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 아이디·비밀번호 칸을 펼쳤는지. **기본 닫힘.**
   *
   * <p>이 화면에서 실제 사용자가 쓸 입구는 카카오 하나뿐인데, 입력 칸 두 개가 처음부터
   * 펼쳐져 있으면 그쪽이 <b>본 로그인처럼</b> 보인다. 접어 두면 필요한 사람만 열어 쓴다.
   */
  const [testerOpen, setTesterOpen] = useState(false)
  const panelId = useId()
  const idInputRef = useRef<HTMLInputElement>(null)

  /*
    펼치면 첫 칸으로 초점을 옮긴다. 여는 이유가 입력하기 위해서라, 열어 놓고 다시 눌러야
    하면 동작이 한 번 더 늘어난다. 접을 때는 옮기지 않는다 — 접는 길은 여는 버튼뿐이고
    그때 초점은 이미 그 버튼에 있다.
  */
  useEffect(() => {
    if (testerOpen) idInputRef.current?.focus()
  }, [testerOpen])

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

  const submitTesterLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    if (busy) return

    setBusy(true)
    setError(null)
    // 성공하면 화면이 통째로 넘어가므로 여기로 돌아오지 않는다. 실패했을 때만 잠금을 푼다.
    const ok = await loginAsTester(loginId, password)
    if (!ok) {
      /*
        어느 쪽이 틀렸는지 말하지 않는다 — 서버가 알려주지 않고, 알려주면 어떤 아이디가
        실재하는지 응답으로 알아낼 수 있게 된다.
      */
      setError('아이디 또는 비밀번호가 맞지 않아요.')
      setBusy(false)
    }
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
            이건 평가용이라, 구분선 아래로 내리고 접어 둔다. 그렇다고 숨기지도 않는다 —
            숨긴 기능은 켜 뒀는지 확인하려고 매번 코드를 열게 된다.

            <p>여는 버튼과 보내는 버튼이 <b>서로 다르게 생겨야 한다.</b> 둘 다 채운 버튼이면
            무엇을 눌러야 로그인이 되는지 알 수 없다. 여는 쪽은 글자와 꺾쇠만 둔 줄이고,
            보내는 쪽만 테두리와 배경을 가진 버튼이다.
          */}
          {testers.length > 0 && (
            <div
              className="mt-9 border-t pt-7"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <button
                type="button"
                onClick={() => {
                  setTesterOpen((open) => !open)
                  // 접었다 다시 열었을 때 지난 실패 문구가 남아 있지 않게 한다.
                  setError(null)
                }}
                aria-expanded={testerOpen}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-2 border-0 bg-transparent p-0 text-left text-[13.5px] font-extrabold tracking-[-0.02em] text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
              >
                테스트 계정으로 로그인
                <IconChevronDown
                  className={cn(
                    'size-4 shrink-0 transition-transform duration-300 ease-out motion-reduce:transition-none',
                    testerOpen && 'rotate-180',
                  )}
                />
              </button>

              {/*
                높이를 <b>`grid-template-rows` 로</b> 편다(0fr → 1fr).

                <p>`max-height` 로 하면 실제 높이보다 넉넉한 값을 손으로 박아야 하고, 그 값과
                실제 높이의 차이만큼 애니메이션이 허공에서 시작해 끝이 뚝 끊긴다. 오류 문구가
                한 줄 붙었다 떨어지는 것만으로도 높이가 달라지는 자리라 더 그렇다.
                `0fr → 1fr` 은 내용이 몇 픽셀이든 브라우저가 재서 채운다.

                <p>`inert` 를 반드시 준다. 접혀 있어도 칸은 DOM 에 그대로 있어서, 없으면
                <b>보이지도 않는 입력 칸에 Tab 으로 들어가고</b> 브라우저 자동완성도 붙는다.
              */}
              <div
                id={panelId}
                className={cn(
                  'grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none',
                  testerOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                )}
              >
                <div className="overflow-hidden" inert={!testerOpen}>
                  <form onSubmit={(event) => void submitTesterLogin(event)} className="pt-4">
                    {/*
                      아이디 목록만 보여준다. 비밀번호는 서버가 내려주지 않고 계정을 나눠 주는
                      사람이 따로 전한다 — 화면에 적어 두면 로그인 절차 자체가 의미를 잃는다.
                    */}
                    <p className="muted m-0 text-[11.5px] font-semibold">
                      아이디: {testers.map((tester) => tester.loginId).join(' · ')}
                    </p>

                    <div className="mt-3 flex flex-col gap-2">
                      <input
                        ref={idInputRef}
                        name="testLoginId"
                        value={loginId}
                        onChange={(event) => setLoginId(event.target.value)}
                        placeholder="아이디"
                        autoComplete="username"
                        aria-label="테스트 계정 아이디"
                        className="h-[46px] w-full rounded-xl border px-3.5 text-[13.5px] font-semibold outline-none transition focus:border-brand-400"
                        style={{
                          borderColor: 'var(--border-hairline)',
                          background: 'var(--surface-sunken)',
                        }}
                      />
                      <input
                        name="testLoginPassword"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="비밀번호"
                        autoComplete="current-password"
                        aria-label="테스트 계정 비밀번호"
                        className="h-[46px] w-full rounded-xl border px-3.5 text-[13.5px] font-semibold outline-none transition focus:border-brand-400"
                        style={{
                          borderColor: 'var(--border-hairline)',
                          background: 'var(--surface-sunken)',
                        }}
                      />
                    </div>

                    {error && (
                      <p className="m-0 mt-2.5 text-[12px] font-bold text-brand-600 dark:text-brand-400">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={busy || loginId.trim() === '' || password === ''}
                      className={cn(
                        'mt-3 grid h-[46px] w-full place-items-center rounded-xl border text-[13.5px] font-extrabold transition',
                        'hover:-translate-y-px hover:border-brand-400 hover:text-brand-600',
                        'disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 disabled:hover:border-[var(--border-hairline)]',
                      )}
                      style={{
                        borderColor: 'var(--border-hairline)',
                        background: 'var(--surface-sunken)',
                      }}
                    >
                      {busy ? (
                        <span className="size-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      ) : (
                        '로그인하기'
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
