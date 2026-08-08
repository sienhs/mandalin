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
 * **저쪽이 화면을 바꾸면 여기는 따라가지 않습니다.** 색만 어긋나는 것이 아니라 구성이
 * 갈립니다 — 실제로 프론트가 캐릭터 그림과 빠른 문장 칩을 지우고 오른쪽 패널을 "담은 과제
 * → 만다라트 초안" 으로 바꾼 뒤에도, 이 파일은 한동안 없어진 자리를 가리키는 주석을 달고
 * 있었습니다. 토픽 문자열과 달리 **테스트로 묶여 있지 않으므로**(어긋나도 기능은 멀쩡합니다)
 * 저쪽을 손대면 이 세 파일도 같이 열어 보세요.
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
//: `frontend/src/components/common/Icons.tsx` 의 `IconCoach` · `IconCheck` ·
//: `IconChevronDown` 이고, path 까지 같은 값입니다.
const ICON_COACH =
  '<svg viewBox="0 0 24 24" class="i17"><rect x="4" y="8" width="16" height="12" rx="4" />' +
  '<path d="M12 8V4.5" /><circle cx="12" cy="3.4" r="1.3" />' +
  '<path d="M9.3 13.2v1.6M14.7 13.2v1.6" /></svg>'
const ICON_CHECK = '<svg viewBox="0 0 24 24" class="i16"><path d="m4.5 12.5 5 5L20 7" /></svg>'
const ICON_CHEVRON =
  '<svg viewBox="0 0 24 24" class="dom-chev"><path d="m5.5 9 6.5 6.5L18.5 9" /></svg>'

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

//: 방금 담은 과제. 그 줄만 한 번 튀어 오르게 하고(`.fresh`) 비웁니다.
//:
//: 형식은 `칸 제목 + NUL + 과제 제목` 입니다. **구분자가 NUL 인 이유**는 제목에 들어갈 수
//: 없는 유일한 문자라서입니다 — 공백으로 이으면 `"A B" + "C"` 와 `"A" + "B C"` 가 같은 키가
//: 됩니다. **만드는 쪽과 비교하는 쪽이 같은 구분자를 써야 합니다**(`keep()` ·
//: `renderSheet()`). 한동안 한쪽은 NUL, 한쪽은 공백이어서 이 애니메이션이 죽어 있었습니다.
//:
//: 소스에는 **이스케이프로 적습니다.** 진짜 NUL 바이트를 박아 두면 git 이 이 파일을
//: binary(`-text`)로 분류해서 diff 가 통째로 바뀐 것처럼 나오고 ripgrep 도 건너뜁니다.
let freshKey = ''

// ── 렌더링 ────────────────────────────────────────────────────────────
/**
 * 연결 상태 배지. 페이지 머리의 배지는 프론트에 없는 자리입니다(저쪽은 앱 셸이 열리면 바로
 * 방에 붙습니다). 다만 **대화 카드의 상태 문구는 저쪽에도 있고**, 아직 준비되지 않았을 때
 * 거기에 뜨는 것이 바로 이 연결 상태입니다(`thinking ? … : ready ? … : status`).
 * 그래서 마지막 문구를 들고 있다가 `paintAgentState()` 에 넘깁니다.
 */
let statusText = '연결 전'

function setStatus(text, kind) {
  statusText = text
  badge.textContent = text
  badge.className = `badge ${kind}`
  paintAgentState()
}

/*
 * 대화 카드의 상태는 **두 깃발로만 갈립니다** — 프론트의 `thinking` · `ready` 와 같습니다.
 *
 * 예전에는 `idle · thinking · answering` 세 상태에 캐릭터 그림을 물려 두었는데, 그림이
 * 없어진 뒤로 `idle` 과 `answering` 은 화면에서 완전히 같은 모양입니다 — 구분을 남겨 두면
 * 없는 차이를 있는 것처럼 읽게 됩니다.
 *
 *   thinking  내 말을 보냈고 답을 기다리는 중   (브랜드색 점 + 숨쉬는 머리 + 점 세 개)
 *   ready     에이전트가 방에 있고 대화 가능    (에메랄드 점)
 *   그 밖      아직/이미 못 붙은 상태            (회색 점 + 연결 상태 문구)
 */
