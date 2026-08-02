import { useCallback, useEffect, useRef, useState } from 'react'
import { Room, RoomEvent } from 'livekit-client'
import { apiFetch, ApiError } from '../../api'
import type { Period } from '../sheet/sheet.types'

/*
 * `ai_livekit/web/app.js` 를 React 로 옮긴 것.
 *
 * **토픽 이름은 `agent/entrypoint.py` · `agent/sheet_transfer.py` 와 같은 문자열이어야
 * 한다.** 한쪽만 고치면 메시지가 조용히 사라진다 — 에러가 아니라 무응답으로 드러난다.
 */
const CHAT_TOPIC = 'lk.chat'
const GOAL_TOPIC = 'mandarin.goal'
const SHEET_TOPIC = 'mandarin.sheet'
const TRANSCRIPT_TOPIC = 'mandarin.transcript'
const HELLO_TOPIC = 'mandarin.hello'

/**
 * 푸시투토크 창. 켜 둔 시간이 곧 STT 요금이라 사람이 열고 닫는다.
 * `web/app.js` 의 `TALK_WINDOW_MS` 와 같은 값이다.
 */
const TALK_WINDOW_MS = 10_000

/** 오조작 가드. 켜자마자 끄면 전사도 못 얻고 STT 연결 비용만 낸다. */
const MISCLICK_GUARD_MS = 300

export type CoachState = 'idle' | 'thinking' | 'answering'

export type ChatMessage = {
  id: number
  who: 'ai' | 'me' | 'sys' | 'warn'
  text: string
}

/** 에이전트가 `mandarin.goal` 로 보내는 구조화 결과 중 화면이 쓰는 부분 */
export type GoalPayload = {
  action?: string
  domain?: string
  domain_is_new?: boolean
  generated_task?: { title?: string; frequency?: Period } | null
  matched_task?: { title?: string; frequency?: Period } | null
  reasoning?: unknown
}

export type ConnectionState = 'off' | 'busy' | 'on'

/** `POST /api/v1/voice-sessions` 응답. 방과 표시 이름은 서버가 정한다. */
type VoiceSession = {
  roomId: string
  url: string
  token: string
  expiresInSeconds: number
}

type UseCoachRoomOptions = {
  /** 접속 직후 에이전트에 넘길 시트. 중복 검사에 쓰인다. */
  getSheet: () => unknown
  /** 구조화 결과 도착 — 추천 목록에 얹는다. */
  onGoal: (payload: GoalPayload) => void
}

/**
 * LiveKit 방 하나를 들고 있는 훅.
 *
 * **토큰을 직접 만들지 않는다.** `API_SECRET` 이 브라우저에 있으면 누구나 토큰을
 * 위조할 수 있으므로 백엔드에서 받아온다.
 */
