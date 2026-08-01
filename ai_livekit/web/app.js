/**
 * 브라우저에서 에이전트와 텍스트로 대화합니다 — 로컬 확인용.
 *
 * `scripts/smoke_client.py` 가 파이썬으로 하던 일을 브라우저에서 합니다. 차이는
 * **토큰을 직접 만들지 않는다**는 것입니다 — `API_SECRET` 이 브라우저에 있으면
 * 누구나 토큰을 위조할 수 있으므로, `dev_server.py`(= 실제로는 Spring)에서 받아옵니다.
 *
 * ## 빌드 도구가 없습니다
 *
 * `livekit-client` 를 CDN 에서 ESM 으로 가져옵니다. `../ai/static/` 이 그냥 서빙되던
 * 구조를 유지하려는 것입니다 — npm + vite 를 들이면 파이썬 저장소에 노드 툴체인이
 * 하나 더 붙습니다. 대신 **페이지를 열 때 네트워크가 필요합니다.** 오프라인에서
 * 작업할 일이 생기면 이 파일을 내려받아 `web/vendor/` 에 두세요.
 *
 * 버전을 고정해 두었습니다. 안 하면 어느 날 메이저가 올라가면서 조용히 깨집니다.
 *
 * ## API 이름
 *
 * livekit-client 2.21 기준입니다(파이썬 SDK 의 camelCase 짝).
 *   room.connect(url, token)
 *   room.registerTextStreamHandler(topic, (reader, info) => ...)
 *   room.localParticipant.sendText(text, { topic })
 */
import { Room, RoomEvent } from 'https://cdn.jsdelivr.net/npm/livekit-client@2.21.0/+esm'

// `agent/entrypoint.py` · `agent/sheet_transfer.py` 와 **같은 문자열이어야 합니다.**
// 한쪽만 고치면 메시지가 조용히 사라집니다 — 에러가 아니라 무응답으로 드러납니다.
const CHAT_TOPIC = 'lk.chat'
const GOAL_TOPIC = 'mandarin.goal'
const SHEET_TOPIC = 'mandarin.sheet'
const TRANSCRIPT_TOPIC = 'mandarin.transcript'
const HELLO_TOPIC = 'mandarin.hello'

//: 도메인당 과제 상한. `../ai/static/js/board.js` 의 `DOMAIN_CAPACITY` 와,
//: `prompts/system.md` 의 `domain_capacity` 와 같은 값입니다.
const DOMAIN_CAPACITY = 8

const FREQUENCY_LABELS = {
  daily: '일간 · 주 7회',
  weekly: '주간 · 주 1회',
  none: '없음 · 한 번만',
}

const $ = (id) => document.getElementById(id)
const badge = $('badge')

let room = null
let sheet = { domains: [] }

//: 채팅 로그에 쓸 AI 이름. `mandarin.hello` 가 도착하면 모드가 붙습니다.
//:
//: **이름을 둘로 나누지 않습니다** — 같은 봇이 모드만 다른 것이라, "채팅 AI" / "음성 AI"
//: 로 갈라 쓰면 봇이 두 개인 것처럼 읽힙니다. 접미로만 구분합니다.
let aiLabel = 'AI'
let voiceAvailable = false

// ── 렌더링 ────────────────────────────────────────────────────────────
function setStatus(text, kind) {
  badge.textContent = text
  badge.className = `badge ${kind}`
}

function renderSheet() {
  const host = $('sheet')
  host.innerHTML = ''
  if (!sheet.domains.length) {
    host.innerHTML = '<p class="empty">시트가 비어 있습니다. AI 가 모든 칸을 새로 제안합니다.</p>'
    return
  }
  for (const domain of sheet.domains) {
    const box = document.createElement('div')
    box.className = 'domain'
    const used = domain.subjects?.length ?? domain.subjectCount ?? 0
    box.innerHTML = `<h3>${escapeHtml(domain.title)} <span class="count">${used}/${DOMAIN_CAPACITY}</span></h3>`
    const list = document.createElement('ul')
    for (const subject of domain.subjects ?? []) {
      const li = document.createElement('li')
      // **두 이름을 다 읽습니다** — 토큰에서 온 과제는 Spring 이름(`period`)이고,
      // `keep()` 이 방금 담은 과제는 모델 payload 의 이름(`frequency`)입니다. 위
      // `nextLocalSubjectId()` 가 `id ?? subjectId` 를 보는 것과 같은 이유이고,
      // 한쪽만 읽으면 빈도 칩만 조용히 사라집니다(서버도 양쪽을 받습니다 —
      // `../ai/app/sheet.py`).
      const freq = FREQUENCY_LABELS[subject.period ?? subject.frequency]
      li.innerHTML = `${escapeHtml(subject.title)}${freq ? ` <em>${freq}</em>` : ''}`
      list.appendChild(li)
    }
    box.appendChild(list)
    host.appendChild(box)
  }
}

