import { useCallback, useEffect, useRef, useState } from 'react'
import { Room, RoomEvent } from 'livekit-client'
import { apiFetch, ApiError } from '../../api/client'

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
 * 푸시투토크 창. `web/app.js` 의 `TALK_WINDOW_MS` 와 같은 값이다.
 *
 * 창이 길어서 **무음 과금은 사람이 막지 않는다** — 서버의 `SpeechGate` 가 말하지 않는
 * 동안 프레임을 보내지 않고(발화가 없으면 Deepgram 소켓을 아예 열지 않는다) 무음이
 * 길어지면 스트림을 닫는다. 이 창은 잊고 켜둔 마이크를 끊는 상한이다.
 *
 * 창은 **응답을 만드는 동안 잠시 멈춘다**(`stopTalking` 의 `resumable`). 답이 도착하면
 * 남은 시간만큼 다시 열리므로, 한 번 눌러 여러 턴을 대화할 수 있다.
 */
const TALK_WINDOW_MS = 15 * 60_000

/**
 * 응답 뒤 자동 재개의 최소 잔여 시간. 이보다 적게 남았으면 재개하지 않는다.
 *
 * 켰다가 곧바로 상한에 걸려 끄면 전사도 못 얻고 STT 연결 비용만 낸다 —
 * `MISCLICK_GUARD_MS` 가 사람의 오조작에 대해 막는 것과 같은 이유다.
 */
const RESUME_MIN_MS = 3_000

/** 오조작 가드. 켜자마자 끄면 전사도 못 얻고 STT 연결 비용만 낸다. */
const MISCLICK_GUARD_MS = 300

/**
 * 응답 생성 잠금이 저절로 풀리는 시간. **잠금이 영구히 남지 않게 하는 보험이다.**
 *
 * 에이전트는 실패해도 답을 보낸다(`FAILURE_REPLY`·`TIMEOUT_REPLY`) — 정상 경로에서는
 * 이 타이머가 걸리지 않는다. 하지만 worker 프로세스가 죽으면 아무것도 오지 않고, 그때
 * 이게 없으면 말하기 버튼이 영원히 안 열린다.
 *
 * 서버의 `BOT_TIMEOUT_SECONDS`(20초)보다 넉넉히 크게 둔다 — 작게 두면 정상적으로 늦은
 * 응답을 기다리는 동안 잠금이 풀려 마이크가 열린다.
 */
const GENERATION_LOCK_MS = 60_000

export type CoachState = 'idle' | 'thinking' | 'answering'

export type ChatMessage = {
  id: number
  who: 'ai' | 'me' | 'sys' | 'warn'
  text: string
}

/**
 * 에이전트가 보내는 주기 어휘.
 *
 * **`sheet.types.ts` 의 `Period` 를 그대로 쓰지 않는다.** 값은 지금 같지만 두 타입이
 * 뜻하는 것이 다르다 — 저쪽은 편집기가 다루는 화면 상태이고 이쪽은 **다른 프로세스가
 * 보내는 와이어 포맷**(`ai_livekit` 의 `FREQUENCIES` = 백엔드 `SubjectPeriod` 의
 * `@JsonValue`)이다. 묶어 두면 편집기 사정으로 이 union 을 좁히는 날 에이전트가 보내는
 * 값이 조용히 타입에서 빠진다.
 */
export type GoalFrequency = 'daily' | 'weekly' | 'monthly' | 'none'

export type GoalTask = {
  title?: string
  frequency?: GoalFrequency
  /**
   * 왜 이 과제인지 한 문장. 제안 카드의 설명 줄에 그대로 들어간다
   * (`GOAL_SCHEMA.generated_tasks[].description`, 40자 상한).
   *
   * `matched_task` 에는 없다 — 그쪽은 이미 시트에 있는 과제를 지목한 것이라 서버가
   * 제목·주기·횟수만 시트에서 채운다.
   */
  description?: string
  /**
   * 한 주기 안의 횟수("주 3회" 의 3).
   *
   * **서버가 주기에 맞춰 확정해서 보낸다**(`bot/goal.py` 의 `_settle_counts`) — 일간·
   * 한번만은 1 고정이고 주간은 1~7, 월간은 1~30 으로 잘려서 온다. 화면에서 다시
   * 판단하지 않고 그대로 쓴다.
   */
  count?: number | null
}

