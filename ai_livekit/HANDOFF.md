# 인수인계 (2026-08-01)

`../ai` 의 자체 SFU 를 LiveKit 으로 옮기는 작업입니다. 실제 브라우저에서 음성과 텍스트
대화가 돌아가고, `../ai` 없이 이 폴더만으로 돕니다(2절).

세부 사용법은 [README.md](README.md) 에 있습니다. 이 문서는 그걸 반복하지 않고 지금
어디까지 왔는지, 왜 이렇게 됐는지, 무엇이 남았는지만 적습니다.

## 1. 지금 돌아가는 것

| | 상태 |
|---|---|
| LiveKit 서버(Docker `--dev`) | 로컬에서 동작 확인 |
| 에이전트 worker(`python -m agent dev`) | 동작 확인 |
| 브라우저 프론트(`web/`, :8000) | 동작 확인 |
| 텍스트 대화에서 3단계 파이프라인을 거쳐 응답까지 | 실서버 |
| 음성(Deepgram STT)에서 전사를 거쳐 파이프라인까지 | 실서버 |
| 시트를 토큰 metadata 로 받아 중복 검사 | 실서버 |
| `../ai` 없이 전체 왕복 | 실서버. venv 에서 `webrtc-sfu` 제거 후 |
| Gemini(SSAFY 게이트웨이) 실제 응답 | 실서버 |
| 담기 결과가 다음 턴 중복 검사에 반영 | 실서버 |

테스트는 `ai` 334개(+1 skip), `ai_livekit` 72개이고 양쪽 lint 를 통과합니다.
미확인 항목은 없습니다. 아래가 수단별 근거입니다.

<details>
<summary>검증 수단별 목록</summary>

LiveKit 1.13.5(`--dev`, Docker), `livekit-agents` 1.6.7, `scripts/smoke_client.py` 로
확인했습니다.

| | 수단 |
|---|---|
| 파이프라인이 전송 스택 없이 import | 테스트(import 차단) |
| 텍스트 턴이 `classify → retrieve → decide` 통과 | 테스트(`echo` 백엔드) |
| 시트 JSON 을 `DomainRef` 로(Spring 모양, 상한, 폴백) | 테스트 11개 |
| 대화 규율(버리기, 타임아웃, 실패 복구, 히스토리) | 테스트 10개 |
| 전사 태스크 레지스트리(mute/unmute 경합, 누수) | 테스트 6개 |
| 이벤트 인자 순서 | 테스트 8개. SDK `emit` 과 대조 |
| Deepgram API 이름(`SpeechEventType` 등) | 설치 패키지 introspection |
| `../ai` 없이 전체 왕복 | 실서버. venv 에서 `webrtc-sfu` 제거 후 |
| `entrypoint.py` 의 LiveKit API 와 텍스트 왕복 | 실서버 |
| 시트가 후보 검색까지 도달 | 실서버. `후보 3건: [3, 4, 11]` |
| 한국어 전사(`language=ko`) | 실서버. `'매일 알고리즘 문제 풀고 싶어'`, 3.7초 |
| 푸시투토크 10초 자동 종료와 과금 정지 | 실서버. 타이머 10.0초, 중지 후 3분 13초간 `stt usage` 0건 |
| Gemini 게이트웨이 경유 실제 응답 | 실서버. `recommend` 와 `generate` 양쪽 |
| 담은 과제가 다음 턴 후보에 포함 | 실서버. `후보 4건: [12, 3, 4, 11]` |
| 1단계 `what`/`frequency` 정규화 | 실서버. `freq=daily query='알고리즘 문제 풀기'` |
| LLM 실패 원인이 채팅에 노출 | 실서버. `API key not valid` 가 사용자에게 전달됨 |
| 음성 꺼짐 fail-open(텍스트 유지) | 실서버와 브라우저 |
| 오조작 가드(0.3초), `hello` 마이크 잠금, `listening` 표시 | 브라우저 |

자립 확인 왕복의 로그입니다. 로거 이름이 `app.bot.*` 에서 `mandarin_goal.bot.*` 으로
바뀐 것 말고 동작은 그대로이고, 프롬프트 경로가 이 저장소 안으로 들어온 것이 첫 줄에
보입니다.

```
mandarin_goal.bot.prompt | system prompt file: ...\ai_livekit\prompts\classify.md
agent.sheet_transfer     | 시트 수신 source=participant.metadata 도메인=2개 과제=2개
mandarin.listen          | STT 활성 model=nova-3 language=ko
mandarin_goal.bot.goal   | goal/classify intent=goal domain=학습
mandarin_goal.bot.goal   | goal/retrieve domain=학습 freq=daily query='알고리즘 문제 풀기' 후보 2건: [3, 4]
mandarin_goal.bot.goal   | goal/decide action=recommend reasoning='이미 담은 과제와 같은 목표'
```

