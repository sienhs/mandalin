# 설계 노트

`ai_livekit` 를 고칠 때 먼저 읽을 것들입니다. 사용법은 [README.md](README.md) 에 있고,
이 문서는 그걸 반복하지 않고 **다시 논의하지 않아도 되는 결정**과 **조용히 실패하던
것들**만 적습니다.

## 1. 확정된 결정

| 결정 | 이유 |
|---|---|
| TTS 도입 안 함 | 응답은 텍스트로만. 에이전트가 오디오를 발행하지 않습니다 |
| `AgentSession` 안 씀 | LLM 자리에 3단계 파이프라인이 들어가 맞지 않고, TTS 가 없어 조율할 출력도 없습니다 |
| STT 는 Deepgram | 스트리밍이라 발화 경계를 자기가 판단하므로 VAD 가 필요 없고, 무료 크레딧 $200 에 한국어를 지원합니다 |
| `STT_LANGUAGE=ko` | `multi` 에 한국어가 없어서 일본어나 중국어로 전사됩니다 |
| 푸시투토크(10초 창) | 상시 청취는 침묵도 과금하고 잡음 구분 장치가 필요해집니다. 사람이 창을 열고 닫으면 둘 다 사라집니다 |
| 벡터 DB 안 씀(아직) | 중복 문제의 원인이 아니었습니다(3절) |
| `web/` 에 빌드 도구 없음 | `livekit-client` 를 CDN ESM 으로. 정적 파일을 그냥 서빙합니다 |
| 프롬프트 정본은 `prompts/` | 모델에게 가는 텍스트가 코드와 파일로 갈리면 두 곳이 서로 다른 말을 합니다(`tests/test_prompts_are_one_folder.py`) |

파이프라인(`mandarin_goal/`)은 전송 계층을 모릅니다. 새 코드에서 `mandarin_goal.` 을
직접 import 하지 말고 `agent/reuse.py` 를 통하세요 — 다음에 또 옮길 때 고칠 곳이 한
파일이어야 하기 때문입니다. `tests/test_reuse.py` 가 소스를 훑어 이 규칙과 "외부 `app`
패키지를 import 하지 않는다" 를 같이 지킵니다.

## 2. 조용히 실패하던 것들

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
| 빈도 판별이 안 됨 | 프롬프트의 `"세 가지만 판단한다"` 때문에 모델이 뒤 절을 건너뜀 | 없음. 문구가 근거라 `prompts/classify.md` 를 고칠 때 주의 |
| Spring 시트의 빈도가 통째로 사라짐 | 전송 이름이 어긋남. Spring 은 `period`, AI 는 `frequency` 만 받았음 | `test_sheet_transfer.py` |

마지막 줄은 아직 안 터진 상태에서 찾은 것입니다. metadata 를 만드는 곳이
`scripts/dev_server.py` 뿐이었고 거기서 `frequency` 로 적어 두어서, 실서버와 브라우저와
테스트가 모두 통과하면서 Spring 을 붙이는 순간에만 빈도가 사라질 예정이었습니다.
`SubjectRef` 가 `period` 를 정본으로 받고(`mandarin_goal/sheet.py`), `dev_server` 와
`test_sheet_transfer.py` 의 fixture 는 Spring 응답 모양을 씁니다.

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

## 3. 중복 문제는 벡터 DB 가 아니었습니다

내 시트에 비슷한 유형이 있는데 다시 넣을 수 있다는 문제를 조사한 결과입니다. 로그가
답이었습니다.

```
goal/retrieve 후보 3건: [3, 4, 11]
goal/decide action=recommend '이미 담은 과제와 같은 목표'   ← 검색과 판단 모두 정확
시트 수신 ... 과제=4개                                    ← 그런데 늘어남
```

검색과 판단은 맞았고 프론트가 중복을 만들었습니다(2절의 5, 6번 항목). 벡터 DB 를 먼저
붙였다면 인프라만 늘고 중복은 그대로였을 것입니다. 후보에 아예 없었던 게 아니니까요.
**재기 전에 고치지 않습니다.**

벡터 DB 가 필요해지는 시점은 어휘 자체가 다른 의역이 새기 시작할 때입니다
(`"코테 준비"` 와 `"알고리즘 문제 풀기"`). 갈아끼울 곳은
`mandarin_goal/bot/subjects.py` 의 `search()` 하나이고, 1단계가 만드는 `what` 은 벡터
검색에서도 더 좋은 질의라 버려지지 않습니다.

## 4. 남은 일

| | 성격 |
|---|---|
| 새로고침 후 시트 유지(localStorage) | `web/app.js` 에 저장·복원 경로가 없습니다 |
| 과제 삭제 | 담기만 있고 빼기가 없습니다 |
| 담은 과제 인계(`postMessage`) | 부모 페이지로 넘기는 경로 |
| React 프론트 이식 | `../frontend/src/components/aiCoach/` 의 `signaling.ts` 와 `sfuClient.ts` 를 버리고 `livekit-client` 로. `taskBoard.ts` 와 패널은 그대로 |
| 인증 | Spring 이 LiveKit access token 을 서명하면 검증은 LiveKit 서버가 하므로 이쪽에 검증 코드가 필요 없어집니다 |
| EC2 배포 | `--node-ip`, 포트, TLS, `--dev` 금지. README "포트" 절 |
| LLM 동시성 제한 | worker 를 여러 개 띄우면 동시 요청도 같이 늘어납니다 |