let ready = false
let thinking = false

//: 연결이 없고 **사람이 다시 시도해야 하는** 상태인가. 끊긴 경우와 붙는 데 실패한 경우
//: (토큰 발급 실패 · 방 접속 실패) 둘 다입니다.
//:
//: 참이면 카드 안 배지 자리에 "다시 연결" 이 섭니다. 아직 한 번도 시도하지 않았을 때는
//: 거짓이라 배지가 그대로 있습니다 — 그때는 머리의 연결하기 버튼이 할 일이고, 버튼이 둘
//: 다 서 있으면 어느 것을 눌러야 하는지가 흐려집니다(프론트에는 머리 버튼이 없어서 이
//: 자리가 유일한 길입니다).
let connectionLost = false

//: 배지에 쓸 에이전트 이름. `mandarin.hello` 가 실제 이름을 알려주면 덮입니다.
let agentName = 'AI 코치'

function setReady(on) {
  ready = on
  paintAgentState()
}

function setThinking(on) {
  thinking = on
  paintAgentState()
}

function paintAgentState() {
  $('state-dot').className = `dot ${thinking ? 'busy' : ready ? 'ready' : ''}`
  $('state-text').textContent = thinking ? '생각하는 중' : ready ? '준비됨' : statusText
  // 점 하나만 깜빡이면 카드 위쪽에서는 눈에 안 들어옵니다 — 머리의 표시도 같이 숨을 쉽니다.
  $('coach-mark').classList.toggle('busy', thinking)
  paintThinkingDots(thinking)

  // 배지와 "다시 연결" 은 같은 자리를 번갈아 씁니다(프론트의 `connection === 'off'` 분기).
  const chip = $('mode-badge')
  chip.textContent = ready ? agentName : room ? '연결 중' : '연결 전'
  chip.className = `badge ${ready ? 'busy' : 'off'}`
  chip.hidden = connectionLost
  $('rejoin').hidden = !connectionLost
}

/** 응답 대기 표시(점 세 개). 답(또는 실패)이 오면 지웁니다. */
function paintThinkingDots(on) {
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
  // 늘 맨 아래입니다 — `place()` 가 이 노드를 기준으로 다른 줄을 그 앞에 넣습니다.
  $('log').appendChild(dots)
  scrollLog()
}

/*
 * 새 줄이 왔을 때 따라 내려갈지. **바닥을 벗어나 읽고 있으면 끌어내리지 않습니다** —
 * 대신 "새 메시지" 버튼을 띄워 사용자가 정하게 합니다(프론트와 같은 장치). 예전에는
 * 무조건 내려서, 위쪽 payload 를 펼쳐 읽는 중에 답이 오면 자리를 잃었습니다.
 */
let atBottom = true

/** 80px 여유. 0 으로 보면 반올림·애니메이션 도중에 "바닥 아님" 으로 튑니다. */
function nearBottom(el) {
  return el.scrollHeight - el.scrollTop - el.clientHeight < 80
}

function scrollLog() {
  if (!atBottom) {
    $('jump').hidden = false
    return
  }
  // 내려가면 알림은 필요 없습니다. scroll 이벤트가 어차피 끄지만 여기서 먼저 끕니다 —
  // 이벤트는 다음 프레임에 오므로 그 사이 한 프레임 동안 버튼이 남습니다.
  $('jump').hidden = true
  const el = $('log')
  el.scrollTop = el.scrollHeight
}

$('log').addEventListener('scroll', () => {
  atBottom = nearBottom($('log'))
  if (atBottom) $('jump').hidden = true
})

$('jump').addEventListener('click', () => {
  const el = $('log')
  el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  atBottom = true
  $('jump').hidden = true
})

