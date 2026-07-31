# 폴더별 명세

README 가 "무엇을 하는 프로젝트인가" 라면, 이 문서는 **"어느 폴더가 무엇을 책임지고,
무엇을 건드리면 안 되는가"** 입니다. 코드를 고치기 전에 해당 폴더 절만 읽으면 됩니다.

밑에 깔린 CS 개념을 코드와 짝지어 설명한 학습 노트는 **[LEARNING.md](LEARNING.md)**
입니다 — "왜 이런 구조인가" 가 궁금하면 그쪽이 먼저입니다.

## 의존 방향

화살표는 "왼쪽이 오른쪽을 안다" 는 뜻입니다. **역방향 import 는 없습니다.**

```
                                 config.py  ◄── (전 계층이 참조)
                                 schemas.py ◄── (시그널링 계약)

  api/ ─────┐
            ├──▶ signaling/ ──▶ media/ ──▶ rooms/
  main.py ──┘         │            │
                      ├──▶ auth/   │
                      ├──▶ bot/ ───┤
                      └──▶ chat/ ──┘
```

지켜야 할 규칙 두 가지입니다.

- **`rooms/` 는 aiortc 도 FastAPI 도 모릅니다.** 미디어 계층이 `Participant` 의 슬롯에
  스스로를 꽂고, 전송 계층이 `send` 콜백을 꽂습니다. 이 방향 덕분에 방 로직을 소켓이나
  PeerConnection 없이 테스트할 수 있고, **AI 봇이 사람과 구별되지 않는 참가자**가 됩니다.
- **`media/` 는 방 전체를 모릅니다.** 연결 하나만 다룹니다. "누가 나갔으니 누구의
  다운스트림을 끊어라" 같은 판단은 방을 아는 `signaling/` 의 몫입니다.

---

## `app/` — 루트 3파일

| 파일 | 줄 | 역할 |
|---|---|---|
| `main.py` | 129 | FastAPI 조립, `lifespan`, 정적 파일 서빙 |
| `config.py` | 212 | pydantic-settings. 모든 설정의 단일 출처 |
| `schemas.py` | 256 | 시그널링 메시지 계약 (discriminated union) |

**`main.py`** — 의존성을 `lifespan` 에서 한 번 만들어 `app.state` 에 올립니다. 전역 변수를
쓰지 않기 때문에 테스트에서 앱을 여러 개 띄워도 서로 간섭하지 않습니다. 서버의 전부는
이 셋입니다.

```python
app.state.rooms  = RoomManager(settings)   # 누가 어느 방에 있는가
app.state.media  = MediaEngine(settings)   # PeerConnection 생성·구독·해제
app.state.bots   = BotManager(settings, rooms)  # AI 참가자와 LLM 백엔드
```

**`config.py`** — `get_settings()` 가 `lru_cache` 라 **`.env` 를 고치면 `--reload` 여부와
무관하게 프로세스를 완전히 재시작해야 합니다.** 자주 걸리는 함정이고, 프롬프트를
`.env` 가 아니라 파일로 뺀 이유이기도 합니다(→ `prompts/`).

리스트 필드는 **JSON 배열**로 써야 합니다. `STUN_URLS=stun:a,stun:b` 는 기동 시
ValidationError 입니다.

**`schemas.py`** — 클라이언트가 보내는 모든 메시지가 여기서 검증됩니다. `type` 필드
하나로 분기하는 discriminated union 이라, `session.py` 에는 `isinstance` 분기만 남습니다.
메시지 타입을 추가하려면 ① 모델 정의 ② `ClientMessage` union 에 추가 — 두 곳입니다.

> `ClientEnvelope` 로 한 겹 감싼 이유: pydantic 의 `discriminator` 는 필드에만 붙일 수
> 있어서 최상위 union 을 직접 검증할 수 없습니다.

---

## `app/rooms/` — 도메인 모델

| 파일 | 줄 | 역할 |
|---|---|---|
| `models.py` | 94 | `Participant`, `Room` |
| `manager.py` | 111 | 인메모리 룸 레지스트리, 정원 제한, `RoomError` |

**책임**: 누가 어느 방에 있는가. 그것뿐입니다.

**절대 하지 말 것**: 이 폴더에서 `aiortc` 나 `fastapi` 를 import 하는 것. `models.py` 는
`TYPE_CHECKING` 블록에서만 미디어 타입을 참조합니다.

**불변식**

- `Participant.publishing` 은 "방에 있다" 가 아니라 **"서버가 이 사람의 트랙을 실제로
  쥐고 있다"** 입니다. 다른 참가자는 이 값이 참이 된 뒤에야 구독해야 합니다.
- `RoomManager.join/leave` 는 락 안에서 동작합니다. "정원 확인 → 추가" 사이에 다른
  코루틴이 끼어들면 정원을 넘길 수 있습니다.
- `leave()` 가 `None` 을 돌려주면 **방이 폐기됐다**는 뜻입니다. 호출하는 쪽이 이 값으로
  브로드캐스트 여부를 판단합니다.
- `send_safe()` 는 예외를 삼킵니다. 죽은 소켓 하나가 방 전체 브로드캐스트를 깨뜨리면
  안 되기 때문입니다.

**단일 프로세스 전용**입니다. 방 목록이 이 객체의 dict 에만 있어서 `--workers 2` 로
띄우면 같은 방 이름의 두 사람이 서로 다른 프로세스에 배정되어 영영 만나지 못합니다.

---

## `app/media/` — 서버 쪽 PeerConnection

| 파일 | 줄 | 역할 |
|---|---|---|
| `peer.py` | 276 | `PublisherSession` / `SubscriberSession`, 공유 `MediaRelay`, `chat_text()` |
| `engine.py` | 115 | 생성·구독·해제 오케스트레이션 |
| `ice.py` | 72 | `RTCConfiguration` 생성, 브라우저 후보 파싱 |