function log(who, text, kind = '') {
  const line = document.createElement('div')
  line.className = `msg ${kind}`
  line.innerHTML = `<span class="who">${escapeHtml(who)}</span><span class="text">${escapeHtml(text)}</span>`
  $('log').appendChild(line)
  $('log').scrollTop = $('log').scrollHeight
  return line
}

/**
 * 구조화 결과를 말풍선 아래에 붙입니다.
 *
 * `recommend`/`generate` 일 때만 담기 버튼이 붙습니다. 자동으로 담지 않는 이유는
 * 프롬프트의 `no_autocomplete` 규칙입니다 — 추천과 초안까지만 하고 최종 확정은
 * 사용자가 합니다(→ `../ai/README.md`).
 */
function renderGoal(data) {
  const box = document.createElement('div')
  box.className = 'goal'

  const action = data.action ?? '?'
  const task = data.generated_task ?? data.matched_task ?? null
  const domain = data.domain ?? null

  const bits = [`<code>${escapeHtml(action)}</code>`]
  if (domain) {
    bits.push(
      data.domain_is_new
        ? `새로 <b>${escapeHtml(domain)}</b> 칸을 만들어 담습니다`
        : `<b>${escapeHtml(domain)}</b> 칸에 담습니다`
    )
  }
  box.innerHTML = `<div class="goal-head">${bits.join(' · ')}</div>`

  if (task?.title) {
    const freq = FREQUENCY_LABELS[task.frequency]
    const row = document.createElement('div')
    row.className = 'goal-task'
    row.innerHTML = `<span>${escapeHtml(task.title)}</span>${freq ? `<em>${freq}</em>` : ''}`
    box.appendChild(row)
  }

  // **`generate` 만 담습니다.** 서버의 `_STORABLE_ACTIONS = ("generate",)` 와 같은
  // 조건입니다. `recommend` 는 "이미 시트에 있는 과제" 를 지목한 것이라 담으면 중복이
  // 됩니다 — 실제로 그렇게 시트가 3개에서 4개로 늘었습니다.
  if (action === 'generate' && domain) {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'keep'
    btn.textContent = `담기 → ${domain}${data.domain_is_new ? ' (새 칸)' : ''}`
    btn.addEventListener('click', () => keep(data, btn))
    box.appendChild(btn)
  } else if (action === 'recommend') {
    // 담을 것이 없다는 것을 알려줘야 합니다. 버튼만 없으면 사용자는 "왜 담기가
    // 안 나오지" 로 읽습니다.
    const note = document.createElement('div')
    note.className = 'goal-note'
    note.textContent = '이미 담아둔 과제예요 — 새로 담지 않습니다.'
    box.appendChild(note)
  }

  // 원본도 접어서 보여줍니다. 배선을 확인하는 화면이라 payload 를 볼 수 있어야 합니다.
  const raw = document.createElement('details')
  raw.innerHTML = `<summary>payload</summary><pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`
  box.appendChild(raw)

  $('log').appendChild(box)
  $('log').scrollTop = $('log').scrollHeight

  if ('reasoning' in data) {
    // 여기 오면 서버가 `public_data()` 를 건너뛴 것입니다.
    log('경고', 'payload 에 reasoning 이 들어 있습니다 — 서버에서 제거되어야 합니다', 'warn')
  }
}

/**
 * 로컬 과제에 붙일 `subjectId`. **토큰에서 온 실제 PK 와 겹치지 않게** 그 뒤에서 셉니다.
 *
 * 토큰 metadata 의 과제는 진짜 PK(3, 4, 11 …)를 갖고 있습니다. 그 값을 다시 매기면
 * 나중에 Spring 담기 API 를 붙일 때 실제 PK 를 잃습니다 — 그래서 기존 값은 보존하고
 * 새로 담는 것만 `max + 1` 부터 붙입니다.
 */
