/**
 * 브라우저에서 에이전트와 대화합니다 — 로컬 확인용.
 *
 * `scripts/smoke_client.py` 가 파이썬으로 하던 일을 브라우저에서 합니다. 차이는
 * **토큰을 직접 만들지 않는다**는 것입니다 — `API_SECRET` 이 브라우저에 있으면
 * 누구나 토큰을 위조할 수 있으므로, `dev_server.py`(= 실제로는 Spring)에서 받아옵니다.
 *
 * ## 화면은 React 프론트에 맞춰 둡니다
 *
 * 레이아웃·토큰·말풍선 모양이 `frontend/src/pages/AiCoachPage.tsx` 와 같습니다.
 * 그쪽으로 옮길 때(README "남은 일") 배선만 들고 가면 되도록, **여기서 만드는 마크업도
 * 저쪽 클래스 구성을 따릅니다.** 다른 점은 `web/index.html` 머리 주석에 있습니다.
 *
 * ## 빌드 도구가 없습니다
 *
 * `livekit-client` 를 CDN 에서 ESM 으로 가져옵니다. 정적 파일을 그냥 서빙하는
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
// `tests/test_topics_match.py` 가 세 곳(서버 · 이 파일 · React 훅)을 대조합니다.
const CHAT_TOPIC = 'lk.chat'
const GOAL_TOPIC = 'mandarin.goal'
const SHEET_TOPIC = 'mandarin.sheet'
const TRANSCRIPT_TOPIC = 'mandarin.transcript'
const HELLO_TOPIC = 'mandarin.hello'

//: 도메인당 과제 상한. 만다라트가 9x9 이중 3x3 이라 칸당 8개입니다.
//:
//: 같은 값이 세 곳에 있습니다 — `mandarin_goal/sheet.py` 의
//: `MAX_SUBJECTS_PER_DOMAIN`(데이터 제약), `prompts/fragments/domain_capacity.md`
//: (모델에게 주는 규칙), 그리고 여기(화면 표시). 하나를 고치면 셋 다 봐야 합니다.
const DOMAIN_CAPACITY = 8

//: 만다라트의 세부 목표 정원. 진행 막대의 분모입니다.
//:
//: **`sheet.py` 의 `MAX_DOMAINS`(16)와 다른 값입니다.** 저쪽은 "정원이 아니라 남용
//: 천장" 이라고 적어 둔 데이터 상한이고(프롬프트 분량 방어), 화면이 보여줄 정원은
//: 만다라트와 같은 8 입니다. React 프론트의 `SLOTS` 와 같습니다.
const DOMAIN_SLOTS = 8

//: 도메인 8색. `frontend/src/components/common/Primitives.tsx` 의 `DOMAIN_COLORS` 와
//: 같은 값이어야 합니다 — 만다라트 칸·마을 건물·리포트 막대가 이 배열을 공유합니다.
const DOMAIN_COLORS = [
  '#e8590c', '#d9480f', '#1971c2', '#0c8599',
  '#2f9e44', '#5f3dc4', '#c2255c', '#f08c00',
]
const domainColor = (index) => DOMAIN_COLORS[((index % 8) + 8) % 8]

const FREQUENCY_LABELS = {
  daily: '일간 · 주 7회',
  weekly: '주간 · 주 1회',
  none: '없음 · 한 번만',
}

//: 마크업에 끼워 넣는 아이콘. `index.html` 의 것과 같은 규격입니다(24 그리드, 굵기 1.8).
//: `frontend/src/components/common/Icons.tsx` 의 `IconCoach` · `IconCheck` 입니다.
const ICON_COACH =
  '<svg viewBox="0 0 24 24" class="i17"><rect x="4" y="8" width="16" height="12" rx="4" />' +
  '<path d="M12 8V4.5" /><circle cx="12" cy="3.4" r="1.3" />' +
  '<path d="M9.3 13.2v1.6M14.7 13.2v1.6" /></svg>'
const ICON_CHECK = '<svg viewBox="0 0 24 24" class="i16"><path d="m4.5 12.5 5 5L20 7" /></svg>'

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

//: 방금 담은 과제(`"칸 제목 과제 제목"`). 그 줄만 한 번 튀어 오르게 하고 비웁니다.
let freshKey = ''

// ── 렌더링 ────────────────────────────────────────────────────────────
/** 연결 상태 배지. 프론트에는 없는 자리입니다(저쪽은 방에 붙지 않습니다). */
function setStatus(text, kind) {
  badge.textContent = text
  badge.className = `badge ${kind}`
}

