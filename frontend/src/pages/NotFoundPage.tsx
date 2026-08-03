import { useStore } from '../data/store'
import Button from '../components/common/ActionButton'

export default function NotFound() {
  const { session } = useStore()

  return (
    <div
      className="grid min-h-dvh place-items-center px-6 py-16"
      style={{ background: 'var(--surface-page)' }}
    >
      <div className="w-full max-w-md text-center">
        <span
          aria-hidden="true"
          className="mx-auto grid size-16 place-items-center rounded-3xl text-3xl"
          style={{ background: 'var(--surface-sunken)' }}
        >
          🧭
        </span>
        <h1 className="mt-6 text-2xl font-extrabold tracking-[-0.04em]">
          이 주소에는 아무것도 없어요
        </h1>
        <p className="muted mt-3 text-[13.5px] font-semibold leading-relaxed">
          주소가 바뀌었거나 삭제된 화면입니다. 아래 버튼으로 돌아가세요.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Button to={session === 'authed' ? '/app' : '/'}>
            {session === 'authed' ? '홈으로' : '소개 페이지로'}
          </Button>
          {session === 'authed' && (
            <Button to="/app/sheets" variant="secondary">
              내 만다라트
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