</details>

## 2. 파이프라인을 물려받았고 지금은 자립합니다

`../ai` 의 목표 설계 파이프라인을 그대로 씁니다. 전환 중에는 옆 폴더를
`pip install -e ../ai --no-deps` 로 참조하는 임시 배치였는데, 2026-08-01 에 여섯 파일과
프롬프트를 이 저장소로 들여와 그 의존을 끊었습니다.

```
ai_livekit/mandarin_goal/   파이프라인. 전송 계층을 모릅니다
ai_livekit/prompts/         프롬프트 정본
ai_livekit/agent/reuse.py   파이프라인을 import 하는 유일한 통로
```

- 물려받음: `bot/{goal,llm,prompt,subjects}.py`, `config.py`, `sheet.py`, `prompts/`
- 버림: `media/`, `signaling/`, `rooms/`, `chat/`, `bot/voice.py`, `bot/manager.py`
- 새로 씀: worker 배선, STT, 시트 전달, 프론트

새 코드에서 `mandarin_goal.` 을 직접 import 하지 마세요. `agent/reuse.py` 를 통해야
합니다. 다음에 또 옮길 때(공용 라이브러리로 배포 등) 고칠 곳이 한 파일이어야 하기
때문입니다. 옛 경로인 `from app.…` 은 `tests/test_reuse.py` 가 소스를 훑어 막습니다.

이제 두 벌이 되었습니다. `../ai/app/bot/` 과 `mandarin_goal/` 은 각자 정본이고 한쪽을
고쳐도 반대쪽에 반영되지 않습니다. 프롬프트도 마찬가지입니다. 옮겨오면서 덜어낸 것은
`config.py` 의 전송 계층 설정(`HOST`, `AUTH_*`, `STUN_URLS`, `BOT_VOICE_*` 등)뿐이고,
`extra="ignore"` 라서 `../ai/.env` 를 그대로 가져와도 기동은 됩니다.

`../ai` 는 손대지 않는 것이 원칙이었고 실제로 바뀐 것은 4절에 적은 것뿐입니다. 지금은
양쪽이 서로를 참조하지 않습니다.

## 3. 확정된 결정

다시 논의하지 않아도 되는 것들입니다.

| 결정 | 이유 |
|---|---|
| TTS 도입 안 함 | 응답은 텍스트로만. `../ai` 와 같은 모양이고 에이전트가 오디오를 발행하지 않습니다 |
| `AgentSession` 안 씀 | LLM 자리에 3단계 파이프라인이 들어가 맞지 않고, TTS 가 없어 조율할 출력도 없습니다 |
| STT 는 Deepgram | 스트리밍이라 발화 경계를 자기가 판단하므로 VAD 가 필요 없고, 무료 크레딧 $200 에 한국어를 지원합니다 |
| `STT_LANGUAGE=ko` | `multi` 에 한국어가 없어서 일본어나 중국어로 전사됩니다 |
| 푸시투토크(10초 창) | 상시 청취는 침묵도 과금하고 잡음 구분 장치가 필요해집니다. 사람이 창을 열고 닫으면 둘 다 사라집니다 |
| 벡터 DB 안 씀(아직) | 중복 문제의 원인이 아니었습니다(6절) |
| `web/` 에 빌드 도구 없음 | `livekit-client` 를 CDN ESM 으로. `../ai/static/` 구조 유지 |
| 프롬프트를 `ai_livekit/prompts/` 로 들여옴 | 원래는 `../ai/prompts/` 를 공유했습니다. 한 벌 유지가 자립보다 값싸지 않았습니다. 프롬프트 하나 때문에 옆 폴더가 필요했으니까요 |

## 4. `../ai` 에 실제로 한 변경

원칙은 손대지 않기였지만 여섯 가지가 필요했습니다. 모두 `../ai` 자체에도 이득입니다.

| 변경 | 왜 |
|---|---|
| `app/sheet.py` 신설 | `DomainRef` 와 `SubjectRef` 를 `schemas.py`(시그널링 계약)에서 분리. `bot/` 이 전송 계층을 import 하던 유일한 실을 끊었습니다 |
| `pyproject.toml` 에 `[build-system]` 과 패키지 탐색 | 그때는 `pip install -e ../ai` 에 필요했습니다. 지금은 그 설치를 안 하므로 되돌려도 됩니다. 저쪽 실행 방식은 어느 쪽이든 그대로입니다 |
| `SubjectRef.frequency` 검증 | 모델 출력은 enum 으로 묶여 있는데 클라이언트 입력은 아무 문자열이나 통과했습니다 |
| `FREQUENCIES` 상수 신설(`sheet.py`) | 런타임 어휘 상수가 테스트 파일에만 있어서 검증에 쓸 수 없었습니다 |
| `SubjectRef.frequency` 가 `period` 도 받음 | Spring 시트 응답의 이름이 `period` 인데 `frequency` 만 받아서 빈도가 조용히 `None` 이 됐습니다(5절 마지막 줄). 필드 이름을 안 바꾼 이유는 `frequency` 가 프롬프트와 responseSchema 의 낱말이라서입니다 |
| 1단계 정규화(`what`/`frequency`)와 `FREQUENCY_BONUS` | 검색이 원문을 질의로 쓰고 빈도를 안 봤습니다 |

