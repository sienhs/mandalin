/**
 * 조립 지점 — 연결 -> 미디어 캡처 -> 시그널링 -> PeerConnection -> UI.
 *
 * 세 모듈을 이어 붙이고 애플리케이션 상태를 들고 있습니다. 각 모듈은 서로를
 * 모르고 여기서만 만납니다.
 *
 *   signaling.js  서버와의 메시지 송수신
 *   rtc.js        PeerConnection 과 DataChannel
 *   ui.js         DOM 그리기
 *
 * **1인 전용 AI 음성봇 모드.** 방 이름·표시 이름 입력을 없애고 고정값으로
 * 접속합니다. 서버의 `MAX_PARTICIPANTS_PER_ROOM` 을 2(본인 + AI 봇)로 두면
 * 다른 사람이 같은 방에 들어올 수 없습니다. 카메라도 쓰지 않습니다 — 오디오만
 * 캡처해서 보내고, 화면에는 AI 아바타만 표시합니다.
 *
 * **다운스트림 구독은 하지 않습니다.** 방에 있는 다른 참가자는 AI 봇 하나이고
 * 봇은 미디어를 보내지 않으므로, 받을 트랙이 없습니다. 서버의 팬아웃 경로는
 * 그대로 있으니 다자간 화면이 필요해지면 브라우저 쪽만 되살리면 됩니다.
 *
 * **연결 순서가 중요합니다.**
 *   1) getUserMedia 로 마이크 확보
 *   2) WebSocket 연결
 *   3) join 전송
 *   4) welcome 수신 → 이때 받은 iceServers 로 publish 시작
 *
 * publish 를 welcome 이후로 미루는 이유는 TURN 자격증명이 welcome 에 실려
 * 오기 때문입니다. 먼저 시작하면 ICE 설정이 빈 채로 협상이 돌아갑니다.
 */
import { Signaling } from './signaling.js';
import { SfuClient } from './rtc.js';
import { UI } from './ui.js';
import { TaskBoard } from './board.js';

const ui = new UI();
const signaling = new Signaling();
const sfu = new SfuClient(signaling);
// 담긴·지워진 사실은 채팅 로그에 남깁니다. 왼쪽 패널만 조용히 바뀌면 방금 무슨
// 일이 일어났는지 시선이 따라가지 못합니다.
const board = new TaskBoard(ui.els, (text) => ui.appendSystem(text));

// 인증이 꺼져 있을 때(로컬 개발) 쓰는 기본값입니다. 인증이 켜지면 **방과 이름은
// 서버가 티켓에서 정하고**, 실제 방은 welcome.room 으로 돌아옵니다.
const FALLBACK_ROOM_ID = 'solo';
const DISPLAY_NAME = '사용자';

/**
 * Spring 이 발급한 입장 티켓을 찾습니다.
 *
 * "과제 AI 생성" 버튼이 이 페이지를 열 때 함께 넘겨줍니다. 세 곳을 순서대로
 * 보는 이유는 배포 형태가 아직 안 정해졌기 때문입니다.
 *
 *   1. sessionStorage  — 같은 오리진에서 SPA 가 심어둔 경우 (가장 깨끗)
 *   2. ?ticket=        — 오리진이 갈릴 때. 수명이 2분이라 감당 가능하지만
 *                        프록시 액세스 로그에는 남습니다
 *   3. location.hash   — 해시는 서버로 전송되지 않아 로그에 안 남습니다
 *
 * 찾은 뒤 URL 에서 지웁니다. 주소창에 남으면 사용자가 그대로 복사해 공유합니다.
 */
function takeTicket() {
  const url = new URL(location.href);
  const fromQuery = url.searchParams.get('ticket');
  const fromHash = new URLSearchParams(url.hash.slice(1)).get('ticket');

  if (fromQuery || fromHash) {
    url.searchParams.delete('ticket');
    url.hash = '';
    history.replaceState(null, '', url);
  }

  try {
    const stored = sessionStorage.getItem('mandarin.ticket');
    if (stored) sessionStorage.removeItem('mandarin.ticket');
    return stored || fromQuery || fromHash || null;
  } catch {
    return fromQuery || fromHash || null;
  }
}

// 페이지가 열린 시점에 한 번만 꺼냅니다. 티켓은 일회용이고 수명이 짧습니다.
const TICKET = takeTicket();