**책임**: 연결 하나를 어떻게 다루는가(`peer.py`) + 누가 누구를 구독하는가(`engine.py`).

**핵심 성질**

- **재인코딩 없음.** 전역 `relay = MediaRelay()` 가 업스트림 트랙 하나의 프레임을 여러
  다운스트림에 나눠줍니다. 구독자가 몇 명이든 디코딩은 한 번입니다. 대신 수신자별
  화질 조절(Simulcast/SVC)은 불가능합니다.
- **협상 방향이 비대칭입니다.** 업스트림은 브라우저가 offerer, **다운스트림은 서버가
  offerer** 입니다. 어떤 트랙이 존재하는지 아는 쪽이 서버이기 때문입니다.
- **ICE 도 비대칭입니다.** 브라우저는 trickle 로 후보를 계속 보내지만, aiortc 는 vanilla
  ICE 라 `setLocalDescription` 안에서 후보를 다 모아 SDP 에 담습니다. 서버는 `ice`
  메시지를 **받기만** 합니다.

**주의점**

- `SubscriberSession.create_offer` 에서 `relay.subscribe(track)` 를 씁니다. **원본 트랙을
  직접 `addTrack` 하면 구독자 한 명만 프레임을 가져가고 나머지는 굶습니다.**
- 같은 곳에서 transceiver 를 `sendonly` 로 고정합니다. 안 하면 aiortc 가 `sendrecv` 로
  offer 를 만들어 브라우저가 쓰지도 않을 업스트림 슬롯을 할당합니다.
- `chat_text()` 는 DataChannel 프레임에서 `{"type":"chat","text":…}` 봉투를 벗깁니다.
  **파싱하지 않으면 봉투 문자열 전체가 채팅 본문이 되어 화면에 raw JSON 이 뜨고 AI 도
  그걸 발화로 받습니다.** 접속 직후에는 채널이 아직 열리지 않아 WebSocket 폴백을 타기
  때문에 멀쩡해 보이다가, 채널이 열리는 순간 증상이 나타납니다.
- `teardown()` 은 **이 참가자가 가진** 연결만 닫습니다. 이 사람을 구독하던 남의
  다운스트림은 `signaling/` 이 끊습니다.

**교체 지점**: 네이티브 SFU(Janus/mediasoup/LiveKit)로 옮긴다면 바꿀 것은 사실상
`MediaEngine` 하나입니다. 시그널링과 프론트엔드는 그대로 둘 수 있습니다.

---

## `app/signaling/` — 연결 상태 머신

| 파일 | 줄 | 역할 |
|---|---|---|
| `router.py` | 48 | `/ws/{room_id}` 엔드포인트, 방 이름 검증 |
| `session.py` | 399 | 연결 하나의 생명주기 + 인증 |

**책임**: 미디어·룸·봇 계층을 잇는 **유일한 조립 지점**. 반대로 저 셋은 서로를 모릅니다.

```
accept → _handshake() → _dispatch() 루프 → cleanup()
```

**불변식**

- 첫 메시지는 반드시 `join` 이고 15초(`JOIN_TIMEOUT_SECONDS`) 안에 와야 합니다.
  **인증도 여기서 합니다** — 티켓이 `join` 본문에 실려 옵니다(→ `app/auth/`).
- **검증 → 방 배정 → `bots.ensure()` 순서입니다.** 검증을 뒤로 미루면 실패할 연결이
  방을 만들고 봇을 깨워 LLM 비용을 태웁니다.
- `_handshake()` 는 **`welcome` 을 만들기 전에** `bots.ensure()` 를 부릅니다. `welcome.peers`
  가 `room.others()` 로 만들어지므로, 순서가 바뀌면 첫 입장자에게 봇이 안 보입니다.
- `send()` 는 락으로 감쌉니다. 브로드캐스트와 개별 응답이 같은 소켓에 동시에 쓰면
  WebSocket 프레임이 섞여 클라이언트 JSON 파싱이 깨집니다.
- 에러는 연결을 끊지 않고 `{"type":"error", "code":…}` 로 알립니다. 조용히 닫으면
  브라우저에는 이유 없는 종료로만 보입니다.
- **`cleanup()` 은 멱등해야 합니다.** 정상 퇴장·소켓 끊김·미디어 실패·서버 예외가 전부
  여기로 모입니다. `_closing` 플래그로 중복 실행을 막습니다.
- `cleanup()` 마지막의 `bots.release_if_only_bots()` 를 빠뜨리면 **봇이 방을 붙잡고 있어
  영원히 폐기되지 않습니다.**

---

## `app/auth/` — 입장 티켓 검증

| 파일 | 줄 | 역할 |
|---|---|---|
| `ticket.py` | 179 | `TicketVerifier`, `Identity`, `AuthError` |

**책임**: "이 사람이 누구이고, 어느 방에 들어갈 수 있는가". 그것뿐입니다.

**SFU 는 OAuth 를 모릅니다.** 구글로 로그인했든 카카오로 했든, 세션 쿠키를 쓰든
자체 JWT 를 쓰든 그건 Spring 이 아는 일입니다. 이 서버가 아는 것은 Spring 이
서명해 준 **단기 티켓 하나**뿐입니다.

```
[React]  "과제 AI 생성" 클릭
   │  POST /api/voice-sessions      ← Spring 이 평소 쓰는 인증 그대로
   ▼
[Spring]  사용자 확인 → 방 확보 → 티켓 서명 (exp 2분, aud=sfu)
   │  { roomId, ticket }
   ▼
[SFU]  app/auth/ 가 티켓만 검증
```

이렇게 갈라두면 소셜 제공자가 늘어나거나 세션에서 JWT 로 바뀌어도 SFU 는 손댈
곳이 없습니다. 반대로 Spring 의 세션 쿠키를 여기까지 끌고 오려 하면 크로스 오리진
쿠키·WebSocket 업그레이드 시 쿠키 전달·세션 조회 왕복이 전부 문제가 됩니다.

