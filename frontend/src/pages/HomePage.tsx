import { useState } from 'react'
import Header from '../components/common/Header'

type DailyTask = {
  id: number
  title: string
  completed: boolean
}

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

export default function HomePage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS)
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
    <div className="min-h-screen bg-[#F4F7F9] text-slate-950">
      <Header />

      <main className="mx-auto grid w-full max-w-[1440px] gap-3 px-5 py-7 sm:px-8 lg:grid-cols-[330px_minmax(0,1fr)] lg:gap-4">
        <aside className="flex min-h-[620px] flex-col rounded-2xl bg-white p-6 sm:p-7">
          <div>
            <h1 className="text-lg font-extrabold tracking-[-0.035em]">오늘의 할 일</h1>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              매일 반복, 오늘 마감 과제
            </p>
          </div>

          <ul className="mt-8 space-y-2.5 p-0">
            {tasks.map((task) => (
              <li key={task.id} className="list-none">
                <label
                  className={[
                    'flex min-h-[54px] cursor-pointer items-center gap-4 rounded-xl px-5 transition-colors',
                    task.completed
                      ? 'bg-[#FAECD3] text-slate-400'
                      : 'bg-[#F1F4F8] text-slate-950 hover:bg-[#EAEFF4]',
                  ].join(' ')}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                    className="peer sr-only"
                  />
                  <span
                    className={[
                      'grid size-5 shrink-0 place-items-center rounded-full border-2',
                      task.completed
                        ? 'border-[#DE8433] bg-[#DE8433] text-white'
                        : 'border-slate-300 bg-white',
                    ].join(' ')}
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
                    className={[
                      'text-sm font-bold tracking-[-0.02em]',
                      task.completed ? 'line-through decoration-slate-400' : '',
                    ].join(' ')}
                  >
                    {task.title}
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-8">
            <div className="grid grid-cols-[1fr_88px] gap-2.5">
              <button
                type="button"
                className="h-12 cursor-pointer rounded-xl border-0 bg-[#72CEA1] text-sm font-extrabold text-white transition hover:bg-[#5EC492]"
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
              className="mt-6 h-12 w-full cursor-pointer rounded-xl border-0 bg-[#72CEA1] text-sm font-extrabold text-white transition hover:bg-[#5EC492]"
            >
              새 만다라트 만들기
            </button>
          </div>
        </aside>

        <section className="min-h-[620px] rounded-[22px] bg-white p-6 sm:p-8">
          <div>
            <h2 className="text-xl font-extrabold tracking-[-0.035em]">내 만다라트 도시</h2>
            <p className="mt-2 text-sm font-semibold text-slate-400">
              화살표로 내 다른 만다라트 미리 보기
            </p>
          </div>

          <div
            aria-label="사용자의 만다라트 도시 미리보기 영역"
            className="relative mt-5 grid min-h-[440px] place-items-center overflow-hidden rounded-[22px] bg-[#E4ECFF] sm:min-h-[500px]"
          >
            <img
              src={previewImageSrc}
              alt={hasCityImage ? '내 만다라트 도시' : '만다라트 도시 이미지를 불러오지 못했습니다'}
              onError={() => setImageLoadFailed(true)}
              className={[
                'max-h-[78%] object-contain',
                hasCityImage ? 'w-[78%]' : 'w-56 max-w-[55%] rounded-xl',
              ].join(' ')}
            />
            <button
              type="button"
              aria-label="이전 만다라트 보기"
              className="absolute left-4 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-white text-slate-400 shadow-sm transition hover:text-slate-700 sm:left-5"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              aria-label="다음 만다라트 보기"
              className="absolute right-4 top-1/2 grid size-11 -translate-y-1/2 cursor-pointer place-items-center rounded-full border-0 bg-white text-slate-400 shadow-sm transition hover:text-slate-700 sm:right-5"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}
