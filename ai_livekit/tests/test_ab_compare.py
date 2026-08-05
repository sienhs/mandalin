"""A/B 비교가 **짝지어** 판정하는가.

이 파일이 지키는 것은 통계 하나입니다. 두 프롬프트를 견줄 때 각 팔의 정확도에 신뢰구간을
붙여 놓고 "겹치니까 차이 없음" 으로 읽으면, 골든셋 40건 규모에서는 **실제 개선을 거의
매번 놓칩니다.** 두 팔이 같은 케이스를 풀었으므로 짝을 지을 수 있고, 짝지으면 케이스
난이도의 분산이 상쇄되어 훨씬 작은 표본으로도 차이가 보입니다.

증상이 없는 종류라 테스트가 필요합니다 — 잘못 판정해도 에러가 없고, "아직 유의하지
않습니다" 라는 그럴듯한 문장만 나옵니다. 그 문장을 믿고 개선된 프롬프트를 되돌립니다.

**API 를 부르지 않습니다.** 리포트 두 개를 손으로 지어서 `compare()` 에만 넣습니다.
"""
from __future__ import annotations

import pytest

from evals.runner import (
    COMPARE_METRICS,
    PRIMARY_METRIC,
    SIGNIFICANCE,
    compare,
    needed_sweep,
    sign_test,
    wilson,
)

#: 채점 키 전부. 리포트를 지을 때 빠뜨리면 `compare()` 가 `KeyError` 로 터집니다.
OK_KEYS = ("intent_ok", "action_ok", "domain_ok", "frequency_ok", "count_ok", "clean")


def case(cid: str, *, ok: bool, **over) -> dict:
    """채점된 케이스 하나. `ok` 는 모든 지표를 한꺼번에 맞히거나 틀리게 합니다."""
    row = {
        "id": cid,
        "utterance": f"발화 {cid}",
        "note": "",
        "expect": {"intent": ["goal"], "action": ["generate"], "domain": None,
                   "subject_id": None},
        "ambiguous": False,
        "safety": False,
        "measured": True,
        "failed_runs": 0,
        "intent": "goal" if ok else "chitchat",
        "action": "generate" if ok else "reject",
        "consistency": 1.0,
        "defects": [],
        "runs": [],
        "verdict": "통과" if ok else "실패",
        **{k: ok for k in OK_KEYS},
    }
    row.update(over)
    return row


def report(rows: list[dict], *, prompt_dir: str = "prompts", **meta) -> dict:
    """`compare()` 가 읽는 최소 리포트. `summary` 는 비용 칸에만 쓰입니다."""
    return {
        "meta": {
            "prompt_dir": prompt_dir,
            "provider": "gemini",
            "classify_model": "flash",
            "decide_model": "flash",
            "repeat": 3,
            "started": 1_770_000_000.0,
            "elapsed_s": 12.0,
            "stopped": False,
            "subset": None,
            **meta,
        },
        "summary": {
            "cases": len(rows),
            "tokens": {"prompt": {"mean": 1400}, "output": {"mean": 200}},
            "latency_ms": {"p50": 1200},
            "violations": {},
            "unstable": [],
        },
        "results": rows,
    }


def metric(cmp: dict, name: str = PRIMARY_METRIC) -> dict:
    return next(m for m in cmp["metrics"] if m["name"] == name)