//: 펼쳐 둔 세부 목표의 제목. **한 번에 하나만 폅니다** — 8칸 x 8개면 72줄이라 다 펴 두면
//: 스크롤밖에 남지 않습니다(프론트의 `openDomain` 과 같은 규칙). `null` 이면 전부 접힘.
let openDomain = null

function renderSheet() {
  const host = $('sheet')
  // **읽던 자리를 지킵니다.** 이 함수는 목록을 통째로 다시 만들기 때문에(펼치기 한 번,
  // 담기 한 번마다) 그대로 두면 스크롤이 맨 위로 튑니다 — 아래쪽 칸을 펼치려고 누른 순간
  // 그 칸이 화면 밖으로 사라집니다. 프론트는 React 가 노드를 유지해서 겪지 않는 문제입니다.
  // 펼친 만큼 내용이 길어지므로 값이 정확히 같은 자리는 아니지만, 0 으로 돌아가는 것보다
  // 훨씬 낫습니다.
  const keptScroll = host.scrollTop
  host.innerHTML = ''

  const domains = sheet.domains ?? []
  const total = domains.reduce((sum, d) => sum + (d.subjects?.length ?? d.subjectCount ?? 0), 0)
  $('task-count').textContent = `과제 ${total}/${DOMAIN_SLOTS * DOMAIN_CAPACITY}`
  $('task-count').className = total > 0 ? 'badge busy' : 'badge'
  $('domain-count').textContent = `세부 목표 ${domains.length}/${DOMAIN_SLOTS}`
  $('progress-fill').style.width = `${Math.min(100, (domains.length / DOMAIN_SLOTS) * 100)}%`

  // 핵심 목표. 서버가 이 값을 `<final_goal>` 로 씁니다 — 비어 있으면 그렇다고 적습니다.
  // 조용히 빈칸으로 두면 "아직 안 받았다" 와 "받았는데 빈 값" 이 구별되지 않습니다.
  const goal = (sheet.title ?? '').trim()
  $('goal-title').textContent = goal || '(시트에 title 이 없습니다)'
  $('goal-title').title = goal

  if (!domains.length) {
    host.innerHTML =
      '<div class="empty"><span class="mark" aria-hidden="true">' +
      '<svg viewBox="0 0 24 24" class="i24"><rect x="4" y="8" width="16" height="12" rx="4" />' +
      '<path d="M12 8V4.5" /><circle cx="12" cy="3.4" r="1.3" />' +
      '<path d="M9.3 13.2v1.6M14.7 13.2v1.6" /></svg></span>' +
      '<strong>아직 담은 과제가 없어요</strong>' +
      '<p>왼쪽에서 코치에게 목표를 말하고, 마음에 드는 과제를 <b>담기</b>로 모아 보세요.</p></div>'
    return
  }

  domains.forEach((domain, index) => {
    const color = domainColor(index)
    const subjects = domain.subjects ?? []
    const used = subjects.length || domain.subjectCount || 0
    const open = openDomain === domain.title

    const box = document.createElement('div')
    // 줄 전체가 펼치기 버튼입니다. 꺾쇠만 누르게 두면 과녁이 14px 이라 계속 헛누릅니다.
    box.innerHTML =
      `<button class="dom-head" type="button" aria-expanded="${open}">` +
      ICON_CHEVRON +
      `<strong>${escapeHtml(domain.title)}</strong>` +
      `<span class="muted nums">${used}/${DOMAIN_CAPACITY}</span></button>` +
      // 접혀도 눈금과 개수는 남습니다 — 펴 보지 않고도 어느 칸이 비었는지 보입니다.
      `<div class="ticks" aria-hidden="true" title="${used}/${DOMAIN_CAPACITY} 칸">` +
      Array.from({ length: DOMAIN_CAPACITY }, (_, slot) =>
        `<span${slot < used ? ` style="background:${color}"` : ''}></span>`
      ).join('') +
      '</div>'

    box.querySelector('.dom-head').addEventListener('click', () => {
      openDomain = open ? null : domain.title
      renderSheet()
    })

    const list = document.createElement('ul')
    list.className = 'items'
    list.hidden = !open
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
      if (freshKey === `${domain.title}\u0000${subject.title}`) li.classList.add('fresh')
      list.appendChild(li)
    }
    box.appendChild(list)
    host.appendChild(box)
  })

  host.scrollTop = keptScroll

  // 한 번만 띄웁니다. 안 비우면 시트를 다시 그릴 때마다 같은 줄이 계속 튑니다.
  freshKey = ''
}