function nextLocalSubjectId() {
  let max = 0
  for (const domain of sheet.domains) {
    for (const subject of domain.subjects ?? []) {
      const id = Number(subject.id ?? subject.subjectId)
      if (Number.isFinite(id) && id > max) max = id
    }
  }
  return max + 1
}

// ── 담기 → 시트 갱신 → 에이전트에 통째로 재전송 ──────────────────────
async function keep(data, btn) {
  const title = (data.generated_task ?? data.matched_task)?.title
  const frequency = (data.generated_task ?? data.matched_task)?.frequency ?? null
  if (!title || !data.domain) return

  let domain = sheet.domains.find((d) => d.title === data.domain)
  if (!domain) {
    domain = { id: null, title: data.domain, subjectCount: 0, subjects: [] }
    sheet.domains.push(domain)
  }
  if ((domain.subjects?.length ?? 0) >= DOMAIN_CAPACITY) {
    log('시스템', `${domain.title} 칸이 ${DOMAIN_CAPACITY}개로 꽉 찼습니다`, 'warn')
    return
  }

  // **id 를 반드시 붙입니다.** `to_candidates()` 가 `subjectId` 없는 과제를 후보에서
  // 버리기 때문에(모델이 지목할 방법이 없어서), `null` 로 두면 **방금 담은 과제가 다음
  // 턴의 중복 검사에 안 들어갑니다.**
  //
  // 진짜 PK 는 Spring 담기 API 가 정하는 값인데 아직 없으므로, `../ai/static/js/board.js`
  // 처럼 **로컬 일련번호**를 씁니다 — 모델이 후보를 지목하고 서버가 같은 요청 안에서
  // 되짚어 보는 데에만 쓰이므로 이 범위에서 유일하면 충분합니다.
  domain.subjects.push({ id: nextLocalSubjectId(), title, frequency })
  domain.subjectCount = domain.subjects.length

  btn.disabled = true
  btn.textContent = '담았습니다'
  renderSheet()
  log('시스템', `"${title}" 을 ${domain.title} 칸에 담았습니다`, 'sys')

  // **전체 목록을 보냅니다.** 증분은 하나 유실되면 서버와 조용히 갈라집니다.
  await room.localParticipant.sendText(JSON.stringify(sheet), { topic: SHEET_TOPIC })
}

