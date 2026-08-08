# ai_livekit

LiveKit 위에서 도는 목표 설계 에이전트입니다. 목표 설계 파이프라인은
`mandarin_goal/` 에 있고, 이 폴더만으로 돌아갑니다.

입력은 텍스트와 음성(Deepgram STT), 출력은 텍스트뿐입니다. TTS 는 넣지 않았습니다.
`AgentSession` 대신 프로그램적 참가자로 구현했고, 프레임워크에서는 job 수명주기와
방 접속만 씁니다.

기준 버전은 `livekit-agents` 1.6.7, LiveKit 서버 1.13.5, `livekit-client` 2.21.0 입니다.

이 문서는 사용법입니다. 확정된 결정의 근거와 이미 잡은 버그 목록은
[HANDOFF.md](HANDOFF.md) 에 있습니다.

## 구조

```
agent/          LiveKit 배선. livekit import 는 여기까지
  └ reuse.py    파이프라인으로 가는 유일한 통로
mandarin_goal/  목표 설계 파이프라인. 전송 계층을 모릅니다
prompts/        프롬프트 정본
web/            브라우저 프론트. 빌드 도구 없음
scripts/        진단, 스모크, 개발용 토큰 서버
```

| 파일 | 역할 | LiveKit |
|---|---|:---:|
| `mandarin_goal/` | 분류, 검색, 판단, LLM, 프롬프트, 시트 모델 | |
| `agent/reuse.py` | 파이프라인 import 통로 | |
| `agent/sheet_transfer.py` | 시트 수신과 파싱 | |
| `agent/conversation.py` | 대화 규율(히스토리, 동시성, 실패 처리) | |
| `agent/listen.py` | 오디오를 전사문으로. 전사 태스크 레지스트리 | 필요 |
| `agent/entrypoint.py` | worker 배선(`AgentServer`, 토픽, 이벤트) | 필요 |
| `agent/__main__.py` | `.env` 로딩, `worker.log`, worker 기동 | 필요 |
| `scripts/check_reuse.py` | 환경 진단 | |
| `scripts/smoke_client.py` | 파이썬 클라이언트로 왕복 확인 | 필요 |
| `scripts/dev_server.py` | 프론트 서빙과 토큰 발급. Spring 자리 | 필요 |

LiveKit 이 필요한 파일은 `entrypoint.py` 하나입니다. 나머지에 로직을 몰아둔 이유는
버그가 주로 파싱, 폴백, 동시성에서 나는데 그게 `livekit.agents` import 뒤에 숨으면
해당 패키지가 설치된 환경에서만 테스트할 수 있게 되기 때문입니다.

### 고칠 때 지킬 것

`mandarin_goal/` 에서 `livekit` 을 import 하지 마세요. 이 경계가 있으면 전송 계층을
통째로 갈아도 파이프라인을 고칠 일이 없습니다.

`mandarin_goal.` 을 직접 import 하지 마세요. `agent/reuse.py` 를 통합니다.

```python
from agent.reuse import GoalPipeline, DomainRef      # 이렇게
from mandarin_goal.bot.goal import GoalPipeline      # 이러지 말고
```

프롬프트의 상대 경로는 이 저장소 루트 기준으로 풀립니다(`prompt.py` 의 `PROJECT_ROOT`).
`./prompts/system.md` 는 `ai_livekit/prompts/system.md` 입니다. 파일을 고치면 재시작 없이
다음 응답부터 반영됩니다.

`tests/test_reuse.py` 가 소스를 훑어서 import 규칙과 "`app` 을 import 하지 않는다" 를
같이 지킵니다.

## 설치

```powershell
python -m venv .venv
.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
.venv\Scripts\python.exe scripts\check_reuse.py
```

`agent` 와 `mandarin_goal` 은 이 폴더 안의 패키지라 CWD 만으로 import 됩니다.
`pip install -e .` 는 필요 없습니다. 서드파티는 `livekit-agents`,
`livekit-plugins-deepgram`, `pydantic`, `pydantic-settings`, `httpx` 뿐입니다.

venv 에 `webrtc-sfu`(`app` 패키지)가 설치돼 있으면 지우세요.

```powershell
.venv\Scripts\python.exe -m pip uninstall webrtc-sfu
```

남겨두면 `app` 패키지가 import 가능한 채로 있어서, 새 코드에 `from app.…` 을 써도 이
환경에서만 통과합니다. `check_reuse.py` 가 남아 있으면 경고합니다.

## 실행

터미널 세 개가 필요합니다.

```powershell
# 1) LiveKit 서버
docker run -d --rm --name lk-dev -p 7880:7880 -p 7881:7881 -p 7882:7882/udp `
  livekit/livekit-server --dev --bind 0.0.0.0 --node-ip 127.0.0.1

# 2) worker
$env:PYTHONIOENCODING="utf-8"; .venv\Scripts\python.exe -m agent dev   # 운영은 start