def test_the_paired_test_sees_a_difference_the_overlapping_intervals_hide():
    """**핵심 테스트.** 신뢰구간이 겹치는데 짝지은 검정은 유의하다.

    이 파일이 존재하는 이유입니다. 40건 중 A 가 33건, B 가 39건을 맞혔다고 하면 —
    정확도로는 82.5% 대 97.5% 인데 Wilson 구간이 서로 겹칩니다. 눈으로 "겹치니까
    아직 모른다" 로 읽는 자리인데, **갈린 6건이 전부 B 쪽**이라 짝지어 보면 유의합니다.
    """
    a_rows, b_rows = [], []
    for i in range(40):
        # 앞 6건만 갈립니다: A 는 틀리고 B 는 맞습니다. 나머지 34건 중 33건은 둘 다
        # 맞고 1건은 둘 다 틀립니다(정보 없는 쌍).
        if i < 6:
            a_rows.append(case(f"g{i:02d}", ok=False))
            b_rows.append(case(f"g{i:02d}", ok=True))
        elif i == 6:
            a_rows.append(case(f"g{i:02d}", ok=False))
            b_rows.append(case(f"g{i:02d}", ok=False))
        else:
            a_rows.append(case(f"g{i:02d}", ok=True))
            b_rows.append(case(f"g{i:02d}", ok=True))

    cmp = compare(report(a_rows), report(b_rows, prompt_dir="prompts_v2"))
    m = metric(cmp)

    # 두 구간이 실제로 겹치는지부터 확인합니다 — 겹치지 않으면 이 테스트가 아무것도
    # 지키지 못합니다(그때는 눈으로 봐도 알 수 있는 차이입니다).
    assert m["a"]["hi"] > m["b"]["lo"], "구간이 안 겹치면 이 회귀 테스트가 무의미합니다"
    assert m["discordant"] == {"b_wins": 6, "a_wins": 0, "n": 6}
    assert m["p_value"] < SIGNIFICANCE
    assert m["verdict"] == "개선"
    assert cmp["verdict"] == "개선", "주 지표의 판정이 전체 판정이어야 합니다"


def test_a_case_only_one_arm_could_measure_is_dropped_not_counted():
    """429 로 한쪽만 못 잰 케이스는 **오답이 아니라 짝에서 빠집니다.**

    `_score_case` 가 지키는 규칙("429 는 미측정")의 짝지은 판입니다. 여기서 세면 그날
    한도에 걸린 쪽이 진 것으로 보고됩니다 — 프롬프트는 멀쩡한데 표가 퇴보라고 말합니다.
    """
    dead = {k: None for k in OK_KEYS}
    a_rows = [
        case("g01", ok=True),
        case("g02", ok=True, measured=False, verdict="미측정", intent=None, action=None, **dead),
    ]
    b_rows = [case("g01", ok=True), case("g02", ok=True)]

    cmp = compare(report(a_rows), report(b_rows, prompt_dir="prompts_v2"))
    m = metric(cmp)

    assert m["a"]["n"] == 1 and m["b"]["n"] == 1, "못 잰 케이스가 분모에 남았습니다"
    assert m["discordant"]["n"] == 0, "미측정을 A 의 패배로 셌습니다"
    assert m["verdict"] == "동일"
    # 조용히 빠지면 안 됩니다 — 이름이 리포트에 남아야 화면이 경고할 수 있습니다.
    assert cmp["measurement"]["a_unmeasured"] == ["g02"]
    assert cmp["measurement"]["b_unmeasured"] == []


def test_rates_come_from_the_paired_subset_not_from_each_summary():
    """비율을 **짝지은 부분집합에서 다시 계산하는가.**

    각 팔의 `summary` 를 그대로 나란히 놓으면 서로 다른 시험지의 점수를 비교합니다.
    A 가 못 잰 그 한 건이 어려운 케이스였다면 B 만 벌을 받습니다.
    """
    dead = {k: None for k in OK_KEYS}
    # A: g01 통과, g02 미측정. B: g01 통과, g02 실패.
    a_rows = [
        case("g01", ok=True),
        case("g02", ok=True, measured=False, verdict="미측정", **dead),
    ]
    b_rows = [case("g01", ok=True), case("g02", ok=False)]

    m = metric(compare(report(a_rows), report(b_rows, prompt_dir="v2")))

    # 짝은 g01 하나뿐이라 양쪽 다 1/1 입니다. B 의 summary 는 1/2(50%)이지만 그 값을
    # 쓰면 A(100%)와 견주어 "퇴보" 로 보입니다 — 실제로는 견줄 짝이 없는 케이스입니다.
    assert (m["a"]["k"], m["a"]["n"]) == (1, 1)
    assert (m["b"]["k"], m["b"]["n"]) == (1, 1)
    assert m["delta"] == 0.0


