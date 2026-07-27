import { API_BASE_URL } from '../api'
import PublicHeader from '../components/common/PublicHeader'

const CITY_BARS = [
  { height: 58, color: '#59E1CB' },
  { height: 77, color: '#FFBC24' },
  { height: 49, color: '#70B8FF' },
  { height: 103, color: '#FF7085' },
  { height: 70, color: '#B5A1FF' },
  { height: 88, color: '#59DFC9' },
  { height: 39, color: '#F49BCC' },
  { height: 75, color: '#FFBC24' },
  { height: 64, color: '#B5A1FF' },
  { height: 54, color: '#70B8FF' },
] as const

export default function LoginPage() {
  const handleKakaoLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth2/authorization/kakao`
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] text-slate-950">
      <PublicHeader />

      <main className="grid min-h-[calc(100vh-72px)] place-items-center px-5 py-12 sm:px-8">
        <section className="grid w-full max-w-[1040px] overflow-hidden shadow-[0_12px_35px_rgba(57,72,86,0.04)] md:grid-cols-[0.9fr_1.1fr]">
          <div className="flex min-h-[450px] flex-col bg-[#FFF1EC] px-9 py-12 sm:px-12 md:min-h-[510px] md:px-14 md:py-16">
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-[9px] bg-[#61B5A7] text-sm font-extrabold text-white">
                만
              </span>
              <span className="text-lg font-extrabold tracking-[-0.04em]">만다린</span>
            </div>

            <h1 className="mt-7 text-[35px] font-black leading-[1.18] tracking-[-0.055em] sm:text-[39px]">
              목표를 세우면,
              <br />
              <span className="text-[#F05A17]">도시가 자랍니다.</span>
            </h1>
            <p className="mt-5 text-[15px] font-bold leading-6 tracking-[-0.02em] text-slate-400">
              81(64)칸 만다라트에 매일의 과제를 채우면(약간 어색)
              <br />
              3D 도시의 건물이 한 층씩 완공(?)돼요.
            </p>

            <div
              aria-label="로그인쪽 막대 일러스트"
              role="img"
              className="mt-auto flex h-28 items-end justify-between gap-2 px-1"
            >
              {CITY_BARS.map((bar, index) => (
                <span
                  key={`${bar.height}-${index}`}
                  className="block w-full max-w-7 rounded-t-[7px]"
                  style={{ height: bar.height, backgroundColor: bar.color }}
                />
              ))}
            </div>
          </div>

          <div className="flex min-h-[390px] flex-col items-center justify-center bg-white px-8 py-14 text-center sm:px-14 md:min-h-[510px]">
            <h2 className="text-xl font-extrabold tracking-[-0.035em] sm:text-[22px]">
              카카오 계정으로 간편하게 로그인 하세요.
            </h2>

            <button
              type="button"
              onClick={handleKakaoLogin}
              className="mt-10 flex h-16 w-full max-w-[450px] cursor-pointer items-center justify-center rounded-2xl border-0 bg-[#FEE500] text-base font-extrabold text-[#181600] transition hover:bg-[#F5DC00] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E7C900]"
            >
              카카오로 로그인하기
            </button>

            <p className="mt-6 text-xs font-semibold text-slate-400">
              카카오 로그인 시 자동으로 가입돼요.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
