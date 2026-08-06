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

//: 주기 라벨. `mandarin_goal/bot/subjects.py` 의 `FREQUENCY_LABELS` 와 같은 문자열입니다.
//:
//: **횟수를 라벨에 박지 않습니다.** 주간은 1~7회, 월간은 1~30회라 문자열 하나로는
//: 표현할 수 없습니다 — 예전 `weekly: '주간 · 주 1회'` 는 주 3회짜리 과제를 주 1회로
//: 보여 줬습니다. 횟수는 `frequencyLabel()` 이 붙입니다.
const FREQUENCY_LABELS = {
  daily: '일간',
  weekly: '주간',
  monthly: '월간',
  none: '한번만',
}

//: 고정 주기(일간·한번만)는 셀 것이 없어 문장으로 씁니다. 서버의
//: `FREQUENCY_COUNT_SUFFIX` 와 같은 표입니다.
const FREQUENCY_SUFFIX = {
  daily: '하루 1회',
  weekly: '주 {n}회',
  monthly: '월 {n}회',
  none: '기간 내 1회',
}

/** `weekly` + 3 → `"주간 · 주 3회"`. 횟수를 모르면 주기만 — 1 로 단정하지 않습니다. */
function frequencyLabel(frequency, count) {
  const label = FREQUENCY_LABELS[frequency]
  if (!label) return null
  const suffix = FREQUENCY_SUFFIX[frequency]
  if (!suffix.includes('{n}')) return `${label} · ${suffix}`
  if (count === null || count === undefined) return label
  return `${label} · ${suffix.replace('{n}', count)}`
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
//: 최종목표(`title`)와 칸 목록. `/api/token` 응답의 시트로 통째로 덮이고,
//: `mandarin.sheet` 로 그대로 되돌려 보냅니다 — 서버가 `title` 을 `<final_goal>` 로 씁니다.
let sheet = { title: '', domains: [] }

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
      // 횟수도 두 이름입니다 — Spring 은 `countPerPeriod`, 모델 payload 는 `count`.
      const freq = frequencyLabel(
        subject.period ?? subject.frequency,
        subject.countPerPeriod ?? subject.count,
      )
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
  // **과제는 배열입니다.** 한 턴이 같은 칸에 담을 과제를 3개까지 냅니다
  // (`GOAL_SCHEMA.generated_tasks`). `recommend` 는 지목이라 언제나 한 건입니다.
  const tasks = data.generated_tasks ?? (data.matched_task ? [data.matched_task] : [])
  const domain = data.domain ?? null

  if (domain) {
    const label = document.createElement('p')
    label.className = 'goal-label'
    label.textContent = data.domain_is_new
      ? `새 세부 목표 “${domain}” 에 담을 과제`
      : `세부 목표 “${domain}” 에 담을 과제`
    box.appendChild(label)
  }

  for (const task of tasks) {
    if (!task?.title) continue
    const freq = frequencyLabel(task.frequency, task.count)
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
      // **카드마다 자기 과제를 넘깁니다.** 예전에는 `keep(data, btn)` 이 payload 에서
      // 과제를 다시 꺼냈는데, 과제가 여러 개가 된 뒤로는 어느 카드를 눌러도 첫 과제가
      // 담깁니다 — 버튼은 비활성으로 바뀌니 사용자는 담긴 줄 압니다.
      btn.addEventListener('click', () => keep(data, task, btn))
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
async function keep(data, task, btn) {
  const title = task?.title
  const frequency = task?.frequency ?? null
  // 횟수는 서버가 이미 주기에 맞춰 놓은 값입니다(`_settle_counts`) — 여기서 다시
  // 판단하지 않고 그대로 싣습니다. 안 실으면 다음 턴 후보 줄에서 빠져 모델이
  // "주 3회" 를 담아 둔 것을 모르고 같은 과제를 또 만듭니다.
  const count = task?.count ?? null
  if (!title || !data.domain) return

  let domain = sheet.domains.find((d) => d.title === data.domain)
  if (!domain) {
    // 새 칸입니다. **자리가 남았는지 먼저 봅니다** — 서버의 `_unknown_domain` 이 같은
    // 경계(`DOMAIN_SLOTS`)를 지키지만, 그건 제안을 막는 층이고 여기는 담기를 막는
    // 층입니다. 없으면 9번째 칸이 로컬 시트에만 생겨 다음 턴에 서버가 거부합니다.
    if (sheet.domains.length >= DOMAIN_SLOTS) {
      log('시스템', `세부 목표가 ${DOMAIN_SLOTS}칸으로 꽉 차 새 칸을 만들 수 없습니다`, 'warn')
      return
    }
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
  domain.subjects.push({ id: nextLocalSubjectId(), title, frequency, count })
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
      $('mic').title = '누르면 15분간 듣습니다 (응답을 만드는 동안에는 잠시 멈춥니다)'
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
    const text = await reader.readAll()
    // 답이 도착했으니 잠금을 풀고, 생성 때문에 멈춘 창이면 **남은 시간만큼 다시 엽니다.**
    endGenerating()
    log(aiLabel, text, 'ai')
    void resumeTalking()
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
      // **그래서 여기서 창을 닫습니다.** 이 동안의 발화는 서버가 버리므로 열어 둘 이유가
      // 없고, 열어 두면 버려질 오디오를 계속 올려보낸 뒤 생성이 끝나는 순간 STT 스트림이
      // 다시 열립니다. 무음 감시로는 못 막습니다 — 답을 기다리며 계속 말하고 있으면
      // 무음이 아닙니다.
      beginGenerating()
      void stopTalking('AI 응답 중', { quiet: true, resumable: true })
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
    talking = false
    // 끊긴 방의 창을 재개하지 않습니다 — 재접속 후 답이 오면 마이크가 저절로 켜집니다.
    resumeAfterReply = false
    // 방이 끊기면 답은 오지 않습니다. 안 풀면 재접속 뒤에도 말하기가 잠겨 있습니다.
    endGenerating()
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
 * 푸시투토크 — 누르면 듣고, 다시 누르거나 15분이 지나면 멈춥니다.
 *
 * 창이 길어져서 **무음 과금을 사람이 막지 못합니다.** 그 일은 서버가 합니다 —
 * `agent/listen.py` 의 `SpeechGate` 가 말하지 않는 동안 프레임을 보내지 않고(발화가
 * 없으면 Deepgram 소켓을 아예 열지 않습니다) 무음이 길어지면 스트림을 닫습니다.
 * 이 창은 상한(잊고 켜둔 마이크)일 뿐입니다.
 *
 * 창은 **응답을 만드는 동안 잠시 멈춥니다**(`stopTalking` 의 `resumable`). 답이 도착하면
 * 남은 시간만큼 다시 열리므로 발화마다 버튼을 누를 필요가 없습니다.
 *
 * 트랙을 끊는 대신 mute 를 토글합니다 — 재협상이 없고, 에이전트 쪽 `track_muted` /
 * `track_unmuted` 가 전사 태스크를 시작·취소합니다.
 */
const TALK_WINDOW_MS = 15 * 60_000

//: 응답 뒤 자동 재개의 최소 잔여 시간. 이보다 적게 남았으면 재개하지 않습니다 — 켰다가
//: 곧바로 상한에 걸려 끄면 전사도 못 얻고 STT 연결 비용만 냅니다.
const RESUME_MIN_MS = 3_000

/** `905` → `"15:05"`. 15분 창을 초로만 보여주면 남은 시간을 못 읽습니다. */
function clock(seconds) {
  const left = Math.max(0, seconds)
  return `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`
}

//: 오조작 가드. 이 시간 안의 두 번째 누름은 무시합니다.
//:
//: 버튼을 스치듯 눌렀을 때를 걸러 **켜자마자 끄는 것을 막습니다** — 그러면 STT
//: 연결을 열자마자 닫아 전사도 못 얻고 요금만 냅니다.
const MISCLICK_GUARD_MS = 300

//: 응답 생성 잠금이 저절로 풀리는 시간. **잠금이 영구히 남지 않게 하는 보험입니다.**
//: 에이전트는 실패해도 답을 보내므로(`FAILURE_REPLY`) 정상 경로에서는 안 걸립니다 —
//: worker 가 죽은 경우입니다. `BOT_TIMEOUT_SECONDS`(20초)보다 넉넉히 큽니다.
const GENERATION_LOCK_MS = 60_000

let talkTimer = null
let countdownTimer = null
let talkStartedAt = 0
//: 마이크 창이 열려 있는가. 창을 닫는 경로가 셋이라(사람 · 응답 생성 · 15분 상한)
//: 겹칩니다 — 이 깃발이 없으면 "듣기를 멈췄습니다" 가 두 줄 남습니다.
let talking = false
//: 답이 도착하면 창을 다시 열어야 하는가. **응답 생성 때문에 멈춘 창에만 참입니다** —
//: 사람이 직접 멈춘 창을 다시 열면 끈 마이크가 저절로 켜지는 셈입니다.
let resumeAfterReply = false
//: 에이전트가 답을 만드는 중인가. **이 동안에는 마이크를 열지 않습니다.** 그 발화는
//: 서버가 버리므로(`Conversation` 의 락) 올려보낸 오디오 값만 나갑니다.
let generating = false
let generationTimer = null

/** 응답 생성 잠금을 풉니다. 답이 도착했을 때와 방이 끊겼을 때 부릅니다. */
function endGenerating() {
  generating = false
  if (generationTimer) clearTimeout(generationTimer)
  generationTimer = null
}

/** 최종 전사(또는 텍스트 전송) 시점 = 생성 시작. */
function beginGenerating() {
  generating = true
  if (generationTimer) clearTimeout(generationTimer)
  generationTimer = setTimeout(endGenerating, GENERATION_LOCK_MS)
}

function setMicLabel(text, active) {
  $('mic-label').textContent = text
  $('mic').classList.toggle('active', !!active)
}

/** 창에 걸린 타이머(상한 · 카운트다운)를 놓습니다. */
function clearTalkTimers() {
  if (talkTimer) clearTimeout(talkTimer)
  if (countdownTimer) clearInterval(countdownTimer)
  talkTimer = countdownTimer = null
}

/**
 * 마이크를 켜고 창에 타이머를 겁니다. `remaining` 은 **이 창에 남은 시간**입니다.
 *
 * 응답 뒤 자동 재개(`resumeTalking`)가 처음 누른 시점부터의 15분을 이어 쓰기 때문에
 * 인자로 받습니다 — 턴마다 15분을 새로 주면 상한이 상한이 아니게 됩니다.
 */
async function openWindow(remaining, note) {
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

  // **먼저 지웁니다.** 자동 재개와 사람의 누름이 겹칠 수 있습니다 — 답이 도착해 잠금이
  // 풀린 직후, `resumeTalking` 이 `await` 에 들어가 있는 사이의 누름은 `talking` 이 아직
  // 거짓이라 통과합니다. 그러면 타이머가 둘씩 생기고 먼저 걸린 상한이 창을 일찍 닫습니다.
  clearTalkTimers()
  talking = true
  setMicLabel(`듣는 중 ${clock(Math.ceil(remaining / 1000))}`, true)
  if (note) log('시스템', note, 'sys')

  // 기준이 처음 누른 시각이라 재개해도 남은 시간이 이어집니다.
  countdownTimer = setInterval(() => {
    const left = Math.ceil((TALK_WINDOW_MS - (Date.now() - talkStartedAt)) / 1000)
    if (left > 0) setMicLabel(`듣는 중 ${clock(left)}`, true)
  }, 1000)

  talkTimer = setTimeout(() => void stopTalking('시간 종료'), remaining)
}

async function startTalking() {
  talkStartedAt = Date.now()
  // 여기서 "말하세요" 라고 해도 거짓이 아닙니다 — Deepgram 연결이 열리기 전에 말해도
  // 프레임은 무제한 채널에 쌓여 있다가 전송됩니다. 전사가 0.7초쯤 늦게 올 뿐입니다.
  await openWindow(TALK_WINDOW_MS, '말하세요 (응답을 만드는 동안에는 잠시 멈춥니다 · 최대 15분)')
}

/**
 * 답이 도착해서 다시 듣습니다. **처음 누른 창을 이어 씁니다.**
 *
 * 조용히 합니다 — 버튼 글자가 `듣는 중 M:SS` 로 돌아오고 에이전트도 `listening` 을 보내
 * 상태줄이 바뀝니다. 턴마다 한 줄씩 남길 일이 아닙니다.
 */
async function resumeTalking() {
  if (!resumeAfterReply) return
  resumeAfterReply = false
  // 이미 열려 있거나(사람이 먼저 눌렀습니다) 방을 놓았으면 할 일이 없습니다.
  if (talking || !room || !voiceAvailable) return
  const left = TALK_WINDOW_MS - (Date.now() - talkStartedAt)
  if (left < RESUME_MIN_MS) {
    log('시스템', '듣기 창이 끝났습니다 (15분) — 더 말하려면 다시 눌러 주세요', 'sys')
    return
  }
  await openWindow(left, null)
}

/**
 * 마이크 창을 닫습니다.
 *
 * `quiet` 는 대화에 한 줄 남기지 않습니다 — 응답 생성 때문에 멈추는 것은 턴마다 한 번씩
 * 일어나므로, 그때마다 남기면 로그가 그것만 남습니다.
 *
 * `resumable` 은 **답이 도착하면 이 창을 다시 열어도 되는가**입니다.
 */
async function stopTalking(reason, { quiet = false, resumable = false } = {}) {
  // 닫는 경로가 겹칩니다(`talking` 주석). 이미 닫혔으면 조용히 돌아갑니다.
  if (!talking) return
  talking = false
  resumeAfterReply = resumable
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
  if (!quiet) log('시스템', `듣기를 멈췄습니다 (${reason})`, 'sys')
}

async function toggleTalk() {
  if (!room || !voiceAvailable) return
  if (!room.localParticipant.isMicrophoneEnabled) {
    // **응답 생성 중에는 열지 않습니다.** 열어도 그 발화는 서버가 버리므로
    // (`Conversation` 의 락) "말했는데 아무 일도 안 일어난다" 만 남습니다.
    //
    // 대신 이 누름을 **자동 재개 취소**로 받습니다 — 안 그러면 응답 중에 그만하려고
    // 눌러도 답이 오는 순간 마이크가 저절로 켜집니다.
    if (generating) {
      if (resumeAfterReply) {
        resumeAfterReply = false
        log('시스템', '듣기를 멈췄습니다 (직접 멈춤) — 답이 와도 다시 듣지 않습니다', 'sys')
      } else {
        log('시스템', 'AI가 답하는 중입니다 — 끝나면 말해 주세요', 'sys')
      }
      return
    }
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
  // 텍스트로 물어도 생성은 생성입니다 — 음성 경로와 같은 구간을 잠그고, 듣고 있었다면
  // 창도 멈춥니다(그 발화는 어차피 버려집니다). 답이 오면 남은 창이 다시 열립니다.
  beginGenerating()
  void stopTalking('AI 응답 중', { quiet: true, resumable: true })
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