# 3) 프론트와 토큰 발급 (Spring 자리)
.venv\Scripts\python.exe scripts\dev_server.py
```

브라우저에서 <http://localhost:8000> 을 열고 연결하기를 누릅니다. 왼쪽이 시트,
오른쪽이 대화창이고 텍스트를 보내면 응답과 `mandarin.goal` payload 가 같이 옵니다.

`--node-ip 127.0.0.1` 을 빼면 브라우저가 붙지 못합니다. [안 될 때](#안-될-때) 참고.

`dev` 에 자동 재시작은 없습니다. 핫리로드는 별도 도구(`lk agent dev`)가 합니다.

worker 를 두 개 띄우지 마세요. job 이 나뉘어 배정돼서 증상이 간헐적이 됩니다.

## 확인

```powershell
.venv\Scripts\python.exe -m pytest -q                                    # 125 tests
.venv\Scripts\python.exe -m ruff check agent mandarin_goal tests scripts
.venv\Scripts\python.exe -m mypy agent mandarin_goal scripts --ignore-missing-imports
.venv\Scripts\python.exe scripts\smoke_client.py "화 안 내는 사람이 되고 싶어"
```

`mypy` 는 **`tests/` 를 빼고** 돌립니다. 테스트 대역(`FlakyBackend` 등)이 프로토콜의 필요한
부분만 구현하는 것이 의도라서, 넣으면 그 11건이 매번 나와 진짜 신호를 덮습니다.
`--ignore-missing-imports` 는 `livekit.*` 에 타입 스텁이 없어서 필요합니다.

`entrypoint.py` 는 LiveKit API 를 호출하는 유일한 파일이라 단위 테스트로 덮을 수
없습니다. 배선을 고쳤으면 `smoke_client.py` 를 돌리세요. 다만 파이썬 클라이언트가
통과해도 브라우저가 통과한다는 뜻은 아닙니다. ICE 폴백과 방 재사용이 달라서
두 번 다르게 깨졌습니다. 브라우저는 따로 확인하세요.

| 테스트 파일 | 개수 | 대상 |
|---|---:|---|
| `test_conversation.py` | 11 | 생성 중 버리기, 타임아웃, 크래시 복구, 히스토리 상한 |
| `test_reuse.py` | 15 | 파이프라인 자립, 전송 스택 없이 import, 텍스트 턴 왕복, 인젝션 방어, 원문의 출처, 발화가 모델에 그대로 실리는지 |
| `test_sheet_transfer.py` | 13 | 시트 파싱. Spring 모양, 상한, fail-open, 폴백 |
| `test_listen.py` | 10 | STT fail-open, 플러그인 import 위치, 언어 기본값 |
| `test_event_signatures.py` | 13 | LiveKit 이벤트 인자 순서(SDK `emit` 과 대조). 이름이 아니라 **의미**로 대조하고, 뒤바뀐 SDK 를 주면 실제로 깨지는지까지 봅니다 |
| `test_stuck_loop.py` | 14 | 같은 되묻기 반복, 재요청에 "겹쳐요" 로 답하기, 꽉 찬 칸을 다음 턴에야 알리기 |
| `test_capacity_slot.py` | 11 | 꽉 찬 시트에서 담긴 과제가 프롬프트 슬롯에서 사라지지 않는지, 칸 이름·과제 제목이 저장 상한을 넘지 않는지 |
| `test_candidate_ranking.py` | 15 | 후보 검색 순위. 횟수가 순위를 가르는지, 가점이 필터가 아닌지, "안 말했다"와 "1이라고 말했다"를 가리는지 |
| `test_recommend_lookup.py` | 7 | 지목한 `subject_id` 를 후보 밖(시트 전체)에서도 찾는지, 없는 번호는 지어내지 않는지 |
| `test_violation_patterns.py` | 5 | eval 위반 지표의 정규식이 **실제로 나가는 로그 줄**과 맞는지(문구를 고치면 조용히 0 이 되는 결합) |
| `test_screenshot_fixtures.py` | 11 | 실측 화면(2026-08-08)을 재현하는 시트 픽스처가 **화면에 찍힌 응답**과 어긋나지 않는지 |
| `test_pipeline_wiring.py` | 8 | 가드를 `_run` 이 **실제로 부르는지**. 호출 한 줄을 지우면 깨진다(정적 메서드만 보던 테스트가 놓쳤던 자리) |
| `test_hello.py` | 13 | 세션 능력 알림. `voice:false` 필수, LLM 상태와 `BACKENDS` 표의 일치 |
| `test_history_reset.py` | 4 | 재입장하면 대화가 초기화되는지. 시트 상태는 남는지, 재입장 핸들러가 실제로 부르는지 |
| `test_shutdown_reason.py` | 3 | job 종료 사유를 사람 말로 옮기는지. 라이브러리의 `parent process shutdown` 오독 방지 |
| `test_single_user_room.py` | 12 | 사용자 1명 + 에이전트 1개. 발신자 대조, 오디오만 구독, `max_participants: 2`, 방 수명이 상속이 아닌지 |
| `test_transcription_registry.py` | 6 | mute/unmute 경합, 중복 시작, 누수 |
| `test_domain_authority.py` | 6 | 도메인 정본이 시트인지, 없는 칸을 만들지 않는지 |
| `test_prompts_are_one_folder.py` | 5 | 모델에게 가는 텍스트가 `prompts/` 에만 있는지, 슬롯이 제 자리에 채워지는지 |
| `test_versions_match.py` | 2 | compose 가 띄우는 LiveKit 서버 태그와 README 의 기준 버전이 같은지, 패치까지 고정됐는지 |
| `test_worker_limits.py` | 4 | 버스터블 baseline 에 맞춘 `load_threshold`·유휴 프로세스 수. 인스턴스를 바꾸면 실패합니다 |
| `test_topics_match.py` | 3 | 토픽 문자열이 서버·`web/app.js`·React 훅 세 곳에서 같은지(이름→값 짝으로) |

`test_event_signatures.py` 부터 `test_transcription_registry.py` 까지는 예외 없이
조용히 실패하던 버그에서 나왔습니다(HANDOFF 2절). 그래서 문구가 아니라 구조를
검사합니다.

## 환경변수

전체 목록과 주석은 `.env.example` 에 있습니다. 자주 걸리는 것만 추립니다.

| 키 | 기본값 | 비고 |
|---|---|---|
| `LIVEKIT_URL` | | 비우면 기동 즉시 `ValueError: ws_url is required` |
| `LIVEKIT_API_KEY` / `_SECRET` | | `--dev` 서버는 `devkey` / `secret` 고정 |
| `DEEPGRAM_API_KEY` | | 없으면 음성만 비활성됩니다 |
| `STT_LANGUAGE` | `ko` | `multi` 로 바꾸지 마세요. 아래 참고 |
| `STT_MODEL` | `nova-3` | `nova-2` 도 한국어를 지원합니다 |
| `BOT_PROVIDER` | `gemini` | `echo` 는 키 없이 도는 데모. 답이 고정 문구입니다. 아는 값은 이 둘뿐이고 오타는 입장 알림으로 드러납니다 |
| `BOT_API_KEY` | | Gemini API 키. `BOT_PROVIDER=gemini` 면 필수 |
| `BOT_BASE_URL` | | 게이트웨이를 쓰면 필수. 빠뜨리면 공식 엔드포인트로 나갑니다 |
| `BOT_STEP_TIMEOUT_SECONDS` | `25` | 게이트웨이는 느립니다. 기본값 15 면 정상 응답이 잘립니다 |
| `BOT_TIMEOUT_SECONDS` | `45` | 위와 같음(기본값 20) |
| `BOT_MODE` | `goal` | `goal` 경로만 배선돼 있습니다. 다른 값은 경고만 남고 동작은 같습니다 |
| `BOT_MAX_CONCURRENT_ROOMS` | `0` | worker 하나가 맡을 방 수 상한(0=무제한). 넘으면 `admit()` 이 거절하고 다른 worker 로 넘깁니다. t3.micro 권장 4 — 근거와 실측치는 `.env.example` 주석에 있습니다(유휴 430MB + 세션당 약 45MB, 1 GiB 라 스왑 없이는 더 올리지 마세요) |
| `BOT_SYSTEM_PROMPT_FILE` | `./prompts/system.md` | 생략 가능. 기본값이 저장소의 정본을 |
| `BOT_CLASSIFY_PROMPT_FILE` | `./prompts/classify.md` | 가리킵니다 — 다른 파일로 실험할 때만 |

같은 `.env` 를 두 계층이 서로 다르게 읽습니다. `LIVEKIT_*` 는 `agent/__main__.py` 의
`load_dotenv()` 가 실제 환경변수로 올려줘야 합니다(`livekit-agents` 는 `.env` 를 스스로
읽지 않습니다). `BOT_*` 는 `pydantic-settings` 가 파일을 직접 읽습니다.

## 토픽

| 토픽 | 방향 | 내용 |
|---|---|---|
| `mandarin.hello` | 에이전트 → 클라이언트 | 세션 능력 `{voice, name, mode}`. 입장 직후 한 번 |
| `lk.chat` | 양방향 | 사용자 발화와 AI 응답(LiveKit SDK 채팅 관례) |
| `mandarin.goal` | 에이전트 → 클라이언트 | 구조화 결과. `public_data()` 통과분 |
| `mandarin.transcript` | 에이전트 → 클라이언트 | 전사문 `{text, final}`, 듣기 상태 `{listening}` |
| `mandarin.sheet` | 클라이언트 → 에이전트 | 시트 전체 갈아끼우기 |

```json
// mandarin.hello
{ "voice": false, "name": "AI", "mode": "채팅" }