// ── 연결 ──────────────────────────────────────────────────────────────
async function connect() {
  $('connect').disabled = true
  setStatus('연결 중…', 'busy')

  let info
  try {
    const res = await fetch('/api/token?room=dev-room')
    if (!res.ok) throw new Error(`토큰 발급 실패 (${res.status})`)
    info = await res.json()
  } catch (err) {
    setStatus('토큰 실패', 'off')
    log('시스템', `${err.message} — dev_server.py 가 떠 있나요?`, 'warn')
    $('connect').disabled = false
    return
  }

  sheet = info.sheet ?? { domains: [] }
  renderSheet()

  room = new Room()

  // 세션 능력 알림. **마이크 버튼은 이걸 받고서야 열립니다** — 서버가 음성을 못 받는
  // 상태에서 버튼을 열어두면, 눌러서 말하고 아무 일도 안 일어나는 것을 보게 됩니다.
  room.registerTextStreamHandler(HELLO_TOPIC, async (reader) => {
    let hello
    try {
      hello = JSON.parse(await reader.readAll())
    } catch {
      return
    }
    voiceAvailable = !!hello.voice
    aiLabel = hello.mode ? `${hello.name} · ${hello.mode}` : hello.name || 'AI'
    $('mic').disabled = !voiceAvailable

    // LLM 이 못 쓰는 상태면 **먼저** 알립니다. 발화를 던지고 실패를 기다리게 두면
    // 사용자는 자기 말이 문제인 줄 압니다. 음성과 달리 LLM 은 선택 기능이 아닙니다.
    if (hello.llmMessage) {
      log('시스템', hello.llmMessage, 'warn')
      setStatus(hello.llm === 'missing_key' ? 'AI 사용 불가' : '데모 백엔드', 'off')
    }
    if (voiceAvailable) {
      $('mic').title = '누르면 10초간 듣습니다'
      log('시스템', `${aiLabel} 준비됨 — 말하기 버튼을 쓸 수 있습니다`, 'sys')
    } else {
      // 이유를 화면에 남깁니다. 서버 로그에만 있으면 사용자는 버튼이 왜 안 되는지
      // 알 수 없습니다.
      $('mic').title = '서버에 음성이 꺼져 있습니다 (DEEPGRAM_API_KEY 없음)'
      setMicLabel('🎤 음성 꺼짐', false)
      log('시스템', `${aiLabel} 준비됨 — 음성이 꺼져 있어 텍스트로만 대화합니다`, 'sys')
    }
  })

  room.registerTextStreamHandler(CHAT_TOPIC, async (reader) => {
    log(aiLabel, await reader.readAll(), 'ai')
  })

  // 전사문은 `lk.chat` 이 아니라 이 토픽으로 옵니다 — 섞으면 내 말과 AI 답을 구분할
  // 수 없습니다. `final` 이 거짓이면 지워질 캡션, 참이면 대화 로그에 남습니다.
  room.registerTextStreamHandler(TRANSCRIPT_TOPIC, async (reader) => {
    let payload
    try {
      payload = JSON.parse(await reader.readAll())
    } catch {
      return
    }
    // `listening` 은 **에이전트가 실제로 듣기 시작/중지했다는 확인**입니다. 브라우저가
    // mute 를 토글해도 에이전트에 이벤트가 안 닿으면 아무 일도 일어나지 않는데, 그
    // 상태를 화면에서 알 방법이 없어 버그가 여러 라운드 숨었습니다.
    if ('listening' in payload) {
      setStatus(payload.listening ? '에이전트가 듣고 있음' : '에이전트 연결됨', 'on')
      return
    }
    if (payload.final) {
      showCaption('')
      log('나', payload.text, 'me')
    } else {
      showCaption(payload.text)
    }
  })
  room.registerTextStreamHandler(GOAL_TOPIC, async (reader) => {
    try {
      renderGoal(JSON.parse(await reader.readAll()))
    } catch (err) {
      log('시스템', `goal payload 파싱 실패: ${err.message}`, 'warn')
    }
  })

  room.on(RoomEvent.ParticipantConnected, (p) => {
    log('시스템', `참가자 입장: ${p.identity}`, 'sys')
    setStatus('에이전트 연결됨', 'on')
  })
  room.on(RoomEvent.Disconnected, () => {
    setStatus('연결 끊김', 'off')
    $('input').disabled = $('send').disabled = $('mic').disabled = true
    $('connect').disabled = false
    showCaption('')
    // 타이머를 안 지우면 끊긴 뒤에도 자동 종료가 돌아 `room` 이 null 인 채로 부릅니다.
    clearTalkTimers()
    setMicLabel('🎤 말하기', false)
    // 재접속하면 hello 를 다시 받습니다. 그때까지 음성은 없는 것으로 둡니다.
    voiceAvailable = false
  })

  try {
    await room.connect(info.url, info.token)
  } catch (err) {
    setStatus('접속 실패', 'off')
    log('시스템', `${err.message} — LiveKit 서버가 떠 있나요? (${info.url})`, 'warn')
    $('connect').disabled = false
    return
  }

  setStatus('방 접속됨 · 에이전트 대기', 'busy')
  log('시스템', `방 "${info.room}" 에 ${info.identity} 로 접속했습니다`, 'sys')

  // 에이전트가 이미 들어와 있을 수도 있습니다(재접속 등).
  if (room.remoteParticipants.size > 0) setStatus('에이전트 연결됨', 'on')

  // 마이크는 `mandarin.hello` 가 음성 가능이라고 알려줄 때까지 잠겨 있습니다.
  $('input').disabled = $('send').disabled = false
  $('input').focus()
}

/** 진행 중인 전사문. 빈 문자열이면 감춥니다. */
function showCaption(text) {
  const el = $('caption')
  el.textContent = text
  el.hidden = !text
}

/**
 * 푸시투토크 — 누르면 듣고, 다시 누르거나 10초가 지나면 멈춥니다.
 *
 * **`../ai` 의 방식으로 돌아온 것입니다.** 저쪽은 버튼을 누르는 동안만 오디오를 보냈고,
 * 시작·끝을 사람이 명시하니 발화 감지가 필요 없었습니다. 마이크를 계속 켜두는 방식으로
 * 바꿨더니 두 문제가 생겼습니다 —
 *
 *   ① 무음 구간도 오디오 시간으로 과금됩니다 (스트리밍 STT 의 특성)
 *   ② 잡음과 무음을 구분할 장치가 없습니다 (silero VAD 가 필요해짐)
 *
 * 창을 사람이 열고 닫으면 **둘 다 사라집니다.** 발화가 짧다는 전제가 맞으면 상한이
 * 넉넉하고, 아니면 `TALK_WINDOW_MS` 만 늘리면 됩니다.
 *
 * 트랙을 끊는 대신 mute 를 토글합니다 — 재협상이 없고, 에이전트 쪽 `track_muted` /
 * `track_unmuted` 가 전사 태스크를 시작·취소합니다(과금 정지 지점).
 */
