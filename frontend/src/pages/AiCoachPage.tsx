import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PERIOD_LABEL, PERIOD_MAX_COUNT, type Period } from '../data/types'
import Button from '../components/common/ActionButton'
import {
  IconCheck,
  IconChevronDown,
  IconCoach,
  IconMic,
  IconSend,
  IconTrash,
} from '../components/common/Icons'
import { Badge, Field, domainColor } from '../components/common/Primitives'
import { cn } from '../utils/cn'
import { useToast } from '../components/common/Toast'
import {
  MAX_DOMAIN_TITLE,
  MAX_SUBJECT_TITLE,
  emptyDomains,
  loadDraft,
  saveDraft,
} from '../features/sheet/draftStorage'
import {
  useCoachRoom,
  type GoalFrequency,
  type GoalPayload,
  type GoalTask,
} from '../components/aiCoach/useCoachRoom'
import CoachGoalPrompt from '../components/aiCoach/CoachGoalPrompt'
import { useCoachDemo } from '../features/coach/useCoachDemo'
import { useAutoTour, useTour } from '../features/tour/TourProvider'

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
  // 여기서 자른다. `loadDraft()` 에만 맡기면 새로고침 전까지 긴 제목이 그대로 남는다.
  const title = (task.title ?? '').trim().slice(0, MAX_SUBJECT_TITLE)
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
 * 편집기 초안에서 시작 상태를 만든다. 에이전트의 `set_domains()` 가 받은 시트로 **통째로
 * 교체**하므로 빈 `basket` 으로 시작하면 초안이 지워진다 — 매번 전체를 실어야 한다.
 */
function seedFromDraft(): {
  goal: string
  basket: Basket[]
  nextId: number
  expiredAt: string
  isOpen: boolean
} {
  const draft = loadDraft()
  // 초안이 없을 때의 `isOpen` 은 `draftStorage` 의 기본값과 같아야 한다 — 다르면 코치를
  // 거쳐 만든 시트만 공개 설정이 뒤집힌다.
  if (!draft) return { goal: '', basket: [], nextId: 1, expiredAt: '', isOpen: true }

  let id = 1
  const basket = draft.domains
    .filter((d) => d.title.trim())
    .map((d) => ({
      domain: d.title.trim(),
      items: d.subjects
        .filter((s) => s.title.trim())
        .map((s) => ({
          title: s.title.trim(),
          period: s.period,
          count: s.countPerPeriod,
          why: '',
          id: id++,
        })),
    }))
    .filter((b) => b.items.length > 0)

  return {
    goal: draft.title.trim(),
    basket,
    nextId: id,
    expiredAt: draft.expiredAt,
    isOpen: draft.isOpen,
  }
}

/**
 * 말하기 버튼에 쓸 글자. **`ai_livekit/web/app.js` 의 `setMicLabel` 짝이다.**
 *
 * 아이콘만 두지 않고 글자를 붙이는 이유는 이 버튼이 **토글이면서 시한부**라서다 —
 * 마이크 그림만으로는 지금 듣고 있는지, 남은 시간이 얼마인지 알 수 없다. 남은 초를
 * 버튼 밖에 따로 띄우면 눈이 두 곳을 오가고, 음성이 꺼진 이유도 붙일 자리가 없다.
 */