const state = {
  selfId: null,
  roomId: null, // welcome 으로 확정됩니다 (인증이 켜지면 서버가 정합니다)
  displayName: DISPLAY_NAME,
  localStream: null,
  publisherReady: false,
  mic: true,
  aiPresent: false, // 방에 AI 봇이 들어와 있는지 (BOT_ENABLED=false 면 계속 false)
};

// ── 서버 -> 클라이언트 메시지 처리 ───────────────────────────────────
signaling.on('welcome', ({ selfId, room, iceServers, peers }) => {
  state.selfId = selfId;
  // 인증이 켜져 있으면 서버가 티켓을 보고 방을 정합니다. 우리가 보낸 방 이름과
  // 다를 수 있고, 서버 값이 정답입니다.
  state.roomId = room;
  sfu.iceServers = iceServers;
  ui.setConnectionState('연결됨', true);
  ui.appendSystem('서버에 연결되었습니다');

  // 이 방에는 본인과 AI 봇만 들어올 수 있으므로, peers 에 누가 있다면 그건 AI 입니다.
  // 봇은 미디어를 보내지 않아 구독할 것이 없습니다.
  state.aiPresent = peers.length > 0;
  if (state.aiPresent) ui.appendSystem('AI와 연결 중입니다');

  startPublishing();
});

// 봇은 WebSocket 없이 방에 들어오므로 사람처럼 peer-joined 로 알려집니다.
signaling.on('peer-joined', ({ peer }) => {
  state.aiPresent = true;
  ui.appendSystem(`${peer.displayName} 님이 입장했습니다`);
});

signaling.on('peer-left', () => {
  state.aiPresent = false;
  ui.appendSystem('AI와의 연결이 끊어졌습니다');
});

// WebSocket 폴백으로 온 채팅, 또는 내가 보낸 메시지의 서버 에코.
// DataChannel 경로는 아래 sfu 이벤트에서 따로 받습니다. 두 경로가 같은 봉투를
// 쓰므로 처리도 하나로 둡니다.
signaling.on('chat', (message) => handleChat(message));

// 인증 실패는 서버가 곧바로 소켓을 닫습니다. 코드만 띄우면 사용자는 무엇을
// 해야 할지 모르므로, 다시 들어오는 방법을 알려줍니다.
const AUTH_HELP = {
  AUTH_REQUIRED: '로그인이 필요합니다. 만다린에서 다시 들어와 주세요.',
  AUTH_EXPIRED: '입장 시간이 만료되었습니다. 만다린에서 다시 들어와 주세요.',
  AUTH_INVALID: '입장 정보가 올바르지 않습니다. 만다린에서 다시 들어와 주세요.',
  AUTH_MISCONFIGURED: '서버 설정 문제로 입장할 수 없습니다. 잠시 후 다시 시도해 주세요.',
};

signaling.on('error', ({ code, message }) => {
  const help = AUTH_HELP[code];
  if (help) {
    ui.setConnectionState('입장 실패', false);
    ui.appendSystem(help);
    ui.els.btnConnect.disabled = false;
    return;
  }
  ui.appendSystem(`오류 · ${code}: ${message}`);
});

signaling.on('close', () => ui.setConnectionState('연결 끊김', false));

// ── PeerConnection 이벤트 ────────────────────────────────────────────
// DataChannel 로 온 채팅 (기본 경로) — AI 의 응답이 여기로도 들어옵니다.
sfu.addEventListener('chat', ({ detail: message }) => handleChat(message));

let aiReadyAnnounced = false;

sfu.addEventListener('publisher-state', ({ detail: connectionState }) => {
  const label = { connected: '송출 중', connecting: '연결 중', failed: '연결 실패' };
  ui.setConnectionState(label[connectionState] ?? connectionState, connectionState === 'connected');

  // RTP 가 흐르기 전에는 서버가 오디오 프레임을 하나도 못 받습니다.
  state.publisherReady = connectionState === 'connected';
  ui.setTalkEnabled(state.publisherReady);

  // 마이크 송출까지 끝나야 실제로 AI에게 말을 걸 수 있습니다. 여기서 한 번만 알립니다.
  if (state.publisherReady && state.aiPresent && !aiReadyAnnounced) {
    aiReadyAnnounced = true;
    ui.appendSystem('AI와 연결되었습니다. 이제 말을 걸어보세요');
  }
});