/**
 * 대화 한 줄. `kind` 로 모양이 갈립니다 —
 *
 *   me    오른쪽 브랜드색 말풍선
 *   ai    왼쪽 가라앉은 말풍선 + 코치 아이콘
 *   sys   배선 상태. **말풍선을 주지 않습니다** — 대화가 아니라 진단 정보입니다
 *   warn  같은 자리, 빨간 글자로
 *
 * **말한 사람을 앞에 적지 않습니다.** 예전에는 `<b>시스템</b>` · `<b>경고</b>` 를 붙였는데,
 * 프론트는 그 자리를 가운데 정렬 + 색으로만 구분합니다 — 이름을 붙이면 sys 줄도 누군가
 * 한 말처럼 읽히고, 실제로 서버 사정("입장 토큰을 받지 못했습니다")을 코치의 대답으로
 * 받아들인 적이 있습니다. `ai` · `me` 는 원래도 이름을 그리지 않았습니다.
 */
function log(kind, text) {
  const line = document.createElement('div')
  if (kind === 'me') {
    line.className = 'turn-me'
    line.innerHTML = `<p>${escapeHtml(text)}</p>`
    // **내 말은 늘 따라 내려갑니다.** 위를 읽던 중이어도 방금 내가 보낸 것은 보여야 합니다 —
    // 안 그러면 보낸 뒤 "새 메시지" 버튼만 뜨고 내 말은 화면 밖에 남습니다(프론트도 보낸
    // 직후에는 `scrollToBottom()` 을 부릅니다). 텍스트 전송과 최종 전사 둘 다 이 길입니다.
    atBottom = true
  } else if (kind === 'ai') {
    line.className = 'turn-ai'
    line.innerHTML =
      `<span class="coach-mini" aria-hidden="true">${ICON_COACH}</span><p>${escapeHtml(text)}</p>`
  } else {
    line.className = `turn-sys ${kind}`
    line.textContent = text
  }
  place(line)
  return line
}

/**
 * 대화 칸에 붙입니다. **전사 캡션과 생각 중 표시는 늘 맨 아래에 둡니다** — 둘은 "지금 벌어지는
 * 일" 이라 그 뒤로 다른 줄이 들어오면 지나간 것처럼 보입니다.
 */