**불변식**

- **방은 티켓이 정합니다.** `room_for()` 가 `room` 클레임 또는 `u_{userId}` 를
  돌려주고, `_handshake()` 가 URL 값을 이것으로 덮어씁니다. 인증만 붙이고 방을
  클라이언트가 고르게 두면 **로그인한 아무나 남의 방에 들어갑니다.**
- **표시 이름도 티켓에서** 옵니다. 이 값은 채팅 payload 와 LLM 프롬프트에 들어가는
  값이라 사용자가 정하면 안 됩니다.
- **설정 실수는 막는 방향으로 끝납니다.** `AUTH_REQUIRED=true` 인데 키가 없으면
  전부 통과가 아니라 `AUTH_MISCONFIGURED` 로 거절합니다.
- **거절 이유를 구체적으로 알려주지 않습니다.** 서명 오류와 클레임 오류를 구분해
  주면 유효한 티켓을 만드는 실마리가 됩니다. 상세는 로그로만 남습니다.
- `exp` 는 필수입니다. 수명 없는 티켓은 유출되면 영원히 유효합니다.
- 시계 오차 30초를 허용합니다. 없으면 NTP 가 몇 초 어긋난 것만으로 입장이
  됐다 안 됐다 합니다.

**기본값은 꺼짐**(`auth_required=False`)입니다. 로컬 개발과 기존 테스트가 티켓 없이
돌아야 하기 때문입니다. 클레임 이름이 전부 설정인 이유도 같습니다 — Spring 스펙이
확정되기 전에 코드가 완성돼 있어야 하고, `sub` 든 `userId` 든 `.env` 한 줄이면 맞습니다.

---

## `app/chat/` — 채팅 팬아웃

| 파일 | 줄 | 역할 |
|---|---|---|
| `service.py` | 52 | `build_payload()`, `fan_out()` |

**경로 우선순위**: ① 각 피어의 `chat` DataChannel → ② 실패하면 `Participant.send`
(시그널링 WebSocket, 또는 봇의 처리 콜백).

**이 폴백 한 줄이 AI 봇 지원의 전부입니다.** 봇은 PeerConnection 이 없으므로 항상 ②로
떨어지고, 그래서 봇을 붙이는 데 시그널링 프로토콜도 브라우저 코드도 바뀌지 않았습니다.

`json.dumps(..., ensure_ascii=False)` 는 필수입니다. 안 그러면 한글 한 글자가 6바이트가
됩니다.

---

## `app/bot/` — AI 참가자

가장 큰 폴더입니다. 세 갈래로 읽으세요.

| 파일 | 줄 | 역할 |
|---|---|---|
| `manager.py` | 414 | 봇 입퇴장, 히스토리, 푸시투토크, 응답 조율 |
| `llm.py` | 472 | 백엔드 3종(`echo`/`gemini`/`openai`), `Turn`, 구조화 출력 |
| `goal.py` | 823 | 목표 설계 파이프라인 (분류 → 검색 → 판단) |
| `prompt.py` | 180 | 프롬프트 파일 로더 (무재시작 반영) |
| `templates.py` | 222 | 예시 과제 후보 검색 |
| `voice.py` | 209 | 푸시투토크 오디오 캡처 · Opus 인코딩 |

### `manager.py`

봇은 WebSocket 없이 `RoomManager.join()` 으로 들어가고, 그때 넘긴 `send` 콜백이
수신함이 됩니다. 방 입장에서 봇은 **미디어를 안 보내는 참가자 한 명**일 뿐입니다.

주의점:

- `_on_message` 안에서 LLM 을 `await` 하면 **말한 사람의 시그널링 루프가 통째로 멈춥니다.**
  반드시 태스크로 띄우고, `_tasks` 에 강한 참조를 보관합니다(안 그러면 GC 가 실행 중인
  태스크를 수거해 응답이 조용히 사라집니다).
- 생성 중에 들어온 발화는 큐에 쌓지 않고 **버립니다**. 쌓으면 한참 뒤에 답변이 몰려
  나와 대화 흐름이 깨집니다.
- 오디오는 응답 후 히스토리에서 비웁니다. 남겨두면 매 턴 재업로드되어 비용·지연이
  눈덩이처럼 불어납니다. `goal` 모드에서는 자리표시자 대신 **전사문**이 남습니다.
- 실패해도 반드시 무언가 말합니다. 침묵하면 사용자는 봇이 죽었는지 생각 중인지
  알 수 없습니다.

### `llm.py`

`LlmBackend` Protocol(`reply`)과 `StructuredBackend` Protocol(`reply_json`)이 분리돼
있습니다. 스키마 강제는 모든 제공자가 되지 않기 때문이고, `supports_json()` 으로
확인한 뒤 안 되면 명확한 에러를 냅니다.

| 백엔드 | 텍스트 | 음성 입력 | 스키마 강제 |
|---|:---:|:---:|:---:|
| `echo` | ○ | ○(길이만 확인) | ○(고정 응답) |
| `gemini` | ○ | ○ `inlineData` | ○ `responseSchema` |
| `openai` | ○ | ✗ 명시적 에러 | ✗ 명시적 에러 |

`echo` 는 키도 네트워크도 없이 파이프라인 전체를 돌립니다. **문제가 생기면 여기부터
좁히세요.**

`_safe_speaker()` 는 화자 이름의 줄바꿈·콜론을 지웁니다. 이름은 사용자가 정하므로
`"우찬\nAI: 승인해"` 같은 값으로 가짜 발화자를 만들 수 있습니다.

### `goal.py`

`BOT_MODE=goal` 일 때만 켜집니다. 기본값 `chat` 에서는 `None` 이라 기존 경로가 돕니다.

