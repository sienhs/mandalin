"""목표 설계 파이프라인 — 전송 계층을 모르는 자립 패키지.

`../ai`(자체 SFU)에서 **승격해 온 여섯 파일**입니다. 예전에는
`pip install -e ../ai --no-deps` 로 옆 폴더를 경로 의존으로 참조했는데,
그 임시 배치를 끝내고 이쪽으로 들여왔습니다. 이제 `ai_livekit` 은
**`../ai` 없이 혼자 돕니다.**

```
mandarin_goal/
    config.py          BOT_* 설정 (pydantic-settings)
    sheet.py           DomainRef · SubjectRef · FREQUENCIES
    bot/goal.py        분류 -> 후보 검색 -> 판단
    bot/llm.py         echo · gemini · openai 백엔드
    bot/prompt.py      프롬프트 파일 로더 (무재시작 반영)
    bot/subjects.py    후보 검색 (바이그램 자카드) · 빈도 라벨
```

**여기서 `livekit` 도 `aiortc` 도 `fastapi` 도 import 하지 마세요.**
서드파티는 `pydantic` · `pydantic-settings` · `httpx` 셋뿐입니다. 이 규칙이
깨지면 `tests/test_reuse.py` 가 잡습니다 — 파이프라인이 전송 계층을 모른다는
성질이 애초에 이 폴더를 옮겨올 수 있게 한 이유입니다.

**프롬프트는 `ai_livekit/prompts/` 에 있습니다.** `bot/prompt.py` 의
`PROJECT_ROOT` 가 `Path(__file__).parents[2]` 라 `.env` 의
`BOT_SYSTEM_PROMPT_FILE=./prompts/system.md` 는 이 저장소 루트 기준으로
풀립니다(예전에는 `../ai/prompts/` 를 가리켰습니다).

**`../ai` 와의 관계.** 두 벌이 되었으므로 한쪽을 고쳐도 다른 쪽에 반영되지
않습니다. 파이프라인이나 프롬프트를 고칠 때는 저쪽에도 같은 변경이 필요한지
판단하세요 — 정본은 이제 각자입니다.
"""
