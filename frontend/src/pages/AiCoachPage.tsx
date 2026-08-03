import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PERIOD_LABEL, type Period } from '../data/types'
import Button from '../components/common/ActionButton'
import { IconCheck, IconCoach, IconMic, IconSend, IconTrash } from '../components/common/Icons'
import { Badge, Field, Input, domainColor } from '../components/common/Primitives'
import { cn } from '../utils/cn'
import { useToast } from '../components/common/Toast'

type Suggestion = { title: string; period: Period; why: string }
type Message =
  | { id: string; role: 'user'; text: string }
  | { id: string; role: 'coach'; text: string; domain?: string; suggestions?: Suggestion[] }

/**
 * 목업 응답 규칙.
 *
 * 실제 서비스의 코치는 별도 LiveKit worker(`ai_livekit`)가 담당한다. Spring 백엔드에는
 * 입장 토큰 발급(`POST /api/v1/voice-sessions`)만 있고 텍스트 대화 엔드포인트가 없어서,
 * 이 화면은 규칙 기반으로 제안을 만들고 결과만 실제 API(시트 생성)로 넘긴다.
 */
const RULES: Array<{ match: RegExp; domain: string; reply: string; items: Suggestion[] }> = [
  {
    match: /운동|헬스|근력|체력|살|다이어트|몸/,
    domain: '규칙적인 운동',
    reply:
      '몸을 만드는 목표군요. 처음부터 강도를 올리면 오래 못 가니, 매일 할 수 있는 작은 것과 주 단위 큰 것을 섞어 잡아봤어요.',
    items: [
      { title: '아침 스트레칭 10분', period: 'DAILY', why: '기상 직후라 빠뜨리기 어렵습니다' },
      { title: '주 3회 웨이트 트레이닝', period: 'WEEKLY', why: '근력은 주 단위가 현실적입니다' },
      { title: '하루 8천 보 걷기', period: 'DAILY', why: '따로 시간을 내지 않아도 됩니다' },
      { title: '운동 일지 기록', period: 'DAILY', why: '기록이 있어야 정체기를 압니다' },
    ],
  },
  {
    match: /공부|개발|코딩|알고리즘|취업|자격증|영어|시험/,
    domain: '꾸준한 학습',
    reply:
      '공부는 “하루에 얼마나”보다 “매일 같은 시간에”가 훨씬 잘 지켜집니다. 분량을 작게 잡았어요.',
    items: [
      {
        title: '매일 알고리즘 한 문제',
        period: 'DAILY',
        why: '한 문제면 바쁜 날도 넘길 수 있어요',
      },
      { title: '공식 문서 30분 읽기', period: 'DAILY', why: '강의보다 검색 능력이 늘어납니다' },
      { title: '주 1회 회고 글쓰기', period: 'WEEKLY', why: '설명할 수 있어야 내 것이 됩니다' },
      { title: '모의 코딩테스트', period: 'WEEKLY', why: '실전 감각은 따로 길러야 합니다' },
    ],
  },
  {
    match: /화|분노|스트레스|불안|마음|명상|감정|멘탈/,
    domain: '마음 다스리기',
    reply: '감정은 참는 것보다 알아차리는 게 먼저입니다. 관찰 → 진정 → 회복 순으로 나눠봤어요.',
    items: [
      { title: '화가 난 순간 기록하기', period: 'DAILY', why: '언제 올라오는지 패턴이 보입니다' },
      { title: '호흡 4-7-8 하기', period: 'DAILY', why: '즉시 쓸 수 있는 진정 도구입니다' },
      { title: '감사 일기 세 줄', period: 'DAILY', why: '주의를 다른 쪽으로 옮겨줍니다' },
      { title: '주말 디지털 디톡스', period: 'WEEKLY', why: '자극의 총량을 줄입니다' },
    ],
  },
  {
    match: /독서|책|글쓰기|기록/,
    domain: '읽고 남기기',
    reply: '읽는 것과 남기는 것을 한 쌍으로 묶으면 훨씬 오래 갑니다.',
    items: [
      { title: '자기 전 20쪽 읽기', period: 'DAILY', why: '분량이 작아야 매일 됩니다' },
      { title: '한 문장 밑줄 옮겨 적기', period: 'DAILY', why: '읽은 흔적이 남습니다' },
      { title: '월 1권 서평 쓰기', period: 'NONE', why: '정리하면 기억에 남습니다' },
      { title: '주 1회 서점 가기', period: 'WEEKLY', why: '다음 책이 끊기지 않게 합니다' },
    ],
  },
  {
    match: /돈|저축|재테크|절약|소비/,
    domain: '돈 관리',
    reply: '돈은 기록이 절반입니다. 새는 곳을 먼저 보이게 만들고 그다음에 줄여요.',
    items: [
      { title: '매일 지출 기록', period: 'DAILY', why: '적기만 해도 소비가 줄어듭니다' },
      { title: '주간 예산 점검', period: 'WEEKLY', why: '월말에 몰아 보면 이미 늦습니다' },
      { title: '고정비 한 건 줄이기', period: 'NONE', why: '한 번 줄이면 매달 절약됩니다' },
      { title: '비상금 자동이체 설정', period: 'NONE', why: '의지가 아니라 구조로 만듭니다' },
    ],
  },
]

