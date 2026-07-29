import { Link } from 'react-router-dom'

/**
 * 어떤 라우트에도 걸리지 않은 주소에서 보여주는 화면 (`*`).
 *
 * 이게 없으면 오타 URL이나 아직 안 만든 페이지에서 Routes가 아무것도 렌더하지 않아
 * 새하얀 화면만 남는다 — 사용자는 로딩이 멈춘 건지 길을 잘못 든 건지 알 수 없다.
 *
 * 로그인 여부를 모르는 자리라 공통 헤더를 쓰지 않는다. 대신 로그인이 필요한 홈과
 * 누구나 볼 수 있는 랜딩을 둘 다 열어 둔다.
 */
export default function NotFoundPage() {
  return (
    <div className="page-shell grid min-h-screen place-items-center px-6">
      <main className="text-center">
        <p className="m-0 text-5xl font-extrabold tracking-[-0.04em] text-slate-300">
          404
        </p>
        <h1 className="mt-4 text-xl font-extrabold tracking-[-0.035em]">
          찾을 수 없는 페이지예요
        </h1>
        <p className="subtitle">
          주소가 바뀌었거나 아직 준비 중인 화면일 수 있어요.
        </p>

        <div className="mt-8 flex justify-center gap-2.5">
          <Link
            to="/home"
            className="btn-primary grid place-items-center px-6 no-underline"
          >
            홈으로 가기
          </Link>
          <Link
            to="/"
            className="btn-secondary grid place-items-center px-6 no-underline"
          >
            처음 화면
          </Link>
        </div>
      </main>
    </div>
  )
}