function place(node) {
  const host = $('log')
  const tail = $('caption') ?? $('thinking')
  host.insertBefore(node, tail ?? null)
  scrollLog()
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

  // 카드는 목록입니다 — 화면이 넓으면 두 장씩 나란히 섭니다(`.sugs` 의 grid).
  const cards = document.createElement('ul')
  cards.className = 'sugs'

  for (const task of tasks) {
    if (!task?.title) continue
    const freq = frequencyLabel(task.frequency, task.count)
    const card = document.createElement('li')
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
    cards.appendChild(card)
  }
  box.appendChild(cards)

  // 원본도 접어서 보여줍니다. 배선을 확인하는 화면이라 payload 를 볼 수 있어야 합니다.
  const raw = document.createElement('details')
  raw.innerHTML =
    `<summary>payload · action=${escapeHtml(action)}</summary>` +
    `<pre>${escapeHtml(JSON.stringify(data, null, 2))}</pre>`
  box.appendChild(raw)

  place(box)

  if ('reasoning' in data) {
    // 여기 오면 서버가 `public_data()` 를 건너뛴 것입니다.
    log('warn', 'payload 에 reasoning 이 들어 있습니다 — 서버에서 제거되어야 합니다')
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
      log('warn', `세부 목표가 ${DOMAIN_SLOTS}칸으로 꽉 차 새 칸을 만들 수 없습니다`)
      return
    }
    domain = { id: null, title: data.domain, subjectCount: 0, subjects: [] }
    sheet.domains.push(domain)
  }
  if ((domain?.subjects?.length ?? 0) >= DOMAIN_CAPACITY) {
    log('warn', `${domain.title} 칸이 ${DOMAIN_CAPACITY}개로 꽉 찼습니다`)
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
  //
  // **담은 칸을 폅니다.** 접힌 채로 담기면 위 눈금이 한 칸 차는 것 말고는 아무 일도 일어나지
  // 않아 보이고, 띄우려는 줄도 `hidden` 안에서 튑니다(프론트도 담은 칸을 같이 폅니다).
  openDomain = domain.title
  freshKey = `${domain.title}\u0000${title}`
  renderSheet()
  log('sys', `"${title}" 을 ${domain.title} 칸에 담았습니다`)

  // **전체 목록을 보냅니다.** 증분은 하나 유실되면 서버와 조용히 갈라집니다.
  await room.localParticipant.sendText(JSON.stringify(sheet), { topic: SHEET_TOPIC })
}