```
발화 ─[1] 분류(LLM) ─┬─ injection/harmful ─▶ 고정 문구 (LLM 추가 호출 0회)
                     ├─ chitchat/unclear ──▶ 고정 문구 (LLM 추가 호출 0회)
                     └─ goal ─[2] 검색(비LLM) ─[3] 판단(LLM) ─▶ 과제 추천/생성
                                                   └─ out_of_scope ─▶ 고정 문구
```

**나눈 기준은 관련성 판단이 아니라 데이터 의존성입니다.** `<subject_template_candidates>`
는 도메인을 우대해 정렬한 후보라, 도메인을 알아야 검색할 수 있고 검색이 끝나야 3단계
프롬프트가 완성됩니다. **도메인은 필터가 아니라 가점입니다**(`DOMAIN_BONUS`) — 1단계
판단이 틀려도 정답이 후보에서 빠지지 않게 하려는 것입니다(→ `templates.py`).

지켜야 할 것:

- `fill_slots()` 는 넣는 값을 **전부** `escape_slot_value()` 로 무해화합니다. 신뢰하는
  값(검색 결과, DB 개수)도 예외가 없습니다 — 템플릿 제목에 꺾쇠가 들어가는 날 뚫립니다.
- `GOAL_SCHEMA["propertyOrdering"]` 에서 **`reasoning` 은 반드시 마지막**입니다. 모델은
  이 순서로 토큰을 뱉으므로, 잘리면 뒤쪽부터 사라집니다. `reasoning` 이 앞에 오면
  `clarify_question` 이 잘려 JSON 자체가 깨집니다.
- `public_data()` 를 거치지 않은 dict 를 클라이언트로 내보내지 마세요. `reasoning` 은
  프롬프트에 "사용자에게 노출하지 않음" 이라고 적힌 필드입니다.
- `render()` 가 빈 문자열을 돌려주면 `out_of_scope` 라는 뜻이고, 호출하는 쪽이 일반
  대화로 폴백합니다. **차단(`injection`/`harmful`)은 폴백하지 않습니다** — 폴백하면
  방어 규칙 없는 프롬프트로 같은 입력을 다시 태우게 됩니다.
- **`recommend` 의 제목·빈도·도메인은 카탈로그가 정본입니다**(`_resolve_match`). 3단계는
  1단계의 도메인을 받지 않고 스스로 다시 분류하므로, 검색은 도메인 A 로 하고 라벨은 B 로
  붙는 일이 생깁니다. 같은 과제가 부를 때마다 다른 칸에 담기면 도메인당 8개 정원 계산도
  흔들립니다. `generate` 는 따를 항목이 없으니 모델 판단을 그대로 씁니다.
- **도메인이 비면 1단계 판단으로 채웁니다**(`_settle_domain`). 3단계는 1단계의 도메인을
  받지 않고 스스로 다시 분류하므로 비는 경우가 있는데, 그 값은 2단계 검색에 쓰고 버려지던
  것이라 이미 메모리에 있습니다 — **LLM 호출 0회**입니다. 둘 다 비면 담기를 보류하고
  고정 문구(`DOMAIN_UNKNOWN_REPLY`)로 되묻습니다. 도메인 없이 내보내면 브라우저가
  `'기타'` 칸으로 밀어넣는데(`app.js` 의 `proposalFrom`), 그건 사용자가 만든 칸이
  아닙니다. 이때 `data["action"]` 을 `clarify` 로
  갈아끼우는 것이 핵심입니다 — `recommend`/`generate` 로 남기면 담기 버튼이 그려집니다.
- **모델이 계산할 수 없는 값은 스키마에 넣지 마세요.** 후보 줄에는 유사도 점수가 없고
  `<existing_domain_tasks>` 도 비어 있을 수 있습니다. 그런 상태에서 숫자 필드를 두거나
  예시에 숫자를 적어두면 모델이 **근거 없이 베낍니다** — 실측(2026-07-30)에서
  `domain_confidence` 는 예시의 `0.95` 가, `reasoning` 은 예시의 `"5/8"` 이 그대로
  나왔습니다. 그래서 `domain_confidence` 를 없앴고 예시의 숫자도 지웠습니다
  (`test_examples_do_not_carry_numbers_the_model_cannot_compute` 가 지킵니다).

**DB 시임**: `GoalPipeline(task_counts=...)` 이 `<existing_domain_tasks>` 주입 지점입니다.
기본값이 빈 dict 라 지금은 `domain_capacity` 규칙(도메인당 8개)이 동작하지 않습니다.

### `prompt.py`

`stat` 한 번으로 `(mtime, size)` 만 비교하고, 그대로면 파일을 다시 읽지 않습니다.
모델 호출은 수백 ms 라 `stat` 비용은 묻힙니다.

- 우선순위: **파일 > `BOT_SYSTEM_PROMPT` > 코드 기본값**
- 상대 경로는 **저장소 루트 기준**(CWD 아님). CWD 기준이면 다른 디렉터리에서 uvicorn 을
  띄웠을 때 조용히 기본값으로 떨어집니다.
- 한 번 읽은 뒤 파일이 사라지면 **마지막 값을 유지**합니다. 에디터가 "임시 파일에 쓰고
  rename" 으로 저장하는 찰나를 견디기 위해서입니다.

### `templates.py`

**의미 검색이 아닙니다.** 글자 바이그램 자카드 유사도라 표현이 겹치면 찾지만 의역은
못 잡습니다. 의도한 것은 시임이고, pgvector/FAISS 로 바꿀 때 갈아끼울 곳은
`TemplateStore.search` 하나입니다.