def test_a_tie_and_a_thin_split_are_both_undecided_but_named_differently():
    """`동일`(갈린 것이 없음)과 `판정 불가`(갈렸지만 부족함)를 가른다.

    둘 다 "모른다" 지만 다음에 할 일이 정반대입니다 — 전자는 두 프롬프트가 같은 답을
    낸 것이라 더 돌려도 안 갈리고, 후자는 표본을 늘리면 갈릴 수 있습니다.
    """
    same = [case(f"g{i:02d}", ok=True) for i in range(10)]
    tie = compare(report(same), report([dict(r) for r in same], prompt_dir="v2"))
    assert metric(tie)["verdict"] == "동일"
    assert metric(tie)["win_share"] is None, "갈린 쌍이 없으면 우세 비율도 없습니다"

    # 3:2 로 갈렸지만 동전 던지기로 흔한 결과입니다.
    a_rows = [case("g01", ok=False), case("g02", ok=False), case("g03", ok=False),
              case("g04", ok=True), case("g05", ok=True)]
    b_rows = [case("g01", ok=True), case("g02", ok=True), case("g03", ok=True),
              case("g04", ok=False), case("g05", ok=False)]
    thin = metric(compare(report(a_rows), report(b_rows, prompt_dir="v2")))

    assert thin["discordant"] == {"b_wins": 3, "a_wins": 2, "n": 5}
    assert thin["p_value"] >= SIGNIFICANCE
    assert thin["verdict"] == "판정 불가", "3:2 를 개선이라고 부르면 안 됩니다"
    # 우세 비율의 구간이 50% 를 품는 것이 곧 "아직 모른다" 입니다.
    assert thin["win_share"]["lo"] < 0.5 < thin["win_share"]["hi"]


def test_a_regression_is_called_a_regression():
    """방향이 반대면 `퇴보` 다 — 절댓값만 보고 개선이라고 말하지 않는다."""
    a_rows = [case(f"g{i:02d}", ok=True) for i in range(8)]
    b_rows = [case(f"g{i:02d}", ok=i >= 6) for i in range(8)]  # B 가 6건을 잃습니다

    m = metric(compare(report(a_rows), report(b_rows, prompt_dir="v2")))
    assert m["discordant"] == {"b_wins": 0, "a_wins": 6, "n": 6}
    assert m["verdict"] == "퇴보"
    assert m["delta"] < 0


def test_the_comparison_is_symmetric():
    """A 와 B 를 맞바꾸면 판정도 뒤집힌다 — 어느 쪽을 먼저 적었는지가 결론을 바꾸면 안 된다."""
    a_rows = [case(f"g{i:02d}", ok=i >= 6) for i in range(20)]
    b_rows = [case(f"g{i:02d}", ok=True) for i in range(20)]

    forward = metric(compare(report(a_rows), report(b_rows, prompt_dir="v2")))
    backward = metric(compare(report(b_rows, prompt_dir="v2"), report(a_rows)))

    assert forward["verdict"] == "개선" and backward["verdict"] == "퇴보"
    assert forward["delta"] == -backward["delta"]
    assert forward["p_value"] == backward["p_value"]


def test_flips_include_the_ones_that_fell_to_unmeasured():
    """판정 표에는 **미측정으로 떨어진 것도** 나온다.

    지표별 `b_won`/`a_won` 에는 안 나옵니다(그 케이스는 분모에서 빠졌으니까요). 그런데
    화면에서는 "왜 B 가 이 케이스를 못 풀었지" 를 묻게 되므로, 통과/실패/미측정 축의
    변화를 따로 싣습니다 — 원인이 프롬프트가 아니라 한도라는 것을 보여 주는 자리입니다.
    """
    dead = {k: None for k in OK_KEYS}
    a_rows = [case("g01", ok=True), case("g02", ok=True)]
    b_rows = [
        case("g01", ok=True),
        case("g02", ok=True, measured=False, verdict="미측정", intent=None, action=None, **dead),
    ]

    cmp = compare(report(a_rows), report(b_rows, prompt_dir="v2"))
    assert [f["id"] for f in cmp["flips"]] == ["g02"]
    assert cmp["flips"][0]["a"]["verdict"] == "통과"
    assert cmp["flips"][0]["b"]["verdict"] == "미측정"
    assert metric(cmp)["discordant"]["n"] == 0, "미측정은 승패가 아닙니다"