// ── 채팅 · 과제 제안 ─────────────────────────────────────────────────
/** DataChannel 과 WebSocket 양쪽에서 오는 채팅을 한 곳에서 처리합니다. */
function handleChat(message) {
  const self = message.from === state.selfId;
  const proposal = self ? null : proposalFrom(message.goal);
  ui.appendChat({ ...message, self, proposal, onAdopt: adopt });
  if (!self) ui.setAiSpeaking(false); // AI 응답 도착
}

/**
 * `payload.goal`(서버의 3단계 판단 결과)에서 담을 수 있는 과제만 뽑아냅니다.
 *
 * `clarify` 나 차단 응답에는 담을 것이 없습니다. `BOT_MODE=chat` 이면 `goal`
 * 필드 자체가 오지 않으므로 자연스럽게 null 이 됩니다.
 */
function proposalFrom(goal) {
  if (!goal) return null;
  const isRecommend = goal.action === 'recommend';
  if (!isRecommend && goal.action !== 'generate') return null;

  const task = (isRecommend ? goal.matched_task : goal.generated_task) ?? {};
  const title = (task.title || '').trim();
  if (!title) return null; // 서버도 이 경우 "제목을 못 읽었다" 고 말합니다

  // 도메인은 사용자 시트의 자유 이름입니다. 고정 목록이 없어졌으므로 이모지·설명도
  // 없습니다. 서버가 도메인 없이 담을 수 있는 응답을 내보내지 않으므로(`no_domain`
  // 경로에서 action 을 clarify 로 바꿉니다) 여기서 `'기타'` 로 메울 일도 없습니다.
  const domain = (goal.domain || '').trim();
  if (!domain) return null;

  return {
    domain,
    //`domain` 행이 아직 없다는 뜻 — 담을 때 칸을 먼저 만들어야 합니다.
    domainIsNew: goal.domain_is_new === true,
    domainId: goal.domain_id ?? null,
    title,
    // 예전의 type(mission/mindset) + is_recurring 을 대체한 필드입니다.
    frequency: task.frequency || 'none',
    description: task.description || '',
    templateId: task.template_id || null,
  };
}

/** 담기 버튼. 담기지 않았으면 false 를 돌려줘 버튼을 살려둡니다. */
function adopt(proposal) {
  return board.add(proposal).ok;
}

// ── 헬퍼 ─────────────────────────────────────────────────────────────
async function startPublishing() {
  try {
    await sfu.publish(state.localStream);
  } catch (err) {
    ui.appendSystem(`송출 실패: ${err.message}`);
  }
}

/** 마이크 확보. 카메라는 쓰지 않습니다(음성 전용). */
async function captureLocalMedia() {
  return navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true },
  });
}

/**
 * 연결을 끊고 담아둔 과제를 들고 이전 페이지로 돌아갑니다.
 *
 * **이 화면은 서버에 저장하지 않습니다. 그게 정상입니다** — 과제를 하나씩 추가하는
 * API 가 없고, 시트는 `POST /api/v1/sheets` 로 **한 번에 통째로** 만들어집니다
 * (`SheetCreateRequest`). 그래서 이 화면이 하는 일은 대화로 64칸 초안을 모아
 * 넘기는 것이고, 나가면서 보드를 비우지 않습니다 — 비우면 넘겨줄 것이 사라집니다.
 *
 * 넘기는 `domains` 는 `SheetCreateRequest.domains[]` 와 같은 모양입니다. 받는 쪽이
 * `title` · `isOpen` · `expiredAt` 만 채워 감싸서 POST 하면 됩니다 — 그 셋은 이
 * 화면이 알 수 없는 값입니다.
 *
 * 이전 페이지가 어떻게 이 화면을 열었는지에 따라 받는 방법이 다릅니다. 셋 다
 * 시도하고, 되는 것이 하나라도 있으면 됩니다.
 *
 *   1. 팝업/iframe 으로 열었다면  → postMessage 로 직접 건넵니다
 *   2. 같은 오리진의 페이지라면   → localStorage('mandarin.tasks.v1') 를 읽으면 됩니다
 *   3. 그 외                      → 뒤로 가기만 하고, 데이터는 1·2 로 이미 전달돼 있습니다
 *
 * **다른 오리진에서 평범한 링크로 넘어온 경우**(예: React 개발 서버 :3000 →
 * 여기 :8080)에는 1도 2도 성립하지 않습니다. 그때는 돌아갈 URL 을 알아야
 * 쿼리스트링이나 인계 키로 실어 보낼 수 있으니, 확정되면 알려주세요.
 */
