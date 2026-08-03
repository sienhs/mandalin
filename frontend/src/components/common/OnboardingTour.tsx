import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../../data/store'
import Button from './ActionButton'
import Modal from './Modal'
import { cn } from '../../utils/cn'

/**
 * 로그인 직후 한 번만 뜨는 안내.
 * "만다라트"는 설명이 필요한 단어인데 기존 화면에서는 로그인 이후 한 번도 나오지 않았다.
 * 랜딩에서 한 약속(쪼개기 → 실천 → 도시)을 앱 안에서 그대로 이어 말한다.
 */
const STEPS = [
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
    art: (
      <div className="flex flex-col gap-2">
        {['아침 스트레칭 10분', '하루 물 2L 마시기', '12시 전에 잠들기'].map((t, i) => (
          <span
            key={t}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[12.5px] font-bold"
            style={{ background: 'var(--surface-sunken)' }}
          >
            <span
              className={cn(
                'grid size-4 place-items-center rounded-full text-[9px] text-white',
                i < 2 ? 'bg-emerald-500' : 'bg-[var(--border-hairline)]',
              )}
            >
              ✓
            </span>
            <span className={i < 2 ? 'line-through opacity-55' : ''}>{t}</span>
            {i < 2 && <span className="ml-auto text-[11px] font-black text-brand-600">+10P</span>}
          </span>
        ))}
      </div>
    ),
    title: '② 매일 과제를 체크합니다',
    body: '과제를 한 번 완료할 때마다 10P가 쌓이고, 만다라트 칸이 아래에서부터 색으로 차오릅니다.',
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
  const navigate = useNavigate()
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
          {last ? (
            <Button
              size="sm"
              onClick={() => {
                finishOnboarding()
                navigate('/app/sheets/new')
              }}
            >
              첫 만다라트 만들기
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
        <div className="w-full max-w-[240px]">{current.art}</div>
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
