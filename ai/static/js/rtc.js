/**
 * SFU 클라이언트 — 브라우저 쪽 PeerConnection 관리.
 *
 *   publisher : RTCPeerConnection 1개. 브라우저 -> SFU (sendonly + 채팅 DataChannel)
 *
 * **다운스트림은 만들지 않습니다.** 이 화면은 1인 전용 AI 음성봇이고, 방에 있는
 * 다른 참가자는 AI 봇 하나뿐인데 봇은 미디어를 보내지 않습니다. 받을 트랙이
 * 없으므로 구독할 것도 없습니다.
 *
 * 서버(`app/media/`)는 여전히 다운스트림을 만들 수 있습니다 — SFU 로서의 팬아웃
 * 경로는 그대로 있고, 여기서 요청하지 않을 뿐입니다. 다자간 화면을 다시 만든다면
 * 브라우저에 `subscribe` / `subscribe-answer` 를 되살리면 되고, 서버는 손댈 필요가
 * 없습니다.
 *
 * 업스트림 협상은 브라우저가 offer, 서버가 answer 입니다.
 */
export class SfuClient extends EventTarget {
  #signaling;
  #iceServers = [];
  #publisherPc = null;
  #chatChannel = null;
  #localStream = null;

  constructor(signaling) {
    super();
    this.#signaling = signaling;
    signaling.on('publish-answer', (m) => this.#onPublishAnswer(m));
  }

  /** ICE 서버 목록은 하드코딩하지 않고 `welcome` 으로 받아 채웁니다. */
  set iceServers(servers) {
    this.#iceServers = servers ?? [];
  }

  get localStream() {
    return this.#localStream;
  }

  #emit(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail }));
  }

  #newPeerConnection() {
    return new RTCPeerConnection({
      iceServers: this.#iceServers,
      // 모든 미디어를 하나의 전송 경로로 묶습니다. ICE 후보 수집이 한 번만
      // 일어나 연결이 빨라지고, 서버가 열어야 할 포트도 줄어듭니다.
      bundlePolicy: 'max-bundle',
      rtcpMuxPolicy: 'require',
    });
  }

  #wireIce(pc) {
    // 브라우저는 trickle ICE 라 후보를 찾는 족족 보냅니다. 반대로 서버(aiortc)는
    // SDP 에 후보를 모두 담아 보내므로 받을 일이 없습니다.
    //
    // `target` 은 서버가 어느 연결의 후보인지 구분하는 값입니다. 연결이 업스트림
    // 하나뿐이라 항상 'publisher' 입니다.
    pc.addEventListener('icecandidate', ({ candidate }) => {
      if (!candidate) return; // null = 후보 수집 완료 신호
      this.#signaling.send({
        type: 'ice',
        target: 'publisher',
        candidate: candidate.toJSON(),
      });
    });
  }

  // ── 업스트림 (내 미디어 올리기) ──────────────────────────────────────
  async publish(stream) {
    this.#localStream = stream;
    const pc = this.#newPeerConnection();
    this.#publisherPc = pc;

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // 채팅은 시그널링 WebSocket 이 아니라 이 연결 위의 DataChannel 을 씁니다.
    // 서버가 채널을 종단하고 다른 참가자에게 다시 뿌립니다.
    const channel = pc.createDataChannel('chat', { ordered: true });
    this.#chatChannel = channel;
    channel.addEventListener('message', (event) => {
      try {
        this.#emit('chat', JSON.parse(event.data));
      } catch {
        /* 깨진 프레임은 무시 */
      }
    });

    this.#wireIce(pc);
    // 이 상태가 'connected' 가 되어야 서버에 RTP 가 실제로 도착합니다.
    // 푸시투토크 버튼이 그 전까지 잠겨 있는 이유이기도 합니다.
    pc.addEventListener('connectionstatechange', () =>
      this.#emit('publisher-state', pc.connectionState),
    );

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.#signaling.send({
      type: 'publish',
      sdp: { type: offer.type, sdp: offer.sdp },
    });
  }

  async #onPublishAnswer({ sdp }) {
    if (!this.#publisherPc) return;
    await this.#publisherPc.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  // ── 채팅 ─────────────────────────────────────────────────────────────
  /**
   * DataChannel 이 열려 있으면 그쪽으로, 아니면 WebSocket 으로 보냅니다.
   * 입장 직후에는 아직 협상 중이라 폴백이 실제로 쓰입니다.
   * @returns {'datachannel'|'websocket'} 실제로 사용한 경로
   */
  sendChat(text) {
    const payload = { type: 'chat', text };
    if (this.#chatChannel?.readyState === 'open') {
      this.#chatChannel.send(JSON.stringify(payload));
      return 'datachannel';
    }
    this.#signaling.send(payload);
    return 'websocket';
  }

  // ── 로컬 미디어 제어 ─────────────────────────────────────────────────
  /**
   * 마이크/카메라 on-off. 트랙을 제거하면 재협상이 필요하지만 `enabled` 만
   * 끄면 무음/검은 화면이 흘러가서 연결은 그대로 유지됩니다.
   * 대신 서버는 이 변화를 알 수 없어 `media-state` 로 따로 알려줘야 합니다.
   */
  setTrackEnabled(kind, enabled) {
    this.#localStream?.getTracks()
      .filter((t) => t.kind === kind)
      .forEach((t) => { t.enabled = enabled; });
  }

  close() {
    this.#chatChannel?.close();
    this.#publisherPc?.close();
    this.#publisherPc = null;
    // track.stop() 을 해야 카메라 표시등이 꺼집니다.
    this.#localStream?.getTracks().forEach((t) => t.stop());
    this.#localStream = null;
  }
}