// mandarin.transcript 는 두 가지가 옵니다
{ "text": "매일 알고리즘 문제 풀고 싶어", "final": true }
{ "listening": true }
```

`hello` 가 없으면 조용히 실패합니다. 서버가 텍스트만 받는 상태를 프론트가 모르면
사용자는 마이크를 눌러도 아무 일이 일어나지 않는 것을 봅니다. 에러도 로그도 응답도
없습니다. 그래서 마이크 버튼은 이 알림을 받고서야 열립니다.

이름은 `name` 과 `mode` 로 나눠 보내고 프론트가 `AI · 음성` 처럼 접미로 붙입니다.
"채팅 AI" 와 "음성 AI" 로 갈라 쓰면 봇이 둘인 것처럼 읽히는데, 실제로는 같은
파이프라인과 히스토리와 시트를 쓰고 입력 경로만 다릅니다.

전사문은 `lk.chat` 으로 보내지 않습니다. 그 토픽에 AI 응답이 흐르므로 섞으면 프론트가
내가 말한 것과 AI 가 답한 것을 구분할 수 없습니다.

`listening` 은 에이전트가 실제로 듣고 있다는 확인입니다. 브라우저가 mute 를 토글해도
이벤트가 에이전트에 안 닿으면 화면에서 알 방법이 없어서, `track_muted` 인자 순서 버그가
여러 라운드 숨었습니다.

`mandarin.goal` 로는 `public_data()` 를 거친 것만 내보냅니다. 안 거치면 프롬프트가
사용자에게 노출하지 않는다고 적어 둔 `reasoning` 이 브라우저까지 갑니다
(`test_the_structured_result_never_carries_reasoning`).

## 시트

```
입장 시점   participant metadata (Spring 이 서명한 access token 에 실림)
            └ 폴백: participant attributes["mandarin.sheet"]