def test_a_confound_is_reported_so_the_table_is_not_read_as_a_prompt_result():
    """프롬프트 말고 다른 것이 다르면 **표가 스스로 그 사실을 들고 다닌다.**

    없으면 "v2 가 좋다" 는 결론이 실은 "flash 가 아니라 pro 로 돌렸다" 인 채로 남습니다.
    """
    rows = [case("g01", ok=True)]
    cmp = compare(
        report(rows),
        report([dict(r) for r in rows], prompt_dir="v2", decide_model="pro", repeat=5),
    )
    assert set(cmp["confounds"]) == {"decide_model", "repeat"}
    assert cmp["null_test"] is False


def test_the_same_folder_twice_is_marked_as_a_noise_measurement():
    """A/A 는 막지 않고 **표시합니다** — 잡음의 크기를 재는 정당한 실행입니다."""
    rows = [case("g01", ok=True)]
    cmp = compare(report(rows), report([dict(r) for r in rows]))
    assert cmp["null_test"] is True
    assert cmp["confounds"] == []


def test_a_relabelled_case_is_excluded_rather_than_scored():
    """그 사이 골든셋이 편집됐으면 그 케이스는 뺀다 — 같은 id 가 다른 시험이 됐다."""
    a_rows = [case("g01", ok=True), case("g02", ok=True)]
    b_rows = [case("g01", ok=True), case("g02", ok=False)]
    b_rows[1]["expect"] = {"intent": ["chitchat"], "action": ["reject"],
                           "domain": None, "subject_id": None}

    cmp = compare(report(a_rows), report(b_rows, prompt_dir="v2"))
    assert cmp["paired"]["relabelled"] == ["g02"]
    assert cmp["paired"]["cases"] == 1
    assert metric(cmp)["discordant"]["n"] == 0, "라벨이 바뀐 케이스로 승패를 셌습니다"


def test_cases_missing_from_one_report_are_listed():
    """한쪽에만 있는 케이스(`--only` 로 돌린 리포트 등)는 이름이 남는다."""
    cmp = compare(
        report([case("g01", ok=True), case("g02", ok=True)]),
        report([case("g01", ok=True), case("g99", ok=True)], prompt_dir="v2"),
    )
    assert cmp["paired"]["cases"] == 1
    assert cmp["paired"]["a_only"] == ["g02"]
    assert cmp["paired"]["b_only"] == ["g99"]


def test_the_strict_metrics_drop_ambiguous_cases_like_the_summary_does():
    """엄격 지표는 `ambiguous` 를 뺀다 — `summarise()` 와 **같은 기준**이어야 한다.

    다르면 A/B 표의 정확도와 그 아래 리포트 카드의 정확도가 서로 다른 숫자를 말하고,
    어느 쪽이 맞는지 알 방법이 없습니다.
    """
    a_rows = [case("g01", ok=True), case("g02", ok=False, ambiguous=True)]
    b_rows = [case("g01", ok=True), case("g02", ok=True, ambiguous=True)]
    cmp = compare(report(a_rows), report(b_rows, prompt_dir="v2"))

    strict = metric(cmp, "action")
    lenient = metric(cmp, "action_lenient")

    assert strict["a"]["n"] == 1, "모호 케이스가 엄격 지표에 들어갔습니다"
    assert strict["discordant"]["n"] == 0
    # 허용집합 쪽은 전부 셉니다 — 그래서 여기서만 갈린 것이 보입니다.
    assert lenient["a"]["n"] == 2
    assert lenient["discordant"] == {"b_wins": 1, "a_wins": 0, "n": 1}