**실천 빈도(`FREQUENCY_LABELS`)의 출처가 여기입니다.** `daily`(주 7회) /
`weekly`(주 1회) / `none`(단 한 번) 셋뿐이고, 예전의 `type`(`mission`/`mindset`)과
`is_recurring` 을 대체합니다. `Template` 이 이 어휘를 쓰는 쪽이라 여기 두었습니다 —
`goal.py` 가 스키마와 채팅 문구를 만들 때 가져다 씁니다(반대 방향은 순환입니다).

- **카탈로그가 빈도를 들고 있어야 합니다.** 없으면 모델이 `recommend` 할 때마다
  제목만 보고 주기를 새로 추측해서, 같은 과제가 부를 때마다 다르게 담깁니다.
  그래서 `as_prompt_line()` 이 후보 줄에 `frequency` 를 실어 보냅니다.
- 라벨 문자열은 `static/js/board.js` 와 **똑같아야** 합니다. 말풍선과 보드에 같은
  과제가 다른 이름으로 보이면 안 됩니다.
- 모르는 값은 경고하고 `none` 으로 떨어집니다. 조용히 넘기면 "추천 과제만 늘
  한 번짜리로 담긴다" 는 증상으로만 드러나서 원인을 찾기 어렵습니다.
- **세 값 사이의 주기는 없습니다.** 월간·분기를 표현할 수 없어서 카탈로그 제목도
  세 버킷에 맞게 맞춰 두었습니다. 제목이 "월 1회" 라고 말하는데 빈도가 `none` 이면
  **모델은 제목을 읽고 배웁니다** — 표현할 수 없는 주기를 따라 만들기 시작합니다.
  `분기`·`월 1회`·`주 3회` 같은 표현이 다시 들어오면 테스트가 잡습니다.

도메인별 개수를 세는 헬퍼는 **일부러 두지 않았습니다.** 세면 `<existing_domain_tasks>`
와 같은 모양이 나와 꽂고 싶어지는데, 그러면 용량 규칙이 사용자 보드가 아니라 카탈로그
크기로 걸립니다. 둘은 범위가 다릅니다(전역 카탈로그 vs 사용자별 보드).

### 도메인 — 고정 목록이 없습니다

**서버는 도메인 목록을 모릅니다.** 도메인은 사용자 시트(`sheet` → `domain`)마다 다른
자유 문자열이고 사용자가 직접 만들 수 있으며, **AI 도 없는 칸을 새로 제안할 수 있습니다**
(기획 결정). 그래서 서버가 아는 유일한 방법은 클라이언트가 `join` 에 실어 보내는 것입니다.

```
join { domains: [{ domainId, title, subjectCount }] }   ← Spring 시트 응답과 같은 이름
  → session.py  bots.set_domains()        ← ensure() 뒤에 (앞이면 _forget 이 지웁니다)
  → BotManager  _domains[room_id]
  → GoalPipeline.run(history, domains)
       ├─ <domain_list> 슬롯 — 1·3단계 양쪽에 주입
       ├─ <existing_domain_tasks> ← subjectCount (정원 규칙이 여기서 처음 실제로 동작)
       └─ _mark_new_domain() → domain_is_new / domain_id
```

지켜야 할 것:

- **`domain` 에 enum 을 걸지 마세요.** 양쪽 스키마 모두입니다. 걸면 AI 의 새 도메인
  제안이 스키마에서 막힙니다. 예전에 8칸 enum 이 있었고, 없앤 지금은 모델이 `학습`
  대신 `"learning"` 같은 값을 낼 수 있지만 피해가 작습니다 — 그 값은 후보 검색의
  **가점**(`DOMAIN_BONUS`)에만 쓰이고 필터가 아니라서 후보가 사라지지 않습니다.
- **"새 칸인가" 를 모델에게 묻지 마세요.** `join` 목록과 비교하면 서버가 아는 값입니다
  (`_mark_new_domain`). 모델에게 물으면 틀린 날 이미 있는 칸이 하나 더 생깁니다.
  기존 칸이면 `domain_id` 를 실어 보내 프론트가 `subject` 를 만들 때 쓰고, 없으면
  `domain` 행을 먼저 만들라는 신호입니다.
- **도메인 이름은 사용자가 만든 값입니다.** 그대로 프롬프트에 들어가므로 `fill_slots`
  의 이스케이프에 의존하고, 분량은 `schemas.py` 의 `MAX_DOMAINS`(16) ·
  `MAX_DOMAIN_TITLE_LENGTH`(40)가 자릅니다. 없으면 도메인 1,000개로 진짜 지시문을
  주의 밖으로 밀어낼 수 있고 그 비용이 매 발화마다 청구됩니다.
- **캐시 키에 목록이 들어갑니다.** 파이프라인은 `BotManager` 가 하나만 만들어 방마다
  공유하므로, 빼면 A 사용자의 결과가 칸이 다른 B 에게 나갑니다.

**이모지·설명은 없습니다.** 예전에는 `domains.py` + `prompts/domains.json` 이 8칸의
이모지와 "왜 이 칸인가" 설명을 들고 있었는데, 자유 이름이 되면서 매칭될 근거가
사라져 삭제했습니다. 그 자리에 `render()` 가 **새 칸 여부**를 알려줍니다 — 사용자가
알아야 하는 건 "왜 이 칸인가" 가 아니라 "칸이 새로 생기는가" 입니다.

### `voice.py`

```
tracks["audio"] ─relay─▶ 48kHz 스테레오 ─리샘플─▶ 16kHz 모노 PCM ─▶ WAV ─opus─▶ 업로드
```

**SFU 구조라서 가능한 기능입니다.** 서버가 이미 Opus 를 디코드해 PCM 을 쥐고 있어서
별도 STT 단계가 없습니다. Mesh 였다면 서버에 미디어가 없어 불가능했습니다.

- `VoiceCapture` 는 상태를 가진 리샘플러와 버퍼를 들고 있어 **재사용하면 이전 발화가
  섞입니다.** 발화마다 새로 만드세요.