세션 중     텍스트 스트림 토픽 mandarin.sheet (전체 목록을 통째로)
```

토큰에서 받는 이유는 시트가 AI 의 중복 판단 근거이기 때문입니다. 클라이언트가 정하게
두면 이미 담아 둔 과제를 숨겨서 같은 과제를 다시 받을 수 있습니다. 서버가 아는 사실은
서버에서 옵니다. 세션 중 변경만 클라이언트에서 받는데, 방금 사용자가 한 행동이라
클라이언트가 유일한 출처입니다.

`DomainRef` 를 그대로 쓰므로 검증기(제목 정리, 과제 8개 절단, `id` 별칭, 빈 칸 제거)가
따라옵니다. 새로 쓴 것은 봉투 하나(`SheetPayload`)뿐입니다.

필드 이름은 Spring 응답 그대로 써야 합니다. 빈도는 `frequency` 가 아니라 `period`
입니다. fixture 나 `dev_server` 가 실제 모양을 안 흉내내면 테스트와 실서버가 다 초록불인
채로 버그가 숨습니다(HANDOFF 2절).

### 중복 방지

프론트가 지킬 규칙이 둘입니다. 빠뜨려서 같은 과제가 시트에 두 번 들어간 적이 있습니다.

`generate` 만 담깁니다(서버의 `_STORABLE_ACTIONS`). `recommend` 는 이미 시트에 있는
과제를 지목한 것이라 담을 게 없습니다. 버튼 대신 `이미 담아둔 과제예요` 를 보여줍니다.

담은 과제에는 `subjectId` 를 붙입니다(`nextLocalSubjectId()`). `to_candidates()` 가
`subjectId` 없는 과제를 후보에서 버리므로, `null` 로 두면 방금 담은 과제가 다음 턴
중복 검사에 안 들어가고 AI 가 같은 것을 또 만듭니다. 진짜 PK 는 Spring 담기 API 가
정하지만 기다릴 필요는 없습니다. 토큰에서 온 실제 PK 는 보존하고 `max + 1` 부터
로컬 일련번호를 붙입니다.

### 최종목표는 서버가 넘깁니다

만다라트 가운데 칸입니다. 시트 봉투의 **`title`** 로 실려 오고(Spring 의
`GET /api/v1/sheets/{sheetId}` 응답과 같은 이름), 프롬프트의 `<final_goal>` 슬롯이 됩니다.

```
프론트 getSheet() → {"title": "정보처리기사 취득하기", "domains": [...]}
  → mandarin.sheet 토픽 / participant metadata
  → SheetPayload.title → Conversation.set_goal() → <final_goal>
```

**모델에게 추론시키지 않습니다.** 예전에는 규칙 2가 "중심 목표는 대화의 첫 목표 발화"
라고 했는데, 히스토리 창이 `BOT_HISTORY_TURNS`(로컬 `.env` 는 4 = 두 왕복)이라 그 발화가
곧 창 밖으로 밀려나 근거가 사라졌습니다 — 증상은 "AI 가 최종목표를 모른다" 뿐입니다.
실측으로 갈립니다(같은 발화 `"뭐부터 하면 좋을까?"`):

| `<final_goal>` | 응답 |
|---|---|
| `정보처리기사 취득하기` | "필기 시험 대비 / 실기 시험 대비 / 학습 계획 세우기 중 어떤 것이 우선일까요?" |
| 없음 | "어떤 목표를 이루고 싶으신가요?" |

**목표가 없어도 됩니다.** 편집기를 거치지 않고 대화부터 시작하면 `None` 이고, 그때는
모델이 목표를 **지어내지 않고 되묻습니다**(`prompts/system.md` 규칙 2 — 발화에서 추론하면
히스토리 창 밖으로 밀려나는 순간 근거가 조용히 바뀝니다). 값이 바뀌면 프론트가 시트를 다시 보내고
(`AiCoachPage` 의 시트 전송 effect 가 `goal` 을 의존성에 둡니다) 캐시 키에도 들어가므로
(`_cache_key`) 목표를 고친 뒤의 첫 턴이 옛 판단을 재사용하지 않습니다.

## 프론트

빌드 도구가 없습니다. `livekit-client` 를 CDN 에서 ESM 으로 가져오고 버전을 2.21.0 으로
고정했습니다. 대신 페이지를 열 때 네트워크가 필요합니다.

`BOT_PROVIDER=echo` 로는 채팅만 보입니다. `echo` 가 늘 `action=clarify` 를 돌려줘서
담기 버튼이 그려질 조건이 안 됩니다. `gemini` 로 바꾸면 나타납니다.

되는 것은 연결, 텍스트 발화, AI 응답, `mandarin.goal` payload 표시, 시트 패널
(토큰 metadata 와 `n/8` 카운트)입니다. 담기 버튼은 `gemini` 에서만 보이고, 마이크는
`DEEPGRAM_API_KEY` 가 있어야 동작합니다.

안 되는 것은 TTS(넣지 않기로 함), 과제 삭제, 새로고침 후 유지, 담은 과제 인계, 인증입니다.

`dev_server.py` 가 하는 일이 실제로는 Spring 이 할 일입니다. 사용자를 확인하고, 방을
정하고, access token 에 서명하면서 그 사용자의 시트를 metadata 로 실어 보냅니다.

로컬 전용입니다. 토큰 발급에 인증이 없어서 주소만 알면 누구나 아무 방에 들어가는 토큰을
받아 갑니다. `API_SECRET` 이 이 프로세스에만 있고 브라우저로 가지 않는 것이 요점입니다.
프론트에 두면 누구나 토큰을 위조합니다.

## 음성

```
오디오 트랙 ─rtc.AudioStream─▶ push_frame ─▶ Deepgram ─▶ SpeechEvent
                                                        ├─ INTERIM → 실시간 캡션
                                                        └─ FINAL   → Conversation.respond()
```

STT 로 텍스트를 얻어 기존 파이프라인에 그대로 넣습니다. 3단계 구조화 출력
(`responseSchema`)이 텍스트 턴을 전제하므로 파이프라인 수정이 0 입니다
(`test_a_text_only_turn_runs_the_whole_pipeline`).

키는 [console.deepgram.com](https://console.deepgram.com) 에서 받습니다. 무료 크레딧
$200 이고 카드가 필요 없습니다(약 41,600분). 키가 없으면 음성만 빠집니다. 키 하나 때문에
세션 전체가 죽으면 안 되니 fail-open 이고, 대신 경고를 크게 남깁니다.

```
# 키 없음
WARNING  DEEPGRAM_API_KEY 가 없습니다 — 음성 입력이 비활성됩니다 (텍스트 대화는 그대로 동작합니다)
INFO     준비 완료 — topic=lk.chat / 음성=비활성(DEEPGRAM_API_KEY 없음)