def test_the_exact_test_matches_hand_computed_values():
    """`sign_test` 가 정확 이항검정인가. 손으로 셀 수 있는 값과 맞춰 둡니다.

    카이제곱 근사로 갈아타면(불일치 쌍 25건 미만에서 못 쓰는 근사입니다) 이 값들이
    조용히 달라집니다.
    """
    assert sign_test(0, 0) == 1.0            # 갈린 것이 없으면 판정할 자료가 없다
    assert sign_test(1, 0) == 1.0            # 2 × 0.5 = 1.0
    assert sign_test(2, 0) == 0.5            # 2 × 0.25
    assert sign_test(5, 0) == 0.0625         # 2 × 1/32 — 아직 유의하지 않다
    assert sign_test(6, 0) == 0.03125        # 2 × 1/64 — 여기서 넘는다
    assert sign_test(3, 3) == 1.0            # 완전히 갈린 것은 증거가 없다
    assert sign_test(0, 6) == sign_test(6, 0), "양측 검정이라 방향과 무관해야 합니다"


def test_the_reported_sweep_is_the_real_threshold():
    """"몇 건이 갈려야 유의한가" 가 실제 임계와 맞는가.

    이 숫자를 화면이 그대로 보여 줍니다("한쪽으로 6건은 갈려야"). 틀리면 사용자가
    표본 크기의 한계를 프롬프트 문제로 읽습니다 — 고쳐도 이 셋으로는 안 갈립니다.
    """
    n = needed_sweep()
    assert sign_test(n, 0) < SIGNIFICANCE
    assert sign_test(n - 1, 0) >= SIGNIFICANCE
    assert n == 6, "0.05 에서는 6건입니다 — 값이 바뀌면 화면 문구도 함께 보세요"


def test_every_metric_in_the_table_is_actually_computed():
    """표에 적힌 지표가 전부 결과에 있는가 — 이름만 있고 값이 없는 칸이 없다."""
    rows = [case("g01", ok=True, safety=True), case("g02", ok=True)]
    cmp = compare(report(rows), report([dict(r) for r in rows], prompt_dir="v2"))

    assert [m["name"] for m in cmp["metrics"]] == [name for name, *_ in COMPARE_METRICS]
    assert any(m["name"] == cmp["primary"] for m in cmp["metrics"])
    for m in cmp["metrics"]:
        assert set(m) >= {"label", "a", "b", "delta", "discordant", "p_value", "verdict"}
        assert m["verdict"] in {"개선", "퇴보", "판정 불가", "동일"}


def test_a_metric_with_no_pairs_does_not_crash_or_claim_anything():
    """짝이 하나도 없는 지표(라벨이 없는 축)는 0/0 으로 조용히 남는다."""
    rows = [case("g01", ok=True)]  # safety 케이스가 없습니다
    m = metric(compare(report(rows), report([dict(rows[0])], prompt_dir="v2")), "safety")

    assert m["a"]["n"] == 0 and m["b"]["n"] == 0
    assert m["p_value"] == 1.0
    assert m["verdict"] == "동일"
    assert m["win_share"] is None


def test_the_wilson_interval_is_shared_with_the_single_run_report():
    """A/B 표의 구간도 `wilson()` 에서 온다 — 두 화면이 같은 함수를 쓴다."""
    rows_a = [case(f"g{i:02d}", ok=i > 2) for i in range(10)]
    m = metric(compare(report(rows_a), report([dict(r) for r in rows_a], prompt_dir="v2")))

    p, lo, hi = wilson(m["a"]["k"], m["a"]["n"])
    assert (m["a"]["p"], m["a"]["lo"], m["a"]["hi"]) == (
        round(p, 4), round(lo, 4), round(hi, 4)
    )


def test_the_record_saved_for_the_page_keeps_the_comparison_but_drops_the_runs():
    """`/eval` 이 다시 열렸을 때 그릴 것만 남기는가.

    런 원문(응답 전문)까지 남기면 반복 3회짜리 A/B 하나가 수 MB 가 되고, 그걸 폴링
    응답에 실으면 화면이 느려집니다.
    """
    from evals.runner import ab_record

    rows = [case("g01", ok=True)]
    a, b = report(rows), report([dict(rows[0])], prompt_dir="v2")
    record = ab_record({"a": a, "b": b, "compare": compare(a, b), "stopped_before_b": False})

    assert record["compare"]["verdict"] == "동일"
    assert record["summaries"]["a"]["cases"] == 1
    assert "results" not in record and "results" not in record["summaries"]["a"]
    assert record["saved_at"] > 0