프롬프트도 정리했습니다(`classify.md` −323자, `system.md` −154자). 비용 근거는 약합니다
(1,000건당 약 $0.04). 근거는 주의력과 지연입니다.

## 5. 조용히 실패하던 것들

남은 버그가 아니라 이미 잡은 것들입니다. 각 줄의 테스트가 재발을 막습니다. 여덟 개
전부 에러가 없고 증상이 품질 저하로만 드러나는 종류였습니다. 새로 손댈 때 이 목록을
먼저 읽으세요.

| 증상 | 원인 | 지키는 테스트 |
|---|---|---|
| worker 는 뜨는데 방에 안 들어옴 | 플러그인 import 를 함수 안에 둠. 메인 스레드에서만 등록 가능 | `test_listen.py` |
| 마이크를 껐는데 과금 계속 | `track_muted` 인자 순서. `Participant` 에도 `.sid` 가 있어 예외 없이 빗나감 | `test_event_signatures.py` |
| mute/unmute 반복 후 과금 안 멈춤 | 완료 콜백이 새 태스크를 지움 | `test_transcription_registry.py` |
| 마이크를 눌러도 무반응 | 서버가 음성 불가인데 알리지 않음 | `test_hello.py` |
| 같은 과제가 두 번 담김 | `recommend` 에 담기 버튼. `_STORABLE_ACTIONS` 무시 | 서버 상수는 `mandarin_goal/bot/goal.py`. 버튼 쪽 테스트는 없음 |
| 방금 담은 과제가 중복 검사에서 빠짐 | `subjectId: null` 이라 `to_candidates` 가 버림 | 없음(프론트) |
| 빈도 판별이 안 됨 | 프롬프트의 `"세 가지만 판단한다"` 때문에 모델이 뒤 절을 건너뜀 | `test_bot_prompt.py` |
| Spring 시트의 빈도가 통째로 사라짐 | 전송 이름이 어긋남. Spring 은 `period`, AI 는 `frequency` 만 받았음 | `test_sheet_transfer.py`, `../ai` 의 `test_sheet.py` |

마지막 줄은 아직 안 터진 상태에서 찾은 것입니다. metadata 를 만드는 곳이
`scripts/dev_server.py` 뿐이었고 거기서 `frequency` 로 적어 두어서, 실서버와 브라우저와
테스트가 모두 통과하면서 Spring 을 붙이는 순간에만 빈도가 사라질 예정이었습니다.
`SubjectRef` 가 `period` 를 정본으로 받게 하고(`../ai/app/sheet.py`), `dev_server` 와
`test_sheet_transfer.py` 의 fixture 는 Spring 응답 모양으로 고쳤습니다. 어휘 자체도
`SubjectPeriod.java` 를 읽어 대조합니다(`../ai/tests/test_bot_frequency.py`).

공통 교훈이 셋입니다.

1. `smoke_client.py` 가 통과해도 브라우저가 통과한다는 뜻은 아닙니다. 두 번 겪었습니다.
   `--node-ip` 누락(파이썬은 TCP ICE 폴백)과 좌초된 job(파이썬은 매번 새 방)입니다.
   브라우저는 따로 확인하세요.
2. 로그가 셋인데 서로 모르는 게 있습니다. LiveKit 서버 로그는 파이썬 예외를 모르고
   worker 로그는 브라우저 실패를 모릅니다. README 의 "로그가 셋입니다" 표를 보세요.
   worker 는 `worker.log` 에도 씁니다.
3. 대역(fixture, `dev_server`)이 실제 모양을 안 흉내내면 그 대역이 버그를 숨깁니다.
   Spring 자리를 채우는 값은 `GET /api/v1/sheets/{sheetId}` 응답의 필드 이름을 그대로
   써야 합니다. 편한 이름으로 적어 두면 초록불이 계약이 맞다는 뜻이 아니게 됩니다.
   위 표의 마지막 줄이 테스트와 실서버와 브라우저가 다 초록불인 채로 그렇게 숨어
   있었습니다.