/**
 * 캐릭터와 대화 카드의 상태 점.
 *
 * 배지는 **연결** 상태를 말하고 이쪽은 **AI 가 지금 무엇을 하는지**를 말합니다 — 둘을
 * 한 곳에 합치면 "연결됨" 만 떠 있는 동안 응답을 기다리는 중인지 알 수 없습니다.
 *
 *   idle      char_3  방에 들어와 시트를 읽는 중 (아무것도 안 하는 상태)
 *   thinking  char_2  내 말을 보냈고 답을 기다리는 중
 *   answering char_1  답이 도착함
 */
const AVATAR = {
  idle: { src: './images/char_3.png', state: '시트를 보고 있어요', dot: 'ready' },
  thinking: { src: './images/char_2.png', state: '생각하고 있어요', dot: 'busy' },
  answering: { src: './images/char_1.png', state: '답을 드렸어요', dot: 'ready' },
}

// 미리 받아 둡니다. 안 하면 상태가 처음 바뀔 때 그림이 잠깐 빕니다.
for (const { src } of Object.values(AVATAR)) new Image().src = src

function setAvatar(state) {
  const next = AVATAR[state]
  if (!next) return
  const box = $('avatar')
  if (box.dataset.state === state) return
  box.dataset.state = state
  $('avatar-img').src = next.src
  $('state-text').textContent = next.state
  $('state-dot').className = `dot ${next.dot}`
  // 생각 중에만 점 세 개를 띄웁니다 — 프론트의 `thinking` 표시와 같은 자리입니다.
  setThinking(state === 'thinking')
}

/** 응답 대기 표시. 답(또는 실패)이 오면 지웁니다. */
function setThinking(on) {
  const existing = $('thinking')
  if (!on) {
    existing?.remove()
    return
  }
  if (existing) return
  const dots = document.createElement('div')
  dots.className = 'thinking'
  dots.id = 'thinking'
  dots.setAttribute('aria-label', '응답 생성 중')
  dots.innerHTML = '<span></span><span></span><span></span>'
  $('log').appendChild(dots)
  scrollLog()
}

function scrollLog() {
  $('log').scrollTop = $('log').scrollHeight
}

function renderSheet() {
  const host = $('sheet')
  host.innerHTML = ''

  const domains = sheet.domains ?? []
  const total = domains.reduce((sum, d) => sum + (d.subjects?.length ?? d.subjectCount ?? 0), 0)
  $('task-count').textContent = `과제 ${total}/${DOMAIN_SLOTS * DOMAIN_CAPACITY}`
  $('task-count').className = total > 0 ? 'badge busy' : 'badge'
  $('domain-count').textContent = `세부 목표 ${domains.length}/${DOMAIN_SLOTS}`
  $('progress-fill').style.width = `${Math.min(100, (domains.length / DOMAIN_SLOTS) * 100)}%`

  if (!domains.length) {
    host.innerHTML =
      '<div class="empty"><span class="mark" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" class="i24"><rect x="4" y="8" width="16" height="12" rx="4" />' +
      '<path d="M12 8V4.5" /><circle cx="12" cy="3.4" r="1.3" />' +
      '<path d="M9.3 13.2v1.6M14.7 13.2v1.6" /></svg></span>' +
      '<strong>시트가 비어 있어요</strong>' +
      '<p>AI 가 모든 칸을 새로 제안합니다. 담기를 누르면 여기에 쌓이고 중복 검사에 들어갑니다.</p></div>'
    return
  }

  domains.forEach((domain, index) => {
    const color = domainColor(index)
    const subjects = domain.subjects ?? []
    const used = subjects.length || domain.subjectCount || 0

    const box = document.createElement('div')
    box.innerHTML =
      '<div class="dom-head">' +
      `<span class="dom-dot" style="background:${color}" aria-hidden="true"></span>` +
      `<strong>${escapeHtml(domain.title)}</strong>` +
      `<span class="muted nums">${used}/${DOMAIN_CAPACITY}</span></div>` +
      `<div class="ticks" aria-hidden="true" title="${used}/${DOMAIN_CAPACITY} 칸">` +
      Array.from({ length: DOMAIN_CAPACITY }, (_, slot) =>
        `<span${slot < used ? ` style="background:${color}"` : ''}></span>`
      ).join('') +
      '</div>'

    const list = document.createElement('ul')
    list.className = 'items'
    for (const subject of subjects) {
      const li = document.createElement('li')
      li.className = 'item'
      // **두 이름을 다 읽습니다** — 토큰에서 온 과제는 Spring 이름(`period`)이고,
      // `keep()` 이 방금 담은 과제는 모델 payload 의 이름(`frequency`)입니다. 아래
      // `nextLocalSubjectId()` 가 `id ?? subjectId` 를 보는 것과 같은 이유이고,
      // 한쪽만 읽으면 빈도 칩만 조용히 사라집니다(서버도 양쪽을 받습니다 —
      // `mandarin_goal/sheet.py`).
      const freq = FREQUENCY_LABELS[subject.period ?? subject.frequency]
      li.innerHTML =
        ICON_CHECK +
        `<span class="body"><span class="title">${escapeHtml(subject.title)}</span>` +
        (freq ? `<span class="meta">${freq}</span>` : '') +
        '</span>'
      if (freshKey === `${domain.title} ${subject.title}`) li.classList.add('fresh')
      list.appendChild(li)
    }
    box.appendChild(list)
    host.appendChild(box)
  })

  // 한 번만 띄웁니다. 안 비우면 시트를 다시 그릴 때마다 같은 줄이 계속 튑니다.
  freshKey = ''
}