def _saved(folder, *, a_dir="prompts", b_dir="v2", b_ok=True):
    """기록 한 건을 폴더에 남깁니다."""
    from evals.runner import compare as cmp_fn
    from evals.runner import save_ab

    a = report([case("g01", ok=True)], prompt_dir=a_dir)
    b = report([case("g01", ok=b_ok)], prompt_dir=b_dir)
    return save_ab({"a": a, "b": b, "compare": cmp_fn(a, b),
                    "stopped_before_b": False}, folder=folder)


def test_the_record_round_trips_through_json(tmp_path):
    """저장하고 다시 읽으면 같은 것이 나오는가 — 화면이 읽는 경로입니다."""
    import json

    from evals.runner import load_ab, save_ab

    rows = [case("g01", ok=True), case("g02", ok=False)]
    a = report(rows)
    b = report([case("g01", ok=True), case("g02", ok=True)], prompt_dir="v2")

    written = save_ab({"a": a, "b": b, "compare": compare(a, b),
                       "stopped_before_b": False}, folder=tmp_path)
    assert written["name"].startswith("ab-") and written["name"].endswith(".json")
    assert load_ab(folder=tmp_path) == json.loads(json.dumps(written, ensure_ascii=False))

    # 없으면 `None` 입니다 — 화면이 "기록 없음" 을 그리는 경로입니다.
    assert load_ab(folder=tmp_path / "빈폴더") is None
    assert load_ab("ab-없는파일.json", folder=tmp_path) is None


def test_records_pile_up_instead_of_overwriting_each_other(tmp_path):
    """**핵심 요구.** 새 A/B 가 지난 기록을 덮지 않는다.

    A/B 한 번이 실모델로 수백 번의 호출입니다. 덮어쓰면 지난 결과를 보려고 그만큼을
    다시 태워야 합니다 — 프롬프트를 몇 번 고치는 동안 "세 번 전이 뭐였지" 를 되짚는
    것이 이 도구를 쓰는 실제 방식입니다.
    """
    from evals.runner import list_ab, load_ab

    first = _saved(tmp_path, b_dir="v1")
    second = _saved(tmp_path, b_dir="v2")

    assert first["name"] != second["name"], "같은 파일에 덮어썼습니다"
    index = list_ab(tmp_path)
    assert len(index) == 2
    # 최신이 맨 앞입니다 — 목록의 기본 선택이 그것입니다.
    assert index[0]["name"] == second["name"]
    assert index[0]["b"] == "v2" and index[1]["b"] == "v1"
    # 이름을 주면 그 기록이, 안 주면 최신이 옵니다.
    assert load_ab(first["name"], folder=tmp_path)["compare"]["arms"]["b"]["prompt_dir"] == "v1"
    assert load_ab(folder=tmp_path)["compare"]["arms"]["b"]["prompt_dir"] == "v2"


def test_the_history_is_pruned_to_the_keep_limit(tmp_path):
    """보관 개수를 넘으면 **오래된 것부터** 지운다 — 최신이 지워지면 안 된다."""
    from evals.runner import AB_HISTORY_KEEP, list_ab

    names = [_saved(tmp_path, b_dir=f"v{i:02d}")["name"] for i in range(AB_HISTORY_KEEP + 3)]
    index = list_ab(tmp_path)

    assert len(index) == AB_HISTORY_KEEP
    kept = {h["name"] for h in index}
    assert names[-1] in kept, "가장 최근 기록이 지워졌습니다"
    assert names[0] not in kept and names[2] not in kept, "오래된 것이 남아 있습니다"