## 6. 중복 문제는 벡터 DB 가 아니었습니다

내 시트에 비슷한 유형이 있는데 다시 넣을 수 있다는 문제를 조사한 결과입니다. 로그가
답이었습니다.

```
goal/retrieve 후보 3건: [3, 4, 11]
goal/decide action=recommend '이미 담은 과제와 같은 목표'   ← 검색과 판단 모두 정확
시트 수신 ... 과제=4개                                    ← 그런데 늘어남
```

검색과 판단은 맞았고 프론트가 중복을 만들었습니다(5절의 5, 6번 항목). 벡터 DB 를 먼저
붙였다면 인프라만 늘고 중복은 그대로였을 것입니다. 후보에 아예 없었던 게 아니니까요.
`../ai/LEARNING.md` 16절의 원칙이 그대로 유효합니다. 재기 전에 고치지 않습니다.

벡터 DB 가 필요해지는 시점은 어휘 자체가 다른 의역이 새기 시작할 때입니다
(`"코테 준비"` 와 `"알고리즘 문제 풀기"`). 갈아끼울 곳은
`mandarin_goal/bot/subjects.py` 의 `search()` 하나이고, 1단계가 만드는 `what` 은 벡터
검색에서도 더 좋은 질의라 버려지지 않습니다.

## 7. 남은 일

`freq` 와 `what` 이 Gemini 에서 실제로 채워지는지는 확인했습니다(2026-08-01,
`goal/retrieve domain=학습 freq=daily query='알고리즘 문제 풀기'`).

| | 성격 |
|---|---|
| 새로고침 후 시트 유지(localStorage) | `../ai/static/js/board.js` 의 `#load`/`#save` 이식 |
| 과제 삭제 | `../ai` 의 `board.js` 에 있습니다 |
| 담은 과제 인계(`postMessage`) | `../ai` 의 `handOffTasks()` 이식 |
| React 프론트 이식 | `signaling.ts` 와 `sfuClient.ts` 를 버리고 `livekit-client` 로. `taskBoard.ts` 와 패널은 그대로 |
| 인증 | Spring 이 LiveKit access token 을 서명하면 검증은 LiveKit 서버가 하므로 이쪽에 검증 코드가 필요 없어집니다 |
| EC2 배포 | `--node-ip`, 포트, TLS, `--dev` 금지. README "포트" 절 |
| LLM 동시성 제한 | `../ai` 부터 없던 항목입니다. worker 를 여러 개 띄우면 동시 요청도 같이 늘어납니다 |

## 8. 커밋 상태

이 시점까지 아무것도 커밋하지 않았습니다.

| | 상태 |
|---|---|
| `ai_livekit/` 전체 | untracked. `mandarin_goal/` 과 `prompts/` 포함 |
| `../ai/app/sheet.py`, `tests/test_sheet.py` | untracked(신규) |
| `../ai` 의 나머지 변경 14개 파일 | 워킹 트리 수정 |

브랜치는 `feat/voice` 입니다. 커밋 단위를 나눈다면 `../ai` 의 `sheet.py` 분리, `../ai` 의
시트 검증과 빈도 정규화, 문서 정리, `ai_livekit` 신규 이렇게 넷으로 갈리는 게
자연스럽습니다.

`.env` 는 양쪽 다 `.gitignore` 에 있습니다. `ai_livekit/.env` 에 Gemini 와 Deepgram 키가
들어 있으니 커밋되지 않는지 확인하세요. 2026-08-01 에 `ai_livekit/.gitignore` 를 임시
git 디렉터리로 검증했고, 제외되는 것은 `.env`, `.venv/`, `.claude/`, `.pytest_cache/`,
`.ruff_cache/`, `worker.log`, `__pycache__/` 이고 추적 대상은 37개 파일입니다.

## 9. 로컬 실행 요약

터미널 세 개입니다. 자세한 것은 README 의 "설치" 와 "실행" 을 보세요.

```powershell
# 1) LiveKit 서버. --node-ip 를 빼면 브라우저가 붙지 못합니다
docker run -d --rm --name lk-dev -p 7880:7880 -p 7881:7881 -p 7882:7882/udp `
  livekit/livekit-server --dev --bind 0.0.0.0 --node-ip 127.0.0.1

# 2) worker (ai_livekit 에서)
$env:PYTHONIOENCODING="utf-8"; .venv\Scripts\python.exe -m agent dev

# 3) 프론트와 토큰 발급 (Spring 자리)
.venv\Scripts\python.exe scripts\dev_server.py     # http://localhost:8000
```

worker 를 두 개 띄우지 마세요. job 이 나뉘어 배정돼서 증상이 간헐적이 됩니다.
`.env` 를 고쳤으면 옛 worker 를 반드시 끄세요.
