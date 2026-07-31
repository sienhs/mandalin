/**
 * DOM 렌더링 전담 — 연결 상태, AI 대화 로그, 컨트롤 버튼.
 *
 * 여기에는 WebRTC 도 시그널링도 없습니다. `app.js` 가 상태를 정하고 이 클래스는
 * 그리기만 합니다. 그래서 화면을 바꿀 때 연결 로직을 건드릴 일이 없습니다.
 *
 * 1인 전용 AI 음성봇 모드로 축소되면서 다자간 비디오 타일 그리드는 제거했습니다.
 * `#ai-avatar` 는 지금은 텍스트 placeholder지만, PNG 이미지를 넣고 싶으면
 * index.html 의 해당 엘리먼트를 `<img>` 로 바꾸고 여기서 `src` 만 지정하면 됩니다.
 */

const $ = (sel) => document.querySelector(sel);

export class UI {
  els = {
    btnConnect: $('#btn-connect'),
    room: $('#room-view'),
    connState: $('#conn-state'),
    aiAvatar: $('#ai-avatar'),
    chatPanel: $('#chat-panel'),
    chatLog: $('#chat-log'),
    chatForm: $('#chat-form'),
    chatInput: $('#chat-input'),
    btnMic: $('#btn-mic'),
    btnTalk: $('#btn-talk'),
    btnLeave: $('#btn-leave'),
    boardList: $('#board-list'),
    boardCount: $('#board-count'),
    boardEmpty: $('#board-empty'),
  };

  setConnectionState(text, live = false) {
    this.els.connState.textContent = text;
    this.els.connState.classList.toggle('live', live);
  }

  /** AI가 응답을 말하는(생성하는) 동안 아바타에 표시할 상태. */
  setAiSpeaking(speaking) {
    this.els.aiAvatar?.classList.toggle('speaking', speaking);
  }

  // ── chat ───────────────────────────────────────────────────────────
  /**
   * @param {object} message
   * @param {object} [message.proposal] 담을 수 있는 과제 제안(`payload.goal` 에서
   *   app.js 가 뽑아낸 것). 있으면 말풍선 아래에 담기 버튼을 붙입니다.
   * @param {(proposal: object) => boolean} [message.onAdopt] 담기를 눌렀을 때.
   *   실제로 담겼으면 true 를 돌려주면 버튼이 담김 표시로 바뀝니다.
   */
  appendChat({ displayName, text, self = false, proposal = null, onAdopt = null }) {
    const li = document.createElement('li');
    if (self) li.classList.add('self');
    const who = document.createElement('span');
    who.className = 'who';
    who.textContent = self ? '나' : displayName;
    const body = document.createElement('span');
    // 줄바꿈이 그대로 보여야 합니다. 도메인 설명과 "담아둘까요?" 가 서버에서
    // 별도 줄로 만들어져 옵니다 (goal.py 의 render()).
    body.className = 'chat-body';
    body.textContent = text;
    li.append(who, body);
    if (proposal && onAdopt) li.append(this.#proposalCard(proposal, onAdopt));
    this.els.chatLog.append(li);
    this.els.chatLog.scrollTop = this.els.chatLog.scrollHeight;
  }

  /**
   * 담기 버튼 한 줄. 제목·설명은 바로 위 말풍선이 이미 말하고 있으므로 여기서
   * 되풀이하지 않고, 어느 칸에 들어가는지(도메인)와 행동만 남깁니다.
   *
   * 자동으로 담지 않는 이유는 프롬프트의 `no_autocomplete` 규칙입니다 —
   * 추천과 초안 생성까지만 하고 최종 확정은 사용자가 합니다.
   */
  #proposalCard(proposal, onAdopt) {
    const card = document.createElement('div');
    card.className = 'task-offer';

    const chip = document.createElement('span');
    chip.className = 'domain-chip';
    // 도메인은 시트의 자유 이름이라 이모지·설명이 없습니다(고정 목록 폐지).
    // 새로 만들 칸이면 그 사실을 칩에 적습니다 — 담고 나서 칸이 늘어난 걸
    // 발견하는 것보다 낫습니다.
    chip.textContent = proposal.domainIsNew ? `${proposal.domain} (새 칸)` : proposal.domain;

    const adopt = document.createElement('button');
    adopt.type = 'button';
    adopt.className = 'mini';
    adopt.textContent = '담기';
    adopt.addEventListener('click', () => {
      if (onAdopt(proposal) === false) return; // 중복·정원 초과. 다시 누를 수 있게 둡니다.
      adopt.disabled = true;
      adopt.textContent = '담았습니다';
    });

    card.append(chip, adopt);
    return card;
  }

  /** 입퇴장·오류·음성 전송 결과 같은 알림. 대화 로그에 섞어서 보여줍니다. */
  appendSystem(text) {
    const li = document.createElement('li');
    li.className = 'system';
    li.textContent = text;
    this.els.chatLog.append(li);
    this.els.chatLog.scrollTop = this.els.chatLog.scrollHeight;
  }

  toggleButton(button, pressed) {
    button.setAttribute('aria-pressed', String(pressed));
  }

  #talkTimer = null;

  /** 송출이 연결되기 전에는 푸시투토크를 막습니다. */
  setTalkEnabled(enabled) {
    const button = this.els.btnTalk;
    if (!button) return;
    button.disabled = !enabled;
    button.title = enabled
      ? '누르고 있는 동안 AI에게 말합니다 (최대 60초)'
      : '연결이 완료되면 사용할 수 있습니다';
  }

  /** 푸시투토크 버튼의 시각 상태 + 경과 시간 표시. */
  setTalking(on, maxSeconds = 60) {
    const button = this.els.btnTalk;
    button.classList.toggle('live', on);
    clearInterval(this.#talkTimer);

    if (!on) {
      this.#talkTimer = null;
      button.textContent = '🎙 AI에게 말하기';
      return;
    }

    const startedAt = Date.now();
    const render = () => {
      const elapsed = (Date.now() - startedAt) / 1000;
      button.textContent = `● 듣는 중 ${elapsed.toFixed(0)}s / ${maxSeconds}s`;
    };
    render();
    this.#talkTimer = setInterval(render, 250);
  }
}