// ── 연결 ──────────────────────────────────────────────────────────────
async function connect() {
  // 다시 붙는 중에는 "다시 연결" 을 치웁니다 — 두 번 누르면 방이 둘 생깁니다.
  connectionLost = false
  $('connect').disabled = true
  setStatus('연결 중…', 'busy')

  let info
  try {
    const res = await fetch('/api/token?room=dev-room')
    if (!res.ok) throw new Error(`토큰 발급 실패 (${res.status})`)
    info = await res.json()
  } catch (err) {
    connectionLost = true
    setStatus('토큰 실패', 'off')
    log('warn', `${err.message} — dev_server.py 가 떠 있나요?`)
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
    // **배지에는 이름을 씁니다.** 예전에는 여기에 `hello.mode`(`goal`)를 넣었는데, 그건
    // 서버 설정값이라 프론트에 없는 자리였고 사용자에게도 뜻이 없습니다. 저쪽처럼
    // "누가 붙어 있는가" 를 말하고, 모드는 `aiLabel` 로 sys 줄에 남습니다.
    agentName = hello.name || 'AI 코치'
    paintAgentState()

    // LLM 이 못 쓰는 상태면 **먼저** 알립니다. 발화를 던지고 실패를 기다리게 두면
    // 사용자는 자기 말이 문제인 줄 압니다. 음성과 달리 LLM 은 선택 기능이 아닙니다.
    if (hello.llmMessage) {
      log('warn', hello.llmMessage)
      // **아는 데모 하나만 데모로 부르고 나머지는 사용 불가로 둡니다.** `missing_key` 만
      // 특별 취급하면 서버가 상태를 하나 더 늘린 날(`unknown_provider`) 쓸 수 없는 상태가
      // "데모 백엔드" 로 표시됩니다 — 관리자에게 알려야 할 일이 정상처럼 읽힙니다.
      setStatus(hello.llm === 'echo' ? '데모 백엔드' : 'AI 사용 불가', 'off')
    }
    if (voiceAvailable) {
      $('mic').title = '누르면 15분간 듣습니다 (응답을 만드는 동안에는 잠시 멈춥니다)'
      log('sys', `${aiLabel} 준비됨 — 말하기 버튼을 쓸 수 있습니다`)
    } else {
      // 이유를 화면에 남깁니다. 서버 로그에만 있으면 사용자는 버튼이 왜 안 되는지
      // 알 수 없습니다.
      $('mic').title = '서버에 음성이 꺼져 있습니다 (DEEPGRAM_API_KEY 없음)'
      setMicLabel('음성 꺼짐', false)
      log('sys', `${aiLabel} 준비됨 — 음성이 꺼져 있어 텍스트로만 대화합니다`)
    }
  })

  room.registerTextStreamHandler(CHAT_TOPIC, async (reader) => {
    const text = await reader.readAll()
    // 답이 도착했으니 잠금을 풀고, 생성 때문에 멈춘 창이면 **남은 시간만큼 다시 엽니다.**
    endGenerating()
    log('ai', text)
    void resumeTalking()
    // 답이 도착한 시점입니다 — 스트림을 다 읽고 나서 바꿉니다. 열리자마자 바꾸면
    // 아직 아무 글자도 안 뜬 화면에서 캐릭터만 먼저 답한 얼굴이 됩니다.
    setThinking(false)
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
      log('me', payload.text)
      // 최종 전사가 곧 발화의 끝입니다 — 여기서부터 에이전트가 답을 만듭니다.
      setThinking(true)
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
      setThinking(false)
    } catch (err) {
      log('warn', `goal payload 파싱 실패: ${err.message}`)
    }
  })

  // **원격 참가자는 에이전트뿐이라고 봅니다.** 방은 사용자 1명 + 에이전트 1개이고
  // (백엔드가 방을 사용자마다 나눕니다 — `agent/entrypoint.py` 모듈 주석) 서버가 이
  // 방에 넣는 다른 참가자는 없습니다. `p.kind` 를 보지 않으므로, 사람이 둘일 수 있는
  // 설계로 바뀌면 여기와 아래 `remoteParticipants.size` 판정을 같이 고쳐야 합니다.
  room.on(RoomEvent.ParticipantConnected, (p) => {
    log('sys', `참가자 입장: ${p.identity}`)
    setStatus('에이전트 연결됨', 'on')
    // 여기서부터 대화가 됩니다 — 상태 점이 초록으로, 배지가 에이전트 이름으로 바뀝니다.
    setReady(true)
  })
  room.on(RoomEvent.Disconnected, () => {
    // 카드 안에 "다시 연결" 을 세웁니다. **`setStatus` 보다 먼저 둡니다** — 저쪽이
    // `paintAgentState()` 를 부르므로, 뒤에 두면 배지가 한 번 잘못 그려집니다.
    connectionLost = true
    setReady(false)
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
    setThinking(false)
    // 재접속하면 hello 를 다시 받습니다. 그때까지 음성은 없는 것으로 둡니다.
    voiceAvailable = false
  })

  try {
    await room.connect(info.url, info.token)
  } catch (err) {
    connectionLost = true
    setStatus('접속 실패', 'off')
    log('warn', `${err.message} — LiveKit 서버가 떠 있나요? (${info.url})`)
    $('connect').disabled = false
    return
  }

  setStatus('방 접속됨 · 에이전트 대기', 'busy')
  log('sys', `방 "${info.room}" 에 ${info.identity} 로 접속했습니다`)
  setThinking(false)

  // 에이전트가 이미 들어와 있을 수도 있습니다(재접속 등). 그때는
  // `ParticipantConnected` 가 오지 않으므로 여기서 같이 열어 줍니다.
  if (room.remoteParticipants.size > 0) {
    setStatus('에이전트 연결됨', 'on')
    setReady(true)
  }

  // 마이크는 `mandarin.hello` 가 음성 가능이라고 알려줄 때까지 잠겨 있습니다.
  setComposerEnabled(true)
  $('input').focus()
}

/** 입력과 보내기를 한꺼번에 잠그고 엽니다. */
function setComposerEnabled(on) {
  $('input').disabled = $('send').disabled = !on
  // 잠긴 동안에는 왜 못 쓰는지를 placeholder 가 말합니다 — 프론트도 `ready` 가 아니면
  // 자리글에 연결 상태를 넣습니다(`${status}…`).
  $('input').placeholder = on ? '이루고 싶은 것을 적어보세요' : `${statusText}…`
}

