import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/common/Header'
import { cn } from '../utils/cn'

type DailyTask = {
  id: number
  title: string
  completed: boolean
}

// TODO: 백엔드 연동 전까지 쓰는 목업 데이터. API 연결 시 서버 응답으로 교체.
const INITIAL_TASKS: DailyTask[] = [
  { id: 1, title: '주 3회 유산소', completed: false },
  { id: 2, title: '물 2L 마시기', completed: true },
  { id: 3, title: '스트레칭 10분', completed: false },
  { id: 4, title: '감사일기 쓰기', completed: false },
  { id: 5, title: '11시 취침', completed: false },
]

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 fill-none stroke-current"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={direction === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  )
}

/** 로그인 후 홈 화면 (`/home`) — 오늘의 할 일 체크리스트 + 내 마을 도시 미리보기. */
export default function HomePage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  // TODO: 마을 3D 씬을 구운 썸네일 URL로 채울 자리. 아직 연동 전이라 항상 null →
  // 아래에서 폴백 이미지(image-load-error.png)를 보여준다.
  const [cityImageUrl] = useState<string | null>(null)
  const [imageLoadFailed, setImageLoadFailed] = useState(false)
  const hasCityImage = Boolean(cityImageUrl) && !imageLoadFailed
  const previewImageSrc = hasCityImage
    ? cityImageUrl!
    : '/images/image-load-error.png'

  const toggleTask = (taskId: number) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  const resetTasks = () => {
    setTasks(INITIAL_TASKS)
  }

  return (
    <div className="page-shell">
      <Header />

      <main
        className={cn(
          'mx-auto grid w-full max-w-[1440px] gap-3 px-5 py-7',
          'sm:px-8',
          'lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-4',
        )}
      >
        <aside className="flex min-h-[620px] flex-col rounded-2xl bg-white p-6 sm:p-7">
          <div>
            <h1 className="text-lg font-extrabold tracking-[-0.035em]">오늘의 할 일</h1>
            <p className="subtitle">
              매일 반복, 오늘 마감 과제
            </p>
          </div>

          <ul className="mt-8 space-y-2.5 p-0">
            {tasks.map((task) => (
              <li key={task.id} className="list-none">
                <label
                  className={cn(
                    'flex min-h-[54px] cursor-pointer items-center gap-4 rounded-xl px-5 transition-colors',
                    task.completed
                      ? 'bg-[#FAECD3] text-slate-400'
                      : 'bg-[#F1F4F8] text-slate-950 hover:bg-[#EAEFF4]',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      'grid size-5 shrink-0 place-items-center rounded-full border-2',
                    task.completed
                        ? 'border-warning bg-warning text-white'
                        : 'border-slate-300 bg-white',
                    )}
                    aria-hidden="true"
                  >
                    {task.completed && (
                      <svg
                        viewBox="0 0 16 16"
                        className="size-3 fill-none stroke-current"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m3 8 3 3 7-7" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-sm font-bold tracking-[-0.02em]',
                      task.completed && 'line-through decoration-slate-400',
                    )}
                  >
                    {task.title}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-8">
            {/* TODO: 체크 상태 저장 API 연동 후 적용하기에 onClick 연결 */}
            <div className="grid grid-cols-[1fr_88px] gap-2.5">
              <button
                type="button"
                className="btn-primary"
              >
                적용하기
              </button>
              <button
                type="button"
                onClick={resetTasks}
                className="h-12 cursor-pointer rounded-xl border border-slate-300 bg-white text-sm font-bold text-slate-400 transition hover:bg-slate-50"
              >
                취소
              </button>
            </div>
            <button
              type="button"
              onClick={() => navigate('/sheet/create')}
              className="btn-primary mt-6 w-full"
            >
              새 만다라트 만들기
            </button>
          </div>
        </aside>

        <section className="min-h-[620px] rounded-[22px] bg-white p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-extrabold tracking-[-0.035em]">내 만다라트 도시</h2>
            <p className="subtitle">
              화살표로 내 다른 만다라트 미리 보기
            </p>
          </div>

          <div
            aria-label="사용자의 만다라트 도시 미리보기 영역"
            className={cn(
              'relative mt-5 grid min-h-[440px] place-items-center',
              'overflow-hidden rounded-[22px] bg-[#E4ECFF]',
              'sm:min-h-[500px]',
            )}
          >
            <img
              src={previewImageSrc}
              alt={hasCityImage ? '내 만다라트 도시' : '만다라트 도시 이미지를 불러오지 못했습니다'}
              onError={() => setImageLoadFailed(true)}
              className={cn(
                'max-h-[78%] object-contain',
                hasCityImage ? 'w-[78%]' : 'w-56 max-w-[55%] rounded-xl',
              )}
            />
            <button
              type="button"
              aria-label="이전 만다라트 보기"
              className={cn(
                'icon-btn',
                'absolute left-4 top-1/2',
                'size-11 -translate-y-1/2',
                'bg-white text-slate-400 shadow-sm',
                'hover:text-slate-700',
                'sm:left-5',
              )}
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="다음 만다라트 보기"
              className={cn(
                'icon-btn',
                'absolute right-4 top-1/2',
                'size-11 -translate-y-1/2',
                'bg-white text-slate-400 shadow-sm',
                'hover:text-slate-700',
                'sm:right-5',
              )}
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
