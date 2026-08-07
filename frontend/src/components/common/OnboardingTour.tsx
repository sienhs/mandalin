import { useState, type ReactNode } from 'react'
import { useStore } from '../../data/store'
import { useTour } from '../../features/tour/TourProvider'
import Button from './ActionButton'
import { IconCheck } from './Icons'
import Modal from './Modal'
import { domainColor } from './Primitives'
import { cn } from '../../utils/cn'

/**
 * ② 카드에 넣을 <b>홈의 "오늘의 할 일"</b> 예시.
 *
 * <p>세부 목표 이름은 ①에서 든 예(건강 → 운동 · 식단 · 수면)와 맞춰 둔다. 색도 실제 화면과
 * 같은 규칙(`domainColor(위치)`)으로 뽑으므로, 홈에 처음 들어갔을 때 같은 줄을 만난다.
 */
const DEMO_TODOS = [
  { title: '아침 스트레칭 10분', domain: '운동', position: 0, done: true },
  { title: '하루 물 2L 마시기', domain: '식단', position: 1, done: true },
  { title: '12시 전에 잠들기', domain: '수면', position: 2, done: false },
]

/**
 * 로그인 직후 한 번만 뜨는 안내.
 * "만다라트"는 설명이 필요한 단어인데 기존 화면에서는 로그인 이후 한 번도 나오지 않았다.
 * 랜딩에서 한 약속(쪼개기 → 실천 → 도시)을 앱 안에서 그대로 이어 말한다.
 */
type Step = {
  art: ReactNode
  title: string
  body: string
  /**
   * 그림을 넓게 쓴다. 기본값(240px)은 3x3 격자처럼 <b>정사각형</b>을 담기 좋은 폭인데,
   * 화면을 줄여 놓은 그림은 그 안에서 글자가 잘린다.
   */
  wideArt?: boolean
}

const STEPS: Step[] = [
  {
    art: (
      <div className="grid grid-cols-3 gap-1.5">
        {Array.from({ length: 9 }, (_, i) => (
          <span
            key={i}
            className={cn(
              'aspect-square rounded-md',
              i === 4 ? 'bg-brand-500' : 'bg-brand-500/18',
            )}
          />
        ))}
      </div>
    ),
    title: '① 큰 목표를 81칸으로 쪼갭니다',
    body: '가운데에 핵심 목표 하나, 그 둘레에 세부 목표 8개, 각 세부 목표마다 실천 과제 8개. 이 표를 만다라트라고 불러요.',
  },
  {
    /*
      <b>홈 화면을 그대로 줄여 놓는다.</b>

      예전에는 초록 동그라미에 취소선만 그은 그림이었는데, 실제 홈의 줄과 닮은 곳이 없어서
      들어가고 나면 "아까 그림의 그 목록" 을 찾지 못했다. 카드 안에 회색 줄이 놓인 짜임,
      체크 동그라미가 세부 목표 색으로 차는 것, 오른쪽의 횟수와 포인트까지 실제 화면
      (`HomePage` 의 `home-todos`)과 같은 규칙으로 그린다 — 색만 같아도 같은 것으로 읽힌다.
    */
    art: (
      <div
        className="flex flex-col gap-2.5 rounded-2xl p-3"
        style={{ background: 'var(--surface-card)' }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-extrabold tracking-[-0.02em]">오늘의 할 일</span>
          <span className="rounded-full bg-brand-500/12 px-2 py-0.5 text-[9.5px] font-black text-brand-600 dark:text-brand-400">
            3개
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {DEMO_TODOS.map((todo) => {
            const color = domainColor(todo.position)
            return (
              <span
                key={todo.title}
                className={cn(
                  'flex items-center gap-2 rounded-xl p-2',
                  'bg-[#f5f5f5] dark:bg-[var(--surface-sunken)]',
                  todo.done && 'opacity-65',
                )}
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    'grid size-6 shrink-0 place-items-center rounded-full border-2',
                    todo.done
                      ? 'border-transparent text-white'
                      : 'border-[var(--border-hairline)] text-transparent',
                  )}
                  style={todo.done ? { background: color } : undefined}
                >
                  <IconCheck className="size-3.5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block truncate text-[11.5px] font-bold leading-snug',
                      todo.done && 'line-through',
                    )}
                  >
                    {todo.title}
                  </span>
                  <span className="muted mt-0.5 flex items-center gap-1 text-[9.5px] font-semibold">
                    <span className="min-w-0 flex-1 truncate">{todo.domain}</span>
                    <span
                      className="shrink-0 rounded-full px-1.5 py-px text-[9px] font-bold"
                      style={{ background: 'var(--surface-card)' }}
                    >
                      매일
                    </span>
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-[10px] font-black tabular-nums">
                    {todo.done ? '1/1' : '0/1'}
                  </span>
                  <span className="muted block text-[9px] font-bold">+10P</span>
                </span>
              </span>
            )
          })}
        </div>
      </div>
    ),
    wideArt: true,
    title: '② 매일 과제를 체크합니다',
    body: '과제를 한 번 완료할 때마다 포인트가 쌓이고, 만다라트 칸이 아래에서부터 색으로 차오릅니다.',
  },
  {
    art: (
      <div className="flex items-end justify-center gap-2 pb-2">
        {[26, 44, 62, 38, 54].map((h, i) => (
          <span
            key={i}
            className="w-9 rounded-t-lg"
            style={{
              height: h,
              background: `linear-gradient(180deg, var(--color-brand-400), var(--color-brand-600))`,
            }}
          />
        ))}
      </div>
    ),
    title: '③ 포인트로 도시를 짓습니다',
    body: '쌓인 포인트로 상점에서 건물을 사고, 내 마을에 세웁니다. 과제가 진행될수록 건물도 한 단계씩 자라요.',
  },
]

