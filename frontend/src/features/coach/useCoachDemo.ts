import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage, GoalPayload, GoalTask } from '../../components/aiCoach/useCoachRoom'
import { DEMO_TURNS } from './demoScript'

/**
 * 안내용 예시 대화.
 *
 * <p><b>왜 필요한가.</b> AI 코치의 값어치는 "말하면 과제가 나온다" 는 흐름 자체인데, 그것을
 * 보려면 마이크 권한을 주고 LiveKit 방이 붙고 STT·LLM 이 전부 살아 있어야 한다. 처음 온
 * 사람에게 그 셋을 통과시킨 <b>다음</b>에야 설명이 시작되면, 대개는 그 전에 화면을 떠난다.
 * 그래서 안내가 도는 동안에는 같은 자리에 <b>같은 모양의</b> 예시 대화를 재생한다.
 *
 * <p><b>진짜인 척하지 않는다.</b> 이 재생은 오버레이 안내가 도는 동안에만 걸리고(페이지의
 * `demoArmed`), 안내 카드와 버튼 툴팁이 "예시 대화" 라고 먼저 말한다. 안내를 끝내면 말하기
 * 버튼은 곧바로 실제 음성으로 돌아간다.
 *
 * <p>화면 모델은 <b>실제와 같은 것</b>을 쓴다(`ChatMessage`·`GoalPayload`). 별도 모양으로
 * 두면 이 예시만 그리는 분기가 페이지에 생기고, 실제 응답이 바뀔 때 같이 낡는다.
 */

/** 남은 시간 표시용. 실제 창(`TALK_WINDOW_MS`)과 같은 15분에서 시작한다. */
const TALK_WINDOW_SEC = 15 * 60

/* ── 재생 간격 ────────────────────────────────────────────────────────
   왕복이 셋이라 <b>한 턴이 길면 전체가 늘어진다</b>. 사람이 읽는 데 필요한 최소만 준다:
   답이 뜨고 다음 발화가 시작되기까지 1.2초면 한 문장을 훑을 수 있고, 제안 카드는 그 뒤에
   따로 나타나므로 다시 눈이 간다. */
/** 받아 적히는 토막 사이. */
const CHUNK_MS = 460
/** 마지막 토막이 뜬 뒤 최종 전사로 굳기까지. */
const SETTLE_MS = 320
/** "생각하는 중" 점 세 개가 도는 시간. */
const THINK_MS = 1_300
/** 답이 뜬 뒤 제안 카드가 따라오기까지. 실제로도 두 토픽이 잇달아 온다. */
const PROPOSAL_MS = 480
/** 제안이 뜬 뒤 대신 담기까지. 카드를 한 번은 보게 둔다. */
const AUTO_ADD_MS = 900
/** 한 턴이 끝나고 다음 발화가 시작되기까지. */
const TURN_GAP_MS = 1_200

/** 담을 수 있는 모양으로. 페이지의 `toSuggestion` 과 같은 변환이라 값이 어긋나지 않는다. */
export type DemoAdd = { domain: string; task: GoalTask }

type Options = {
  /** 제안이 도착했다. <b>실제 경로와 같은 콜백</b>이라 제안 카드가 그대로 그려진다. */
  onGoal: (payload: GoalPayload) => void
  /**
   * 앞 턴의 과제를 대신 담는다. 페이지의 담기 경로를 그대로 부르므로 8칸 제한·중복 검사가
   * 똑같이 걸린다.
   */
  onAdd: (add: DemoAdd) => void
  /** 재생이 끝났다. 안내를 다음 단계로 넘기는 데 쓴다. */
  onDone?: () => void
}

