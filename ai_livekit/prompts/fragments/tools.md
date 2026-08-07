# 도구 설명

`BOT_MODE=agent` 에서 모델에게 선언되는 도구의 설명입니다. **이름과 인자 모양은
코드가 정합니다**(`mandarin_goal/bot/tools.py`) — 그쪽은 `FREQUENCIES` 나
`MAX_SUBJECTS_PER_DOMAIN` 같은 데이터 제약이라 문구가 아닙니다. 여기 있는 것은
**언제 그 도구를 부르는가** 뿐이고, 그건 다듬을 문구라서 정본이 여기입니다.

`## 도구이름` 이 한 도구의 시작입니다. 이름이 코드의 선언과 어긋나면 그 도구는
설명 없이 나갑니다(`tests/test_tool_calls.py` 가 짝을 검사합니다).

판단 규칙은 `prompts/system.md` 에 그대로 있습니다. 여기서 되풀이하지 마세요 —
같은 말을 두 곳에서 하면 한쪽만 고치는 날이 옵니다.

**대신 그쪽 낱말과 이어 줍니다.** `system.md` 는 `generate`·`recommend`·`clarify` 라는
**action 이름**으로 규칙을 적어 두었는데, 도구 모드에는 그 이름이 없습니다. 이어 주지
않으면 규칙 4("이미 담은 과제와 같으면 recommend")가 갈 곳을 잃습니다 — 실측
(2026-08-07)으로 `"정보처리기사 준비하고 싶어"` 가 중복 알림 대신 새 과제 생성으로
샜습니다. 한 도구당 한 구절이면 됩니다.

## propose_tasks

`generate` 다. 새 실천과제를 만들어 제안한다. 사용자가 카드에서 골라 담는다.
**먼저 point_to_existing 을 검토한 뒤** 겹치는 것이 없을 때만 쓴다.

## point_to_existing

`recommend` 다 — 규칙 4가 말하는 중복 알림. 하려는 일이 &lt;existing_domain_tasks&gt; 나
&lt;existing_subjects&gt; 의 과제와 실질적으로 같으면, 새로 만들지 말고 그 subject_id 를
지목한다. 새로 담기지 않는다.

## ask

`clarify` 다. 판단할 정보가 모자라거나 담을 칸을 정할 수 없을 때 되묻는다.
질문은 반드시 채운다.

## decline

`out_of_scope`·`injection`·`harmful`·`self_harm` 이다. 만들어 줄 수 없는 발화를 그
이유와 함께 끊는다. 어떤 이유인지는 kind 로 고른다.