- `relay.subscribe()` 를 넘깁니다. 원본에서 직접 당기면 다른 참가자에게 갈 프레임을
  가로챕니다.
- 0.3초(`MIN_SECONDS`) 미만은 버립니다(버튼 오조작).
- Opus 인코딩 실패는 치명적이지 않습니다 — WAV 로 폴백합니다.

---

## `app/api/` — REST 점검 엔드포인트

| 파일 | 줄 | 엔드포인트 |
|---|---|---|
| `rooms.py` | 57 | `/api/health`, `/api/ice-servers`, `/api/rooms`, `/api/rooms/{id}` |
| `bot.py` | 133 | `/api/bot`, `/api/bot/prompt`, `/api/bot/ask`, `/api/bot/probe-audio` |

**라우터가 둘로 갈려 있습니다.** `router` 는 `/api/health` 만 담고 항상 등록됩니다
(로드밸런서 헬스체크). 나머지 전부는 `debug_router` 이고 `DEBUG_API_ENABLED=true`
일 때만 등록됩니다 — 끄면 OpenAPI 문서에도 나오지 않습니다.

갈라낸 이유는 **인증이 없기 때문**입니다. 열어두면 주소만 아는 누구나 LLM
크레딧을 태우고(`/api/bot/ask`, `/probe-audio`), 프롬프트 전문을 읽고, TURN
자격증명을 가져가고(`/api/ice-servers`), 접속 중인 사용자를 열거할 수 있습니다
(`/api/rooms` — 사용자별 방을 쓰는 지금은 **방 이름이 곧 사용자 식별자**입니다).

시그널링은 WebSocket 이라 밖에서 들여다보기 어렵습니다. **디버깅할 때 제일 먼저
두드리는 곳입니다.**

- `/api/rooms/{id}` 의 `participants[].publishing` — 서버가 그 사람의 미디어를 실제로
  받고 있는가
- `/api/bot/prompt` — 지금 모델에 들어가는 프롬프트 전문. `source` 가 `settings` 면
  파일을 못 찾은 것
- `/api/bot/probe-audio` — 마이크·WebRTC 를 건너뛰고 오디오 업로드 경로만 시험

> **기본값은 꺼짐입니다.** `.env` 에 `DEBUG_API_ENABLED=true` 를 넣어야 위 넷이
> 나타납니다. `main.py` 의 `_warn_about_unsafe_config()` 가 켜져 있을 때 기동 로그에
> 경고를 남깁니다 — 인증 꺼짐·진단 API 열림·음성 덤프 켜짐 셋 다 **로그를 안 보면
> 모른다**는 공통점이 있습니다.

---

## `prompts/` — 콘텐츠

| 파일 | 줄 | 역할 |
|---|---|---|
| `system.md` | 135 | 3단계 판단 프롬프트 → Gemini `systemInstruction` |
| `classify.md` | 70 | 1단계 분류 프롬프트 |
| `templates.json` | 31 | 예시 과제 22건 (2단계 검색 대상) |

**프롬프트는 코드가 아니라 콘텐츠입니다.** 고치고 저장하면 **재시작 없이** 다음 응답부터
반영됩니다.

작성 규칙:

- `system.md` 의 `<...>` 태그 이름이 곧 슬롯 이름입니다. 안쪽에 무슨 설명을 적어두든
  `fill_slots()` 가 통째로 대체합니다.
- 태그를 **설명하려고** 언급할 때는 `&lt;user_utterance&gt;` 처럼 이스케이프하세요.
  날것으로 쓰면 슬롯으로 오인됩니다.
- **예시의 길이가 곧 모델 출력의 길이입니다.** `reasoning` 예시를 장황하게 쓰면 모델도
  장황해지고 토큰이 잘립니다. **40자** 이하로 유지하세요 — 프롬프트가 선언한 상한과
  같은 값이고 테스트가 강제합니다.
- **예시에 숫자를 쓰지 마세요. 모델이 그 숫자를 베낍니다.** 실측(2026-07-30)에서
  `<existing_domain_tasks>` 가 `(집계 없음)` 인데도 출력 `reasoning` 에 예시의
  `"5/8"` 이 그대로 나왔고, `domain_confidence` 는 예시의 `0.95` 가 나왔습니다
  (그래서 그 필드를 없앴습니다). 후보 줄에는 유사도 점수가 실려 가지 않으므로
  `"유사도 0.88"` 같은 값도 모델이 지어낸 것입니다.
  - **슬롯 안쪽의 숫자는 안전합니다.** `<existing_domain_tasks>{{... 예: {"커리어":3}}}`
    처럼 태그 안에 적은 값은 `fill_slots()` 가 통째로 대체해 모델에 닿지 않습니다.
    위험한 것은 대체되지 않는 자리 — `<examples>` 와 `<instructions>` 입니다.
- `action` / `intent` / `frequency` 값을 추가하면 `goal.py` 의 스키마도 같이 고쳐야
  합니다. **한쪽만 고치면 테스트가 실패합니다** — 의도된 가드입니다.
- **`<domain_list>` 에 도메인 이름을 적지 마세요.** 슬롯입니다 — 사용자 시트의 칸
  목록이 `join` 으로 들어와 채웁니다. 파일에 박아두면 남의 시트 기준으로 분류합니다.

---

## `static/` — 프론트엔드 (빌드 도구 없음)

| 파일 | 줄 | 역할 |
|---|---|---|
| `index.html` | 57 | 단일 화면(로비 없음). 과제 보드 + 아바타 + 대화 패널 |
| `js/app.js` | 446 | 와이어링, 고정 `ROOM_ID='solo'`, 푸시투토크, 과제 인계 |
| `js/board.js` | 321 | `TaskBoard` — 담아둔 과제의 상태·저장·렌더링 |
| `js/rtc.js` | 145 | `SfuClient` — 업스트림 PC 1개, 채팅 DataChannel |
| `js/signaling.js` | 79 | WebSocket 래퍼 (메시지 타입 → DOM 이벤트) |
| `js/ui.js` | 142 | DOM 렌더링만. WebRTC 도 시그널링도 없음 |
| `css/style.css` | 470 | 만다린 디자인 시스템 (호스트 앱과 같은 토큰) |