/**
 * 대화 한 줄. `kind` 로 말풍선 모양이 갈립니다 —
 *
 *   me    오른쪽 브랜드색 말풍선
 *   ai    왼쪽 가라앉은 말풍선 + 코치 아이콘
 *   sys   배선 상태. **말풍선을 주지 않습니다** — 대화가 아니라 진단 정보입니다
 *   warn  같은 자리, 브랜드색으로
 */
function log(who, text, kind = '') {
  const line = document.createElement('div')
  if (kind === 'me') {
    line.className = 'turn-me'
    line.innerHTML = `<p>${escapeHtml(text)}</p>`
  } else if (kind === 'ai') {
    line.className = 'turn-ai'
    line.innerHTML =
      `<span class="coach-mini" aria-hidden="true">${ICON_COACH}</span><p>${escapeHtml(text)}</p>`
  } else {
    line.className = `turn-sys ${kind}`
    line.innerHTML = `<b>${escapeHtml(who)}</b><span>${escapeHtml(text)}</span>`
  }
  $('log').appendChild(line)
  scrollLog()
  return line
}

/**
 * 구조화 결과를 말풍선 아래에 붙입니다 — 프론트의 "제안 카드" 자리입니다.
 *
 * `generate` 일 때만 담기 버튼이 붙습니다. 자동으로 담지 않는 이유는 프롬프트의
 * `no_autocomplete` 규칙입니다 — 추천과 초안까지만 하고 최종 확정은 사용자가 합니다.
 */
