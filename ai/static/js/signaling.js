/**
 * 시그널링 WebSocket 래퍼.
 *
 * 서버 메시지의 `type` 을 그대로 DOM 이벤트 이름으로 바꿔 발행합니다. 덕분에
 * 호출하는 쪽은 거대한 switch 문 대신 `signaling.on('welcome', handler)` 로
 * 필요한 것만 구독하면 됩니다.
 *
 * 재연결은 구현하지 않았습니다. 끊기면 PeerConnection 상태와 서버의 방 상태를
 * 다시 맞춰야 하는데, 그 복구 로직이 최초 입장 로직보다 복잡해집니다. 지금은
 * 새로고침이 가장 확실한 복구입니다.
 */
export class Signaling extends EventTarget {
  #ws = null;
  #queue = [];

  get connected() {
    return this.#ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 소켓이 열릴 때까지 기다립니다.
   * @returns {Promise<void>} 열리면 resolve, 실패하면 reject
   */
  connect(roomId) {
    const scheme = location.protocol === 'https:' ? 'wss' : 'ws';
    const url = `${scheme}://${location.host}/ws/${encodeURIComponent(roomId)}`;
    this.#ws = new WebSocket(url);

    return new Promise((resolve, reject) => {
      this.#ws.addEventListener('open', () => {
        // 열리기 전에 보낸 메시지를 순서대로 흘려보냅니다.
        this.#queue.splice(0).forEach((m) => this.#ws.send(m));
        this.dispatchEvent(new CustomEvent('open'));
        resolve();
      });

      this.#ws.addEventListener('message', (event) => {
        let data;
        try {
          data = JSON.parse(event.data);
        } catch {
          return;
        }
        if (!data?.type) return;
        this.dispatchEvent(new CustomEvent(data.type, { detail: data }));
      });

      this.#ws.addEventListener('close', (event) => {
        this.dispatchEvent(new CustomEvent('close', { detail: event }));
      });

      this.#ws.addEventListener('error', (event) => {
        // 'error' 는 서버가 보내는 애플리케이션 에러 메시지 타입이라 이름이
        // 겹칩니다. 전송 계층 오류는 'socket-error' 로 구분해 발행합니다.
        this.dispatchEvent(new CustomEvent('socket-error', { detail: event }));
        reject(new Error('signaling connection failed'));
      });
    });
  }

  /** 소켓이 아직 안 열렸으면 큐에 담아 두었다가 열릴 때 보냅니다. */
  send(message) {
    const payload = JSON.stringify(message);
    if (this.connected) this.#ws.send(payload);
    else this.#queue.push(payload);
  }

  on(type, handler) {
    this.addEventListener(type, (event) => handler(event.detail));
    return this;
  }

  close() {
    // 명시적으로 알리면 서버가 소켓 타임아웃을 기다리지 않고 즉시 정리합니다.
    if (this.connected) this.send({ type: 'leave' });
    this.#ws?.close();
    this.#ws = null;
  }
}