export function useCoachDemo({ onGoal, onAdd, onDone }: Options) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [caption, setCaption] = useState('')
  const [listening, setListening] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [running, setRunning] = useState(false)
  const [talkLeft, setTalkLeft] = useState(0)

  const timers = useRef<number[]>([])
  const nextId = useRef(1)

  const onGoalRef = useRef(onGoal)
  const onAddRef = useRef(onAdd)
  const onDoneRef = useRef(onDone)
  onGoalRef.current = onGoal
  onAddRef.current = onAdd
  onDoneRef.current = onDone

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id)
    timers.current = []
  }, [])

  // 화면을 떠나면 남은 예약을 모두 놓는다. 안 그러면 언마운트 뒤에 setState 가 돈다.
  useEffect(() => clearTimers, [clearTimers])

  /**
   * 예시 메시지에는 <b>큰 번호</b>를 준다. 실제 대화의 `messageId` 는 1 부터 오르는데,
   * 두 목록을 한 화면에 이어 그리므로 번호가 겹치면 React 가 같은 줄로 보고 섞는다.
   */
  const push = useCallback((who: ChatMessage['who'], text: string) => {
    const id = 1_000_000 + nextId.current++
    setMessages((prev) => [...prev, { id, who, text }])
  }, [])

  const stop = useCallback(() => {
    clearTimers()
    setRunning(false)
    setListening(false)
    setThinking(false)
    setCaption('')
    setTalkLeft(0)
  }, [clearTimers])

  /**
   * 재생을 멈추고 <b>남긴 자국까지 지운다.</b> 안내가 끝나면 이걸 부른다.
   *
   * <p>`stop()` 과 나눠 둔 이유: 멈추는 것과 없던 일로 만드는 것은 다르다. 대화창에 예시
   * 말풍선이 남아 있으면 사용자는 그것을 <b>자기가 코치와 나눈 대화</b>로 읽는다 — 새로
   * 말을 걸었을 때 코치가 그 맥락을 모르는 이유를 설명할 길이 없어진다.
   */
  const reset = useCallback(() => {
    stop()
    setMessages([])
    nextId.current = 1
  }, [stop])

  const start = useCallback(() => {
    if (running) return
    clearTimers()
    setRunning(true)
    setListening(true)
    setTalkLeft(TALK_WINDOW_SEC)
    // 실제 `startTalking()` 이 남기는 줄과 같은 문구. 여기만 다르면 예시가 예시로 보인다.
    push('sys', '말하세요 (응답을 만드는 동안에는 잠시 멈춥니다 · 최대 15분)')

    /*
      대본을 시간축에 펼친다. `cursor` 는 재생 시작으로부터의 밀리초다.

      턴마다 `setTimeout` 을 새로 걸지 않고 <b>전부 미리 예약</b>하는 이유는, 중간에 한 턴이
      늦어져도 뒤가 밀리지 않게 하기 위해서다 — 예약을 사슬로 이으면 브라우저가 탭을 쉬게
      하는 동안(백그라운드 스로틀링) 턴 하나가 지연되고 그만큼 전체가 어긋난다.
    */
    let cursor = 400
    const at = (ms: number, run: () => void) => {
      timers.current.push(window.setTimeout(run, ms))
    }

    DEMO_TURNS.forEach((turn, index) => {
      const speech = turn.chunks[turn.chunks.length - 1]

      // 첫 턴이 아니면 듣기가 다시 열린 뒤에 말이 시작된다.
      if (index > 0) {
        const resumeAt = cursor
        at(resumeAt, () => {
          setListening(true)
          setTalkLeft(Math.max(0, TALK_WINDOW_SEC - Math.round(resumeAt / 1000)))
        })
        cursor += TURN_GAP_MS
      }

      // 받아 적히는 중 — 점선 말풍선으로 뜬다.
      turn.chunks.forEach((text) => {
        at(cursor, () => setCaption(text))
        cursor += CHUNK_MS
      })
      cursor += SETTLE_MS

      at(cursor, () => {
        setCaption('')
        push('me', speech)
        setThinking(true)
        /*
          말이 끝나면 실제로도 창이 잠시 멈춘다(`stopTalking('AI 응답 중', { quiet: true })`).
          조용히 멈추므로 대화에 줄을 남기지 않는다 — 버튼 글자만 "말하기" 로 돌아간다.
        */
        setListening(false)
        setTalkLeft(0)
      })
      cursor += THINK_MS

      at(cursor, () => {
        setThinking(false)
        push('ai', turn.reply)
      })
      cursor += PROPOSAL_MS

      // 답이 도착한 직후 구조화 결과가 따라온다. 실제 순서와 같다.
      at(cursor, () => onGoalRef.current(turn.proposal))

      if (turn.autoAdd) {
        cursor += AUTO_ADD_MS
        const domain = turn.proposal.domain ?? ''
        for (const task of turn.proposal.generated_tasks ?? []) {
          at(cursor, () => onAddRef.current({ domain, task }))
          // 셋을 한꺼번에 넣지 않는다. 한 줄씩 쌓여야 초안이 차오르는 것이 보인다.
          cursor += 220
        }
      }
    })

    // 마지막 턴의 카드는 사용자가 담는다. 그동안 듣기 창은 열어 둔다(실제와 같다).
    const endAt = cursor + 600
    at(endAt, () => {
      setListening(true)
      setTalkLeft(Math.max(0, TALK_WINDOW_SEC - Math.round(endAt / 1000)))
      setRunning(false)
      onDoneRef.current?.()
    })
  }, [clearTimers, push, running])

  /* 남은 시간 카운트다운. 버튼 글자가 실제처럼 줄어든다. */
  useEffect(() => {
    if (!listening) return
    const id = window.setInterval(() => setTalkLeft((left) => Math.max(0, left - 1)), 1000)
    return () => window.clearInterval(id)
  }, [listening])

  return { messages, caption, listening, thinking, running, talkLeft, start, stop, reset }
}