const TALK_WINDOW_MS = 10_000

//: 오조작 가드. 이 시간 안의 두 번째 누름은 무시합니다.
//:
//: `../ai` 의 `MIN_SECONDS = 0.3`("버튼을 스치듯 눌렀을 때 무시")과 같은 자리입니다.
//: 저쪽은 캡처된 오디오 길이로 걸렀지만, 여기서는 **켜자마자 끄는 것을 막습니다** —
//: 그러면 STT 연결을 열자마자 닫아 전사도 못 얻고 요금만 냅니다.
const MISCLICK_GUARD_MS = 300

let talkTimer = null
let countdownTimer = null
let talkStartedAt = 0

function setMicLabel(text, active) {
  $('mic').textContent = text
  $('mic').classList.toggle('active', !!active)
}

function clearTalkTimers() {
  if (talkTimer) clearTimeout(talkTimer)
  if (countdownTimer) clearInterval(countdownTimer)
  talkTimer = countdownTimer = null
}

async function startTalking() {
  $('mic').disabled = true
  try {
    await room.localParticipant.setMicrophoneEnabled(true)
  } catch (err) {
    // 권한 거부·장치 없음이 여기로 옵니다. localhost 는 secure context 로 취급되어
    // getUserMedia 가 동작하지만, 다른 기기에서 열면 HTTPS 가 필요합니다.
    log('시스템', `마이크를 켤 수 없습니다: ${err.message}`, 'warn')
    $('mic').disabled = false
    return
  }
  $('mic').disabled = false

  talkStartedAt = Date.now()
  // 여기서 "말하세요" 라고 해도 거짓이 아닙니다 — Deepgram 연결이 열리기 전에 말해도
  // 프레임은 무제한 채널에 쌓여 있다가 전송됩니다. 전사가 0.7초쯤 늦게 올 뿐입니다.
  setMicLabel('🎤 듣는 중 10s', true)
  log('시스템', '말하세요 (10초 후 자동으로 멈춥니다)', 'sys')

  countdownTimer = setInterval(() => {
    const left = Math.ceil((TALK_WINDOW_MS - (Date.now() - talkStartedAt)) / 1000)
    if (left > 0) setMicLabel(`🎤 듣는 중 ${left}s`, true)
  }, 250)

  talkTimer = setTimeout(() => void stopTalking('시간 종료'), TALK_WINDOW_MS)
}

async function stopTalking(reason) {
  clearTalkTimers()
  $('mic').disabled = true
  try {
    await room.localParticipant.setMicrophoneEnabled(false)
  } catch (err) {
    log('시스템', `마이크를 끄지 못했습니다: ${err.message}`, 'warn')
  }
  $('mic').disabled = false
  setMicLabel('🎤 말하기', false)
  showCaption('')
  log('시스템', `듣기를 멈췄습니다 (${reason})`, 'sys')
}

async function toggleTalk() {
  if (!room || !voiceAvailable) return
  if (!room.localParticipant.isMicrophoneEnabled) {
    await startTalking()
    return
  }
  const held = Date.now() - talkStartedAt
  if (held < MISCLICK_GUARD_MS) {
    // 켜자마자 끄면 전사도 못 얻고 STT 연결 비용만 냅니다.
    log('시스템', '너무 빨리 눌렀습니다 — 계속 듣고 있어요', 'sys')
    return
  }
  await stopTalking('직접 멈춤')
}

$('connect').addEventListener('click', () => void connect())
$('mic').addEventListener('click', () => void toggleTalk())

$('composer').addEventListener('submit', async (event) => {
  event.preventDefault()
  const text = $('input').value.trim()
  if (!text || !room) return
  $('input').value = ''
  log('나', text, 'me')
  await room.localParticipant.sendText(text, { topic: CHAT_TOPIC })
})

function escapeHtml(value) {
  // `&` 를 먼저 바꿔야 합니다. 나중에 바꾸면 앞서 만든 `&lt;` 가 이중 이스케이프됩니다
  // (→ `../ai/LEARNING.md` 10절, `escape_slot_value` 와 같은 함정).
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

renderSheet()
