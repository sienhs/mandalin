"""목표 설계 파이프라인 — 전송 계층을 모르는 자립 패키지.

```
mandarin_goal/
    config.py          BOT_* 설정 (pydantic-settings)
    sheet.py           DomainRef · SubjectRef · FREQUENCIES
    bot/goal.py        분류 -> 후보 검색 -> 판단
    bot/llm.py         echo · gemini 백엔드
    bot/prompt.py      프롬프트 파일 로더 (무재시작 반영)
    bot/subjects.py    후보 검색 (바이그램 자카드) · 빈도 라벨
```

**여기서 `livekit` 도 `fastapi` 도 import 하지 마세요.**
서드파티는 `pydantic` · `pydantic-settings` · `httpx` 셋뿐입니다. 이 규칙이
깨지면 `tests/test_reuse.py` 가 잡습니다 — 파이프라인이 전송 계층을 모른다는
성질이 애초에 이 폴더를 옮겨올 수 있게 한 이유입니다.

**프롬프트는 `ai_livekit/prompts/` 에 있습니다.**
"""
