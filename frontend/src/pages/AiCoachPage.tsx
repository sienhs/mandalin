import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PERIOD_LABEL, PERIOD_MAX_COUNT, type Period } from '../data/types'
import Button from '../components/common/ActionButton'
import { IconCheck, IconCoach, IconMic, IconSend, IconTrash } from '../components/common/Icons'
import { Badge, Field, Input, domainColor } from '../components/common/Primitives'
import { cn } from '../utils/cn'
import { useToast } from '../components/common/Toast'
import {
  useCoachRoom,
  type GoalFrequency,
  type GoalPayload,
  type GoalTask,
} from '../components/aiCoach/useCoachRoom'

type Suggestion = { title: string; period: Period; count: number; why: string }

/** 담은 과제. `id` 는 **에이전트가 중복 검사에 쓰는 값**이라 담을 때 붙인다. */
type BasketItem = Suggestion & { id: number }

/**
 * 에이전트 어휘(소문자) → 앱 모델(대문자). **이 페이지가 두 표기의 경계다.**
 *
 * 에이전트는 백엔드 `SubjectPeriod` 의 `@JsonValue`(소문자)를 쓰고, 화면·편집기는
 * `data/types.ts` 의 대문자 `Period` 를 쓴다. 어느 쪽이 옳으냐와 무관하게 **변환을
 * 한곳에 모아 둔다** — 흘려보내면 `PERIOD_LABEL[period]` 가 `undefined` 가 되고 배지가
 * 조용히 빈칸으로 나온다.
 */
const PERIOD_BY_FREQUENCY: Record<GoalFrequency, Period> = {
  daily: 'DAILY',
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
  none: 'NONE',
}

/** 되돌리는 쪽 — 담은 과제를 에이전트에게 다시 보낼 때 쓴다(중복 검사용). */
const FREQUENCY_BY_PERIOD: Record<Period, GoalFrequency> = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  NONE: 'none',
}

/**
 * 주기 표시. **횟수가 2 이상일 때만 붙인다** — 주간·월간만 횟수를 정할 수 있고
 * (일간·한번만은 1 고정), 1 회는 라벨만으로 이미 맞는 말이다.
 */
const periodText = (period: Period, count: number) =>
  count > 1 ? `${PERIOD_LABEL[period]} · ${count}회` : PERIOD_LABEL[period]

/**
 * 에이전트가 만든 과제 하나를 화면 모델로. **모르는 값은 버린다**(빈 배열).
 *
 * 주기를 모르면 어느 칸에 어떻게 담을지 정할 수 없고, 기본값으로 `NONE`("한 번만")을
 * 붙이면 매일 해야 할 일이 한 번짜리로 굳는다 — 서버가 같은 이유로 기본값을 두지 않는다.
 */
const toSuggestion = (task: GoalTask): Suggestion[] => {
  const title = (task.title ?? '').trim()
  const frequency = task.frequency
  if (!title || !frequency || !(frequency in PERIOD_BY_FREQUENCY)) return []
  const period = PERIOD_BY_FREQUENCY[frequency]
  // 서버가 이미 주기에 맞춰 잘라 보내지만(`_settle_counts`) 여기서도 막는다 — 이 값은
  // 편집기를 거쳐 저장 요청까지 그대로 간다.
  const count = Math.min(Math.max(1, Math.round(task.count ?? 1)), PERIOD_MAX_COUNT[period])
  return [{ title, period, count, why: (task.description ?? '').trim() }]
}

/** 코치가 방금 제안한 묶음. 한 턴에 한 칸, 과제는 최대 3개다. */
type Proposal = { key: number; domain: string; domainIsNew: boolean; items: Suggestion[] }

type Basket = { domain: string; items: BasketItem[] }