/** 에이전트가 `mandarin.goal` 로 보내는 구조화 결과 중 화면이 쓰는 부분 */
export type GoalPayload = {
  action?: string
  domain?: string
  domain_is_new?: boolean
  /**
   * **배열이다.** 한 턴이 같은 칸에 담을 과제를 3개까지 낸다
   * (`GOAL_SCHEMA.generated_tasks`). 단수 `generated_task` 를 읽으면 `undefined` 를
   * 받고, 증상은 에러가 아니라 "제안 카드가 안 그려진다" 뿐이다.
   */
  generated_tasks?: GoalTask[] | null
  /** 중복 알림. 지목이라 언제나 한 건이고, 제목·주기·횟수는 서버가 시트에서 채운다. */
  matched_task?: GoalTask | null
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
  /**
   * `setMicrophoneEnabled` 이 오가는 동안 참. **버튼을 잠그는 데 쓴다**
   * (`web/app.js` 의 `$('mic').disabled = true` 짝).
   *
   * 이 창이 열려 있는 사이의 두 번째 클릭은 `isMicrophoneEnabled` 가 아직 옛 값이라
   * 같은 분기로 또 들어간다 — 켜는 중에 한 번 더 누르면 `startTalking` 이 두 번 돌아
   * 타이머가 둘 생기고, 먼저 걸린 쪽이 창을 일찍 닫는다. `MISCLICK_GUARD_MS` 는
   * **켠 뒤**의 오조작을 막는 것이라 이 구간을 덮지 못한다.
   */
  const [micBusy, setMicBusy] = useState(false)

  const roomRef = useRef<Room | null>(null)
  /**
   * `connect()` 가 도는 중인지. **`roomRef` 로는 이 구간을 막을 수 없다.**
   *
   * `roomRef.current` 는 토큰을 받아온 **뒤**에 채워지는데, 그 앞에 `await apiFetch` 가
   * 있다. 즉 첫 호출이 토큰을 기다리는 동안 `roomRef.current` 는 아직 `null` 이라
   * 두 번째 호출이 가드를 그냥 통과하고, **같은 identity 로 두 번 입장한다.**
   *
   * LiveKit 은 같은 identity 의 새 참가자가 오면 이전 것을 끊는다
   * (`reason: DUPLICATE_IDENTITY`). 쫓겨난 쪽의 PeerConnection 이 협상 중에 무너지면서
   * livekit-client 가 `could not establish pc connection` 을 던지므로, 증상이 **서버가
   * 안 떠 있는 것처럼** 보인다. 실제 관측(2026-08-05):
   *
   *     00:37:58.385  removing duplicate participant  PA_ZzfUPyHfeBqY
   *     00:37:58.400  removing duplicate participant  PA_dAmFDjAb9wYg   ← 15ms 뒤
   *
   * 두 번 부르는 것은 개발 모드의 `StrictMode`(`main.tsx`)다 — effect 를
   * mount → cleanup → mount 로 돌린다. 운영에서도 "다시 연결" 을 빠르게 두 번 누르거나
   * 화면을 빨리 오가면 같은 일이 난다. 그래서 StrictMode 를 끄는 것이 아니라 여기를 막는다.
   */
  const connectingRef = useRef(false)
  const aiLabel = useRef('AI')
  const talkTimer = useRef<number | null>(null)
  const countdownTimer = useRef<number | null>(null)
  const talkStartedAt = useRef(0)
  /**
   * 답이 도착하면 창을 다시 열어야 하는가.
   *
   * **응답 생성 때문에 멈춘 창에만 참이다.** 사람이 직접 멈췄거나 15분 상한에 걸린 창을
   * 다시 열면 끈 마이크가 저절로 켜지는 셈이다.
   */
  const resumeAfterReplyRef = useRef(false)
  /**
   * 마이크 창이 열려 있는가. **`listening` 상태로는 이 판정을 못 한다** — setState 가
   * 비동기라 같은 tick 에 두 경로가 들어오면 둘 다 옛 값을 본다.
   *
   * 창을 닫는 경로가 셋이다(사람이 다시 누르기 · 응답 생성 시작 · 15분 상한). 이 깃발이
   * 없으면 겹칠 때 "듣기를 멈췄습니다" 가 두 줄 남고 `setMicrophoneEnabled(false)` 도
   * 두 번 나간다 — 음성 발화와 텍스트 전송이 앞뒤로 붙으면 실제로 겹친다.
   */
  const talkingRef = useRef(false)
  /**
   * 에이전트가 답을 만드는 중인가. **이 동안에는 마이크를 열지 않는다.**
   *
   * 서버는 이미 이 구간을 막고 있다 — 생성 중에 들어온 발화는 `Conversation` 이 버리고
   * (락), `listen.py` 가 STT 스트림을 닫는다("생성 중"). 그런데 브라우저가 마이크를
   * 열어두면 **버려질 오디오를 계속 올려보내고**, 생성이 끝나는 순간 스트림이 다시
   * 열린다. 창을 닫는 쪽이 확실하다.
   *
   * `coachState` 를 쓰지 않는 이유는 그것이 화면 표현이라서다 — 페이지가 `'answering'`
   * 을 애니메이션에 쓰고 `'idle'` 로 되돌리지 않으므로 잠금의 근거가 될 수 없다.
   */
  const generatingRef = useRef(false)
  const generatingTimer = useRef<number | null>(null)
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

  /** 창에 걸린 타이머(상한 · 카운트다운)를 놓는다. */
  const clearTalkTimers = useCallback(() => {
    if (talkTimer.current) window.clearTimeout(talkTimer.current)
    if (countdownTimer.current) window.clearInterval(countdownTimer.current)
    talkTimer.current = null
    countdownTimer.current = null
  }, [])

  /** 응답 생성 잠금을 푼다. 답이 도착했을 때와 방을 놓을 때 부른다. */
  const endGenerating = useCallback(() => {
    generatingRef.current = false
    if (generatingTimer.current) window.clearTimeout(generatingTimer.current)
    generatingTimer.current = null
  }, [])

  /** 최종 전사 시점 = 생성 시작. 마이크를 열지 않는 구간이 여기서 시작된다. */
  const beginGenerating = useCallback(() => {
    generatingRef.current = true
    if (generatingTimer.current) window.clearTimeout(generatingTimer.current)
    generatingTimer.current = window.setTimeout(endGenerating, GENERATION_LOCK_MS)
  }, [endGenerating])

  /**
   * `openRoom` 의 핸들러가 부를 `stopTalking`.
   *
   * **직접 참조하면 안 된다.** `stopTalking` 은 이 아래에서 선언되므로 `openRoom` 의
   * 의존성 배열에 넣는 순간 렌더 중에 초기화 전 값을 읽는다(TDZ). 위 `getSheetRef` 와
   * 같은 패턴이다.
   */
  const stopTalkingRef = useRef<
    ((reason: string, opts?: { quiet?: boolean; resumable?: boolean }) => Promise<void>) | null
  >(null)
  /** 같은 이유로 ref 를 거치는 `resumeTalking`(답이 도착하면 다시 듣기). */
  const resumeTalkingRef = useRef<(() => Promise<void>) | null>(null)

  /**
   * 화면을 떠났는지. **입장이 끝난 뒤에 확인해야 한다.**
   *
   * 아래 cleanup 은 `roomRef.current` 를 끊는데, 입장 도중(토큰 대기 중)에 떠나면 그
   * 값이 아직 `null` 이라 아무것도 끊지 못한다. 그러고 나서 입장이 완료되면 **아무도
   * 소유하지 않은 참가자가 방에 남는다.** `livekit.yaml` 의 `max_participants: 2`
   * (사용자 1 + 에이전트 1)에 걸려 다음 입장이나 에이전트 배정이 막힐 수 있다.
   *
   * effect 진입에서 `false` 로 되돌리는 것이 `StrictMode` 대응이다 — 가짜 cleanup 이
   * `true` 로 만들어 둔 것을 두 번째 mount 가 지운다.
   */
  const disposedRef = useRef(false)

  // 화면을 떠날 때 방을 끊는다. 안 끊으면 참가자가 남아 다음 접속이 방을 재사용한다.
  useEffect(() => {
    disposedRef.current = false
    return () => {
      disposedRef.current = true
      clearTalkTimers()
      endGenerating()
      void roomRef.current?.disconnect()
    }
  }, [clearTalkTimers, endGenerating])

  /** 실제 입장 절차. **직접 부르지 않는다** — 중복 입장을 막는 `connect()` 를 쓴다. */
  const openRoom = useCallback(async () => {
    setConnection('busy')
    setStatus('연결 중…')

    // 토큰 수명이 2분이라 화면 진입 시가 아니라 여기서 받는다.
    let info: VoiceSession
    try {
      info = await apiFetch<VoiceSession>('/api/v1/voice-sessions', { method: 'POST' })
    } catch (cause) {
      setConnection('off')
      setStatus('토큰 실패')
      // 원인은 콘솔로만. `apiFetch` 메시지에는 상태 코드가 섞여 있다.
      console.error('[coach] 입장 토큰 발급 실패', cause)
      push(
        'warn',
        cause instanceof ApiError && cause.status === 401
          ? '로그인이 필요합니다. 다시 로그인한 뒤 이용해 주세요.'
          : '지금은 코치에 연결할 수 없어요. 잠시 후 다시 시도해 주세요.',
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
      // 답이 도착했으니 잠금을 풀고, 생성 때문에 멈춘 창이면 **남은 시간만큼 다시 연다.**
      // 그래야 버튼 한 번으로 여러 턴을 대화할 수 있다.
      endGenerating()
      push('ai', text)
      setCoachState('answering')
      void resumeTalkingRef.current?.()
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
        /*
         * **최종 전사 = 생성 시작.** 여기서 마이크 창을 잠시 멈춘다.
         *
         * 이 동안의 발화는 서버가 버리므로(`Conversation` 의 락) 열어 둘 이유가 없고,
         * 열어 두면 버려질 오디오를 계속 올려보낸 뒤 생성이 끝나는 순간 STT 스트림이
         * 다시 열린다.
         *
         * `resumable` 로 닫으므로 답이 도착하면 남은 창이 다시 열린다 — 사용자가 발화마다
         * 버튼을 누를 필요는 없다.
         */
        beginGenerating()
        void stopTalkingRef.current?.('AI 응답 중', { quiet: true, resumable: true })
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
          // 여기 오면 서버가 `public_data()` 를 건너뛴 것이다. 개발자에게 하는 말이다.
          console.warn('[coach] payload 에 reasoning 이 있다 — 서버에서 제거되어야 한다', payload)
        }
      } catch (cause) {
        console.error('[coach] goal payload 파싱 실패', cause)
        push('warn', '과제 제안을 받지 못했어요. 다시 말씀해 주시겠어요?')
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
        console.error('[coach] 시트 전송 실패', cause)
        push('warn', '담은 과제를 코치에게 전하지 못했어요. 같은 제안이 다시 나올 수 있습니다.')
      }
    }

    /**
     * 누군가 들어왔다. 입장은 상태줄과 배지가 보여주므로 대화에는 남기지 않는다.
     *
     * **`connection` 은 상대가 누구든 켠다** — 종류로 걸러 버리면 판별이 틀리는 날
     * 입력창이 영원히 잠긴다.
     */
    const welcome = () => {
      setConnection('on')
      setStatus('에이전트 연결됨')
      void pushSheet()
    }

    room.on(RoomEvent.ParticipantConnected, welcome)

    room.on(RoomEvent.Disconnected, () => {
      roomRef.current = null
      clearTalkTimers()
      // 방이 끊기면 답은 오지 않는다. 안 풀면 재접속 뒤에도 말하기가 잠겨 있다.
      endGenerating()
      talkingRef.current = false
      // 끊긴 방의 창을 재개하지 않는다 — 재접속 후 답이 오면 마이크가 저절로 켜진다.
      resumeAfterReplyRef.current = false
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
      roomRef.current = null
      setConnection('off')
      setStatus('접속 실패')
      // SDK 메시지와 서버 주소는 개발자용이다.
      console.error('[coach] LiveKit 접속 실패', { url: info.url, cause })
      push('warn', '코치와 연결하지 못했어요. 잠시 후 “다시 연결”을 눌러 주세요.')
      return
    }

    // 입장하는 사이에 화면을 떠났다면 여기서 정리한다(`disposedRef` 주석). cleanup 은
    // 이미 지나갔고 그때는 끊을 방이 없었다.
    if (disposedRef.current) {
      roomRef.current = null
      void room.disconnect()
      return
    }

    setConnection('busy')
    setStatus('방 접속됨 · 에이전트 대기')
    // 방 ID 는 사용자에게 뜻이 없다. 접속 사실은 상태줄이 말한다.
    console.info('[coach] 방 접속', info.roomId)

    // 에이전트가 이미 들어와 있을 수도 있다(재접속 등). 그때는 `ParticipantConnected` 가
    // 안 오므로 같은 처리를 여기서 한다 — 연결 상태와 시트 전송 둘 다.
    //
    // **재접속이 흔하다.** 개발 중에는 HMR 이, 운영에서는 새로고침이 방을 다시 잡는데
    // 에이전트 job 은 방 단위라 이미 들어와 있다. 이 갈래를 빼면 그 경우에만 입력창이
    // 안 열린다.
    if (room.remoteParticipants.size > 0) welcome()
  }, [beginGenerating, clearTalkTimers, endGenerating, push])

  /**
   * 입장. **두 번 겹쳐 부를 수 없다**(`connectingRef` 주석의 DUPLICATE_IDENTITY).
   *
   * 깃발을 **첫 `await` 앞에서** 세우는 것이 요점이다. 뒤로 밀면 막으려던 구간이 그대로
   * 열린다 — `openRoom()` 은 토큰을 받으러 바로 await 로 들어간다.
   */
  const connect = useCallback(async () => {
    if (roomRef.current || connectingRef.current) return
    connectingRef.current = true
    try {
      await openRoom()
    } finally {
      connectingRef.current = false
    }
  }, [openRoom])

  const disconnect = useCallback(async () => {
    await roomRef.current?.disconnect()
  }, [])

  const sendChat = useCallback(
    async (text: string) => {
      const room = roomRef.current
      if (!room || !text.trim()) return
      push('me', text)
      setCoachState('thinking')
      // 텍스트로 물어도 생성은 생성이다 — 음성 경로와 같은 구간을 잠근다. 듣고 있었다면
      // 창도 멈추고(그 발화는 어차피 버려진다), 답이 오면 남은 창이 다시 열린다.
      beginGenerating()
      void stopTalkingRef.current?.('AI 응답 중', { quiet: true, resumable: true })
      await room.localParticipant.sendText(text, { topic: CHAT_TOPIC })
    },
    [beginGenerating, push],
  )

  /** 시트가 바뀌면 통째로 다시 보낸다. 증분은 하나 유실되면 서버와 조용히 갈라진다. */
  const sendSheet = useCallback(async () => {
    const room = roomRef.current
    if (!room) return
    await room.localParticipant.sendText(JSON.stringify(getSheetRef.current()), {
      topic: SHEET_TOPIC,
    })
  }, [])

  /**
   * 마이크 창을 닫는다.
   *
   * `quiet` 는 대화에 한 줄 남기지 않는다 — 응답 생성 때문에 잠시 멈추는 것은 한 턴에
   * 한 번씩 일어나므로, 그때마다 "듣기를 멈췄습니다" 를 남기면 로그가 그것만 남는다.
   * 그 상태는 상태줄("생각하는 중")과 버튼 글자가 이미 보여준다.
   *
   * `resumable` 은 **답이 도착하면 이 창을 다시 열어도 되는가**다. 사람이 직접 멈췄거나
   * 15분 상한에 걸린 창을 다시 열면 안 된다 — 끈 마이크가 저절로 켜지는 셈이다.
   */
  const stopTalking = useCallback(
    async (reason: string, { quiet = false, resumable = false } = {}) => {
      const room = roomRef.current
      // 닫는 경로가 여럿이라 겹친다(`talkingRef` 주석). 이미 닫혔으면 조용히 돌아간다.
      if (!talkingRef.current) return
      talkingRef.current = false
      resumeAfterReplyRef.current = resumable
      clearTalkTimers()
      setTalkLeft(0)
      setMicBusy(true)
      try {
        await room?.localParticipant.setMicrophoneEnabled(false)
      } catch (cause) {
        console.error('[coach] 마이크 끄기 실패', cause)
        push('warn', '마이크를 끄지 못했어요. 브라우저 탭을 새로고침해 주세요.')
      } finally {
        setMicBusy(false)
      }
      setListening(false)
      setCaption('')
      if (!quiet) push('sys', `듣기를 멈췄습니다 (${reason})`)
    },
    [clearTalkTimers, push],
  )

  // `openRoom` 의 전사 핸들러와 `sendChat` 이 이걸 통해 창을 닫는다(위 주석의 TDZ).
  stopTalkingRef.current = stopTalking

  /**
   * 마이크를 켜고 창에 타이머를 건다. `remaining` 은 **이 창에 남은 시간**이다.
   *
   * 응답 뒤 자동 재개(`resumeTalking`)가 처음 누른 시점부터의 15분을 이어 쓰기 때문에
   * 인자로 받는다 — 턴마다 15분을 새로 주면 상한이 상한이 아니게 된다.
   */
  const openWindow = useCallback(
    async (remaining: number, note: string | null) => {
      const room = roomRef.current
      if (!room) return
      setMicBusy(true)
      try {
        await room.localParticipant.setMicrophoneEnabled(true)
      } catch (cause) {
        // 권한 거부·장치 없음이 여기로 온다. localhost 는 secure context 로 취급되어
        // getUserMedia 가 동작하지만, 다른 기기에서 열면 HTTPS 가 필요하다.
        // 원인에 따라 사용자가 할 일이 달라서 이름으로만 갈라 준다.
        console.error('[coach] 마이크 켜기 실패', cause)
        const denied = cause instanceof Error && /NotAllowed|Permission/i.test(cause.name)
        push(
          'warn',
          denied
            ? '마이크 권한이 필요해요. 주소창의 자물쇠에서 마이크를 허용해 주세요.'
            : '마이크를 켤 수 없어요. 다른 앱이 쓰고 있는지 확인해 주세요.',
        )
        return
      } finally {
        setMicBusy(false)
      }

      // **먼저 지운다.** 자동 재개와 사람의 누름이 겹칠 수 있다 — 답이 도착해
      // `endGenerating()` 이 잠금을 푼 직후, `resumeTalking` 이 `await` 에 들어가 있는
      // 사이의 누름은 `talkingRef` 가 아직 거짓이라 통과한다. 그러면 카운트다운과 상한
      // 타이머가 둘씩 생기고, 먼저 걸린 상한이 창을 일찍 닫는다.
      clearTalkTimers()
      talkingRef.current = true
      setListening(true)
      setTalkLeft(Math.ceil(remaining / 1000))
      if (note) push('sys', note)

      // 1초 주기다. 남은 시간을 초 단위로 보여주므로 그보다 잦은 setState 는 15분 동안
      // 리렌더만 늘린다. **기준은 처음 누른 시각이라** 재개해도 값이 이어진다.
      countdownTimer.current = window.setInterval(() => {
        const left = Math.ceil((TALK_WINDOW_MS - (Date.now() - talkStartedAt.current)) / 1000)
        if (left > 0) setTalkLeft(left)
      }, 1000)

      talkTimer.current = window.setTimeout(() => void stopTalking('시간 종료'), remaining)
    },
    [clearTalkTimers, push, stopTalking],
  )

  const startTalking = useCallback(async () => {
    talkStartedAt.current = Date.now()
    await openWindow(TALK_WINDOW_MS, '말하세요 (응답을 만드는 동안에는 잠시 멈춥니다 · 최대 15분)')
  }, [openWindow])

  /**
   * 답이 도착해서 다시 듣는다. **처음 누른 창을 이어 쓴다.**
   *
   * 조용히 한다 — 버튼 글자가 `듣는 중 M:SS` 로 돌아오고, 에이전트도 `listening` 을
   * 보내 상태줄이 바뀐다(`TRANSCRIPT_TOPIC`). 턴마다 한 줄씩 남길 일이 아니다.
   */
  const resumeTalking = useCallback(async () => {
    if (!resumeAfterReplyRef.current) return
    resumeAfterReplyRef.current = false
    // 이미 열려 있거나(사람이 먼저 눌렀다) 방을 놓았으면 할 일이 없다.
    if (talkingRef.current || disposedRef.current || !roomRef.current || !voiceAvailable) return
    const left = TALK_WINDOW_MS - (Date.now() - talkStartedAt.current)
    if (left < RESUME_MIN_MS) {
      // 남은 창이 없으면 여기서 끝낸다. 굳이 켰다가 곧바로 끄면 STT 연결 비용만 낸다.
      push('sys', '듣기 창이 끝났습니다 (15분) — 더 말하려면 다시 눌러 주세요')
      return
    }
    await openWindow(left, null)
  }, [openWindow, push, voiceAvailable])

  // `openRoom` 의 답 핸들러가 이걸 통해 다시 듣는다(위 주석의 TDZ).
  resumeTalkingRef.current = resumeTalking

  const toggleTalk = useCallback(async () => {
    const room = roomRef.current
    // `micBusy` 도 여기서 막는다. 버튼이 `disabled` 라도 키보드·프로그램 호출로 들어올
    // 수 있고, 그 경로가 열려 있으면 위 `micBusy` 주석의 타이머 중복이 그대로 난다.
    if (!room || !voiceAvailable || micBusy) return
    if (!room.localParticipant.isMicrophoneEnabled) {
      /*
       * **응답 생성 중에는 열지 않는다.** 열어도 그 발화는 서버가 버리므로
       * (`Conversation` 의 락) 사용자는 "말했는데 아무 일도 안 일어난다" 만 겪고, 그
       * 오디오를 올려보낸 값은 나간다.
       *
       * 대신 이 누름을 **자동 재개 취소**로 받는다. 안 그러면 응답 중에 그만하려고 눌러도
       * 답이 오는 순간 마이크가 저절로 켜진다.
       */
      if (generatingRef.current) {
        if (resumeAfterReplyRef.current) {
          resumeAfterReplyRef.current = false
          push('sys', '듣기를 멈췄습니다 (직접 멈춤) — 답이 와도 다시 듣지 않습니다')
        } else {
          push('sys', 'AI가 답하는 중입니다 — 끝나면 말해 주세요')
        }
        return
      }
      await startTalking()
      return
    }
    if (Date.now() - talkStartedAt.current < MISCLICK_GUARD_MS) {
      // 켜자마자 끄면 전사도 못 얻고 STT 연결 비용만 낸다.
      push('sys', '너무 빨리 눌렀습니다 — 계속 듣고 있어요')
      return
    }
    await stopTalking('직접 멈춤')
  }, [micBusy, push, startTalking, stopTalking, voiceAvailable])

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
    micBusy,
    connect,
    disconnect,
    sendChat,
    sendSheet,
    toggleTalk,
    /** 화면이 스스로 한 처리를 대화에 한 줄 남긴다(에이전트가 한 말이 아니다). */
    notify: (text: string) => push('sys', text),
  }
}