/**
 * 진행 중인 전사문. 빈 문자열이면 지웁니다.
 *
 * **대화 목록 안에, 맨 아래에 둡니다.** 예전에는 대화 칸과 입력줄 사이의 별도 띠였는데,
 * 그러면 "지금 말하는 내용" 이 대화 흐름 밖에 앉아 다음 줄로 이어지는 것처럼 안 보입니다.
 * 프론트처럼 내 말과 같은 자리·같은 모양(오른쪽 정렬)이되 **채우지 않고 점선**만 둡니다 —
 * 최종 전사가 오면 이 노드는 사라지고 같은 자리에 채운 말풍선이 남습니다.
 */
function showCaption(text) {
  const existing = $('caption')
  if (!text) {
    existing?.remove()
    return
  }
  const node = existing ?? document.createElement('div')
  if (!existing) {
    node.id = 'caption'
    node.className = 'turn-caption'
    node.innerHTML = '<p></p>'
    // 생각 중 표시보다는 위입니다(`place()` 와 같은 순서).
    $('log').insertBefore(node, $('thinking') ?? null)
  }
  node.firstChild.textContent = text
  scrollLog()
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
    log('warn', `마이크를 켤 수 없습니다: ${err.message}`)
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
  if (note) log('sys', note)

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
    log('sys', '듣기 창이 끝났습니다 (15분) — 더 말하려면 다시 눌러 주세요')
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
    log('warn', `마이크를 끄지 못했습니다: ${err.message}`)
  }
  $('mic').disabled = false
  setMicLabel('말하기', false)
  showCaption('')
  if (!quiet) log('sys', `듣기를 멈췄습니다 (${reason})`)
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
        log('sys', '듣기를 멈췄습니다 (직접 멈춤) — 답이 와도 다시 듣지 않습니다')
      } else {
        log('sys', 'AI가 답하는 중입니다 — 끝나면 말해 주세요')
      }
      return
    }
    await startTalking()
    return
  }
  const held = Date.now() - talkStartedAt
  if (held < MISCLICK_GUARD_MS) {
    // 켜자마자 끄면 전사도 못 얻고 STT 연결 비용만 냅니다.
    log('sys', '너무 빨리 눌렀습니다 — 계속 듣고 있어요')
    return
  }
  await stopTalking('직접 멈춤')
}

/** 텍스트 한 줄을 보냅니다. */
async function send(text) {
  const value = text.trim()
  if (!value || !room) return
  log('me', value)
  setThinking(true)
  // 텍스트로 물어도 생성은 생성입니다 — 음성 경로와 같은 구간을 잠그고, 듣고 있었다면
  // 창도 멈춥니다(그 발화는 어차피 버려집니다). 답이 오면 남은 창이 다시 열립니다.
  beginGenerating()
  void stopTalking('AI 응답 중', { quiet: true, resumable: true })
  await room.localParticipant.sendText(value, { topic: CHAT_TOPIC })
}

$('connect').addEventListener('click', () => void connect())
// 카드 안의 "다시 연결". 머리의 연결하기와 같은 일을 합니다 — 끊긴 상태에서 이 카드만 보고
// 있으면 머리 버튼이 시야 밖일 수 있어서 프론트가 여기에도 둡니다.
$('rejoin').addEventListener('click', () => void connect())
$('mic').addEventListener('click', () => void toggleTalk())

$('composer').addEventListener('submit', (event) => {
  event.preventDefault()
  const text = $('input').value
  $('input').value = ''
  void send(text)
})

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
paintAgentState()

// 첫 화면의 대화 칸을 비워 두지 않습니다. 다만 **말풍선을 주지 않습니다** — 코치가 한 말이
// 아닌데 말풍선 모양이면 인사한 것처럼 읽히고, 접속 전에도 늘 떠 있어서 화면이 살아 있는
// 듯한 착각을 줍니다. 프론트가 고정 인사말을 지운 이유이기도 합니다(실제로 목업으로
// 오해된 적이 있습니다 — `AiCoachPage.tsx` 의 `messages` 자리 주석).
log('sys', '연결하기를 누르면 방에 들어갑니다. 그다음 이루고 싶은 것을 적어 보세요.')