/**
 * 말하기 버튼에 쓸 글자. **`ai_livekit/web/app.js` 의 `setMicLabel` 짝이다.**
 *
 * 아이콘만 두지 않고 글자를 붙이는 이유는 이 버튼이 **토글이면서 시한부**라서다 —
 * 마이크 그림만으로는 지금 듣고 있는지, 남은 시간이 얼마인지 알 수 없다. 남은 초를
 * 버튼 밖에 따로 띄우면 눈이 두 곳을 오가고, 음성이 꺼진 이유도 붙일 자리가 없다.
 */
const micLabel = (voiceAvailable: boolean, listening: boolean, talkLeft: number) => {
  if (!voiceAvailable) return '음성 꺼짐'
  return listening ? `듣는 중 ${talkLeft}s` : '말하기'
}

/**
 * 버튼에 얹는 설명. 음성이 꺼졌을 때 **이유를 화면에 남긴다** — 서버 로그에만 있으면
 * 사용자는 버튼이 왜 잠겼는지 알 수 없다(`app.js` 의 같은 문구).
 */
const micTitle = (voiceAvailable: boolean) =>
  voiceAvailable
    ? '누르면 10초간 듣습니다'
    : '서버에 음성이 꺼져 있습니다 (DEEPGRAM_API_KEY 없음)'

/** 세부 목표 하나에 담을 수 있는 과제 수, 그리고 세부 목표 칸 수. 서버 규칙(8 x 8)과 같다. */
const SLOTS = 8