const micLabel = (voiceAvailable: boolean, listening: boolean, talkLeft: number) => {
  if (!voiceAvailable) return '음성 꺼짐'
  if (!listening) return '말하기'
  // 창이 15분이라 `900s` 로는 남은 시간을 못 읽는다(`app.js` 의 `clock`).
  const left = Math.max(0, talkLeft)
  return `듣는 중 ${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
}

/**
 * 버튼에 얹는 설명. 음성이 꺼졌을 때 **이유를 화면에 남긴다** — 서버 로그에만 있으면
 * 사용자는 버튼이 왜 잠겼는지 알 수 없다(`app.js` 의 같은 문구).
 */
const micTitle = (voiceAvailable: boolean) =>
  voiceAvailable
    ? '누르면 15분간 듣습니다 (응답을 만드는 동안에는 잠시 멈춥니다)'
    : '서버에 음성이 꺼져 있습니다 (DEEPGRAM_API_KEY 없음)'

/** 세부 목표 하나에 담을 수 있는 과제 수, 그리고 세부 목표 칸 수. 서버 규칙(8 x 8)과 같다. */
const SLOTS = 8

export default function Coach() {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const tour = useTour()
  const scrollRef = useRef<HTMLDivElement>(null)
  /** 대화가 바닥에 붙어 있는가. 새 내용을 따라 내려갈지 정한다. */
  const [atBottom, setAtBottom] = useState(true)
  /** 바닥을 벗어난 사이에 새 메시지가 왔는가. 내려가기 버튼이 이걸 보고 뜬다. */
  const [hasUnread, setHasUnread] = useState(false)

  /** 대화를 맨 아래로. 내가 보낸 직후와 알림 버튼이 쓴다. */
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
    setAtBottom(true)
    setHasUnread(false)
  }, [])

  // 초안은 첫 렌더 전에 읽는다. `useEffect` 로 늦게 넣으면 그 전에 빈 시트가 나간다.
  const [seed] = useState(seedFromDraft)

  const [input, setInput] = useState('')
  const [basket, setBasket] = useState<Basket[]>(seed.basket)
  /** 핵심 목표. **사용자가 직접 적는다** — 첫 발화로 자동으로 채우지 않는다. */
  const [goal, setGoal] = useState(seed.goal)
  /** 목표 입력 팝업. **들어올 때 한 번만 판정한다** — 칸을 지울 때마다 덮이면 안 된다. */
  const [goalPromptOpen, setGoalPromptOpen] = useState(!seed.goal.trim())
  const [proposal, setProposal] = useState<Proposal | null>(null)
  /** 펼쳐 둔 세부 목표. 한 번에 하나만 편다 — 8칸 x 8개면 72줄이라 다 펴면 스크롤뿐이다. */
  const [openDomain, setOpenDomain] = useState<string | null>(null)
  /** 담은 과제에 붙일 번호. **에이전트가 중복을 지목할 때 쓰는 id 라 유일하면 된다.** */
  const nextId = useRef(seed.nextId)
  /**
   * 이 화면에 입력이 없는 초안 필드. **되돌려 쓸 때 지우지 않기 위해** 들고 있는다.
   *
   * `SheetDraft` 에는 만료일·공개 여부도 있는데 코치 화면에는 그 입력이 없다. 기본값으로
   * 덮으면 편집기에서 정해 둔 값이 조용히 사라진다.
   */
  const draftMeta = useRef({ expiredAt: seed.expiredAt, isOpen: seed.isOpen })

  /**
   * 담은 과제를 <b>편집기 초안으로 써 둔다.</b>
   *
   * <p>평소에는 아래 효과가 `basket` 이 바뀔 때마다 부르지만, 함수로 빼 둔 이유는 <b>되돌릴
   * 때도 같은 글을 써야 하기 때문</b>이다. 안내용 예시가 담아 둔 과제를 치울 때 화면
   * 상태(`basket`)만 되돌리면 효과가 다시 돌기 전에 화면을 떠날 수 있고, 그러면 예시가 초안에
   * 그대로 남는다. 정리하는 쪽에서 직접 부를 수 있어야 한다.
   *
   * <p><b>8칸 골격에 채워 넣는다.</b> 편집기는 항상 8칸을 그리므로(`emptyDomains`) 담은 것만
   * 성기게 저장하면 그쪽에서 칸 수가 줄어 보인다.
   */
  const writeDraft = useCallback((nextBasket: Basket[], nextGoal: string) => {
    const domains = emptyDomains()
    nextBasket.slice(0, domains.length).forEach((b, index) => {
      const subjects = domains[index].subjects
      domains[index] = {
        title: b.domain,
        subjects: subjects.map((empty, slot) => {
          const item = b.items[slot]
          return item
            ? { title: item.title, period: item.period, countPerPeriod: item.count }
            : empty
        }),
      }
    })
    // **편집기가 쓰는 다른 필드를 지우지 않는다.** `SheetDraft` 에는 만료일·공개 여부도
    // 있고 이 화면에는 그 입력이 없다 — 기본값으로 덮으면 편집기에서 정해 둔 값이
    // 조용히 사라진다.
    saveDraft({
      title: nextGoal,
      expiredAt: draftMeta.current.expiredAt,
      isOpen: draftMeta.current.isOpen,
      domains,
    })
  }, [])

  /**
   * 에이전트에게 넘길 시트 — **담은 과제가 곧 시트다.**
   *
   * 이걸 안 보내면 코치는 사용자가 방금 담은 과제를 모르고 같은 것을 또 제안한다
   * (서버의 중복 검사는 이 목록으로만 돈다). `subjectId` 를 반드시 붙인다 —
   * 없는 과제는 후보에서 버려져서(`to_candidates`) 모델이 지목할 방법이 사라진다.
   */
  const getSheet = useCallback(
    () => ({
      /*
       * **최종목표를 함께 보낸다.** 이름이 `title` 인 이유는 서버가 Spring 의
       * `GET /api/v1/sheets/{sheetId}` 응답 모양을 그대로 받기 때문이다
       * (`ai_livekit/agent/sheet_transfer.py` 의 `SheetPayload.title`).
       *
       * 빼면 에이전트가 중심 목표를 **모른다.** 예전에는 "대화의 첫 목표 발화" 로
       * 추론하게 했는데, 히스토리 창(`BOT_HISTORY_TURNS`)이 두 왕복이라 그 발화가
       * 곧 창 밖으로 밀려나 근거가 사라졌다.
       */
      title: goal.trim(),
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
    [basket, goal],
  )

  /**
   * 구조화 결과 도착. **`generate` 만 카드로 만들고, 나머지는 카드를 걷는다.**
   *
   * 서버의 `_STORABLE_ACTIONS` 와 같은 조건이다. `recommend` 는 이미 시트에 있는 과제를
   * 지목한 것이라 담으면 중복이고, `clarify`·`out_of_scope` 는 되묻기·거절이다.
   *
   * <p>그때 <b>직전 턴의 카드를 남기지 않는다</b> — `send()` 가 텍스트 전송 때 하는 정리와
   * 같은 이유다(어느 것이 지금 이야기인지 흐려지고, 코치가 방향을 바꾼 뒤에도 옛 제안을
   * 담을 수 있다). 음성 발화는 `send()` 를 타지 않아 그 정리가 걸리지 않으므로, 응답이
   * 도착하는 여기서 걷어야 두 경로가 같아진다.
   */
  const handleGoal = useCallback((payload: GoalPayload) => {
    if (payload.action !== 'generate') {
      setProposal(null)
      return
    }
    const domain = (payload.domain ?? '').trim().slice(0, MAX_DOMAIN_TITLE)
    const items = (payload.generated_tasks ?? []).flatMap(toSuggestion)
    // 칸 이름이나 과제가 비어 있으면 담을 수 없다. 서버가 이미 같은 검사를 하지만
    // (`_unknown_domain`), 빈 카드를 그려 놓고 담기가 안 되는 쪽이 더 나쁘다.
    // 이때도 옛 카드를 남기지 않는다 — 담을 수 없는 응답인 것은 위와 같다.
    if (!domain || items.length === 0) {
      setProposal(null)
      return
    }
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

  /* ───────── 사용법 안내와 예시 대화 ───────── */

  /**
   * 안내가 도는 동안에는 말하기 버튼이 <b>예시 대화</b>를 재생한다.
   *
   * <p>실제 음성은 마이크 권한 · LiveKit 방 · STT · LLM 이 모두 살아 있어야 돌아간다. 처음
   * 온 사람에게 그 넷을 통과시킨 다음에야 "이런 식으로 대화합니다" 를 보여 주면 대개는 그
   * 전에 떠난다. 안내를 끝내면 곧바로 실제 음성으로 돌아간다 — 예시는 안내 안에서만 산다.
   */
  const demoArmed = tour.active === 'coach'

  const demo = useCoachDemo({
    onGoal: handleGoal,
    /*
      앞 턴의 과제를 대신 담는다. **화면의 담기와 같은 함수를 부른다** — 8칸 제한도, 중복
      검사도, 담은 칸을 펼치는 동작도 그대로 걸린다. 예시만 다른 길로 넣으면 그 길이 조용히
      낡는다.
    */
    onAdd: ({ domain, task }) => {
      for (const suggestion of toSuggestion(task)) add(domain, suggestion)
    },
    // 예시가 끝나면 "이렇게 오갑니다" 단계는 할 일을 마쳤다. 사용자가 누르기 전에 넘긴다.
    onDone: () => tour.advanceFrom('coach-live'),
  })

  const thinking = coachState === 'thinking' || demo.thinking
  const ready = connection === 'on'

  /*
    예시 대화를 실제 대화 <b>뒤에</b> 이어 붙인다. 두 목록을 섞지 않는 이유는 순서다 —
    예시는 언제나 지금까지의 대화 다음에 온다(방 안내 문구가 먼저 도착해 있다).
  */
  const shownMessages = demo.messages.length > 0 ? [...messages, ...demo.messages] : messages
  const shownCaption = demo.running ? demo.caption : caption
  /** 말하기 버튼이 지금 듣고 있다고 보이는가. 예시 중에는 예시가 정한다. */
  const shownListening = demoArmed || demo.running ? demo.listening : listening
  const shownTalkLeft = demoArmed || demo.running ? demo.talkLeft : talkLeft

  /*
    핵심 목표 팝업이 닫힌 뒤에 안내를 띄운다. 그 팝업은 <b>적어야 넘어갈 수 있는</b> 창이라
    (ESC·배경으로 안 닫힌다) 그 위에 안내를 겹치면 둘 다 막힌다.

    방식 선택 팝업에서 "AI 코치와 대화로 만들기" 를 골라 들어왔으면(`state.tour`) 이미 본
    안내라도 다시 띄운다 — 그 길을 고른 사람은 설명을 원한 것이다.
  */
  useAutoTour('coach', {
    ready: !goalPromptOpen,
    force: Boolean((location.state as { tour?: boolean } | null)?.tour),
  })

  /*
    도움말 목록에서 "AI 코치와 대화하기" 를 직접 고른 경우는 위의 `ready` 를 거치지 않는다 —
    안내를 보러 옮겨 온 것이라 곧바로 시작한다. 그러면 <b>적어야 넘어갈 수 있는</b> 목표 팝업과
    안내가 그대로 겹치므로, 편집기의 방식 선택과 같이 팝업을 안내 뒤로 물린다.
    여는 조건은 그대로라 안내가 끝나면 그 자리에 뜬다.
  */
  const { active: activeTour, pending: pendingTour } = useTour()
  const tourFirst = activeTour === 'coach' || pendingTour === 'coach'

  /**
   * 예시를 재생하기 <b>직전</b>의 초안. 안내가 끝나면 여기로 되돌린다.
   *
   * <p>비어 있지 않을 수 있다 — 편집기에서 쓰던 초안을 들고 코치로 넘어온 경우다. 그래서
   * "다 지운다" 가 아니라 "재생 전으로 되돌린다" 여야 한다.
   */
  const beforeDemo = useRef<{ basket: Basket[]; goal: string; nextId: number } | null>(null)

  const startDemo = demo.start
  const takeSnapshot = useCallback(() => {
    if (beforeDemo.current) return
    beforeDemo.current = { basket, goal, nextId: nextId.current }
  }, [basket, goal])

  /**
   * "이렇게 오갑니다" 단계에 닿으면 <b>예시를 저절로 재생한다.</b>
   *
   * <p>말하기 버튼을 누르는 것이 본래 길이지만, 그 단계에도 "다음" 버튼이 있어서 그냥 넘길
   * 수 있다. 넘겨 버리면 뒤따르는 네 단계가 전부 <b>없는 것을 설명하게 된다</b> — 빈 대화창을
   * 가리키며 "이렇게 오갑니다", 카드가 없는데 "마음에 드는 것만 담기", 텅 빈 초안을 두고
   * "담은 과제가 곧 초안", 그리고 잠긴 "편집기로 가져가기".
   *
   * <p>그래서 <b>어느 길로 오든</b> 이 단계에서는 대화가 돌아간다. 버튼을 눌러서 온 경우에는
   * 이미 재생 중이라 `start()` 가 그냥 돌아간다(훅의 `running` 가드).
   */
  const demoAutoStarted = useRef(false)
  useEffect(() => {
    if (!demoArmed || demoAutoStarted.current) return
    if (tour.activeTarget !== 'coach-live') return
    demoAutoStarted.current = true
    takeSnapshot()
    startDemo()
  }, [demoArmed, tour.activeTarget, startDemo, takeSnapshot])

  /**
   * 안내가 끝나면 <b>예시가 남긴 것을 전부 치운다.</b>
   *
   * <p>예시는 실제 담기 경로를 그대로 타므로(그래서 진짜처럼 보인다) 대화창의 말풍선, 제안
   * 카드, 오른쪽 초안, 그리고 `localStorage` 의 편집기 초안까지 실제로 바뀐다. 안내가 끝난
   * 뒤에도 그게 남아 있으면 <b>시연이 아니라 사용자의 데이터</b>가 된다 — 편집기를 열었을 때
   * 적은 적 없는 "아침 스트레칭 10분" 이 들어 있는 식이다.
   *
   * <p>되돌리는 폭은 <b>재생 직전 상태</b>까지다. 마지막 턴의 카드를 직접 담아 본 것도 예시의
   * 일부라 같이 치운다 — 남기면 "세 개 중 하나만 남은" 어중간한 초안이 된다.
   */
  const resetDemo = demo.reset
  const wasArmed = useRef(false)
  useEffect(() => {
    if (demoArmed) {
      wasArmed.current = true
      return
    }
    if (!wasArmed.current) return
    wasArmed.current = false
    demoAutoStarted.current = false

    // 재생 도중에 안내를 건너뛸 수 있다. 예약된 대사가 남아 있으면 되돌린 뒤에 또 담긴다.
    resetDemo()
    setProposal(null)

    const snapshot = beforeDemo.current
    if (!snapshot) return
    beforeDemo.current = null
    setBasket(snapshot.basket)
    setOpenDomain(null)
    nextId.current = snapshot.nextId
    /*
      초안은 재생 중에 아예 안 썼으므로(자동 저장 효과의 `beforeDemo` 가드) 지금도 스냅샷
      그대로다. 그래도 한 번 더 써 두는 것은 <b>보험</b>이다 — 위 `setBasket` 이 반영되기
      전에 화면을 떠나면 자동 저장이 다시 돌 기회가 없다.
    */
    writeDraft(snapshot.basket, snapshot.goal)
  }, [demoArmed, resetDemo, writeDraft])

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
    if (!ready) return
    void sendSheet()
  }, [basket, ready, sendSheet])

  /**
   * 코치 화면의 편집을 **편집기 초안에 되돌려 쓴다**(`writeDraft`).
   *
   * 예전에는 핸드오프 버튼(`handoff`)만 초안 쪽으로 값을 넘겼다. 그래서 최종목표를
   * 고치고 버튼을 누르지 않은 채 시트로 돌아가면 그 수정이 사라졌다 — 화면에는 남아
   * 있으니 저장된 줄 알게 되는 종류의 손실이다.
   */
  useEffect(() => {
    /*
      **예시가 도는 동안에는 초안에 쓰지 않는다.**

      되돌리기(스냅샷 복원)만으로는 <b>새로고침</b>을 막지 못한다. 재생 도중 F5 를 누르면
      React 의 정리가 돌 기회가 없고, 그 순간까지 저장된 예시 과제가 초안에 그대로 남는다
      (실제로 "아침 스트레칭 10분" 외 둘이 남는 것을 확인했다). 되돌릴 것을 만들지 않는 편이
      확실하다 — 재생 중에는 초안이 <b>한 순간도</b> 예시를 담지 않는다.

      이 구간에 초안이 최신이 아니어도 잃는 것이 없다. 초안을 읽는 곳은 편집기로 넘어가는
      길뿐인데, 안내가 떠 있는 동안에는 그 버튼을 누를 수 없다(오버레이가 덮는다).
    */
    if (beforeDemo.current) return
    writeDraft(basket, goal)
  }, [basket, goal, writeDraft])

  /**
   * 새 내용이 와도 **바닥에 있을 때만** 따라 내려간다. 위로 올려 읽는 중이면 안 끌어당긴다.
   *
   * `caption` 은 의존성에서 뺐다 — 초당 여러 번 바뀌는 중간 전사라 `smooth` 가 재시작되며
   * 스크롤이 덜덜거린다.
   */
  useEffect(() => {
    if (!atBottom) {
      if (messages.length || demo.messages.length) setHasUnread(true)
      return
    }
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    /*
      `shownMessages` 를 의존성에 두지 않는다 — 두 목록을 이어 붙인 <b>새 배열</b>이라 매
      렌더 새 참조가 되고, 그러면 이 효과가 렌더마다 돌아 `smooth` 스크롤이 계속 재시작된다.
      실제로 바뀌는 것은 두 원본이므로 그쪽을 본다.
    */
  }, [messages, demo.messages, proposal, thinking, atBottom])

  const send = (text: string) => {
    const value = text.trim()
    if (!value || thinking || !ready) return
    setInput('')
    // 지난 턴의 카드를 지운다. 남겨 두면 코치가 방향을 바꾼 뒤에도 옛 제안을 담을 수 있고,
    // 어느 것이 지금 이야기인지 흐려진다.
    setProposal(null)
    // 내가 보낸 것은 위를 읽던 중이었어도 따라 내려간다.
    scrollToBottom()
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
    // 담은 칸을 펼친다. 접힌 채로 담기면 담긴 줄 모른다.
    setOpenDomain(domain)
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
          data-tour="coach-chat"
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

          {/* 알림 버튼을 띄우기 위한 기준. 스크롤은 안쪽 div 가 맡는다. */}
          <div data-tour="coach-live" className="relative min-h-0 flex-1">
            <div
              ref={scrollRef}
              onScroll={(e) => {
                const el = e.currentTarget
                // 80px 여유. 0 으로 보면 반올림·애니메이션 도중에 "바닥 아님" 으로 튄다.
                const bottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80
                setAtBottom(bottom)
                if (bottom) setHasUnread(false)
              }}
              className="no-scrollbar h-full overflow-y-auto px-5 py-6"
            >
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
              {shownMessages.map((m) =>
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
              {shownCaption && (
                <div className="flex justify-end">
                  <p
                    className="m-0 max-w-[80%] rounded-[18px] rounded-br-md border border-dashed px-4 py-3 text-[13.5px] font-semibold leading-relaxed"
                    style={{ borderColor: 'var(--color-brand-400)', color: 'var(--text-muted)' }}
                  >
                    {shownCaption}
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
                <div key={proposal.key} data-tour="coach-proposal" className="ml-10">
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

            {/* 끌어내리는 대신 알리기만 한다 — 읽던 자리를 뺏지 않는다. */}
            {hasUnread && !atBottom && (
              <button
                type="button"
                onClick={() => scrollToBottom()}
                className="absolute inset-x-0 bottom-3 mx-auto flex w-fit items-center gap-1.5 rounded-full border-0 px-3.5 py-2 text-[12px] font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5"
                style={{ background: 'var(--color-brand-600)' }}
              >
                새 메시지
                <span aria-hidden="true">↓</span>
              </button>
            )}
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
              data-tour="coach-mic"
              /*
                안내가 도는 동안에는 <b>예시 대화</b>를 재생한다. 실제 마이크는 건드리지
                않는다 — 권한 창을 띄우지도, 오디오를 올려보내지도 않는다.
              */
              onClick={() => (demoArmed ? demo.start() : void toggleTalk())}
              /*
                재생 중에는 `demoArmed` 와 무관하게 잠근다. 안내를 건너뛰어도 예약된 대사는
                계속 도착하는데(타이머는 화면을 떠날 때 놓는다), 그 사이에 실제 마이크가
                열리면 예시와 진짜 발화가 같은 대화창에 섞인다.
              */
              disabled={demoArmed || demo.running ? demo.running : !voiceAvailable || micBusy}
              title={
                demoArmed
                  ? '안내용 예시 대화를 재생합니다 (실제 마이크는 켜지지 않아요)'
                  : micTitle(voiceAvailable)
              }
              aria-label={shownListening ? '말하기 멈추기' : '음성으로 말하기'}
              aria-pressed={shownListening}
              className={cn(
                'flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-[12px] font-bold transition-colors',
                shownListening
                  ? 'border-0 bg-red-500 text-white'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-strong)]',
                'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-[var(--text-muted)]',
              )}
              style={shownListening ? undefined : { borderColor: 'var(--border-hairline)' }}
            >
              <IconMic className="size-[19px]" />
              {/* 남은 초가 글자로 들어오므로 폭이 흔들린다. 숫자만 tabular 로 두면
                  "듣는 중 9:59" → "듣는 중 10:00" 에서 버튼이 덜 튄다. */}
              <span className="tabular-nums">
                {micLabel(demoArmed || voiceAvailable, shownListening, shownTalkLeft)}
              </span>
            </button>

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={ready ? '이루고 싶은 것을 적어보세요' : `${status}…`}
              aria-label="코치에게 보낼 메시지"
              disabled={!ready}
              className="h-11 min-w-0 flex-1 rounded-full border bg-[var(--surface-sunken)] px-4 text-sm font-semibold text-[var(--text-strong)] outline-none transition-colors focus:border-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
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
            data-tour="coach-goal"
            className="shrink-0 border-b px-5 py-4"
            style={{ borderColor: 'var(--border-hairline)' }}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="section-title m-0">새 만다라트 초안</h2>
              <Badge tone={totalItems > 0 ? 'brand' : 'neutral'}>과제 {totalItems}/64</Badge>
            </div>

            {/*
              여기서는 못 고친다. 들어올 때 팝업으로 정하고(`CoachGoalPrompt`) 세션 내내
              그 값을 쓴다 — 대화 도중 바뀌면 앞 턴의 제안이 다른 목표 기준이 된다.
              입력칸 대신 값만 보여준다. 잠긴 입력칸은 왜 안 되는지를 설명하지 못한다.
            */}
            <div className="mt-3">
              <Field label="핵심 목표" hint="편집기에서 고칠 수 있어요.">
                <p
                  className="m-0 truncate rounded-xl border px-3.5 py-2.5 text-[13.5px] font-bold"
                  style={{
                    borderColor: 'var(--border-hairline)',
                    background: 'var(--surface-sunken)',
                  }}
                  title={goal}
                >
                  {goal}
                </p>
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
          <div data-tour="coach-basket" className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-4">
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
                  const open = openDomain === b.domain
                  return (
                    <div key={b.domain}>
                      <button
                        type="button"
                        onClick={() => setOpenDomain(open ? null : b.domain)}
                        aria-expanded={open}
                        aria-controls={`basket-${b.domain}`}
                        className="flex w-full items-center gap-2 border-0 bg-transparent p-0 text-left"
                      >
                        <IconChevronDown
                          aria-hidden="true"
                          className={cn(
                            'size-3.5 shrink-0 text-[var(--text-muted)] transition-transform',
                            !open && '-rotate-90',
                          )}
                        />
                        <strong className="min-w-0 flex-1 truncate text-[12.5px] font-extrabold">
                          {b.domain}
                        </strong>
                        <span className="muted shrink-0 text-[11px] font-bold tabular-nums">
                          {b.items.length}/{SLOTS}
                        </span>
                      </button>

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

                      {/* 접혀도 위 눈금·개수는 남아 어느 칸이 비었는지 보인다. */}
                      <ul
                        id={`basket-${b.domain}`}
                        hidden={!open}
                        className="m-0 mt-2.5 flex list-none flex-col gap-1.5 p-0"
                      >
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
              아래 버튼이 왜 잠겨 있는지를 말한다. 만다라트는 81칸을 모두 채워야 저장되는데
              (서버가 8 x 8 을 강제한다) 편집기에 가서야 알게 되면 늦다.
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
            <Button
              full
              data-tour="coach-handoff"
              disabled={basket.length === 0}
              onClick={handoff}
            >
              편집기로 가져가기
            </Button>
            <Button variant="quiet" full size="sm" className="mt-2" to="/app/sheets/new">
              처음부터 직접 채우기
            </Button>
          </div>
        </aside>
      </div>

      {/* 목표 없이 들어오면 먼저 묻는다. 방 접속은 뒤에서 계속 진행된다. */}
      <CoachGoalPrompt
        open={goalPromptOpen && !tourFirst}
        onSubmit={(next) => {
          setGoal(next)
          setGoalPromptOpen(false)
        }}
        onLeave={() => navigate('/app/sheets/new')}
      />
    </div>
  )
}