**1인 전용 AI 음성봇 화면 하나입니다.** 카메라를 쓰지 않고(`getUserMedia({audio})`)
화상 그리드도, **다운스트림 구독도 없습니다.** 방에 있는 다른 참가자는 AI 봇
하나뿐이고 봇은 미디어를 보내지 않으므로 받을 트랙이 없습니다 — `SfuClient` 에는
업스트림 PeerConnection 하나와 채팅 DataChannel 만 남았습니다.

**백엔드는 손대지 않았습니다.** `SubscriberSession` 도 `subscribe` 시그널링도 그대로
있습니다. 다자간 화면이 필요해지면 브라우저에만 되살리면 되고, 서버는 이미 준비돼
있습니다(`tests/test_media_relay.py` 가 팬아웃 경로를 계속 검증합니다).

### 스타일 — 호스트 앱과 같은 디자인 시스템

`style.css` 는 만다린 프론트엔드의 `index.css`(Tailwind `@theme`) 토큰을 그대로 옮긴
것입니다. 이 화면은 호스트 앱 안에서 열리거나 그 앱에서 넘어오기 때문에, 여기만
다크 테마면 같은 서비스로 보이지 않습니다.

- **변수 이름을 저쪽과 똑같이 두었습니다**(`--color-brand`, `--color-success` …).
  색을 바꿀 때 두 파일을 나란히 놓고 비교할 수 있어야 합니다.
- `:root` 의 `font: 18px/145%` 도 같은 값입니다. Tailwind 의 `rem` 이 이 크기로
  계산되므로, 여기 `rem` 값들이 저쪽 `text-sm`/`text-xl` 과 실제로 같아집니다.
- 반복되던 유틸 조합(`.friends-panel`, `.friends-primary-action`)은 같은 값의 순수
  CSS 클래스로 다시 썼습니다. **이 프로젝트에는 빌드 도구가 없습니다** — Tailwind 를
  들이면 `static/` 을 그냥 서빙하던 구조가 깨집니다.
- 쓰지 않는 토큰(`--color-warning`, `--color-gold`, `--color-text-muted`)도 남겨
  두었습니다. 팔레트를 반쪽만 옮겨두면 다음에 요소를 추가할 때 여기 없는 색을
  새로 만들어 쓰게 됩니다.

연결 순서가 중요합니다.

```
getUserMedia → WebSocket 연결 → join → welcome 수신 → 그때 받은 iceServers 로 publish
```

`publish` 를 `welcome` 이후로 미루는 이유는 **TURN 자격증명이 `welcome` 에 실려 오기**
때문입니다. 먼저 시작하면 ICE 설정이 빈 채로 협상이 돌아갑니다.

주의점:

- `sendChat()` 은 DataChannel 과 WebSocket 양쪽에서 **같은 봉투**를 씁니다. 서버가
  `chat_text()` 로 벗깁니다.
- 마이크 on/off 는 트랙 제거가 아니라 `track.enabled` 만 바꿉니다. 재협상을 피하는
  대신 서버가 알 수 없어 `media-state` 로 따로 알려야 합니다.
- 푸시투토크는 `publisher-state === 'connected'` 전까지 잠깁니다. 트랙이 존재해도
  ICE/DTLS 가 끝나기 전에는 RTP 가 흐르지 않아 프레임이 0개로 끝납니다.
- **시그널링 재연결은 없습니다.** 끊기면 새로고침이 정답입니다.

### `board.js` — 담아둔 과제

AI 가 `recommend` / `generate` 를 돌려주면 말풍선 아래에 **담기 버튼**이 붙고, 누르면
왼쪽 보드로 들어갑니다. 자동으로 담지 않는 이유는 프롬프트의 `no_autocomplete`
규칙입니다 — 추천과 초안 생성까지만 하고 최종 확정은 사용자가 합니다.

- **저장소는 localStorage 입니다.** 과제를 받아줄 DB 가 아직 없어서입니다. 서버로
  옮길 때 갈아끼울 곳은 `#load` / `#save` 두 개이고, 그때 `GoalPipeline(task_counts=...)`
  에 도메인별 개수를 넘기면 프롬프트의 `domain_capacity` 규칙도 같이 살아납니다.
- 도메인당 8개(`DOMAIN_CAPACITY`)에서 막습니다. `prompts/system.md` 의
  `domain_capacity` 와 같은 값입니다 — **담고 나서야 초과를 알면 늦습니다.**
- 담김·삭제·초과는 전부 **채팅 로그에 남깁니다.** 왼쪽 패널만 조용히 바뀌면 방금
  무슨 일이 일어났는지 시선이 따라가지 못합니다.
- 삭제에 확인 대화상자를 두지 않았습니다. 지우기가 번거로우면 잘못 담은 과제를
  그냥 두게 되고 보드가 금방 지저분해집니다.

**연결 종료는 인계입니다.** 저장할 곳이 없는 동안에는 이 화면이 결과를 들고 나가는
것 자체가 전달 방법이라, 나가면서 보드를 비우지 않습니다. `leave()` 가 세 경로를
모두 시도합니다.

```
1. 팝업/iframe 으로 열렸다  → postMessage({type:'mandarin:tasks', tasks})
2. 같은 오리진의 페이지다   → localStorage('mandarin.tasks.v1') 를 읽으면 됨
3. 그 외                    → 뒤로 가기만 (데이터는 1·2 로 이미 전달)
```

`snapshot()` 이 넘기는 모양에서 `emoji`·`domainDescription`·`id` 는 빠집니다. 받는
쪽이 저장할 값과 그리기 위한 값을 구분하지 못하면 이모지가 DB 컬럼으로 굳습니다.