export default function Coach() {
  const navigate = useNavigate()
  const toast = useToast()
  const scrollRef = useRef<HTMLDivElement>(null)

  const [input, setInput] = useState('')
  const [basket, setBasket] = useState<Basket[]>([])
  const [goal, setGoal] = useState('')
  const [proposal, setProposal] = useState<Proposal | null>(null)
  /** 담은 과제에 붙일 번호. **에이전트가 중복을 지목할 때 쓰는 id 라 유일하면 된다.** */
  const nextId = useRef(1)

  /**
   * 에이전트에게 넘길 시트 — **담은 과제가 곧 시트다.**
   *
   * 이걸 안 보내면 코치는 사용자가 방금 담은 과제를 모르고 같은 것을 또 제안한다
   * (서버의 중복 검사는 이 목록으로만 돈다). `subjectId` 를 반드시 붙인다 —
   * 없는 과제는 후보에서 버려져서(`to_candidates`) 모델이 지목할 방법이 사라진다.
   */
  const getSheet = useCallback(
    () => ({
      domains: basket.map((b) => ({
        title: b.domain,
        subjects: b.items.map((i) => ({
          subjectId: i.id,
          title: i.title,
          period: FREQUENCY_BY_PERIOD[i.period],
          countPerPeriod: i.count,
        })),
      })),
    }),
    [basket],
  )

  /**
   * 구조화 결과 도착. **`generate` 만 카드로 만든다.**
   *
   * 서버의 `_STORABLE_ACTIONS` 와 같은 조건이다. `recommend` 는 이미 시트에 있는 과제를
   * 지목한 것이라 담으면 중복이고, `clarify`·`out_of_scope` 는 되묻기·거절이다 — 그
   * 문장들은 말풍선으로 이미 도착해 있으므로 여기서 더 할 일이 없다.
   */
  const handleGoal = useCallback((payload: GoalPayload) => {
    if (payload.action !== 'generate') return
    const domain = (payload.domain ?? '').trim()
    const items = (payload.generated_tasks ?? []).flatMap(toSuggestion)
    // 칸 이름이나 과제가 비어 있으면 담을 수 없다. 서버가 이미 같은 검사를 하지만
    // (`_unknown_domain`), 빈 카드를 그려 놓고 담기가 안 되는 쪽이 더 나쁘다.
    if (!domain || items.length === 0) return
    setProposal({ key: Date.now(), domain, domainIsNew: payload.domain_is_new ?? false, items })
  }, [])

  const {
    connection,
    status,
    coachState,
    messages,
    caption,
    voiceAvailable,
    listening,
    talkLeft,
    micBusy,
    connect,
    sendChat,
    sendSheet,
    toggleTalk,
  } = useCoachRoom({ getSheet, onGoal: handleGoal })

  const thinking = coachState === 'thinking'
  const ready = connection === 'on'

  // 화면에 들어오면 바로 방을 잡는다. 이 페이지는 코치 전용이라 "연결" 버튼을 한 번 더
  // 누르게 할 이유가 없다. 나갈 때 끊는 것은 훅이 한다.
  useEffect(() => {
    void connect()
  }, [connect])

  /**
   * 담은 과제가 바뀌면 시트를 다시 보낸다.
   *
   * **`add()` 안에서 보내면 안 된다** — `setBasket` 직후에는 아직 새 상태가 렌더되지 않아
   * `getSheet()` 가 직전 목록을 만든다. 방금 담은 과제가 빠진 시트가 가고, 증상은
   * "담았는데 또 추천한다" 뿐이다.
   */
  useEffect(() => {
    if (ready) void sendSheet()
  }, [basket, ready, sendSheet])

  /**
   * 핵심 목표는 **첫 사용자 발화**다 — 에이전트도 같은 규칙으로 읽는다
   * (`prompts/system.md`: "중심 목표는 대화의 첫 목표 발화").
   *
   * `send()` 안이 아니라 대화에서 읽는 이유는 **음성**이다. 마이크로 시작하면 발화가
   * `send()` 를 지나지 않고 전사 토픽으로 들어와서, 그쪽에만 두면 말로 시작한 사용자는
   * 핵심 목표 칸이 빈 채로 남는다. 길면 비워 둔다 — 30자를 넘는 문장은 제목이 아니다.
   */
  useEffect(() => {
    if (goal) return
    const first = messages.find((m) => m.who === 'me')?.text.trim()
    if (first) setGoal(first.length <= 30 ? first : '')
  }, [messages, goal])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, caption, proposal, thinking])

  const send = (text: string) => {
    const value = text.trim()
    if (!value || thinking || !ready) return
    setInput('')
    // 지난 턴의 카드를 지운다. 남겨 두면 코치가 방향을 바꾼 뒤에도 옛 제안을 담을 수 있고,
    // 어느 것이 지금 이야기인지 흐려진다.
    setProposal(null)
    void sendChat(value)
  }

  const add = (domain: string, item: Suggestion) => {
    setBasket((prev) => {
      const found = prev.find((b) => b.domain === domain)
      if (!found) {
        // 세부 목표는 8칸이다. 서버도 자리가 없으면 새 칸을 만들지 않지만(`DOMAIN_SLOTS`),
        // 담기까지 온 뒤에 막으면 사용자는 이유를 모른다.
        if (prev.length >= SLOTS) {
          toast.show({ tone: 'warn', title: `세부 목표는 ${SLOTS}칸까지예요` })
          return prev
        }
        return [...prev, { domain, items: [{ ...item, id: nextId.current++ }] }]
      }
      if (found.items.some((i) => i.title === item.title)) return prev
      if (found.items.length >= SLOTS) {
        toast.show({ tone: 'warn', title: `한 세부 목표에는 과제 ${SLOTS}개까지 담을 수 있어요` })
        return prev
      }
      return prev.map((b) =>
        b.domain === domain ? { ...b, items: [...b.items, { ...item, id: nextId.current++ }] } : b,
      )
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
          // 횟수도 함께 넘긴다. 빼면 편집기가 전부 1 회로 앉히고, 주 3회로 제안받아
          // 담은 과제가 주 1회가 된다 — 사용자는 편집기에서 다시 세어야 한다.
          subjects: b.items.map((item) => ({
            title: item.title,
            period: item.period,
            countPerPeriod: item.count,
          })),
        })),
      },
    })
  }

  return (
    /*
      화면 높이를 꽉 채운다. 예전에는 대화 카드만 680px 로 고정해 둬서, 세로가 긴 모니터에서는
      아래로 200px 넘게 빈 채 남고 오른쪽 패널은 짧아 담은 과제가 몇 개만 보였다.
      152px = 상단 바(64) + 본문 위쪽 여백(24) + 아래쪽 여백(64).

      좁은 화면에서는 높이를 묶지 않는다 — 주소창이 들락거리는 모바일에서 100dvh 를 기준으로
      잡으면 스크롤이 튀고, 어차피 두 칸이 위아래로 쌓인다.
    */
    <div className="flex flex-col gap-5 lg:h-[calc(100dvh-152px)] lg:min-h-[560px]">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">AI 코치</h1>
          <p className="page-caption">대화로 과제를 모으고, 그대로 새 만다라트를 만듭니다.</p>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,clamp(360px,26vw,460px))]">
        {/* ───────── 대화 ───────── */}
        <section
          className="card flex min-h-0 flex-col overflow-hidden max-lg:h-[min(72vh,680px)]"
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
              {/*
                상태 문구는 **훅이 주는 것을 그대로** 쓴다. 화면이 따로 문장을 만들면
                연결이 끊겼는데 "준비됨" 이라고 적혀 있는 조합이 생긴다.
              */}
              <span className="muted flex items-center gap-1.5 text-[11.5px] font-bold">
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-1.5 rounded-full',
                    thinking && 'animate-pulse bg-brand-500',
                    !thinking && ready && 'bg-emerald-500',
                    !thinking && !ready && 'bg-ink-300',
                  )}
                />
                {thinking ? '생각하는 중' : ready ? '준비됨' : status}
              </span>
            </div>

            {/* 연결이 끊긴 상태에서 아무 버튼도 없으면 새로고침밖에 방법이 없다. */}
            {connection === 'off' ? (
              <Button size="sm" variant="secondary" className="ml-auto" onClick={() => void connect()}>
                다시 연결
              </Button>
            ) : (
              <Badge className="ml-auto" tone={ready ? 'brand' : 'neutral'}>
                {ready ? 'AI 코치' : '연결 중'}
              </Badge>
            )}
          </div>

          <div ref={scrollRef} className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-6">
            {/* 말풍선은 너무 넓으면 눈이 줄을 놓친다. 다만 예전 680px 은 카드 안에 빈 띠를
                크게 남겼다 — 제안 카드가 두 장 나란히 들어갈 만큼만 넓힌다. */}
            <div className="mx-auto flex max-w-[860px] flex-col gap-5">
              {/*
                고정 인사말을 두지 않는다. 에이전트가 한 말이 아닌데 말풍선 모양이라
                코치가 인사한 것처럼 읽히고, 접속 전에도 늘 떠 있어서 화면이 살아 있는
                듯한 착각을 준다 — 실제로 목업으로 오해된 적이 있다.

                에이전트가 붙었다는 사실은 `mandarin.hello` 를 받은 뒤 훅이 넣는 시스템
                안내(`"… 준비됨"`)가 알린다. 그쪽은 진짜 상태다.
              */}
              {messages.map((m) =>
                m.who === 'me' ? (
                  <div key={m.id} className="flex justify-end">
                    <p
                      className="m-0 max-w-[80%] rounded-[18px] rounded-br-md px-4 py-3 text-[13.5px] font-semibold leading-relaxed text-white"
                      style={{ background: 'var(--color-brand-600)' }}
                    >
                      {m.text}
                    </p>
                  </div>
                ) : m.who === 'ai' ? (
                  <div key={m.id} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className="grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white"
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
                ) : (
                  /*
                    안내·경고는 말풍선이 아니다. 코치가 한 말처럼 보이면 사용자는 서버
                    사정을 코치의 대답으로 읽는다("입장 토큰을 받지 못했습니다").
                  */
                  <p
                    key={m.id}
                    className={cn(
                      'm-0 text-center text-[11.5px] font-bold',
                      m.who === 'warn' ? 'text-red-500' : 'muted',
                    )}
                  >
                    {m.text}
                  </p>
                ),
              )}

              {/* 말하는 중인 전사문. 최종본이 오면 위 목록으로 옮겨가고 여기는 비워진다. */}
              {caption && (
                <div className="flex justify-end">
                  <p
                    className="m-0 max-w-[80%] rounded-[18px] rounded-br-md border border-dashed px-4 py-3 text-[13.5px] font-semibold leading-relaxed"
                    style={{ borderColor: 'var(--color-brand-400)', color: 'var(--text-muted)' }}
                  >
                    {caption}
                  </p>
                </div>
              )}

              {/*
                제안 카드는 **마지막 한 묶음만** 남긴다. 지난 턴의 카드를 쌓아 두면 이미
                담았거나 코치가 방향을 바꾼 과제까지 계속 담을 수 있게 되고, 어느 것이
                지금 이야기인지 흐려진다.
              */}
              {proposal && (
                // key 를 두어 새 제안이 오면 이 블록을 **갈아끼운다** — 같은 자리에서 내용만
                // 바뀌면 카드의 초점·스크롤 위치가 옛 제안 것으로 남는다.
                <div key={proposal.key} className="ml-10">
                  <p className="muted m-0 mb-2 text-[11.5px] font-bold">
                    {proposal.domainIsNew ? '새 세부 목표' : '세부 목표'} “{proposal.domain}” 에
                    담을 과제
                  </p>
                  <ul className="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
                    {proposal.items.map((s) => {
                      const already = inBasket(proposal.domain, s.title)
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
                            <Badge>{periodText(s.period, s.count)}</Badge>
                          </div>
                          {s.why && (
                            <p className="muted m-0 mt-1.5 flex-1 text-[12px] font-medium leading-relaxed">
                              {s.why}
                            </p>
                          )}
                          <Button
                            size="sm"
                            variant={already ? 'quiet' : 'secondary'}
                            disabled={already}
                            className="mt-3"
                            onClick={() => add(proposal.domain, s)}
                          >
                            {already ? '담았어요' : '담기'}
                          </Button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
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

          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex items-center gap-2 border-t px-4 py-3.5"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            {/*
              `ai_livekit/web/index.html` 의 `#mic` 을 옮긴 것 — 아이콘 + 글자, 남은 초는
              글자 안에.

              **`voiceAvailable` 을 받고서야 열린다.** 서버가 음성을 못 받는 상태에서
              버튼을 열어두면, 눌러서 말하고 아무 일도 안 일어나는 것을 보게 된다.
              저쪽처럼 `disabled` 로 잠그고 이유는 `title` 로 붙인다 — 눌러 보고 토스트로
              알려주는 것보다 애초에 못 누르는 편이 낫다.

              `micBusy` 는 마이크가 켜지거나 꺼지는 동안이다. 그 사이의 두 번째 클릭은
              타이머를 둘로 만든다(훅의 `micBusy` 주석).
            */}
            <button
              type="button"
              onClick={() => void toggleTalk()}
              disabled={!voiceAvailable || micBusy}
              title={micTitle(voiceAvailable)}
              aria-label={listening ? '말하기 멈추기' : '음성으로 말하기'}
              aria-pressed={listening}
              className={cn(
                'flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-bold transition-colors',
                listening
                  ? 'border-0 bg-red-500 text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]',
                'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[var(--text-muted)]',
              )}
              style={listening ? undefined : { borderColor: 'var(--border-hairline)' }}
            >
              <IconMic className="size-[19px]" />
              {/* 남은 초가 글자로 들어오므로 폭이 흔들린다. 숫자만 tabular 로 두면
                  "듣는 중 9s" → "듣는 중 10s" 에서 버튼이 덜 튄다. */}
              <span className="tabular-nums">{micLabel(voiceAvailable, listening, talkLeft)}</span>
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={ready ? '이루고 싶은 것을 적어보세요' : `${status}…`}
              aria-label="코치에게 보낼 메시지"
              disabled={!ready}
              className="h-11 min-w-0 flex-1 rounded-full border bg-[var(--surface-sunken)] px-4 text-sm font-semibold outline-none transition-colors focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ borderColor: 'var(--border-hairline)' }}
            />

            {/* 남은 시간은 버튼 글자 안에 있다(`micLabel`). 여기 따로 두면 같은 값이 두
                군데 뜨고, 눈이 버튼과 이 자리를 오간다. */}

            <button
              type="submit"
              disabled={!input.trim() || thinking || !ready}
              aria-label="보내기"
              className="grid size-11 shrink-0 place-items-center rounded-full border-0 bg-brand-600 text-white transition-all hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <IconSend className="size-[19px]" />
            </button>
          </form>
        </section>

        {/* ───────── 담은 과제 → 만다라트 ───────── */}
        {/*
          예전에는 "담은 과제"와 "만다라트로 옮기기"가 카드 두 장으로 갈라져 있었다. 둘은
          한 가지 일(초안 만들기)의 앞뒤인데 상자가 나뉘어, 목표를 적는 칸과 그 목표에 담긴
          과제가 서로 다른 상자에 있었다. 하나로 합치고 위에서 아래로 <b>목표 → 진행 → 과제
          → 가져가기</b> 순서로 세운다.

          가운데 목록만 스크롤되고 머리와 발은 붙어 있다 — 과제를 20개 담아도 "가져가기"
          버튼을 찾아 스크롤할 일이 없다.
        */}
        <aside className="card flex min-h-0 flex-col overflow-hidden p-0">
          {/* ── 머리: 핵심 목표 + 진행 ── */}
          <div
            className="shrink-0 border-b px-5 py-4"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="section-title m-0">새 만다라트 초안</h2>
              <Badge tone={totalItems > 0 ? 'brand' : 'neutral'}>과제 {totalItems}/64</Badge>
            </div>

            <div className="mt-3">
              <Field label="핵심 목표">
                <Input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="예) 건강한 몸 만들기"
                  maxLength={30}
                />
              </Field>
            </div>

            {/* 세부 목표가 몇 칸 찼는지 — 숫자보다 막대가 먼저 읽힌다. */}
            <div className="mt-3.5 flex items-center gap-2.5">
              <span
                className="h-1.5 flex-1 overflow-hidden rounded-full"
                style={{ background: 'var(--surface-sunken)' }}
                aria-hidden="true"
              >
                <span
                  className="block h-full rounded-full transition-[width] duration-500"
                  style={{
                    width: `${(basket.length / SLOTS) * 100}%`,
                    background: 'var(--color-brand-500)',
                  }}
                />
              </span>
              <span className="muted shrink-0 text-[11.5px] font-bold tabular-nums">
                세부 목표 {basket.length}/{SLOTS}
              </span>
            </div>
          </div>

          {/* ── 몸통: 담은 과제 (여기만 스크롤) ── */}
          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">
            {basket.length === 0 ? (
              <div className="flex h-full min-h-[180px] flex-col items-center justify-center text-center">
                <span
                  className="grid size-12 place-items-center rounded-2xl text-[var(--text-muted)]"
                  style={{ background: 'var(--surface-sunken)' }}
                  aria-hidden="true"
                >
                  <IconCoach className="size-6" />
                </span>
                <p className="m-0 mt-3.5 text-[13px] font-bold">아직 담은 과제가 없어요</p>
                <p className="muted m-0 mt-1.5 max-w-[240px] text-[12px] font-medium leading-relaxed">
                  왼쪽에서 코치에게 목표를 말하고, 마음에 드는 과제를 <b>담기</b>로 모아 보세요.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                {basket.map((b, i) => {
                  const color = domainColor(i)
                  return (
                    <div key={b.domain}>
                      <div className="flex items-center gap-2">
                        <strong className="min-w-0 flex-1 truncate text-[12.5px] font-extrabold">
                          {b.domain}
                        </strong>
                        <span className="muted shrink-0 text-[11px] font-bold tabular-nums">
                          {b.items.length}/{SLOTS}
                        </span>
                      </div>

                      {/*
                        8칸이 얼마나 찼는지 눈금으로. 숫자만 있으면 "3/8"을 읽고 머릿속에서
                        환산해야 하는데, 눈금은 훑기만 해도 어느 목표가 비었는지 보인다.
                      */}
                      <div
                        className="mt-2 flex gap-1"
                        aria-hidden="true"
                        title={`${b.items.length}/${SLOTS} 칸`}
                      >
                        {Array.from({ length: SLOTS }, (_, slot) => (
                          <span
                            key={slot}
                            className="h-1 flex-1 rounded-full transition-colors duration-300"
                            style={{
                              background: slot < b.items.length ? color : 'var(--surface-sunken)',
                            }}
                          />
                        ))}
                      </div>

                      <ul className="m-0 mt-2.5 flex list-none flex-col gap-1.5 p-0">
                        {b.items.map((item) => (
                          <li
                            key={item.title}
                            className="group flex items-center gap-2 rounded-xl border px-3 py-2.5"
                            style={{
                              borderColor: 'var(--border-hairline)',
                              background: 'var(--surface-card)',
                            }}
                          >
                            <IconCheck className="size-4 shrink-0 text-emerald-500" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[12.5px] font-bold">
                                {item.title}
                              </span>
                              <span className="muted block text-[10.5px] font-semibold">
                                {periodText(item.period, item.count)}
                              </span>
                            </span>
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
                              /*
                                평소엔 흐리게 두고 마우스를 얹거나 키보드 초점이 오면 또렷해진다.
                                삭제 버튼이 목록마다 진하게 박혀 있으면 눈이 그리로 끌린다.
                                항상 자리는 차지하므로(투명도만 변한다) 줄이 흔들리지 않는다.
                              */
                              className="shrink-0 text-[var(--text-muted)] opacity-45 transition-[opacity,color] hover:text-red-500 hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
                            >
                              <IconTrash className="size-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── 발: 가져가기 ── */}
          <div
            className="shrink-0 border-t px-5 py-4"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            {/*
              만다라트는 81칸을 모두 채워야 저장된다(서버가 8 x 8 을 강제한다). 편집기에 가서야
              알게 되면 늦으므로 여기서 미리 말해 둔다.
            */}
            <p className="muted m-0 mb-3 text-[11.5px] font-medium leading-relaxed">
              {basket.length === 0
                ? '과제를 담으면 세부 목표별로 배치된 채 편집기가 열려요.'
                : `남은 ${64 - totalItems}칸은 편집기에서 이어 채우면 돼요. 81칸을 다 채워야 저장됩니다.`}
            </p>

            {/*
              편집기와 코치를 오갈 수 있다는 사실을 여기서 말해 둔다. 예전에는 편집기로 가면
              끝인 줄 알고 대화를 억지로 길게 끌거나, 반대로 편집기에서 막혀도 돌아오지 못했다.
            */}
            <p className="muted m-0 mb-3 text-[11.5px] font-medium leading-relaxed">
              편집기에서 <b>AI 코치로 이어 만들기</b>를 누르면 쓰던 내용을 두고 다시 여기로 올 수
              있어요. 돌아갈 때 빈 칸에만 채워 넣습니다.
            </p>
            <Button full disabled={basket.length === 0 || !goal.trim()} onClick={handoff}>
              편집기로 가져가기
            </Button>
            <Button variant="quiet" full size="sm" className="mt-2" to="/app/sheets/new">
              처음부터 직접 채우기
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