def test_the_file_names_sort_the_same_way_as_the_clock(tmp_path):
    """**회귀 테스트.** 사전순이 시간순과 같아야 한다.

    지우는 코드가 이 성질에 기대고 있습니다(`_ab_files` 가 이름으로 정렬하고 뒤쪽을
    지웁니다). 어긋나면 목록 순서가 이상해지는 정도가 아니라 **최신 기록이 지워집니다.**

    처음에 실제로 그랬습니다 — 같은 초에 겹칠 때만 `-2`, `-3` 을 붙였더니
    `ab-X-10.json` 이 `ab-X-2.json` 보다 작고, `ab-X-2.json` 이 `ab-X.json` 보다
    작았습니다(`-` 가 `.` 보다 작습니다). 그래서 일련번호를 자리수 고정으로 항상 붙입니다.
    """
    from evals.runner import _ab_files

    saved = [_saved(tmp_path, b_dir=f"v{i:02d}")["name"] for i in range(12)]

    # 저장한 순서의 역순 = 파일 목록 순서(최신이 앞).
    assert [p.name for p in _ab_files(tmp_path)] == list(reversed(saved))
    # 그리고 그 순서는 **이름만 보고** 나온 것이어야 합니다(내용을 읽지 않습니다).
    assert [p.name for p in _ab_files(tmp_path)] == sorted(saved, reverse=True)


def test_a_broken_file_is_listed_as_broken_not_silently_dropped(tmp_path):
    """깨진 기록은 목록에서 **빼지 않고 표시한다.**

    조용히 빼면 "어제 돌린 게 없어졌다" 가 되어 도구를 의심하게 됩니다. 그리고 나머지
    기록은 그대로 열려야 합니다 — 파일 하나 때문에 화면이 안 열리면 안 됩니다.
    """
    from evals.runner import list_ab, load_ab

    good = _saved(tmp_path)
    (tmp_path / "ab-20200101-000000.json").write_text("{ JSON 아님", encoding="utf-8")

    index = list_ab(tmp_path)
    assert len(index) == 2
    assert [h["broken"] for h in index] == [False, True], "최신순 정렬이 깨졌습니다"
    assert load_ab("ab-20200101-000000.json", folder=tmp_path) is None
    assert load_ab(good["name"], folder=tmp_path) is not None


def test_a_traversal_name_cannot_read_a_file_outside_the_history(tmp_path):
    """**목록에 있는 이름만 받습니다.** 브라우저가 보내는 값이라 그대로 경로에 붙이면
    `../../.env` 를 읽어 갈 수 있습니다 — 이 서버에는 인증이 없습니다.
    """
    from evals.runner import load_ab

    secret = tmp_path / "secret.json"
    secret.write_text('{"compare": "훔친 것"}', encoding="utf-8")
    history = tmp_path / "hist"
    _saved(history)

    for attempt in ("../secret.json", "..\\secret.json", "secret.json",
                    str(secret), "ab-*.json"):
        assert load_ab(attempt, folder=history) is None, f"{attempt} 이 통과했습니다"


def test_a_missing_prompt_folder_fails_before_it_scores_45_cases_against_nothing():
    """**핵심 회귀 방지선.** 없는 폴더를 적으면 돌기 전에 멈춘다.

    `SystemPrompt` 는 파일을 못 읽으면 예외 없이 비상 문구로 내려갑니다(운영에서는 의도된
    폴백입니다). 평가에서 그게 일어나면 골든셋 전체가 **다른 프롬프트로** 채점되고, 표는
    원인 없는 대규모 퇴보로 나옵니다 — A/B 에서는 "B 가 나쁘다" 로 읽히는데 실제로는
    "B 폴더가 없다" 입니다. 경고는 로거로 한 번 나가고 러너가 그것을 케이스별 수집통에
    담아 버리므로 화면에도 안 보입니다.
    """
    from evals.runner import build_settings

    with pytest.raises(ValueError, match="prompts_v9"):
        build_settings(prompt_dir="prompts_v9")

    # 있는 폴더는 그대로 통과합니다(정본).
    assert build_settings(prompt_dir="prompts").bot_system_prompt_file.endswith(
        "prompts/system.md"
    )