const HANDOFF_MESSAGE = 'mandarin:tasks';

function leave() {
  state.localStream?.getTracks().forEach((t) => t.stop());
  sfu.close();
  signaling.close();
  handOffTasks();
  goBack();
}

function handOffTasks() {
  const tasks = board.snapshot();
  // 서버에 그대로 POST 할 수 있는 모양. `tasks` 도 같이 보냅니다 — 화면에 다시
  // 그리려면 `description` 처럼 시트에 저장되지 않는 값이 필요합니다.
  const domains = board.sheetDraft();
  // 열어준 창(팝업) 이 우선입니다. iframe 이면 parent 가 그 역할을 합니다.
  const host = window.opener ?? (window.parent !== window ? window.parent : null);
  if (!host) return;

  // targetOrigin 을 '*' 로 두면 과제 목록이 아무 페이지에나 전달될 수 있습니다.
  // referrer 에서 오리진을 얻고, 없으면 같은 오리진으로 좁힙니다.
  // **호스트 주소가 확정되면 이 값을 상수로 고정하세요.**
  let target = window.location.origin;
  try {
    if (document.referrer) target = new URL(document.referrer).origin;
  } catch {
    /* referrer 가 이상하면 같은 오리진으로 둡니다 */
  }

  try {
    host.postMessage({ type: HANDOFF_MESSAGE, tasks, domains }, target);
    console.info(
      `[sfu] 과제 ${tasks.length}건(도메인 ${domains.length}칸)을 ${target} 로 넘겼습니다`,
    );
  } catch (err) {
    console.warn('[sfu] 과제 인계 실패 — 이전 페이지가 localStorage 를 읽어야 합니다', err);
  }
}

function goBack() {
  // 팝업으로 열렸으면 닫는 게 "이전 페이지로 돌아가는 것" 입니다. 다만
  // `window.close()` 는 스크립트가 연 창에서만 동작합니다 — `target="_blank"`
  // 링크로 열렸다면 조용히 무시되고 사용자는 멈춘 화면에 남습니다. 그래서
  // 닫혔는지 확인하고 안 닫혔으면 평소 경로로 내려갑니다.
  if (window.opener) {
    window.close();
    setTimeout(() => {
      if (!window.closed) stepBack();
    }, 150);
    return;
  }
  stepBack();
}

function stepBack() {
  // history.length 는 이 페이지 자신도 포함하므로 2 이상이어야 뒤가 있습니다.
  if (window.history.length > 1 && document.referrer) {
    window.history.back();
    return;
  }
  // 직접 주소를 쳐서 들어온 경우. 돌아갈 곳이 없으니 처음 화면으로 되돌립니다.
  location.reload();
}

// ── DOM 이벤트 연결 ──────────────────────────────────────────────────
ui.els.btnConnect.addEventListener('click', async () => {
  ui.els.btnConnect.disabled = true;
  ui.appendSystem('서버에 접속중입니다…');

  try {
    // 1) capture -> 2) connect -> 3) join. publish 는 iceServers 를 담은
    // welcome 을 받은 뒤 시작합니다.
    state.localStream = await captureLocalMedia();
    await signaling.connect(FALLBACK_ROOM_ID);
    // 티켓은 URL 이 아니라 본문으로 보냅니다 — 쿼리스트링에 담으면 프록시
    // 액세스 로그에 토큰이 그대로 남습니다. 인증이 켜져 있으면 서버가 티켓의
    // 방으로 재배정하고, 실제 방 이름은 welcome.room 으로 알려줍니다.
    signaling.send({ type: 'join', displayName: DISPLAY_NAME, ticket: TICKET });
  } catch (err) {
    ui.els.btnConnect.disabled = false;
    ui.appendSystem(
      err.name === 'NotAllowedError'
        ? '마이크 권한이 필요합니다.'
        : `연결 실패: ${err.message}`,
    );
  }
});

