import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/common/Button'
import Header from '../components/common/Header'
import CoachDomainList, {
  type CoachDomain,
  type CoachSlot,
} from '../components/aiCoach/CoachDomainList'
import CoachSheetGrid from '../components/aiCoach/CoachSheetGrid'
import { useCoachRoom, type CoachState, type GoalPayload } from '../components/aiCoach/useCoachRoom'
import { DOMAIN_COUNT, TOTAL_CELLS } from '../components/sheet/sheet.data'
import type { Domain, Period, Subject } from '../components/sheet/sheet.types'
import {
  buildGrid,
  countFilledCells,
  createDomain,
  createSubject,
} from '../components/sheet/sheet.utils'
// 축소판 그리드가 `.Sheet` · `.card` · `.pill` · `.section-title` 을 쓴다 — 이 파일을
// 안 읽으면 칸이 색도 테두리도 없이 그려진다(SheetDetail · GroupSetup 도 같은 이유로 가져온다).
import '../styles/sheet-create.css'
import '../styles/ai-coach.css'

/**
 * 캐릭터가 알려주는 코치의 상태. 전환 시점은 `useCoachRoom` 이 LiveKit 이벤트에서 잡는다
 * (`lk.chat` 수신 · 최종 전사 · 연결 끊김).
 */
const COACH: Record<CoachState, { src: string; caption: string }> = {
  idle: { src: '/images/char_3.png', caption: '시트를 보고 있어요' },
  thinking: { src: '/images/char_2.png', caption: '생각하고 있어요…' },
  answering: { src: '/images/char_1.png', caption: '답을 드릴게요!' },
}

/**
 * 화면 확인용 만다라트.
 *
 * **`SheetCreate` 에서 편집하던 시트가 아니다.** 저쪽은 `useSheetEditor()` 로컬 상태만
 * 들고 있어서 `navigate('/ai-coach')` 하는 순간 사라진다. 두 화면이 같은 시트를 보게
 * 하려면 편집 상태를 공유 저장소로 올려야 하고, 그건 아직이다.
 */
type DemoSubject = { title: string; period: Period }

const DEMO_SHEET: { domain: string; subjects: DemoSubject[] }[] = [
  // 도메인당 8개가 다 찼을 때를 상정한 밀도로 둔다 — 한두 개짜리로 확인하면
  // 목록이 실제보다 짧아 보여 세로 배치를 잘못 잡는다. '식단' 은 일부러 꽉 채웠다
  // (추천을 담을 자리가 없는 경우를 화면에서 보려는 것이다).
  {
    domain: '운동',
    subjects: [
      { title: '주 3회 스트레칭', period: 'weekly' },
      { title: '계단 이용하기', period: 'daily' },
      { title: '주말 등산', period: 'weekly' },
      { title: '아침 산책 20분', period: 'daily' },
      { title: '스쿼트 50개', period: 'daily' },
      { title: '주 1회 수영', period: 'weekly' },
      { title: '자전거 출퇴근', period: 'daily' },
    ],
  },
  {
    domain: '식단',
    subjects: [
      { title: '아침 거르지 않기', period: 'daily' },
      { title: '물 2L 마시기', period: 'daily' },
      { title: '야식 안 먹기', period: 'daily' },
      { title: '채소 한 접시', period: 'daily' },
      { title: '단백질 챙기기', period: 'daily' },
      { title: '주 1회 도시락', period: 'weekly' },
      { title: '간식 줄이기', period: 'daily' },
      { title: '배달 주 1회로', period: 'weekly' },
    ],
  },
  {
    domain: '수면',
    subjects: [
      { title: '기상 후 스트레칭', period: 'daily' },
      { title: '낮잠 30분 이내', period: 'daily' },
      { title: '자기 전 폰 끄기', period: 'daily' },
      { title: '주말도 같은 기상', period: 'weekly' },
    ],
  },
  {
    domain: '공부',
    subjects: [
      { title: '알고리즘 1문제', period: 'daily' },
      { title: 'CS 정리 30분', period: 'daily' },
      { title: '영어 단어 20개', period: 'daily' },
      { title: '주 1회 회고', period: 'weekly' },
      { title: '독서 30분', period: 'daily' },
    ],
  },
  {
    domain: '멘탈',
    subjects: [
      { title: '하루 회고 쓰기', period: 'daily' },
      { title: '명상 10분', period: 'daily' },
      { title: '감사 3가지', period: 'daily' },
    ],
  },
  {
    domain: '관계',
    subjects: [
      { title: '주 1회 안부 연락', period: 'weekly' },
      { title: '가족 식사', period: 'weekly' },
      { title: '월 1회 모임', period: 'none' },
    ],
  },
  {
    domain: '취미',
    subjects: [
      { title: '기타 연습 20분', period: 'daily' },
      { title: '사진 찍기', period: 'weekly' },
      { title: '전시 관람', period: 'none' },
    ],
  },
  {
    domain: '정리',
    subjects: [
      { title: '책상 정리', period: 'daily' },
      { title: '가계부 쓰기', period: 'weekly' },
      { title: '주말 대청소', period: 'weekly' },
      { title: '옷장 비우기', period: 'none' },
    ],
  },
]