export function useCoachRoom({ getSheet, onGoal }: UseCoachRoomOptions) {
  const [connection, setConnection] = useState<ConnectionState>('off')
  const [status, setStatus] = useState('연결 안 됨')
  const [coachState, setCoachState] = useState<CoachState>('idle')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  /** 진행 중인 전사문. 최종 전사가 오면 대화로 옮겨가고 여기는 비워진다. */
  const [caption, setCaption] = useState('')
  const [voiceAvailable, setVoiceAvailable] = useState(false)
  const [listening, setListening] = useState(false)
  const [talkLeft, setTalkLeft] = useState(0)

  const roomRef = useRef<Room | null>(null)
  const aiLabel = useRef('AI')
  const talkTimer = useRef<number | null>(null)
  const countdownTimer = useRef<number | null>(null)
  const talkStartedAt = useRef(0)
  const messageId = useRef(0)

  // 콜백은 매 렌더 새로 만들어진다. 핸들러를 등록할 때 잡아두면 옛 시트를 보게 되므로
  // ref 로 최신 것을 가리킨다.
  const getSheetRef = useRef(getSheet)
  const onGoalRef = useRef(onGoal)
  getSheetRef.current = getSheet
  onGoalRef.current = onGoal

  const push = useCallback((who: ChatMessage['who'], text: string) => {
    messageId.current += 1
    setMessages((prev) => [...prev, { id: messageId.current, who, text }])
  }, [])

  const clearTalkTimers = useCallback(() => {
    if (talkTimer.current) window.clearTimeout(talkTimer.current)
    if (countdownTimer.current) window.clearInterval(countdownTimer.current)
    talkTimer.current = null
    countdownTimer.current = null
  }, [])

  // 화면을 떠날 때 방을 끊는다. 안 끊으면 참가자가 남아 다음 접속이 방을 재사용한다.
  useEffect(
    () => () => {
      clearTalkTimers()
      void roomRef.current?.disconnect()
    },
    [clearTalkTimers],
  )

  const connect = useCallback(async () => {
    if (roomRef.current) return
    setConnection('busy')
    setStatus('연결 중…')

    // 토큰 수명이 2분이라 화면 진입 시가 아니라 여기서 받는다.
    let info: VoiceSession
    try {
      info = await apiFetch<VoiceSession>('/api/v1/voice-sessions', { method: 'POST' })
    } catch (cause) {
      setConnection('off')
      setStatus('토큰 실패')
      push(
        'warn',
        cause instanceof ApiError && cause.status === 401
          ? '로그인이 필요합니다.'
          : `입장 토큰을 받지 못했습니다: ${cause instanceof Error ? cause.message : cause}`,
      )
      return
    }

    const room = new Room()
    roomRef.current = room

    /*
     * 세션 능력 알림. **말하기 버튼은 이걸 받고서야 열린다** — 서버가 음성을 못 받는
     * 상태에서 버튼을 열어두면, 눌러서 말하고 아무 일도 안 일어나는 것을 보게 된다.
     */
    room.registerTextStreamHandler(HELLO_TOPIC, async (reader) => {
      let hello: { voice?: boolean; name?: string; mode?: string; llm?: string; llmMessage?: string }
      try {
        hello = JSON.parse(await reader.readAll())
      } catch {
        return
      }
      setVoiceAvailable(!!hello.voice)
      aiLabel.current = hello.mode ? `${hello.name} · ${hello.mode}` : hello.name || 'AI'

      // LLM 이 못 쓰는 상태면 **먼저** 알린다. 발화를 던지고 실패를 기다리게 두면
      // 사용자는 자기 말이 문제인 줄 안다.
      if (hello.llmMessage) {
        push('warn', hello.llmMessage)
        setStatus(hello.llm === 'missing_key' ? 'AI 사용 불가' : '데모 백엔드')
      }
      push(
        'sys',
        hello.voice
          ? `${aiLabel.current} 준비됨 — 말하기를 쓸 수 있습니다`
          : `${aiLabel.current} 준비됨 — 음성이 꺼져 있어 텍스트로만 대화합니다`,
      )
    })

    room.registerTextStreamHandler(CHAT_TOPIC, async (reader) => {
      // 스트림을 다 읽고 나서 상태를 바꾼다. 열리자마자 바꾸면 아직 글자가 안 뜬 화면에서
      // 캐릭터만 먼저 답한 얼굴이 된다.
      const text = await reader.readAll()
      push('ai', text)
      setCoachState('answering')
    })

    /*
     * 전사문은 `lk.chat` 이 아니라 이 토픽으로 온다 — 섞으면 내 말과 AI 답을 구분할 수
     * 없다. `final` 이 거짓이면 지워질 캡션, 참이면 대화에 남는다.
     */
    room.registerTextStreamHandler(TRANSCRIPT_TOPIC, async (reader) => {
      let payload: { listening?: boolean; final?: boolean; text?: string }
      try {
        payload = JSON.parse(await reader.readAll())
      } catch {
        return
      }
      // `listening` 은 **에이전트가 실제로 듣기 시작/중지했다는 확인**이다. 브라우저가
      // mute 를 토글해도 에이전트에 이벤트가 안 닿으면 아무 일도 일어나지 않는데,
      // 그 상태를 화면에서 알 방법이 없어 버그가 여러 라운드 숨었다.
      if ('listening' in payload) {
        setStatus(payload.listening ? '에이전트가 듣고 있음' : '에이전트 연결됨')
        return
      }
      if (payload.final) {
        setCaption('')
        push('me', payload.text ?? '')
        setCoachState('thinking')
      } else {
        setCaption(payload.text ?? '')
      }
    })

    room.registerTextStreamHandler(GOAL_TOPIC, async (reader) => {
      try {
        const payload: GoalPayload = JSON.parse(await reader.readAll())
        onGoalRef.current(payload)
        setCoachState('answering')
        if ('reasoning' in payload) {
          // 여기 오면 서버가 `public_data()` 를 건너뛴 것이다.
          push('warn', 'payload 에 reasoning 이 들어 있습니다 — 서버에서 제거되어야 합니다')
        }
      } catch (cause) {
        push('warn', `goal payload 파싱 실패: ${cause instanceof Error ? cause.message : cause}`)
      }
    })

    /*
     * 지금 편집 중인 시트를 넘긴다. 없으면 에이전트는 토큰 metadata 의 시트만 보고
     * 중복 검사를 해서, 화면에 담겨 있는 과제를 또 제안한다.
     *
     * **접속 직후가 아니라 에이전트가 들어온 뒤에 보낸다.** 텍스트 스트림은 그 시점에
     * 방에 있는 참가자에게만 간다 — `room.connect()` 직후엔 에이전트가 아직 배정 전이라
     * 보낸 시트가 아무 데도 닿지 않고 조용히 사라진다(에러도 안 난다).
     */
    const pushSheet = async () => {
      try {
        await room.localParticipant.sendText(JSON.stringify(getSheetRef.current()), {
          topic: SHEET_TOPIC,
        })
      } catch (cause) {
        push('warn', `시트를 보내지 못했습니다: ${cause instanceof Error ? cause.message : cause}`)
      }
    }

    room.on(RoomEvent.ParticipantConnected, (participant) => {
      push('sys', `참가자 입장: ${participant.identity}`)
      setConnection('on')
      setStatus('에이전트 연결됨')
      void pushSheet()
    })

    room.on(RoomEvent.Disconnected, () => {
      roomRef.current = null
      clearTalkTimers()
      setConnection('off')
      setStatus('연결 끊김')
      setCaption('')
      setListening(false)
      setCoachState('idle')
      // 재접속하면 hello 를 다시 받는다. 그때까지 음성은 없는 것으로 둔다.
      setVoiceAvailable(false)
    })

    try {
      await room.connect(info.url, info.token)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      roomRef.current = null
      setConnection('off')
      setStatus('접속 실패')
      push('warn', `${message} — LiveKit 서버가 떠 있나요? (${info.url})`)
      return
    }

    setConnection('busy')
    setStatus('방 접속됨 · 에이전트 대기')
    push('sys', `방 "${info.roomId}" 에 접속했습니다`)

    // 에이전트가 이미 들어와 있을 수도 있다(재접속 등). 그때는 입장 이벤트가 안 오므로
    // 시트도 여기서 보낸다.
    if (room.remoteParticipants.size > 0) {
      setConnection('on')
      setStatus('에이전트 연결됨')
      await pushSheet()
    }
  }, [clearTalkTimers, push])

  const disconnect = useCallback(async () => {
    await roomRef.current?.disconnect()
  }, [])

  const sendChat = useCallback(
    async (text: string) => {
      const room = roomRef.current
      if (!room || !text.trim()) return
      push('me', text)
      setCoachState('thinking')
      await room.localParticipant.sendText(text, { topic: CHAT_TOPIC })
    },
    [push],
  )

  /** 시트가 바뀌면 통째로 다시 보낸다. 증분은 하나 유실되면 서버와 조용히 갈라진다. */
  const sendSheet = useCallback(async () => {
    const room = roomRef.current
    if (!room) return
    await room.localParticipant.sendText(JSON.stringify(getSheetRef.current()), {
      topic: SHEET_TOPIC,
    })
  }, [])

  const stopTalking = useCallback(
    async (reason: string) => {
      const room = roomRef.current
      clearTalkTimers()
      setTalkLeft(0)
      try {
        await room?.localParticipant.setMicrophoneEnabled(false)
      } catch (cause) {
        push('warn', `마이크를 끄지 못했습니다: ${cause instanceof Error ? cause.message : cause}`)
      }
      setListening(false)
      setCaption('')
      push('sys', `듣기를 멈췄습니다 (${reason})`)
    },
    [clearTalkTimers, push],
  )

  const startTalking = useCallback(async () => {
    const room = roomRef.current
    if (!room) return
    try {
      await room.localParticipant.setMicrophoneEnabled(true)
    } catch (cause) {
      // 권한 거부·장치 없음이 여기로 온다. localhost 는 secure context 로 취급되어
      // getUserMedia 가 동작하지만, 다른 기기에서 열면 HTTPS 가 필요하다.
      push('warn', `마이크를 켤 수 없습니다: ${cause instanceof Error ? cause.message : cause}`)
      return
    }

    talkStartedAt.current = Date.now()
    setListening(true)
    setTalkLeft(TALK_WINDOW_MS / 1000)
    push('sys', '말하세요 (10초 후 자동으로 멈춥니다)')

    countdownTimer.current = window.setInterval(() => {
      const left = Math.ceil((TALK_WINDOW_MS - (Date.now() - talkStartedAt.current)) / 1000)
      if (left > 0) setTalkLeft(left)
    }, 250)

    talkTimer.current = window.setTimeout(() => void stopTalking('시간 종료'), TALK_WINDOW_MS)
  }, [push, stopTalking])

  const toggleTalk = useCallback(async () => {
    const room = roomRef.current
    if (!room || !voiceAvailable) return
    if (!room.localParticipant.isMicrophoneEnabled) {
      await startTalking()
      return
    }
    if (Date.now() - talkStartedAt.current < MISCLICK_GUARD_MS) {
      // 켜자마자 끄면 전사도 못 얻고 STT 연결 비용만 낸다.
      push('sys', '너무 빨리 눌렀습니다 — 계속 듣고 있어요')
      return
    }
    await stopTalking('직접 멈춤')
  }, [push, startTalking, stopTalking, voiceAvailable])

  return {
    connection,
    status,
    coachState,
    setCoachState,
    messages,
    caption,
    voiceAvailable,
    listening,
    talkLeft,
    connect,
    disconnect,
    sendChat,
    sendSheet,
    toggleTalk,
    /** 화면이 스스로 한 처리를 대화에 한 줄 남긴다(에이전트가 한 말이 아니다). */
    notify: (text: string) => push('sys', text),
  }
}
