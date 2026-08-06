"""시트 전달 — 사용자 시트가 파이프라인까지 들어오는 경로.

**여기가 3단계의 실제 로직입니다.** `entrypoint.py` 는 이 함수들을 LiveKit 이벤트에
연결하는 배선일 뿐이고, 버그는 파싱과 폴백에서 납니다. `livekit.agents` 를 import
하지 않아 그 패키지 없이도 돌아갑니다.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

from agent.sheet_transfer import (
    MAX_DOMAINS,
    MAX_SHEET_TITLE_LENGTH,
    SHEET_ATTRIBUTE,
    parse_sheet,
    parse_sheet_envelope,
    sheet_envelope_from_participant,
    sheet_from_participant,
)

#: **`GET /api/v1/sheets/{sheetId}` 응답 그대로입니다** — 이름을 손대지 마세요.
#:
#: 예전 이 fixture 는 과제 주기를 `frequency` 로 적어 두었는데, 그건 프롬프트·모델
#: 스키마의 낱말이고 **Spring 이 내보내는 이름은 `period`** 입니다
#: (`SheetDetailResponse.SubjectDetailResponse.period`). 그래서 이 파일이 "Spring
#: 응답이 그대로 파싱된다" 를 통과시키면서도 실제 Spring 응답에서는 빈도가 조용히
#: 사라지는 상태였습니다. fixture 가 계약을 대신하는 자리라 faithful 해야 합니다.
#:
#: `position`·`progress` 처럼 AI 가 안 쓰는 필드를 남겨 둔 것도 의도입니다 — 응답을
#: 벗기지 않고 실어 보낼 수 있어야 프론트에 매핑 코드가 안 생깁니다. `subjectCount`
#: 는 Spring 이 보내지 않습니다(과제 수는 `subjects` 길이로 셉니다).
SPRING_SHAPE = {
    "sheetId": 12,
    "title": "2026 상반기",
    "domains": [
        {
            "domainId": 7,
            "position": 0,
            "title": "학습",
            "subjects": [
                {
                    "subjectId": 3,
                    "position": 0,
                    "title": "매일 알고리즘 1문제 풀기",
                    "period": "daily",
                    "targetCount": 180,
                    "progress": 42,
                },
                {
                    "subjectId": 4,
                    "position": 1,
                    "title": "주 1회 블로그에 정리하기",
                    "period": "weekly",
                    "targetCount": 26,
                    "progress": 0,
                },
            ],
        },
        {"domainId": 9, "position": 1, "title": "커리어", "subjects": []},
    ],
}

#: 브라우저가 보내는 모양. `web/` 은 시트를 자기 상태로 들고 있어서
#: `id`/`frequency` 로 보냅니다 — 양쪽을 다 받아야 하는 이유입니다.
BROWSER_SHAPE = {
    "domains": [
        {
            "id": 7,
            "title": "학습",
            "subjectCount": 2,
            "subjects": [
                {"id": 3, "title": "매일 알고리즘 1문제 풀기", "frequency": "daily"},
                {"id": 4, "title": "주 1회 블로그에 정리하기", "frequency": "weekly"},
            ],
        },
        {"id": 9, "title": "커리어", "subjectCount": 0, "subjects": []},
    ]
}


def test_a_spring_sheet_response_parses_unchanged():
    """`GET /api/v1/sheets/{sheetId}` 응답을 그대로 실어 보낼 수 있어야 합니다.

    필드 이름을 Spring 에 맞춰 둔 이유가 이것입니다 — 매핑 코드가 한 겹 줄어듭니다.
    **주기가 `period` 로 온다는 것이 이 테스트의 핵심입니다**(→ `mandarin_goal/sheet.py`
    의 `frequency` 주석). 못 읽으면 에러 없이 빈도 표시와 검색 가점이 같이 죽습니다.
    """
    domains = parse_sheet(json.dumps(SPRING_SHAPE), source="test")
    assert [d.title for d in domains] == ["학습", "커리어"]
    assert domains[0].domainId == 7
    assert domains[0].subjects[0].subjectId == 3
    assert domains[0].subjects[0].frequency == "daily"
    assert domains[0].subjects[1].frequency == "weekly"


def test_the_browser_renders_both_frequency_names():
    """브라우저 시트에는 **두 이름이 섞여 들어옵니다.**

    토큰 metadata 에서 온 과제는 Spring 이름(`period`)이고, `keep()` 이 방금 담은
    과제는 모델 payload 의 이름(`frequency`)입니다. `renderSheet()` 가 한쪽만 읽으면
    **빈도 칩만 조용히 사라집니다** — 에러도 없고 대화도 정상입니다.

    `web/` 에는 빌드 도구가 없어 JS 러너를 들일 수 없으므로 파일을 읽어 확인합니다.
    """
    source = (Path(__file__).resolve().parents[1] / "web" / "app.js").read_text(
        encoding="utf-8"
    )
    render = re.search(r"function renderSheet\(\).*?\n\}", source, re.S)
    assert render, "web/app.js 에서 renderSheet() 를 찾지 못했습니다"
    assert "subject.period" in render.group(0), "Spring 이름(period)을 안 읽습니다"
    assert "subject.frequency" in render.group(0), "담은 과제 이름(frequency)을 안 읽습니다"


def test_the_browser_shape_parses_too():
    """`id`/`frequency` 로 보내는 프론트 두 곳을 위한 경로입니다."""
    domains = parse_sheet(json.dumps(BROWSER_SHAPE), source="test")
    assert domains[0].domainId == 7
    assert domains[0].subjects[0].subjectId == 3
    assert domains[0].subjects[1].frequency == "weekly"
    assert domains[0].subjectCount == 2


def test_a_bare_array_is_accepted_too():
    """`domains` 키 없이 배열만 온 경우. 클라이언트가 벗겨 보내는 일이 흔합니다."""
    domains = parse_sheet(json.dumps(SPRING_SHAPE["domains"]), source="test")
    assert [d.title for d in domains] == ["학습", "커리어"]


def test_malformed_json_fails_open_with_an_empty_sheet():
    """파싱 실패가 입장을 막지 않습니다.

    시트가 없으면 AI 는 모든 도메인을 새 칸으로 제안합니다. 여기서 예외를 올리면
    시트 하나 때문에 AI 를 아예 못 쓰게 됩니다.
    """
    assert parse_sheet("{이건 JSON 이 아닙니다", source="test") == []
    assert parse_sheet("null", source="test") == []
    assert parse_sheet('"문자열"', source="test") == []


def test_an_empty_sheet_is_not_an_error():
    """시트가 아직 빈 사용자, 또는 시트를 안 싣는 구버전 클라이언트입니다."""
    assert parse_sheet(None, source="test") == []
    assert parse_sheet("", source="test") == []
    assert parse_sheet("   ", source="test") == []
    assert parse_sheet('{"domains": []}', source="test") == []


def test_too_many_domains_is_rejected_not_truncated():
    """`MAX_DOMAINS` 초과는 **거부**합니다.

    조용히 앞쪽만 쓰면 잘린 칸의 과제가 중복 검사에서 빠져 "가끔 중복 과제를 만든다"
    로만 드러납니다. 개수가 상한을 넘는 건 시트 자체가 이상하다는 신호입니다.
    """
    payload = {"domains": [{"title": f"칸{i}"} for i in range(MAX_DOMAINS + 1)]}
    assert parse_sheet(json.dumps(payload), source="test") == []


def test_subjects_beyond_eight_are_truncated_not_rejected():
    """과제 개수는 반대로 잘라냅니다.

    9번째 과제 하나 때문에 입장 전체를 실패시키면 사용자는 AI 를 못 씁니다. 판단
    근거는 `mandarin_goal/sheet.py` 의 상수 주석에 있습니다.
    """
    payload = {
        "domains": [
            {"title": "학습", "subjects": [{"id": i, "title": f"과제{i}"} for i in range(12)]}
        ]
    }
    domains = parse_sheet(json.dumps(payload), source="test")
    assert len(domains) == 1
    assert len(domains[0].subjects) == 8


def test_untitled_domains_are_dropped():
    """제목이 빈 칸은 프롬프트에 넣을 값이 없고, 모델이 그 빈 줄을 흉내냅니다."""
    payload = {"domains": [{"title": "   "}, {"title": "학습"}, {"title": ""}]}
    domains = parse_sheet(json.dumps(payload), source="test")
    assert [d.title for d in domains] == ["학습"]


def test_metadata_wins_over_attributes():
    """metadata 가 우선입니다 — 자유 문자열이라 크기 제약이 덜합니다."""
    attrs = {SHEET_ATTRIBUTE: json.dumps({"domains": [{"id": 1, "title": "우회로"}]})}
    domains = sheet_from_participant(json.dumps(SPRING_SHAPE), attrs)
    assert [d.title for d in domains] == ["학습", "커리어"]


def test_attributes_are_the_fallback_when_metadata_is_empty():
    """metadata 를 다른 용도로 쓰는 클라이언트를 위한 경로입니다."""
    attrs = {SHEET_ATTRIBUTE: json.dumps(SPRING_SHAPE)}
    assert [d.title for d in sheet_from_participant(None, attrs)] == ["학습", "커리어"]


def test_attributes_are_also_the_fallback_when_metadata_is_unparseable():
    """metadata 가 시트가 아닌 다른 JSON 인 경우 — 흔합니다.

    Spring 이 metadata 에 사용자 정보를 넣고 시트는 attributes 로 보내는 구성이면
    이 경로를 탑니다. metadata 파싱 실패로 끝내면 시트를 놓칩니다.
    """
    attrs = {SHEET_ATTRIBUTE: json.dumps(SPRING_SHAPE)}
    domains = sheet_from_participant('{"userId": 1042, "tier": "free"}', attrs)
    assert [d.title for d in domains] == ["학습", "커리어"]


def test_nothing_anywhere_is_still_fine():
    assert sheet_from_participant(None, None) == []
    assert sheet_from_participant(None, {}) == []


# -- 최종목표 --------------------------------------------------------------
#
# 만다라트 가운데 칸입니다. **모델에게 추론시키지 않고 서버가 넘깁니다** — 예전에는
# 프롬프트 규칙 2가 "중심 목표는 대화의 첫 목표 발화" 라고 했는데, 히스토리 창
# (`BOT_HISTORY_TURNS`)이 두 왕복이면 그 발화가 창 밖으로 밀려나 근거가 사라집니다.
def test_the_final_goal_rides_along_with_the_sheet():
    """Spring 응답의 `title` 이 최종목표다 — 프롬프트의 `<final_goal>` 로 간다."""
    sheet = parse_sheet_envelope(json.dumps(SPRING_SHAPE), source="test")
    assert sheet.title == SPRING_SHAPE["title"]
    assert [d.title for d in sheet.domains] == ["학습", "커리어"]


def test_a_missing_or_blank_final_goal_is_none_not_empty():
    """빈 문자열로 두면 프롬프트에 "목표가 있는데 값이 빈" 슬롯이 실린다.

    없는 것과 구분되지 않으면 모델은 목표가 정해진 줄 알고 빈 문장에 과제를 맞춥니다.
    """
    no_title = {"domains": SPRING_SHAPE["domains"]}
    assert parse_sheet_envelope(json.dumps(no_title), source="test").title is None
    blank = {"title": "   ", "domains": SPRING_SHAPE["domains"]}
    assert parse_sheet_envelope(json.dumps(blank), source="test").title is None
    # 배열만 온 모양(브라우저 축약형)에는 목표를 실을 자리가 없다.
    assert parse_sheet_envelope(json.dumps(SPRING_SHAPE["domains"]), source="test").title is None
    # 파싱 실패도 같다 — fail-open 이라 빈 시트로 계속 간다.
    assert parse_sheet_envelope("{깨진 JSON", source="test").title is None


def test_a_long_final_goal_is_cut_not_refused():
    """슬롯 하나가 길어지면 진짜 지시문이 뒤로 밀린다 — 자르고 계속한다.

    거부하면 목표 한 줄 때문에 시트가 통째로 버려지고 중복 검사까지 같이 죽습니다
    (`MAX_DOMAINS` 초과를 **거부**하는 것과 반대 판단입니다 — 그쪽은 시트 자체가
    이상하다는 신호이고, 이쪽은 사용자가 길게 적었을 뿐입니다).
    """
    payload = {"title": "가" * 500, "domains": SPRING_SHAPE["domains"]}
    sheet = parse_sheet_envelope(json.dumps(payload), source="test")
    assert sheet.title is not None
    assert len(sheet.title) == MAX_SHEET_TITLE_LENGTH
    assert [d.title for d in sheet.domains] == ["학습", "커리어"]


def test_the_goal_survives_when_only_the_domains_come_from_the_fallback():
    """metadata 에 목표만, attributes 에 칸이 있는 조합.

    편집기에서 가운데 칸만 적고 과제는 아직 없는 사용자가 이 모양입니다. 우회로 결과로
    통째로 갈아치우면 그 사용자의 목표가 조용히 사라집니다.
    """
    attrs = {SHEET_ATTRIBUTE: json.dumps({"domains": SPRING_SHAPE["domains"]})}
    sheet = sheet_envelope_from_participant('{"title": "3년 안에 이직", "domains": []}', attrs)
    assert sheet.title == "3년 안에 이직"
    assert [d.title for d in sheet.domains] == ["학습", "커리어"]


def test_the_domains_only_helpers_still_return_a_list():
    """`parse_sheet`·`sheet_from_participant` 는 칸 목록만 — 호출부가 많아 남긴 껍데기다."""
    assert [d.title for d in parse_sheet(json.dumps(SPRING_SHAPE), source="test")] == [
        "학습",
        "커리어",
    ]
    assert sheet_from_participant(None, None) == []