function renderGoal(data) {
  const box = document.createElement('div')
  box.className = 'goal'

  const action = data.action ?? '?'
  const task = data.generated_task ?? data.matched_task ?? null
  const domain = data.domain ?? null

  if (domain) {
    const label = document.createElement('p')
    label.className = 'goal-label'
    label.textContent = data.domain_is_new
      ? `새 세부 목표 “${domain}” 에 담을 과제`
      : `세부 목표 “${domain}” 에 담을 과제`
    box.appendChild(label)
  }

  if (task?.title) {
    const freq = FREQUENCY_LABELS[task.frequency]
    const card = document.createElement('div')
    card.className = 'sug'
    card.innerHTML =
      '<div class="sug-top">' +
      `<strong>${escapeHtml(task.title)}</strong>` +
      (freq ? `<span class="badge">${freq}</span>` : '') +
      '</div>'

    // 근거 자리입니다. 모델의 `reasoning` 은 사용자에게 나가지 않으므로(`public_data`)
    // 여기에는 **서버가 무엇을 하려는지**를 적습니다.
    const why = document.createElement('p')
    why.className = 'sug-why'
    why.textContent =
      action === 'generate'
        ? data.domain_is_new
          ? '새로 만든 초안입니다. 담으면 이 칸이 시트에 생깁니다.'
          : '새로 만든 초안입니다. 담으면 다음 턴 중복 검사에 들어갑니다.'
        : '이미 시트에 있는 과제를 지목한 것입니다 — 새로 담지 않습니다.'
    card.appendChild(why)

    // **`generate` 만 담습니다.** 서버의 `_STORABLE_ACTIONS = ("generate",)` 와 같은
    // 조건입니다. `recommend` 는 "이미 시트에 있는 과제" 를 지목한 것이라 담으면 중복이
    // 됩니다 — 실제로 그렇게 시트가 3개에서 4개로 늘었습니다.
    const btn = document.createElement('button')
    btn.type = 'button'
    if (action === 'generate' && domain) {
      btn.className = 'btn btn-secondary btn-sm'
      btn.textContent = `담기${data.domain_is_new ? ' (새 칸)' : ''}`
      btn.addEventListener('click', () => keep(data, btn))
    } else {
      // 담을 것이 없다는 것을 알려줘야 합니다. 버튼만 없으면 사용자는 "왜 담기가
      // 안 나오지" 로 읽습니다.
      btn.className = 'btn btn-quiet btn-sm'
      btn.textContent = '이미 담아둔 과제예요'
      btn.disabled = true
    }
    card.appendChild(btn)
    box.appendChild(card)
  }

  // 원본도 접어서 보여줍니다. 배선을 확인하는 화면이라 payload 를 볼 수 있어야 합니다.
  const raw = document.createElement('details')
  raw.innerHTML =
    `<summary>payload · action=${escapeHtml(action)}</summary>` +
    `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`
  box.appendChild(raw)

  $('log').appendChild(box)
  scrollLog()

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
  // 진짜 PK 는 Spring 담기 API 가 정하는 값인데 아직 없으므로 **로컬 일련번호**를
  // 씁니다 — 모델이 후보를 지목하고 서버가 같은 요청 안에서
  // 되짚어 보는 데에만 쓰이므로 이 범위에서 유일하면 충분합니다.
  domain.subjects.push({ id: nextLocalSubjectId(), title, frequency })
  domain.subjectCount = domain.subjects.length

  btn.disabled = true
  btn.className = 'btn btn-quiet btn-sm'
  btn.textContent = '담았어요'
  // 방금 담은 줄을 한 번 띄워 **어디에 들어갔는지** 보여줍니다. 렌더가 그 줄을 알아야
  // 해서 키로 넘깁니다 — DOM 을 다시 뒤져 찾으면 목록 순서에 기대는 코드가 됩니다.
  freshKey = `${domain.title} ${title}`
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
    if (hello.mode) $('mode-badge').textContent = hello.mode

    // LLM 이 못 쓰는 상태면 **먼저** 알립니다. 발화를 던지고 실패를 기다리게 두면
    // 사용자는 자기 말이 문제인 줄 압니다. 음성과 달리 LLM 은 선택 기능이 아닙니다.
    if (hello.llmMessage) {
      log('시스템', hello.llmMessage, 'warn')
      // **아는 데모 하나만 데모로 부르고 나머지는 사용 불가로 둡니다.** `missing_key` 만
      // 특별 취급하면 서버가 상태를 하나 더 늘린 날(`unknown_provider`) 쓸 수 없는 상태가
      // "데모 백엔드" 로 표시됩니다 — 관리자에게 알려야 할 일이 정상처럼 읽힙니다.
      setStatus(hello.llm === 'echo' ? '데모 백엔드' : 'AI 사용 불가', 'off')
    }
    if (voiceAvailable) {
      $('mic').title = '누르면 10초간 듣습니다'
      log('시스템', `${aiLabel} 준비됨 — 말하기 버튼을 쓸 수 있습니다`, 'sys')
    } else {
      // 이유를 화면에 남깁니다. 서버 로그에만 있으면 사용자는 버튼이 왜 안 되는지
      // 알 수 없습니다.
      $('mic').title = '서버에 음성이 꺼져 있습니다 (DEEPGRAM_API_KEY 없음)'
      setMicLabel('음성 꺼짐', false)
      log('시스템', `${aiLabel} 준비됨 — 음성이 꺼져 있어 텍스트로만 대화합니다`, 'sys')
    }
  })

  room.registerTextStreamHandler(CHAT_TOPIC, async (reader) => {
    log(aiLabel, await reader.readAll(), 'ai')
    // 답이 도착한 시점입니다 — 스트림을 다 읽고 나서 바꿉니다. 열리자마자 바꾸면
    // 아직 아무 글자도 안 뜬 화면에서 캐릭터만 먼저 답한 얼굴이 됩니다.
    setAvatar('answering')
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
      setStatus(payload.listening ? '듣고 있음' : '에이전트 연결됨', 'on')
      return
    }
    if (payload.final) {
      showCaption('')
      log('나', payload.text, 'me')
      // 최종 전사가 곧 발화의 끝입니다 — 여기서부터 에이전트가 답을 만듭니다.
      setAvatar('thinking')
    } else {
      showCaption(payload.text)
    }
  })
  room.registerTextStreamHandler(GOAL_TOPIC, async (reader) => {
    try {
      renderGoal(JSON.parse(await reader.readAll()))
      setAvatar('answering')
    } catch (err) {
      log('시스템', `goal payload 파싱 실패: ${err.message}`, 'warn')
    }
  })

  // **원격 참가자는 에이전트뿐이라고 봅니다.** 방은 사용자 1명 + 에이전트 1개이고
  // (백엔드가 방을 사용자마다 나눕니다 — `agent/entrypoint.py` 모듈 주석) 서버가 이
  // 방에 넣는 다른 참가자는 없습니다. `p.kind` 를 보지 않으므로, 사람이 둘일 수 있는
  // 설계로 바뀌면 여기와 아래 `remoteParticipants.size` 판정을 같이 고쳐야 합니다.
  room.on(RoomEvent.ParticipantConnected, (p) => {
    log('시스템', `참가자 입장: ${p.identity}`, 'sys')
    setStatus('에이전트 연결됨', 'on')
  })
  room.on(RoomEvent.Disconnected, () => {
    setStatus('연결 끊김', 'off')
    setComposerEnabled(false)
    $('mic').disabled = true
    $('connect').disabled = false
    showCaption('')
    // 타이머를 안 지우면 끊긴 뒤에도 자동 종료가 돌아 `room` 이 null 인 채로 부릅니다.
    clearTalkTimers()
    setMicLabel('말하기', false)
    // 끊긴 뒤에 "생각 중" 으로 굳어 있으면 오지 않을 답을 기다리게 됩니다.
    setAvatar('idle')
    setThinking(false)
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
  setAvatar('idle')

  // 에이전트가 이미 들어와 있을 수도 있습니다(재접속 등).
  if (room.remoteParticipants.size > 0) setStatus('에이전트 연결됨', 'on')

  // 마이크는 `mandarin.hello` 가 음성 가능이라고 알려줄 때까지 잠겨 있습니다.
  setComposerEnabled(true)
  $('input').focus()
}

/** 입력·보내기·빠른 문장을 한꺼번에 잠그고 엽니다. */
function setComposerEnabled(on) {
  $('input').disabled = $('send').disabled = !on
  for (const chip of $('chips').children) chip.disabled = !on
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
 * **버튼을 누르는 동안만 오디오를 보냅니다.** 시작·끝을 사람이 명시하므로 발화
 * 감지가 필요 없습니다. 마이크를 계속 켜두면 두 문제가 생깁니다 —
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
//: 버튼을 스치듯 눌렀을 때를 걸러 **켜자마자 끄는 것을 막습니다** — 그러면 STT
//: 연결을 열자마자 닫아 전사도 못 얻고 요금만 냅니다.
const MISCLICK_GUARD_MS = 300

let talkTimer = null
let countdownTimer = null
let talkStartedAt = 0

function setMicLabel(text, active) {
  $('mic-label').textContent = text
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
  setMicLabel('듣는 중 10s', true)
  log('시스템', '말하세요 (10초 후 자동으로 멈춥니다)', 'sys')

  countdownTimer = setInterval(() => {
    const left = Math.ceil((TALK_WINDOW_MS - (Date.now() - talkStartedAt)) / 1000)
    if (left > 0) setMicLabel(`듣는 중 ${left}s`, true)
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
  setMicLabel('말하기', false)
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

/** 텍스트 한 줄을 보냅니다. 입력창과 빠른 문장 칩이 같이 씁니다. */
async function send(text) {
  const value = text.trim()
  if (!value || !room) return
  log('나', value, 'me')
  setAvatar('thinking')
  await room.localParticipant.sendText(value, { topic: CHAT_TOPIC })
}

$('connect').addEventListener('click', () => void connect())
$('mic').addEventListener('click', () => void toggleTalk())

$('composer').addEventListener('submit', (event) => {
  event.preventDefault()
  const text = $('input').value
  $('input').value = ''
  void send(text)
})

// 빠른 문장. 프론트의 quick 칩과 같은 자리입니다 — 여기서는 시트 fixture 에 맞춰
// 중복(recommend) 과 신규(generate) 를 둘 다 밟도록 골라 두었습니다.
for (const chip of $('chips').children) {
  chip.addEventListener('click', () => void send(chip.textContent))
}

function escapeHtml(value) {
  // `&` 를 먼저 바꿔야 합니다. 나중에 바꾸면 앞서 만든 `&lt;` 가 이중 이스케이프됩니다
  // (서버의 `escape_slot_value` 와 같은 함정).
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

renderSheet()
setComposerEnabled(false)

// 첫 화면의 대화 칸을 비워 두지 않습니다. 프론트도 코치의 첫 인사로 시작하는데
// (`AiCoachPage.tsx` 의 `messages` 초기값), 여기서는 아직 방에 붙지 않았으니 **AI 가
// 한 말처럼 쓰지 않고** 무엇을 눌러야 하는지만 적습니다.
log(
  aiLabel,
  '연결하기를 누르면 방에 들어갑니다. 그다음 이루고 싶은 것을 적거나 아래 문장을 눌러 보세요.',
  'ai'
)