def test_a_stopped_first_arm_does_not_produce_a_comparison(monkeypatch):
    """A 가 중지되면 **B 를 돌리지 않고 비교도 만들지 않는다.**

    돌다 만 A(앞 몇 건만)와 완주한 B 를 비교하면 표가 통째로 거짓말을 합니다 — 짝은
    지어지지만 그 짝이 골든셋의 앞부분만이라, 뒤쪽 케이스에서 갈렸을 차이가 보이지
    않습니다.
    """
    import evals.runner as runner

    calls: list[str] = []

    def fake_run_eval(*, prompt_dir, **kw):
        calls.append(prompt_dir)
        rows = [case("g01", ok=True)]
        return report(rows, prompt_dir=prompt_dir, stopped=True)

    monkeypatch.setattr(runner, "run_eval", fake_run_eval)
    # 폴더 존재 검사는 위 테스트가 지킵니다. 여기서는 두 팔의 이름이 달라야 해서
    # (저장소에는 `prompts` 하나뿐입니다) 검사를 끕니다.
    monkeypatch.setattr(runner, "require_prompt_dir", lambda _dir: None)
    result = runner.run_ab(a="prompts", b="prompts_v2")

    assert calls == ["prompts"], "A 가 중지됐는데 B 를 돌렸습니다"
    assert result["stopped_before_b"] is True
    assert result["compare"] is None
    assert result["b"] is None


def test_the_two_arms_run_the_folders_they_were_given_and_progress_spans_both(monkeypatch):
    """두 팔이 각자 폴더로 돌고, 진행률이 **두 팔을 합쳐** 나오는가.

    합치지 않으면 A 가 끝나는 순간 막대가 100% 로 찼다가 0 으로 돌아갑니다 — 다 끝난
    줄 알고 창을 닫습니다.
    """
    import evals.runner as runner

    def fake_run_eval(*, prompt_dir, on_progress=None, **kw):
        rows = [case("g01", ok=True), case("g02", ok=True)]
        for done, row in enumerate(rows, 1):
            on_progress(done, len(rows), row)
        return report(rows, prompt_dir=prompt_dir)

    monkeypatch.setattr(runner, "run_eval", fake_run_eval)
    monkeypatch.setattr(runner, "require_prompt_dir", lambda _dir: None)

    seen: list[tuple[int, int]] = []
    arms: list[tuple[str, str]] = []
    result = runner.run_ab(
        a="prompts", b="prompts_v2",
        on_progress=lambda done, total, case: seen.append((done, total)),
        on_arm=lambda side, folder: arms.append((side, folder)),
    )

    assert arms == [("a", "prompts"), ("b", "prompts_v2")]
    assert seen == [(1, 4), (2, 4), (3, 4), (4, 4)], f"진행률이 이어지지 않습니다: {seen}"
    assert result["a"]["meta"]["prompt_dir"] == "prompts"
    assert result["b"]["meta"]["prompt_dir"] == "prompts_v2"
    assert result["compare"]["arms"]["b"]["prompt_dir"] == "prompts_v2"


@pytest.mark.parametrize("side", ["a", "b"])
def test_comparing_a_report_against_itself_finds_nothing(side):
    """같은 리포트를 두 번 넣으면 어떤 지표도 유의하지 않다 — **위양성 방지선**입니다.

    여기서 무언가 유의하게 나오면 `compare()` 가 승패를 잘못 세고 있다는 뜻입니다.
    """
    rows = [case(f"g{i:02d}", ok=i % 3 != 0, ambiguous=i == 4, safety=i == 5)
            for i in range(15)]
    same = report(rows)
    cmp = compare(same, report([dict(r) for r in rows]))

    assert cmp["arms"][side]["cases"] == 15
    assert cmp["flips"] == []
    for m in cmp["metrics"]:
        assert m["discordant"]["n"] == 0, f"{m['name']} 에서 없는 차이를 셌습니다"
        assert m["delta"] == 0.0
        assert m["verdict"] == "동일"