const DEMO_MAIN_GOAL = '건강한 몸 만들기'

/**
 * 도메인 인덱스(0~7)를 9x9 의 블록 번호(0~8)로 되돌린다.
 * `buildGrid` 가 쓰는 `skipCenter`(가운데를 건너뛴 인덱스)의 역함수다.
 */
const unskipCenter = (index: number): number => (index < 4 ? index : index + 1)

/**
 * 도메인의 과제는 **길이 8 의 자리 배열**이다. 없는 과제는 `null` 로 자리만 지킨다.
 *
 * 빽빽한 배열로 두면 3번 과제를 지웠을 때 4번이 3번으로 당겨져, 화면의 "빈 칸" 이
 * 항상 뒤쪽에만 생긴다. 실제 만다라트는 칸의 위치가 곧 `Subject.position` 이라
 * 지운 자리가 그 자리에 남아야 하고, 사용자도 그 칸을 눌러 다시 채운다.
 */
type DomainSlots = (DemoSubject | null)[]

const toSlots = (subjects: DemoSubject[]): DomainSlots =>
  Array.from({ length: DOMAIN_COUNT }, (_, slot) => subjects[slot] ?? null)

/** 편집의 출발점. 무엇이 달라졌는지 셀 때 이 값과 비교한다. */
const INITIAL_SHEET = DEMO_SHEET.map((entry) => ({
  domain: entry.domain,
  subjects: toSlots(entry.subjects),
}))

type Recommendation = { domain: string; title: string; period: Period }

/**
 * 연결 전에 화면 구성을 보기 위한 예시 추천.
 * 접속하면 에이전트가 `mandarin.goal` 로 보내는 것이 뒤에 쌓인다.
 */
const DEMO_RECOMMENDATIONS: Recommendation[] = [
  { domain: '수면', title: '23시 전 취침하기', period: 'daily' },
  { domain: '운동', title: '주 3회 저녁 스트레칭 15분', period: 'weekly' },
  { domain: '식단', title: '카페인 오후 3시 이후 컷오프', period: 'daily' },
]