# 키 있음
INFO     STT 활성 model=nova-3 language=ko
INFO     준비 완료 — topic=lk.chat / 음성=활성
```

이 로그는 기동 시가 아니라 참가자가 접속할 때 나옵니다. `build_stt()` 가 `entrypoint()`
안에서 불리고, `entrypoint()` 는 job 이 배정될 때 실행되기 때문입니다. 기동 로그에는
`registered worker` 까지만 있습니다.

### multi 에는 한국어가 없습니다

Nova-3 multilingual 은 영어, 스페인어, 프랑스어, 독일어, 힌디어, 이탈리아어, 일본어,
네덜란드어, 러시아어, 포르투갈어 10개입니다. 한국어가 없습니다. "매일 알고리즘 문제 풀고
싶어요" 를 세 번 말한 결과입니다.

```
'내이 algorithms 문적트고 한시고 한요.'
'Beiil algori ズム 문제트히 트히.'
'Bei 以 来 书borism muncie flu gossip 회.'
```

에러가 아니라 품질 저하로만 드러납니다. 전사에 카타카나나 한자가 섞이면 이 설정을 먼저
의심하세요. `test_the_default_language_is_not_the_multilingual_mode` 가 되돌림을 막습니다.

### 마이크 창은 15분입니다 (응답 중에는 잠시 멈춤)

```
말하기 누름    → unmute → track_unmuted → 전사 시작
최종 전사 도착 → mute   → track_muted   → 전사 중지 (= 응답 생성 시작, 아래 절)
답 도착        → unmute                  (남은 창을 이어서 — 버튼을 다시 누르지 않습니다)
15분 경과      → mute                    (하드 상한)
다시 누름      → 즉시 mute
```

**창은 처음 누른 시점부터 15분입니다.** 응답 뒤 재개는 그 남은 시간을 이어 쓰므로
(`openWindow(remaining)`), 턴이 많아도 상한이 늘어나지 않습니다. 남은 시간이
`RESUME_MIN_MS`(3초)보다 적으면 재개하지 않습니다 — 켰다가 곧바로 끄면 전사도 못 얻고
STT 연결 비용만 냅니다.

상수는 `web/app.js` 의 `TALK_WINDOW_MS`(15분)와 `MISCLICK_GUARD_MS`(0.3초)이고,
`frontend/src/components/aiCoach/useCoachRoom.ts` 가 같은 값을 씁니다.

10초 창이던 시절에는 사람이 창을 여닫는 것으로 무음 과금이 막혔습니다. 15분 상한만
있던 동안에는 그 전제가 깨져 있었고 — 창의 대부분이 무음입니다 — 그래서 무음을 거르는
층이 서버에 생겼습니다. **그 층은 그대로 남습니다**: 창이 열려 있는 동안(말하는 중의
문장 사이 등)의 무음 프레임을 Deepgram 에 보내지 않는 것은 서버 일입니다.

### 응답을 만드는 동안에는 듣지 않습니다

방어가 두 겹입니다.

| 층 | 하는 일 |
|---|---|
| 서버 (`agent/listen.py`) | `Conversation.busy` 를 보고 **STT 스트림을 닫고 프레임을 버립니다**("생성 중"). 그 발화는 `Conversation` 이 락으로 버리므로 전사해도 쓰이지 않습니다 |
| 브라우저 (`useCoachRoom.ts`) | 최종 전사가 오는 시점(= 생성 시작)에 **마이크를 mute 합니다.** 답이 도착할 때까지 말하기 버튼도 열리지 않습니다 |

**Deepgram 요금은 서버 층이 막습니다.** 브라우저 쪽을 더 둔 이유는 다른 데 있습니다 —
버려질 오디오를 계속 올려보내지 않는 것(t3.micro 가 15분치 프레임 RMS 를 계산하지 않는
것), 그리고 생성이 끝나는 순간 스트림이 다시 열리지 않는 것입니다.

답이 도착하면 잠금이 풀리고 **남은 창만큼 다시 듣습니다**(`resumeTalking`). 사람이 직접
멈춘 창이나 15분 상한에 걸린 창은 재개하지 않습니다 — 끈 마이크가 저절로 켜지면 안
됩니다(`resumeAfterReplyRef`). 응답 중에 버튼을 누르면 그 재개를 취소합니다.

잠금은 답(`lk.chat`)이 도착할 때 풀립니다. 에이전트는 실패해도 답을 보내지만
(`FAILURE_REPLY`·`TIMEOUT_REPLY`) worker 가 죽으면 아무것도 오지 않으므로,
`GENERATION_LOCK_MS`(60초)가 지나면 잠금이 저절로 풀립니다 — 그게 없으면 말하기 버튼이
영원히 안 열립니다.

### 무음 자동 종료는 넣지 않았습니다

"말이 끝나면 창을 닫는다" 를 브라우저에서 재는 층(로컬 트랙 RMS)을 만들어 봤다가
**뺐습니다.** 요금이 줄지 않기 때문입니다 — 코치 대화는 모든 발화가 곧 생성으로
이어지므로 그 자리는 이미 위의 "생성 중 닫기" 가 차지하고 있고(실측 0.6초), 무음 종료로
바꾸면 마지막 전사를 기다리는 유예가 붙어 오히려 조금 불리했습니다. 발화마다 소켓을 새로
여는 연결 오버헤드도 그만큼 늘어납니다.

잃는 것은 분명했습니다 — 발화마다 버튼을 다시 눌러야 합니다. `HANDOFF.md` 의 결정
("발화마다 버튼을 누르게 하지 않습니다")과 어긋납니다.

### 무음 게이트

`agent/listen.py` 의 `SpeechGate` 가 프레임마다 RMS 를 재서 **무음이면 Deepgram 에
보내지 않습니다.** 보내지 않는 것으로 끝내지 않고 **무음이 이어지면 스트림을 닫습니다** —
Deepgram 은 WebSocket 이 열려 있는 시간으로 과금하므로(플러그인이 소켓 수명으로 사용량을
집계합니다) 연결을 붙잡고 있으면 프레임을 안 보내도 요금이 흐릅니다.

```
무음            프레임을 버립니다. 최근 300ms 는 링버퍼에 남겨 둡니다
120ms 이상 소리 스트림을 열고 링버퍼부터 밀어 넣습니다 (첫 음절 보존)
발화 중         그대로 보냅니다. 중간의 800ms 이하 침묵은 자르지 않습니다
800ms 침묵      발화 종료. flush() 로 Deepgram 에 마지막 FINAL 을 받아냅니다
응답 생성 중    스트림을 닫고 프레임을 버립니다 (아래)
5초 침묵        스트림을 닫습니다 (과금 정지)
다시 소리       새 스트림을 엽니다
```

`STT 스트림 닫기(생성 중)` · `(무음)` · `(종료)` 로 어느 규칙이 닫았는지 로그에 남고,
그 뒤 `STT 소켓 닫힘 — N초` 가 **실제 과금 시간**을 남깁니다.

닫을 때 스트림이 스스로 끝나기를 기다리지 않습니다 — 플러그인 keepalive 가 소켓이 닫힌
것을 다음 전송(5초 주기)에서야 알아채서, 기다리면 발화당 3~5초가 더 청구됩니다. 오는
중인 전사가 있을 때만 `STT_FINALIZE_SECONDS`(1.5초) 기다리고, 그 안에 못 받으면 경고를
남깁니다(`FINAL 을 …s 안에 못 받고 닫습니다`).

### 응답을 만드는 동안은 듣지 않습니다

`Conversation` 은 생성 중에 들어온 발화를 **버립니다**(그쪽 락 — 큐에 쌓으면 답이 몰려
나옵니다). 그래서 그 동안 전사하면 **쓰이지도 않는 오디오에 요금을 냅니다.** 게이트가
`Conversation.busy` 를 보고 스트림을 닫는 이유입니다. 실측 로그입니다.

```
18.511  발화 from=tester: '매일 아침 스트레칭 하고 싶어'   ← 생성 시작
18.608  STT 스트림 닫기(생성 중) — 보낸 오디오 0.8s        ← 100ms 뒤 닫힘
21.827  gemini usage …                                    ← 이 3.2초 동안 0원
21.833  STT 스트림 열기                                    ← 응답 6ms 뒤 재개
```

무음 규칙만 있으면 이 구간에 유휴 5초가 더 붙습니다. 생성이 5초보다 오래 걸리면 그
차이만큼, 사용자가 생성 중에 계속 말하면 그 시간 전부가 그냥 나가는 돈이었습니다.

생성이 끝나면 다음 온셋에서 다시 엽니다 — 그때 사용자가 말하는 중이었다면 문장
중간부터 잡습니다. 버려질 발화였으므로 잃는 것은 없습니다.

임계값은 `.env` 로 조절합니다(`STT_SILENCE_DBFS`, `STT_ONSET_MS`, `STT_HANGOVER_MS`,
`STT_PREBUFFER_MS`, `STT_IDLE_CLOSE_SECONDS`). 판단 근거는 이 로그 한 줄입니다.

```
INFO  STT 스트림 닫기 — 보낸 오디오 12.4s / 마이크 213.0s
```

두 값이 비슷하면 게이트가 계속 열려 있는 것입니다(잡음이 많은 환경). `STT_SILENCE_DBFS`
를 올리세요. 반대로 전사에서 첫 음절이 빠지면 `STT_PREBUFFER_MS` 를 늘립니다.

silero VAD 는 안 씁니다. 필요한 판정이 "사람이 말하는가" 가 아니라 "보낼 만한 소리가
있는가" 뿐이고, t3.micro 에서는 모델이 job 프로세스마다 CPU·메모리를 먹습니다.

### mute 는 트랙을 끊지 않습니다

`setMicrophoneEnabled(false)` 는 트랙을 mute 만 합니다. 트랙은 살아 있고 무음 프레임이
계속 흐릅니다. 그래서 `track_muted` 와 `track_unmuted` 로 전사 태스크를 취소하고
재시작합니다(`entrypoint.py`). 게이트가 있어도 이 층은 필요합니다 — 게이트는 창 안의
무음을 막고, 이쪽은 창 자체를 닫습니다.

세 곳을 같이 챕니다.

- `track_subscribed` 인데 이미 `publication.muted` 면 시작하지 않습니다. 마이크를 끈 채
  접속한 경우인데, 첫 발화 전부터 과금되는 것을 막습니다
- `track_unmuted` 에 재시작하고 `track_muted` 에 취소합니다
- `run()` 의 `finally` 가 취소 중에도 STT 와 오디오 스트림을 닫습니다. 안 그러면
  mute/unmute 를 반복할 때 연결이 쌓입니다

`track_muted` 와 `track_unmuted` 는 인자 순서가 subscribed 계열과 다릅니다
(`tests/test_event_signatures.py`).

### 비용

계기가 둘입니다.

| 비용 | 단위 | 로그 |
|---|---|---|
| LLM(분류, 판단) | 토큰 | `gemini usage …` |
| STT | 오디오 시간 | `stt usage …` (5초 주기 리포트) |

`stt usage` 는 과금 단위가 아니라 리포트 주기입니다. 5초 미만 발화는 로그에 안 남지만
과금은 됩니다. 로그가 없다고 과금이 없는 게 아닙니다. 실제로 보낸 오디오는
`STT 스트림 닫기 — 보낸 오디오 …` 줄이 알려줍니다.

Nova-3 단일언어 스트리밍이 분당 $0.0048, 다국어가 $0.0058 입니다. **과금은 마이크 창이
아니라 Deepgram 소켓이 열린 시간을 따릅니다.** 그 값을 로그가 직접 알려줍니다.

```
STT 스트림 닫기(생성 중) — 보낸 오디오 0.8s / 마이크 2.1s
STT 소켓 닫힘 — 0.6s (과금 단위)
```

실측(2026-08-05, `scripts/audio_smoke.py`)입니다.

| 상황 | 소켓 |
|---|---|
| 창을 열어두고 말하지 않음 | **0초** — 소켓을 아예 열지 않습니다 |
| 소리 2초 → 무음(유휴 규칙으로 닫힘) | 6.9초 = 소리 2 + hangover 0.8 + 유휴 약 4 |
| 소리 → 곧바로 생성 시작 | **0.6초** |
| 게이트 없이 15분 창 | 900초 (약 $0.072) |

남은 오버헤드는 `HANGOVER_MS`(0.8초)와, 생성이 안 이어질 때의 `STT_IDLE_CLOSE_SECONDS`
입니다. **소켓 종료 지연은 없습니다**(3ms 수준) — 스트림이 스스로 끝나기를 기다리지 않고
직접 닫기 때문입니다. 기다렸을 때는 같은 조건에서 10.5초였습니다(keepalive 주기 5초가
끝나야 스트림이 끝납니다).

최소 과금 구간이 있는지는 공식 문서에서 확인하지 못했습니다. 발화마다 소켓을 여닫으므로
있다면 그만큼 늘어납니다 — "이하는 무료" 같은 규칙을 전제로 설계하지 마세요.

Google 플러그인은 대안이 아닙니다. Google Cloud STT 는 GCP 서비스 계정
(`GOOGLE_APPLICATION_CREDENTIALS`)을 요구하고 Gemini API 키와 다릅니다. LiveKit 플러그인
목록에 Gemini 기반 STT 는 없습니다.

## 포트

| 포트 | 무엇 | 브라우저로 열까 |
|---|---|---|
| 8000 | `dev_server.py`. 프론트와 토큰 발급 | 여기를 엽니다 |
| 7880 | LiveKit 서버(WebSocket/HTTP) | 아니오. `app.js` 가 내부적으로 붙습니다 |
| 7881 / 7882 | LiveKit RTC(TCP / UDP) | 아니오 |
| 임의 포트 | worker 자체 HTTP(`HTTP server listening on :NNNNN`) | 아니오. 무시하세요 |

worker 는 밖에서 들어오는 요청을 받지 않습니다. 반대로 LiveKit 서버(7880)로 나가서
등록합니다.

## 안 될 때

| 증상 | 원인과 조치 |
|---|---|
| `토큰 실패` | `dev_server.py` 가 안 떠 있거나 포트 충돌 |
| `could not establish pc connection` | `--node-ip 127.0.0.1` 누락. 아래 참고 |
| `접속 실패` | LiveKit 컨테이너 확인(`docker ps`) |
| 연결은 되는데 `참가자 입장` 이 안 뜸 | worker 미등록, 좌초된 job, `entrypoint()` 예외 중 하나. **설정값 오류는 여기가 아닙니다** — 아래 `BOT_PROVIDER` 행 참고 |
| 응답이 안 옴 | 토픽 문자열 불일치. `app.js` 와 `entrypoint.py` 의 `lk.chat` |
| 입장 직후 `BOT_PROVIDER 설정값이 잘못됐습니다` | `.env` 의 `BOT_PROVIDER` 오타. 아는 값은 `echo`/`gemini` 뿐입니다(`BACKENDS`). 발화하면 `AI 응답 실패: 알 수 없는 BOT_PROVIDER` 가 같이 뜹니다 — 세션은 살아 있어 시트와 담기는 그대로 씁니다 |
| payload 에 `reasoning` 이 들어 있음 | 서버가 `public_data()` 를 건너뜀 |
| 마이크를 켰는데 캡션이 안 뜸 | `DEEPGRAM_API_KEY` 없음. 기동 로그의 `음성=` 확인 |
| `마이크를 켤 수 없습니다` | 브라우저 권한이나 장치 문제. `localhost` 는 secure context 지만 다른 기기에서 열면 HTTPS 가 필요합니다 |
| 전사가 중간에 멈춤 | worker 로그의 STT 스트림 예외. 태스크가 GC 되면 조용히 멈춥니다 |
| STT 가 됐다 안 됐다 함 | worker 가 두 개. `.env` 를 고쳤으면 옛 것을 끄세요 |
| 전사에 카타카나나 한자 | `STT_LANGUAGE` 가 `multi` |

LiveKit 서버를 재시작하면 worker 도 재접속해야 합니다. 자동으로 16회까지 재시도하니
보통 몇 초 안에 붙지만, `registered worker` 가 다시 찍힌 뒤에 브라우저를 새로고침하세요.

### --node-ip 를 빼면 브라우저만 실패합니다

LiveKit 이 자기 IP 를 자동 판별하면 컨테이너 안에서는 Docker 브리지 주소(`172.17.0.2`)가
나옵니다. 그 값을 ICE 후보로 브라우저에 알려주는데, Docker Desktop for Windows 는 VM
안에서 돌기 때문에 호스트에서 그 주소로 갈 수 없습니다.

시그널링(WebSocket)은 성공하고 PeerConnection 에서만 실패하는 게 단서입니다. 토큰이나
방 문제면 그 전에 막힙니다. `smoke_client.py` 는 이 상태에서도 통과합니다. Rust SDK 가
TCP ICE 후보(7881)로 폴백하기 때문입니다.

### 로그가 셋입니다

어느 로그가 무엇을 모르는지가 진단의 핵심입니다. 잘못된 로그를 보면 아무 에러도 없는데
안 된다로 끝납니다.

| 로그 | 보는 법 | 알 수 있는 것 | 알 수 없는 것 |
|---|---|---|---|
| LiveKit 서버 | `docker logs -f lk-dev` | 입퇴장, job 배정, ICE, 오디오 활성 | 파이썬 예외 |
| worker | 터미널 또는 `worker.log` | `entrypoint()` traceback, STT 활성, 전사문, 파이프라인 단계 | 브라우저 쪽 실패 |
| 브라우저 | F12 콘솔 | 토큰, 접속, 마이크 권한 | 서버와 에이전트 내부 |

```powershell
Get-Content worker.log -Tail 40 -Wait                                    # tail -f
Select-String -Path worker.log -Pattern "Traceback|ERROR|STT|전사"
docker logs lk-dev 2>&1 | Select-String "assigned job|worker registered|TerminateJob"
```

| 서버 로그 | 뜻 | 조치 |
|---|---|---|
| `worker registered` 없음 | worker 가 LiveKit 에 못 붙음 | `LIVEKIT_URL` 과 `.env` 로딩 확인 |
| `worker registered` 는 있고 `assigned job` 이 없음 | 좌초된 job | 방을 지우세요 |
| `assigned job` 은 있는데 에이전트가 안 보임 | `entrypoint()` 예외 | worker 로그의 traceback |

`worker.log` 에는 발화 내용과 전사문이 남습니다. 매 기동마다 덮어쓰고 `.gitignore` 에
있습니다. 운영에 그대로 가져가지 마세요.

### 좌초된 job

LiveKit 은 방이 만들어질 때 job 을 한 번만 배정합니다. 그 job 을 받은 worker 가 죽으면
(개발 중 재시작이 대표적) 방은 남고 job 은 죽은 상태가 되어 새 참가자가 들어와도 다시
배정되지 않습니다. 증상이 고약합니다. 브라우저는 정상 접속되고 마이크도 올라가고
서버와 worker 어디에도 에러가 없습니다.

```
assigned job AJ_Qefdzm... -> room "dev-room" (RM_dgedr5dpURwF)
(worker 재시작)
failed sending TerminateJob RPC ... participant: agent-AJ_Qefdzm...
```

`dev_server.py` 가 토큰 발급 전에 방을 지워서 이걸 막습니다(`reset_room`). 그래도 막히면
직접 지우세요.

```powershell
.venv\Scripts\python.exe -c @'
import asyncio, os
from dotenv import load_dotenv; load_dotenv()
from livekit import api
async def main():
    lk = api.LiveKitAPI(url=os.environ["LIVEKIT_URL"].replace("ws://","http://"),
                        api_key=os.environ["LIVEKIT_API_KEY"],
                        api_secret=os.environ["LIVEKIT_API_SECRET"])
    for r in (await lk.room.list_rooms(api.ListRoomsRequest())).rooms:
        await lk.room.delete_room(api.DeleteRoomRequest(room=r.name)); print("삭제:", r.name)
    await lk.aclose()