const FALLBACK: Suggestion[] = [
  { title: '하루 10분 목표 점검', period: 'DAILY', why: '무엇을 할지 정하는 시간이 먼저입니다' },
  { title: '주간 회고 쓰기', period: 'WEEKLY', why: '한 주를 닫는 습관이 다음 주를 만듭니다' },
  { title: '한 달 목표 다시 보기', period: 'NONE', why: '방향이 어긋났는지 확인합니다' },
]

const QUICK = [
  '화 안 내는 사람이 되고 싶어',
  '올해 안에 10kg 빼고 싶어',
  '프론트엔드 취업 준비 중이야',
  '책을 꾸준히 읽고 싶어',
  '돈을 좀 모으고 싶어',
]

type Basket = { domain: string; items: Suggestion[] }

export default function Coach() {
  const navigate = useNavigate()
  const toast = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm0',
      role: 'coach',
      text: '안녕하세요, 만다린 코치예요. 이루고 싶은 것을 편하게 말해주세요. 목표를 실천 과제로 잘게 나눠 드릴게요.',
    },
  ])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [basket, setBasket] = useState<Basket[]>([])
  const [goal, setGoal] = useState('')

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  const send = (text: string) => {
    const value = text.trim()
    if (!value || thinking) return

    setMessages((m) => [...m, { id: `u${Date.now()}`, role: 'user', text: value }])
    setInput('')
    setThinking(true)
    if (!goal) setGoal(value.length <= 20 ? value : '')

    window.setTimeout(() => {
      const rule = RULES.find((r) => r.match.test(value))
      setMessages((m) => [
        ...m,
        {
          id: `c${Date.now()}`,
          role: 'coach',
          text:
            rule?.reply ??
            '좋아요. 우선 방향을 잡을 수 있는 과제부터 제안해 볼게요. 더 구체적으로 말해주시면 더 정확해집니다.',
          domain: rule?.domain ?? '첫 걸음',
          suggestions: rule?.items ?? FALLBACK,
        },
      ])
      setThinking(false)
    }, 850)
  }

  const add = (domain: string, item: Suggestion) => {
    setBasket((prev) => {
      const found = prev.find((b) => b.domain === domain)
      if (!found) return [...prev, { domain, items: [item] }]
      if (found.items.some((i) => i.title === item.title)) return prev
      if (found.items.length >= 8) {
        toast.show({ tone: 'warn', title: '한 세부 목표에는 과제 8개까지 담을 수 있어요' })
        return prev
      }
      return prev.map((b) => (b.domain === domain ? { ...b, items: [...b.items, item] } : b))
    })
  }

  const inBasket = (domain: string, title: string) =>
    basket.find((b) => b.domain === domain)?.items.some((i) => i.title === title) ?? false

  const totalItems = basket.reduce((a, b) => a + b.items.length, 0)

  /**
   * 모은 과제를 만다라트 편집기로 넘긴다.
   *
   * <p>여기서 바로 저장하지 않는 이유는 만다라트가 <b>81칸을 모두 채워야</b> 저장되기 때문이다
   * (서버가 세부 목표 8개 × 과제 8개를 강제한다). 대화로 64칸을 정확히 채우기는 어려우니,
   * 코치는 초안까지만 만들고 나머지는 편집기에서 마무리한다.
   */
  const handoff = () => {
    if (!goal.trim()) {
      toast.show({ tone: 'warn', title: '핵심 목표를 한 줄로 적어주세요' })
      return
    }
    if (basket.length === 0) {
      toast.show({ tone: 'warn', title: '담은 과제가 없어요' })
      return
    }

    navigate('/app/sheets/new', {
      state: {
        title: goal.trim(),
        domains: basket.map((b) => ({
          title: b.domain,
          subjects: b.items.map((item) => ({ title: item.title, period: item.period })),
        })),
      },
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">AI 코치</h1>
          <p className="page-caption">대화로 과제를 모으고, 그대로 새 만다라트를 만듭니다.</p>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,360px)]">
        {/* ───────── 대화 ───────── */}
        <section
          className="card flex flex-col overflow-hidden"
          /*
            높이를 고정한다. min-height 로 두면 대화가 쌓일수록 카드가 아래로 끝없이 자라
            입력창이 화면 밖으로 밀려나고, 옆 패널과 높이도 어긋났다.
            고정하면 넘치는 만큼만 안쪽에서 스크롤된다 — 지난 대화는 위로 올려 볼 수 있다.
          */
          style={{ height: 'min(72vh, 680px)', minHeight: 480 }}
        >
          <div
            className="flex items-center gap-3 border-b px-5 py-4"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <span
              className={cn(
                'grid size-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white',
                thinking && 'animate-pulse',
              )}
              aria-hidden="true"
            >
              <IconCoach className="size-[22px]" />
            </span>

            <div className="min-w-0">
              <strong className="block text-[14px] font-extrabold tracking-[-0.02em]">
                만다린 코치
              </strong>
              {/*
                상태를 글자로만 쓰면 "대기 중"이 늘 붙어 있어 아무 정보도 주지 않는다.
                점 색으로 두면 흘깃 봐도 지금 답하는 중인지 알 수 있다.
              */}
              <span className="muted flex items-center gap-1.5 text-[11.5px] font-bold">
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-1.5 rounded-full',
                    thinking ? 'animate-pulse bg-brand-500' : 'bg-emerald-500',
                  )}
                />
                {thinking ? '생각하는 중' : '준비됨'}
              </span>
            </div>

            <Badge className="ml-auto">규칙 기반 응답</Badge>
          </div>

          <div ref={scrollRef} className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-6">
            <div className="mx-auto flex max-w-[680px] flex-col gap-5">
              {messages.map((m) =>
                m.role === 'user' ? (
                  <div key={m.id} className="flex justify-end">
                    <p
                      className="m-0 max-w-[80%] rounded-[18px] rounded-br-md px-4 py-3 text-[13.5px] font-semibold leading-relaxed text-white"
                      style={{ background: 'var(--color-brand-600)' }}
                    >
                      {m.text}
                    </p>
                  </div>
                ) : (
                  <div key={m.id} className="flex flex-col gap-3">
                    <div className="flex gap-2.5">
                      <span
                        aria-hidden="true"
                        className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-500/12 text-brand-600 dark:text-brand-400"
                      >
                        <IconCoach className="size-[17px]" />
                      </span>
                      <p
                        className="m-0 max-w-[80%] rounded-[18px] rounded-tl-md px-4 py-3 text-[13.5px] font-semibold leading-relaxed"
                        style={{ background: 'var(--surface-sunken)' }}
                      >
                        {m.text}
                      </p>
                    </div>

                    {m.suggestions && m.domain && (
                      <div className="ml-10">
                        <p className="muted m-0 mb-2 text-[11.5px] font-bold">
                          세부 목표 “{m.domain}” 에 담을 과제
                        </p>
                        <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
                          {m.suggestions.map((s) => {
                            const already = inBasket(m.domain!, s.title)
                            return (
                              <li
                                key={s.title}
                                className="flex flex-col rounded-2xl border p-4"
                                style={{ borderColor: 'var(--border-hairline)' }}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <strong className="text-[13px] font-extrabold leading-snug">
                                    {s.title}
                                  </strong>
                                  <Badge>{PERIOD_LABEL[s.period]}</Badge>
                                </div>
                                <p className="muted m-0 mt-1.5 flex-1 text-[12px] font-medium leading-relaxed">
                                  {s.why}
                                </p>
                                <Button
                                  size="sm"
                                  variant={already ? 'quiet' : 'secondary'}
                                  disabled={already}
                                  className="mt-3"
                                  onClick={() => add(m.domain!, s)}
                                >
                                  {already ? '담았어요' : '담기'}
                                </Button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ),
              )}

              {thinking && (
                <div className="ml-10 flex gap-1.5" aria-label="응답 생성 중">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="size-2 animate-bounce rounded-full bg-[var(--text-muted)]"
                      style={{ animationDelay: `${i * 0.12}s` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto px-5 pb-3 no-scrollbar">
            {QUICK.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => send(q)}
                className="shrink-0 rounded-full border px-3.5 py-2 text-[12px] font-bold transition-colors hover:border-brand-300 hover:text-brand-600"
                style={{ borderColor: 'var(--border-hairline)' }}
              >
                {q}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2 border-t px-4 py-3.5"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <button
              type="button"
              onClick={() =>
                toast.show({
                  tone: 'info',
                  title: '음성 대화는 별도 서버가 필요해요',
                  body: 'LiveKit worker(ai_livekit)와 입장 토큰 발급이 함께 떠 있어야 합니다.',
                })
              }
              aria-label="음성으로 말하기"
              className="grid size-11 shrink-0 place-items-center rounded-full border text-[var(--text-muted)] transition-colors hover:text-[var(--text-strong)]"
              style={{ borderColor: 'var(--border-hairline)' }}
            >
              <IconMic className="size-[19px]" />
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="이루고 싶은 것을 적어보세요"
              aria-label="코치에게 보낼 메시지"
              className="h-11 min-w-0 flex-1 rounded-full border bg-[var(--surface-sunken)] px-4 text-sm font-semibold outline-none transition-colors focus:border-brand-400"
              style={{ borderColor: 'var(--border-hairline)' }}
            />

            <button
              type="submit"
              disabled={!input.trim() || thinking}
              aria-label="보내기"
              className="grid size-11 shrink-0 place-items-center rounded-full border-0 bg-brand-600 text-white transition-all hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconSend className="size-[19px]" />
            </button>
          </form>
        </section>

        {/* ───────── 담은 과제 → 만다라트 ───────── */}
        <aside className="flex flex-col gap-5">
          <section className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="section-title m-0">담은 과제</h2>
              <Badge tone={totalItems > 0 ? 'brand' : 'neutral'}>{totalItems}개</Badge>
            </div>

            {basket.length === 0 ? (
              <p className="muted m-0 mt-4 text-[12.5px] font-medium leading-relaxed">
                코치가 제안한 과제 중 마음에 드는 것을 담아보세요. 담은 과제로 새 만다라트를 한 번에
                만들 수 있어요.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {basket.map((b, i) => (
                  <div key={b.domain}>
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ background: domainColor(i) }}
                        aria-hidden="true"
                      />
                      <strong className="text-[12.5px] font-extrabold">{b.domain}</strong>
                      <span className="muted ml-auto text-[11px] font-bold">
                        {b.items.length}/8
                      </span>
                    </div>
                    <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                      {b.items.map((item) => (
                        <li
                          key={item.title}
                          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12.5px] font-bold"
                          style={{ background: 'var(--surface-sunken)' }}
                        >
                          <IconCheck className="size-4 shrink-0 text-emerald-500" />
                          <span className="min-w-0 flex-1 truncate">{item.title}</span>
                          <button
                            type="button"
                            aria-label={`${item.title} 빼기`}
                            onClick={() =>
                              setBasket((prev) =>
                                prev
                                  .map((x) =>
                                    x.domain === b.domain
                                      ? {
                                          ...x,
                                          items: x.items.filter((y) => y.title !== item.title),
                                        }
                                      : x,
                                  )
                                  .filter((x) => x.items.length > 0),
                              )
                            }
                            className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-red-500"
                          >
                            <IconTrash className="size-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card p-6">
            <h2 className="section-title m-0">만다라트로 옮기기</h2>
            <p className="muted m-0 mt-1 text-[12.5px] font-semibold">
              담은 과제가 세부 목표별로 배치된 상태로 편집기가 열립니다.
            </p>

            <div className="mt-4 flex flex-col gap-3">
              <Field label="핵심 목표">
                <Input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="예) 건강한 몸 만들기"
                  maxLength={30}
                />
              </Field>

              {/* 남은 칸을 미리 알려준다 — 편집기에서 처음 알게 하면 늦다 */}
              <div
                className="rounded-xl px-3.5 py-3"
                style={{ background: 'var(--surface-sunken)' }}
              >
                <p className="m-0 text-[12px] font-bold">
                  현재 {basket.length}/8 세부 목표 · 과제 {totalItems}/64
                </p>
                <p className="muted m-0 mt-1.5 text-[11.5px] font-medium leading-relaxed">
                  만다라트는 81칸을 모두 채워야 저장됩니다. 부족한 칸은 편집기에서 이어 채우면 돼요.
                </p>
              </div>

              <Button full disabled={basket.length === 0 || !goal.trim()} onClick={handoff}>
                편집기로 가져가기
              </Button>
              <Button variant="quiet" full size="sm" to="/app/sheets/new">
                처음부터 직접 채우기
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