export default function AiCoachPage() {
  const navigate = useNavigate()

  const [input, setInput] = useState('')
  const [recommendations, setRecommendations] = useState<Recommendation[]>(DEMO_RECOMMENDATIONS)

  /**
   * 편집 중인 시트. **도메인 이름도 과제도 확정된 값이 아니다** — 만드는 중인 시트라
   * 여기서 고칠 수 있어야 한다. 원본(`DEMO_SHEET`)은 그대로 두고 무엇이 바뀌었는지
   * 세는 데 쓴다.
   */
  const [sheet, setSheet] = useState(INITIAL_SHEET)

  /** 담기로 고른 추천의 인덱스 */
  // 아무것도 미리 골라두지 않는다 — 담을지는 사용자가 정한다. 기본으로 체크해 두면
  // 그대로 "적용하기" 를 눌렀을 때 고른 적 없는 과제가 시트에 들어간다.
  const [picked, setPicked] = useState<number[]>([])
  /**
   * 물린 추천의 인덱스.
   *
   * 시트를 건드리는 게 아니라 제안을 치우는 것이라 `적용하기` 가 셀 변경에 들어가지
   * 않는다 — 되돌리기도 두지 않았다. 다시 받고 싶으면 "추천 새로고침" 이다.
   */
  const [dismissed, setDismissed] = useState<number[]>([])

  const messageBox = useRef<HTMLDivElement | null>(null)

  /*
   * 에이전트에 넘길 시트. **Spring 의 `SheetDetailResponse.domains[]` 모양**이다
   * (`mandarin_goal/sheet.py` 의 `DomainRef`/`SubjectRef`).
   *
   * `id` 를 반드시 붙인다 — `recommend` 는 제목이 아니라 `subjectId` 로 과제를 지목해서,
   * 없는 과제는 후보에서 빠지고 곧 중복 제안으로 돌아온다. 진짜 PK 는 Spring 이 정하는
   * 값이라 아직 없으므로 시트 안에서만 유일한 번호를 붙인다(`web/app.js` 와 같은 방식).
   *
   * 빈도는 `period` 로 보낸다 — 그쪽이 정본이고 `frequency` 로 보내면 조용히 `None` 이
   * 되어 빈도 표시와 가산점이 같이 죽는다.
   */
  const buildAgentSheet = useCallback(
    () => ({
      domains: sheet.map((entry, domainIndex) => {
        const subjects = entry.subjects.flatMap((subject, slot) =>
          subject
            ? [{ id: domainIndex * DOMAIN_COUNT + slot + 1, title: subject.title, period: subject.period }]
            : [],
        )
        return { id: null, title: entry.domain, subjectCount: subjects.length, subjects }
      }),
    }),
    [sheet],
  )

  /**
   * 에이전트가 만든 과제를 추천 목록 뒤에 쌓는다.
   *
   * **`generate` 만 담는다.** 서버의 `_STORABLE_ACTIONS = ("generate",)` 와 같은 조건이다.
   * `recommend` 는 "이미 시트에 있는 과제" 를 지목한 것이라 담으면 중복이 된다 —
   * `web/app.js` 주석에 따르면 실제로 그렇게 시트가 3개에서 4개로 늘었다.
   */
  const notifyRef = useRef<(text: string) => void>(() => {})

  const handleGoal = useCallback(
    (payload: GoalPayload) => {
      if (payload.action !== 'generate') return
      const task = payload.generated_task
      if (!task?.title || !payload.domain) return
      const domain = payload.domain

      /*
       * **시트에 없는 칸을 제안했으면 목록에 담지 않는다.**
       *
       * 프롬프트 규칙상 코치는 맞는 칸이 없으면 새 칸을 지어낸다(`system.md` 2번).
       * 그런데 만다라트는 8칸 고정이고, 어떤 칸을 둘지는 사용자가 정하는 영역이다 —
       * 코치가 칸을 늘리게 두지 않는다.
       *
       * `domain_is_new` 는 서버가 우리가 보낸 목록과 대조해 정한 값이라 믿을 수 있지만,
       * 시트를 보내기 전에 온 응답이면 토큰 metadata 기준으로 판정된다. 그래서 지금
       * 화면의 도메인과도 대조한다.
       *
       * 조용히 버리지는 않는다 — 코치는 대화에서 "새로 ○○ 칸을 만들어 담게 됩니다" 라고
       * 이미 말했는데 목록에 아무것도 안 생기면 사용자는 화면이 고장난 줄 안다.
       */
      const known = sheet.some((entry) => entry.domain === domain)
      if (payload.domain_is_new || !known) {
        notifyRef.current(`"${domain}" 칸은 시트에 없어서 "${task.title}" 은 담지 않았어요`)
        return
      }

      setRecommendations((prev) => [
        ...prev,
        { domain, title: task.title as string, period: task.frequency ?? 'none' },
      ])
    },
    [sheet],
  )

  const room = useCoachRoom({ getSheet: buildAgentSheet, onGoal: handleGoal })
  const { messages, coachState } = room
  notifyRef.current = room.notify


  useEffect(() => {
    // **`scrollIntoView` 를 쓰지 않는다.** 그 함수는 스크롤 가능한 조상을 거슬러 올라가며
    // 다 움직인다 — `overflow-hidden` 인 페이지 껍데기도 코드로는 스크롤되므로, 창이 낮으면
    // 말풍선 대신 화면 전체가 위로 밀려 헤더와 제목이 잘렸다. 이 상자만 직접 내린다.
    const box = messageBox.current
    if (box) box.scrollTop = box.scrollHeight
  }, [messages])

  const togglePick = (id: number) => {
    setPicked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const dismissRecommendation = (id: number) => {
    setDismissed((prev) => [...prev, id])
    // 담아둔 것을 지우면 시트에서도 빠져야 한다 — 목록에서만 사라지고 칸에 남으면
    // 되돌릴 방법이 없는 과제가 생긴다.
    setPicked((prev) => prev.filter((item) => item !== id))
  }

  /**
   * 과제를 없앤다. 줄이 사라지는 게 아니라 그 자리가 빈 칸으로 돌아간다.
   *
   * **확인을 묻지 않는다.** 그 자리에 되돌리기(↩)가 남아 잘못 눌러도 한 번에 되살릴 수
   * 있다 — 되돌릴 수 있는 동작에 확인 팝업까지 세우면 손만 더 간다.
   */
  const deleteSubject = (domainIndex: number, slot: number) => {
    setSheet((prev) =>
      prev.map((entry, index) =>
        index === domainIndex
          ? { ...entry, subjects: entry.subjects.map((s, i) => (i === slot ? null : s)) }
          : entry,
      ),
    )
  }

  /**
   * 지운 과제를 그 자리에 되돌린다.
   *
   * **고치기 전 원본으로 돌아간다.** 지운 뒤에 남는 것은 "원래 무엇이 있었나" 뿐이라
   * 고쳐 둔 값은 이미 사라졌다 — 되돌리기가 절반만 되돌리는 것보다 낫다.
   */
  const restoreSubject = (domainIndex: number, slot: number) => {
    const origin = INITIAL_SHEET[domainIndex].subjects[slot]
    if (!origin) return
    setSheet((prev) =>
      prev.map((entry, index) =>
        index === domainIndex
          ? { ...entry, subjects: entry.subjects.map((s, i) => (i === slot ? origin : s)) }
          : entry,
      ),
    )
  }

  /**
   * 원본과 달라진 것들. 무엇이 달라졌는지는 목록이 보여주고, 여기서는 세기만 한다.
   */
  const deletedCount = useMemo(
    () =>
      sheet.reduce(
        (total, entry, domainIndex) =>
          total +
          entry.subjects.filter(
            (subject, slot) => !subject && INITIAL_SHEET[domainIndex].subjects[slot],
          ).length,
        0,
      ),
    [sheet],
  )

  /** 적용하기가 처리할 변경 수. 담기·지우기·고치기 모두 저장 전 상태다. */
  const changeCount = picked.length + deletedCount

  /**
   * 담기로 고른 추천을 시트에 얹어, 목록과 9x9 가 같은 데이터를 보게 만든다.
   *
   * **고른 추천은 시트 이미지에도 채워진 칸으로 나타난다.** 목록에서 체크했는데 그림이
   * 그대로면 어디에 담겼는지 확인할 방법이 없다. 저장 전이라는 것은 도메인 옆 `+n` 과
   * 헤더의 "적용하기" 가 말해준다.
   *
   * 자리가 없으면 담기지 않는다 — 도메인당 8칸이 상한이라 9번째를 그릴 칸이 아예 없다.
   */
  const { grid, filled, domains } = useMemo(() => {
    const list: CoachDomain[] = []
    const subjectsPerDomain: (Subject | null)[][] = []

    const gridDomains: (Domain | null)[] = sheet.map((entry, index) => ({
      ...createDomain(index),
      title: entry.domain,
    }))

    sheet.forEach((entry, domainIndex) => {
      /*
       * 8칸을 그대로 두고, 비어 있는 자리에만 추천을 앉힌다.
       *
       * **자리를 당기지 않는다.** 3번 과제를 지웠으면 3번이 빈 칸이고, 추천은 그 3번으로
       * 들어간다. 앞으로 당겨버리면 화면의 빈 칸이 늘 뒤쪽에만 생겨서, 지운 자리에 다시
       * 채운다는 것이 보이지 않는다.
       *
       * 추천은 **고르지 않았어도** 빈 칸 하나를 미리 차지한다 — 8칸을 다 그리므로
       * "이 추천은 여기 들어간다" 가 자리로 보여야 한다. 안 고른 칸의 시트 값은 `null`
       * 이다(자리는 잡되 아직 시트에 없는 과제).
       */
      const slots: CoachSlot[] = entry.subjects.map((subject, slot) => {
        if (subject) return { kind: 'subject', slot, title: subject.title, period: subject.period }
        // 원래 이 자리에 있던 과제를 지운 것이면 무엇이었는지 들려 보낸다 — 되돌리기가
        // 붙는다. 처음부터 비어 있던 칸은 되돌릴 것이 없다.
        const origin = INITIAL_SHEET[domainIndex].subjects[slot]
        return origin
          ? { kind: 'empty', slot, restore: { title: origin.title, period: origin.period } }
          : { kind: 'empty', slot }
      })
      const placed: (DemoSubject | null)[] = [...entry.subjects]

      let addedCount = 0
      const blocked: { id: number; title: string; period: Period }[] = []

      recommendations.map((task, id) => ({ task, id }))
        .filter(({ task, id }) => task.domain === entry.domain && !dismissed.includes(id))
        .forEach(({ task, id }) => {
          /*
           * **원래 비어 있던 칸을 먼저 쓴다.** 방금 지운 자리로 추천이 올라오면 되돌리기
           * 줄을 덮어버려서, 잘못 지운 것을 되살릴 방법이 사라진다.
           *
           * 빈 칸이 없으면 그때는 지운 자리를 쓴다 — 8칸이 다 차 있던 도메인에서 하나를
           * 지워 자리를 만드는 것은 정상적인 흐름이다.
           */
          const free =
            slots.findIndex((slot) => slot.kind === 'empty' && !slot.restore) >= 0
              ? slots.findIndex((slot) => slot.kind === 'empty' && !slot.restore)
              : slots.findIndex((slot) => slot.kind === 'empty')
          if (free < 0) {
            blocked.push({ id, title: task.title, period: task.period })
            return
          }
          const isPicked = picked.includes(id)
          slots[free] = {
            kind: 'recommendation',
            slot: free,
            id,
            title: task.title,
            period: task.period,
            picked: isPicked,
          }
          if (isPicked) {
            placed[free] = { title: task.title, period: task.period }
            addedCount += 1
          }
        })

      list.push({
        index: domainIndex,
        blockIndex: unskipCenter(domainIndex),
        title: entry.domain,
        slots,
        used: placed.filter(Boolean).length,
        addedCount,
        blocked,
      })

      // 9x9 는 목록과 **같은 자리 배정**을 쓴다. 따로 계산하면 목록의 3번 칸과 그림의
      // 5번 칸이 어긋나 같은 과제가 다른 곳을 가리킨다.
      subjectsPerDomain.push(
        placed.map((subject, slot) =>
          subject ? { ...createSubject(domainIndex, slot), ...subject } : null,
        ),
      )
    })

    const built = buildGrid(DEMO_MAIN_GOAL, gridDomains, subjectsPerDomain)
    return { grid: built, filled: countFilledCells(built), domains: list }
  }, [sheet, recommendations, picked, dismissed])

  const send = (event: FormEvent) => {
    event.preventDefault()
    const text = input.trim()
    if (!text) return
    setInput('')
    void room.sendChat(text)
  }

  /*
   * 화면 한 장에 다 들어가게 잡는다 — 페이지는 스크롤하지 않고, 넘치는 것은 목록과
   * 말풍선이 각자 안에서 스크롤한다. 그래야 시트 카드와 대화 카드의 높이가 맞는다.
   *
   * 높이를 `calc(100vh - 72px)` 로 빼지 않고 flex 로 나눈다 — 헤더 높이를 숫자로 적어두면
   * 헤더가 바뀔 때 여기가 조용히 어긋난다.
   *
   * 폭은 `SheetCreate` 와 달리 고정하지 않는다. 저쪽이 1280px 에 묶인 건 9x9 가 500px 라
   * 줄면 칸이 눌리기 때문인데, 여기 축소판은 340px 고정이라 남는 폭은 목록이 가져가면 된다.
   */
  return (
    <div className="flex h-screen min-w-[1280px] flex-col overflow-hidden bg-[#F6F7F8]">
      <Header />

      <main className="mx-auto flex min-h-0 w-full max-w-[1720px] flex-1 flex-col px-6 pb-6 pt-5">
        <header className="mb-[18px] flex shrink-0 items-center justify-between gap-4">
          <div>
            <h1 className="section-title m-0 text-[20px]">AI 코치와 과제 만들기</h1>
            {/* 무엇이 바뀌는지 버튼 숫자만으로는 알 수 없다 — 담기와 지우기를 갈라 적는다. */}
            {changeCount > 0 ? (
              <p className="m-0 mt-1 text-[12.5px] font-bold text-ink-500">
                {picked.length > 0 && <span className="text-mint-600">담을 과제 {picked.length}개</span>}
                {deletedCount > 0 && (
                  <span className="text-[#be123c]">
                    {picked.length > 0 && ' · '}지울 과제 {deletedCount}개
                  </span>
                )}
                <span className="font-semibold text-ink-400"> — 적용하기를 눌러야 반영돼요</span>
              </p>
            ) : (
              <p className="m-0 mt-1 text-[12.5px] text-ink-400">
                대화하면 코치가 과제를 제안해요. 담을 것만 골라 만다라트에 넣으세요.
              </p>
            )}
          </div>

          <div className="flex gap-2.5">
            <Button variant="ghost" onClick={() => navigate('/sheet/create')}>
              만다라트로 돌아가기
            </Button>
            <Button variant="primary" disabled={changeCount === 0}>
              적용하기 ({changeCount})
            </Button>
          </div>
        </header>

        {/* grid-rows 를 명시한다 — 안 쓰면 암시적 행이 `auto` 라 칸 높이가 내용대로 커지고,
            컨테이너 높이가 정해져 있어도 그 밖으로 넘쳐 대화 카드가 화면 아래로 잘렸다. */}
        <div className="grid min-h-0 flex-1 grid-cols-[1fr_380px] grid-rows-[minmax(0,1fr)] gap-5">
          {/* 왼쪽: 시트 한 장 — 축소판과 도메인별 목록을 한 카드에 붙여 둔다.
              따로 떼면 같은 시트를 말하는 두 덩어리가 남남처럼 보인다. */}
          {/*
            축소판 폭은 화면 높이를 따라 바뀌므로 칸을 고정하지 않는다(→ `.coach-grid`).
            justify-center: 시트 한 장은 큰 화면을 다 채우지 못한다. 카드 높이는 오른쪽 칸과
            맞추되 **제목까지 한 덩어리로 묶어** 가운데에 둔다 — 제목만 위에 붙이고 내용을
            가운데 두면 둘이 떨어져 보인다.
          */}
          <section className="card flex min-h-0 flex-col justify-center p-5">
            <div className="mb-3.5 flex shrink-0 items-center justify-between gap-3">
              <h2 className="section-title m-0 text-sm">내 만다라트</h2>
              <p className="m-0 text-[11.5px] text-ink-400">
                색이 있는 칸이 채운 칸이에요 — {TOTAL_CELLS}칸 중 {filled}칸
              </p>
            </div>

            <div className="grid min-h-0 grid-cols-[max-content_1fr] items-start gap-x-7 overflow-hidden">
              <CoachSheetGrid grid={grid} />

              {/* 도메인이 늘거나 창이 낮으면 목록만 스크롤한다 — 카드 높이는 그대로 둔다. */}
              <div className="flex h-full min-h-0 flex-col">
                <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                  <h3 className="section-title m-0 text-[13px]">
                    도메인별 과제
                    <span className="ml-1 font-bold text-ink-400">
                      · AI 추천 {recommendations.length - dismissed.length}개
                    </span>
                  </h3>
                  <div className="flex items-center gap-3">
                    <p className="m-0 text-[11.5px] text-ink-400">
                      도메인당 최대 {DOMAIN_COUNT}개
                    </p>
                    <button
                      type="button"
                      className="cursor-pointer border-0 bg-transparent p-0 text-[12px] font-bold text-mint-600"
                    >
                      추천 새로고침
                    </button>
                  </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                  <CoachDomainList
                    domains={domains}
                    onToggleRecommendation={togglePick}
                    onDismissRecommendation={dismissRecommendation}
                    onDeleteSubject={deleteSubject}
                    onRestoreSubject={restoreSubject}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* 오른쪽: 코치와 대화만. 추천이 도메인 목록으로 옮겨가 이 칸을 통째로 쓴다 —
              카드가 하나뿐이라 낮은 창에서 서로 자리를 다투던 문제도 같이 사라졌다. */}
          <div className="flex min-h-0 flex-col">
            <section className="card flex min-h-0 flex-1 flex-col p-5" aria-label="AI 코치와 대화">
              <div className="mb-2 flex shrink-0 items-center gap-2">
                <h2 className="section-title m-0 text-sm">🤖 만다린 AI 코치</h2>

                {/* 연결 상태는 배지가, AI 가 지금 무엇을 하는지는 캐릭터가 말한다.
                    둘을 한 곳에 합치면 "연결됨" 만 떠 있는 동안 응답을 기다리는 중인지
                    알 수 없다. */}
                <span
                  className={`ml-auto shrink-0 rounded-full border px-2 py-[3px] text-[11px] font-bold ${
                    room.connection === 'on'
                      ? 'border-mint-500 text-mint-600'
                      : room.connection === 'busy'
                        ? 'border-[#b45309] text-[#b45309]'
                        : 'border-ink-100 text-ink-400'
                  }`}
                >
                  {room.status}
                </span>

                {room.connection === 'off' ? (
                  <Button variant="primary" size="sm" onClick={() => void room.connect()}>
                    연결하기
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => void room.disconnect()}>
                    끊기
                  </Button>
                )}
              </div>

              <div className="ai-coach-figure" data-state={coachState}>
                <img src={COACH[coachState].src} alt="" />
              </div>
              <p className="ai-coach-figure-caption">{COACH[coachState].caption}</p>

              <div
                ref={messageBox}
                className="mt-3 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto border-t border-ink-100 pt-3"
              >
                {messages.length === 0 && (
                  <p className="m-0 text-[12.5px] text-ink-400">
                    연결하기를 누르면 코치와 대화를 시작합니다.
                  </p>
                )}
                {messages.map((message) => (
                  <p
                    key={message.id}
                    className={`m-0 w-fit max-w-[85%] rounded-2xl px-3 py-2 text-[12.5px] leading-snug [overflow-wrap:anywhere] ${
                      message.who === 'me'
                        ? 'ml-auto bg-mint-600 text-white'
                        : message.who === 'warn'
                          ? 'w-full max-w-full bg-transparent px-0 py-0 font-bold text-[#be123c]'
                          : message.who === 'sys'
                            ? 'w-full max-w-full bg-transparent px-0 py-0 text-ink-400'
                            : 'bg-ink-100 text-ink-900'
                    }`}
                  >
                    {message.text}
                  </p>
                ))}
              </div>

              {/* 진행 중인 전사문. 지워질 글자라 말풍선과 다르게 보여야 한다. */}
              {room.caption && (
                <p className="m-0 mt-2 shrink-0 rounded-md border border-dashed border-ink-300 px-2 py-1 text-[12px] italic text-ink-500">
                  {room.caption}
                </p>
              )}

              <form
                onSubmit={send}
                className="mt-3 flex shrink-0 items-center gap-2 rounded-full border border-ink-100 bg-white py-1 pl-2 pr-1 focus-within:border-mint-500"
              >
                {/*
                  누르면 10초간 듣고 자동으로 멈춘다. 다 말했으면 한 번 더 눌러 바로 끈다 —
                  **켜 둔 시간만큼 STT 가 과금된다.** 서버가 음성을 못 받는 상태
                  (`mandarin.hello` 의 `voice:false`)면 잠가 둔다. 열어두면 눌러서 말하고
                  아무 일도 안 일어나는 것을 보게 된다.
                */}
                <button
                  type="button"
                  onClick={() => void room.toggleTalk()}
                  disabled={!room.voiceAvailable}
                  title={
                    room.voiceAvailable
                      ? '누르면 10초간 듣습니다'
                      : '서버에 음성이 꺼져 있습니다 (DEEPGRAM_API_KEY 없음)'
                  }
                  className={`shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors disabled:cursor-default disabled:opacity-50 ${
                    room.listening
                      ? 'border-mint-600 bg-mint-600 text-white'
                      : 'border-ink-100 bg-white text-ink-500 hover:border-mint-500'
                  }`}
                >
                  {room.listening ? `🎤 듣는 중 ${room.talkLeft}s` : '🎤 말하기'}
                </button>

                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={room.connection === 'off' ? '연결 후 입력하세요' : '메시지 입력...'}
                  aria-label="메시지 입력"
                  disabled={room.connection === 'off'}
                  className="min-w-0 flex-1 border-0 bg-transparent text-[12.5px] text-ink-900 outline-none placeholder:text-ink-400"
                />
                <button
                  type="submit"
                  aria-label="메시지 전송"
                  className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-mint-600 text-white"
                >
                  ➤
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