ui.els.btnMic.addEventListener('click', () => {
  state.mic = !state.mic;
  ui.toggleButton(ui.els.btnMic, state.mic);
  sfu.setTrackEnabled('audio', state.mic);
  signaling.send({ type: 'media-state', audio: state.mic, video: false });
});

// ── 푸시투토크 ───────────────────────────────────────────────────────
// 누르는 동안의 음성만 AI 에게 보냅니다. VAD(자동 발화 감지)를 쓰지 않는
// 이유는, 시작과 끝을 사람이 정하면 오작동이 구조적으로 생길 수 없기 때문입니다.
let talking = false;

let talkStartedAt = 0;

function startTalk() {
  if (talking) return;
  if (!state.publisherReady) {
    ui.appendSystem('아직 연결 중입니다. 상단 배지가 "송출 중"이 된 뒤 눌러주세요');
    return;
  }
  if (!state.mic) {
    ui.appendSystem('마이크가 꺼져 있어 음성을 보낼 수 없습니다');
    return;
  }
  talking = true;
  talkStartedAt = Date.now();
  ui.setTalking(true);
  signaling.send({ type: 'bot-listen', state: 'start' });
}

function stopTalk(source = 'unknown') {
  if (!talking) return;
  const heldMs = Date.now() - talkStartedAt;
  console.debug(`[sfu] talk stop (${source}) after ${heldMs}ms`);
  if (heldMs < 150 && source !== 'pointerup') {
    // 사람이 150ms 안에 버튼을 뗄 수는 없습니다. pointercancel 이나 blur 가
    // 끼어든 것이므로 무시하고 녹음을 이어갑니다.
    console.warn(`[sfu] ${source} 가 ${heldMs}ms 만에 발생 — 무시합니다`);
    return;
  }
  talking = false;
  ui.setTalking(false);
  signaling.send({ type: 'bot-listen', state: 'stop' });
}

signaling.on('bot-listen', ({ state: phase, reason, seconds, captured }) => {
  if (phase === 'listening') {
    ui.appendSystem('듣는 중…');
    return;
  }
  talking = false;
  ui.setTalking(false);
  if (captured) {
    ui.setAiSpeaking(true); // AI가 답을 준비하는 중
    ui.appendSystem(
      `음성 ${seconds}초를 AI 에게 보냈습니다${reason === 'limit' ? ' (최대 길이 도달)' : ''}`,
    );
  } else {
    ui.appendSystem(`음성이 캡처되지 않았습니다 (${seconds}초). 서버 로그를 확인하세요`);
  }
});

if (!ui.els.btnTalk) {
  console.error('[sfu] #btn-talk 을 찾지 못했습니다. index.html 이 캐시된 구버전일 수 있습니다.');
} else {
  ui.els.btnTalk.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    console.debug('[sfu] talk down');
    startTalk();                       // 캡처 실패가 전송을 막지 않도록 먼저 보낸다
    try {
      // 포인터 캡처: 버튼 밖에서 손을 떼도 pointerup 이 여기로 온다.
      ui.els.btnTalk.setPointerCapture(event.pointerId);
    } catch (err) {
      console.warn('[sfu] setPointerCapture 실패', err);
    }
  });
  ui.els.btnTalk.addEventListener('pointerup', () => stopTalk('pointerup'));
  ui.els.btnTalk.addEventListener('pointercancel', () => stopTalk('pointercancel'));
  ui.els.btnTalk.addEventListener('lostpointercapture', () => stopTalk('lostpointercapture'));
  window.addEventListener('blur', () => stopTalk('blur'));
}

ui.els.btnLeave.addEventListener('click', leave);

ui.els.chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = ui.els.chatInput.value.trim();
  if (!text) return;
  sfu.sendChat(text);
  ui.setAiSpeaking(true); // AI가 답을 준비하는 중
  ui.els.chatInput.value = '';
});

// 콘솔 디버깅용 핸들. 모듈 스코프라 밖에서 접근할 방법이 없어서 열어둡니다.
// 예: __sfu.signaling.send({ type: 'bot-listen', state: 'start' })
// 프로덕션에서는 지워도 됩니다.
window.__sfu = { signaling, sfu, state, ui, board, startTalk, stopTalk };
console.info('[sfu] loaded. window.__sfu 로 접근 가능');

window.addEventListener('beforeunload', () => {
  sfu.close();
  signaling.close();
});