asyncio.run(main())
'@
```

`smoke_client.py` 가 이 함정을 안 밟는 이유는 끝나면 깨끗하게 나가서 방이 소멸하기
때문입니다. 브라우저 탭은 방을 계속 붙잡고 있습니다.

## LiveKit 버전을 올릴 때

`requirements.txt` 는 `livekit-agents~=1.6` 으로 묶여 있고 `entrypoint.py` 는 1.6.7
기준으로 실서버 검증된 코드입니다. worker 와 plugin API 는 0.x 에서 1.x 로 갈 때 한 번,
1.x 안에서도 또 바뀌었습니다. 1.6 계열은 `AgentServer` 와 `@server.rtc_session()` 과
`cli.run_app(server)` 를 쓰고, `WorkerOptions` 는 `ServerOptions` 의 별칭입니다.
하한을 올릴 때는 `entrypoint.py` 를 먼저 읽고 공식 문서와 대조하세요.

**서버 버전은 두 곳에 적혀 있습니다** — 이 문서 첫머리의 "기준 버전" 과
`deploy/docker-compose.yml` 의 이미지 태그입니다. 갈리면 **검증한 것과 다른 서버가
배포에 뜨는데 아무 데서도 드러나지 않습니다**(로컬은 `--dev` 로 태그 없이 띄우므로 그
핀을 타지 않습니다). 실제로 그 상태였고, 지금은 `tests/test_versions_match.py` 가
막습니다. 올릴 때 두 곳을 같이 고치세요.

**`from livekit.agents.worker import ServerEnvOption` 이 `livekit.agents` 에 re-export 되어
있지 않습니다.** dev/운영 기본값을 나누는 라이브러리 자체의 장치라 쓰고 있지만 공개
경로가 아니어서, 버전을 올릴 때 여기가 먼저 깨질 수 있습니다. 없어지면 `sys.argv` 로
dev 를 판별해 값을 갈라야 합니다(`tests/test_worker_limits.py` 가 값을 지킵니다).

- [Job lifecycle](https://docs.livekit.io/agents/server/job/) — `JobContext`, `ctx.job.metadata`, `participant.attributes`
- [Sending text](https://docs.livekit.io/transport/data/text-streams/) — `send_text`, `register_text_stream_handler`
- [agents README](https://github.com/livekit/agents/blob/main/README.md) — `AgentServer` 최소 예제

## 남은 일

- React 프론트(`../frontend/src/components/aiCoach/`) 이식. `signaling.ts` 와
  `sfuClient.ts` 를 버리고 `livekit-client` 로 갑니다. `taskBoard.ts` 와 패널은 그대로입니다
- 인증. Spring 이 LiveKit access token 을 서명하면 검증은 LiveKit 서버가 하므로
  이쪽에 검증 코드가 필요 없어집니다
- EC2 배포. `--node-ip`, 포트, TLS, `--dev` 금지
- LLM 동시성 제한. worker 를 여러 개 띄우면 동시 요청도 같이 늘어납니다