> **다른 오리진에서 평범한 링크로 넘어온 경우**(React 개발 서버 `:3000` → 여기
> `:8080`)에는 1도 2도 성립하지 않습니다. 돌아갈 URL 이 확정되면 쿼리스트링이나
> 인계 키로 실어 보내야 합니다. `postMessage` 의 `targetOrigin` 도 지금은 referrer
> 에서 추측하고 있으니, 호스트 주소가 정해지면 상수로 고정하세요.

---

## `tests/` — 272개

| 파일 | 개수 | 대상 |
|---|---:|---|
| `test_bot_goal.py` | 99 | 목표 파이프라인, 인젝션 방어, 유해 발화, 슬롯 치환 |
| `test_auth.py` | 30 | 티켓 검증, 방 배정, 설정 실수, 핸드셰이크 |
| `test_bot_frequency.py` | 27 | 실천 빈도 3종, 폐지 어휘 잔존, 프롬프트↔스키마·제목 일치 |
| `test_bot.py` | 22 | 봇 생명주기, 히스토리, 백엔드 3종 |
| `test_bot_prompt.py` | 20 | 프롬프트 파일 로딩, 무재시작 반영 |
| `test_voice.py` | 16 | 캡처, 리샘플, Opus 인코딩 |
| `test_media_relay.py` | 14 | 미디어 릴레이 E2E, `chat_text()` |
| `test_debug_api.py` | 13 | 진단 API 기본 차단, TURN 자격증명 노출 |
| `test_bot_api.py` | 7 | `/api/bot` 계열 |
| `test_signaling.py` | 6 | WebSocket 입구, 방 이름 검증 |
| `test_schemas.py` | 6 | 메시지 파싱 |
| `test_rooms.py` | 5 | 정원, 방 폐기 |
| `test_ice.py` | 4 | 후보 파싱 |
| `test_api.py` | 3 | health, rooms |

`test_media_relay.py` 는 실제 aiortc 피어 두 개를 띄워 `publisher → SFU → subscriber` 로
비디오 프레임이 도달하는지 검증합니다. 루프백만 있는 환경에서는 ICE 후보를 모을 수
없어 자동 skip 됩니다.

**프롬프트 관련 테스트는 문구를 검사하지 않습니다.** 프롬프트는 사람이 계속 고치는
콘텐츠라, 문구를 단정하면 다듬을 때마다 테스트가 깨집니다. 대신 **구조**를 검사합니다 —
슬롯 존재, 스키마와 문서의 일치, 예시 길이 상한 같은 것들.

---

## `coturn/` · 배포 파일

| 파일 | 역할 |
|---|---|
| `coturn/turnserver.conf` | TURN 서버 설정. `external-ip` 와 `user` 를 실제 값으로 |
| `Dockerfile` | python:3.12-slim + 네이티브 미디어 런타임, 비루트 실행 |
| `docker-compose.yml` | sfu + coturn. `network_mode: host` |
| `Makefile` | `install` / `dev` / `run` / `test` / `lint` / `docker` |

**`--workers 1` 고정**입니다. 룸과 미디어 파이프라인이 프로세스 메모리에 있습니다.

**Windows 에서는 Docker 경로가 동작하지 않습니다.** `network_mode: host` 를 Docker
Desktop for Windows 가 지원하지 않아서, 로컬 uvicorn 실행만 가능합니다.

`make` 자체가 Windows 에 없고, `Makefile` 은 **venv 가 활성화돼 있다고 가정합니다.**
conda base 등에서 그냥 `uvicorn` 을 부르면 `ModuleNotFoundError: pydantic_settings` 가
납니다. 인터프리터를 직접 지목하면 활성화 없이도 확실합니다.

```powershell
.venv\Scripts\python.exe -m app --reload     # 포트는 .env 의 PORT
```

`uvicorn` 을 직접 부를 때는 `--port` 를 반드시 주세요. 빠뜨리면 uvicorn 기본값(8000)에
붙는데 기동 로그는 `.env` 의 설정값을 출력해서 로그와 실제 포트가 어긋납니다.

---

## 무언가를 바꾸려면

| 하고 싶은 것 | 건드릴 곳 |
|---|---|
| 봇 인격·규칙 수정 | `prompts/*.md` — 재시작 불필요 |
| 예시 과제 추가 | `prompts/templates.json` — 재시작 불필요 |
| 도메인 목록 변경 | 클라이언트가 `join` 에 싣는 값. 서버·프롬프트 수정 없음 |
| 실천 빈도 값 추가·수정 | `app/bot/templates.py` 의 `FREQUENCY_LABELS` + `prompts/system.md` + `board.js` |
| 과제 저장소를 서버로 | `static/js/board.js` 의 `#load` / `#save` |
| 담은 과제를 넘길 곳 지정 | `static/js/app.js` 의 `handOffTasks()` / `goBack()` |
| 시그널링 메시지 추가 | `app/schemas.py` + `app/signaling/session.py` |
| LLM 제공자 교체 | `.env` 의 `BOT_PROVIDER` (코드 수정 없음) |
| 의미 검색 도입 | `app/bot/templates.py` 의 `TemplateStore.search` |
| 사용자 과제 수 연동 | `GoalPipeline(task_counts=...)` |
| 네이티브 SFU 로 교체 | `app/media/engine.py` 의 `MediaEngine` |
| 인증 클레임·알고리즘 변경 | `.env` 의 `AUTH_*` (코드 수정 없음) |
| 다자간 화면 추가 | `static/js/rtc.js` 에 구독 PC + `static/js/app.js` 에 peer 추적 (백엔드는 이미 지원) |
| 수평 확장 | 룸 상태를 Redis 로, 방 단위 sticky, 노드 간 pub/sub |