export default function OnboardingTour() {
  const { finishOnboarding } = useStore()
  const { start } = useTour()
  const [step, setStep] = useState(0)
  const last = step === STEPS.length - 1
  const current = STEPS[step]

  return (
    <Modal
      open
      onClose={finishOnboarding}
      title="만다린이 처음이신가요?"
      description="30초면 끝나요. 이 서비스가 무엇을 하는지 먼저 보여드릴게요."
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={finishOnboarding}>
            건너뛰기
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={step === 0}
            aria-label="이전 단계로 돌아가기"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
          >
            이전
          </Button>
          {/*
            <b>마지막 장에서 끊지 않는다.</b> ①②③ 은 "이 서비스가 무엇인가" 까지고, 그 다음
            질문("그래서 이 화면은 어떻게 쓰나")의 답이 있는 곳은 상단 바의 물음표 버튼이다.
            여기서 팝업을 닫으면서 곧바로 그 버튼을 가리키는 오버레이 안내로 넘긴다 —
            같은 '다음' 을 세 번 누른 흐름 그대로 네 번째를 누르면 화면 위로 옮겨 간다.
          */}
          {last ? (
            <Button
              size="sm"
              onClick={() => {
                finishOnboarding()
                start('welcome')
              }}
            >
              다음
            </Button>
          ) : (
            <Button size="sm" onClick={() => setStep((s) => s + 1)}>
              다음
            </Button>
          )}
        </>
      }
    >
      <div
        className="grid min-h-[168px] place-items-center rounded-2xl p-6"
        style={{ background: 'var(--surface-sunken)' }}
      >
        <div className={cn('w-full', current.wideArt ? 'max-w-[320px]' : 'max-w-[240px]')}>
          {current.art}
        </div>
      </div>

      <h3 className="m-0 mt-5 text-[17px] font-extrabold tracking-[-0.03em]">{current.title}</h3>
      <p className="muted m-0 mt-2 text-[13.5px] font-medium leading-relaxed">{current.body}</p>

      <div className="mt-5 flex items-center justify-center gap-1.5" aria-hidden="true">
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === step ? 'w-6 bg-brand-500' : 'w-1.5 bg-[var(--border-hairline)]',
            )}
          />
        ))}
      </div>
    </Modal>
  )
}
