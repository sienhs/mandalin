"""LiveKit 이벤트 핸들러의 **인자 순서**를 SDK 와 맞춥니다.

이벤트는 위치 인자로 전달되고 파이썬은 타입을 검사하지 않습니다. 순서를 잘못 받으면
**예외 없이 조용히 엉뚱한 값을 씁니다** — 실제로 이렇게 터졌습니다.

    track_muted 를 (publication, participant) 로 받음
      -> publication 자리에 Participant 가 들어옴
      -> Participant 에도 `.sid` 가 있어서 AttributeError 도 안 남
      -> 참가자 sid(PA_…)를 트랙 sid(TR_…)로 알고 dict.pop 이 못 찾음
      -> 증상: "마이크를 껐는데 stt usage 가 5초마다 계속 찍힘"

로그에 에러가 없어서 찾는 데 왕복이 여러 번 걸렸습니다. **순서가 이벤트마다 다르다는
것**이 함정입니다 — `track_subscribed` 는 `(track, publication, participant)` 인데
`track_muted` 는 `(participant, publication)` 입니다.

여기서는 SDK 소스의 `self.emit(...)` 호출을 읽어 **실제 순서**를 뽑고, 우리 핸들러의
파라미터 이름이 그와 맞는지 봅니다. SDK 를 올릴 때 순서가 바뀌면 이 테스트가 먼저
깨집니다.

**판정은 이름이 아니라 의미로 합니다**(`ROLE_ALIASES`). 예전에는 SDK 변수명에 우리가
기대하는 단어가 들어 있는지를 봤는데(`"publication" in got`), livekit 1.1.14 가
`publication` 을 `subscribed`/`unsubscribed` 로, `track` 을 `remote_video_track`/
`rtrack` 으로 **이름만** 바꾸면서 이 파일이 통째로 깨졌습니다 — 순서는 그대로였습니다.
잡아야 하는 것은 순서이고 이름 변경은 위험하지 않습니다. 그래도 **모르는 이름은
실패**로 둡니다: 이름이 바뀌었다는 건 그쪽 코드가 움직였다는 뜻이라 사람이 한 번은
봐야 하고, 실패 문구가 무엇을 하면 되는지 알려줍니다.
"""
from __future__ import annotations

import ast
from pathlib import Path

import pytest
from livekit.rtc import room as room_module

import agent.entrypoint

ENTRYPOINT_PY = Path(agent.entrypoint.__file__)

#: 우리가 구독하는 이벤트와, 각 인자가 무엇이어야 하는지.
#: 값은 SDK 가 넘기는 **의미** 순서입니다 — 파라미터 이름이 이걸 따라야 합니다.
EXPECTED = {
    "track_subscribed": ("track", "publication", "participant"),
    "track_unsubscribed": ("track", "publication", "participant"),
    "track_muted": ("participant", "publication"),
    "track_unmuted": ("participant", "publication"),
}

#: SDK 가 `self.emit()` 에 넘기는 **지역 변수 이름 → 의미.**
#:
#: 부분일치로 유추하지 않습니다. `subscribed_participant` 는 `subscribed` 를 포함하고
#: `remote_audio_track` 은 `track` 을 포함해서, 규칙 순서 하나에 판정이 뒤집힙니다.
#: 표로 두면 어느 이름이 무엇인지가 코드에 남습니다.
#:
#: **모르는 이름을 publication 으로 떨어뜨리지 않습니다.** 그렇게 하면 SDK 가 인자를
#: 하나 끼워 넣는 날 조용히 통과합니다 — 이 파일이 막으려는 사고가 정확히 그 모양입니다.
ROLE_ALIASES: dict[str, str] = {
    "track": "track",
    "rtrack": "track",
    "remote_audio_track": "track",
    "remote_video_track": "track",
    "publication": "publication",
    "rpublication": "publication",
    # livekit 1.1.14 부터의 이름. 값 자체는 그대로 TrackPublication 입니다.
    "subscribed": "publication",
    "unsubscribed": "publication",
    "participant": "participant",
    "rparticipant": "participant",
    "subscribed_participant": "participant",
    "unsubscribed_participant": "participant",
}


def _arg_name(node: ast.expr) -> str:
    """`emit` 인자 하나의 이름. 모르는 모양은 그대로 돌려 실패 문구에 보이게 합니다."""
    if isinstance(node, ast.Name):
        return node.id
    if isinstance(node, ast.Attribute):
        return node.attr
    return ast.dump(node)


def _sdk_emit_sites(event: str, source: Path | None = None) -> list[tuple[str, ...]]:
    """SDK 소스에서 그 이벤트를 emit 하는 **모든** 자리의 인자 이름.

    **첫 번째만 보면 안 됩니다.** 1.1.14 의 `track_subscribed` 는 video/audio 두 곳에서
    emit 하고, 우리가 구독하는 것은 audio 쪽입니다. 예전 `re.search` 는 앞에 있는
    video 쪽만 봤습니다.

    정규식이 아니라 `ast` 로 읽습니다 — 예전 패턴의 `[^)]+` 는 인자에 괄호가 하나라도
    들어가면(중첩 호출, 튜플) 거기서 끊깁니다.

    `source` 를 받는 이유는 **이 테스트의 이빨을 테스트하기 위해서**입니다(아래
    `test_a_reordered_sdk_would_still_fail`). 기본값은 설치된 SDK 입니다.
    """
    source = source or Path(room_module.__file__)
    tree = ast.parse(source.read_text(encoding="utf-8"))
    sites: list[tuple[str, ...]] = []
    for node in ast.walk(tree):
        if not isinstance(node, ast.Call):
            continue
        if not (isinstance(node.func, ast.Attribute) and node.func.attr == "emit"):
            continue
        if not node.args:
            continue
        first = node.args[0]
        if isinstance(first, ast.Constant) and first.value == event:
            sites.append(tuple(_arg_name(a) for a in node.args[1:]))
    return sites


def _handler_params(event: str) -> tuple[str, ...] | None:
    """`@ctx.room.on("<event>")` 로 등록된 우리 핸들러의 파라미터 이름."""
    tree = ast.parse(ENTRYPOINT_PY.read_text(encoding="utf-8"))
    for node in ast.walk(tree):
        if not isinstance(node, ast.FunctionDef | ast.AsyncFunctionDef):
            continue
        for deco in node.decorator_list:
            if not isinstance(deco, ast.Call) or not deco.args:
                continue
            first = deco.args[0]
            if isinstance(first, ast.Constant) and first.value == event:
                return tuple(a.arg for a in node.args.args)
    return None


@pytest.mark.parametrize("event", sorted(EXPECTED))
def test_the_sdk_still_emits_the_order_we_assumed(event: str):
    """SDK 쪽 순서가 우리가 가정한 것과 같은지. 버전을 올리면 여기가 먼저 깨집니다.

    emit 하는 자리가 여럿이면 **전부** 봅니다 — 하나만 맞으면 우리가 구독하는 쪽이
    틀렸을 수 있습니다.
    """
    _check_sites(event, _sdk_emit_sites(event))


def _check_sites(event: str, sites: list[tuple[str, ...]]) -> None:
    """판정 본체. 아래 음성 테스트가 가짜 SDK 소스로 같은 것을 부릅니다."""
    assert sites, f"SDK 에서 {event} 의 emit 을 찾지 못했습니다"

    expected = EXPECTED[event]
    for names in sites:
        unknown = [n for n in names if n not in ROLE_ALIASES]
        assert not unknown, (
            f"{event}: SDK 가 인자 이름을 바꿨거나 인자를 늘렸습니다 — {unknown}. "
            f"그 값이 track/publication/participant 중 무엇인지 확인하고 "
            f"ROLE_ALIASES 에 추가하세요 (SDK: {names}). "
            "이름 변경만이면 순서는 그대로일 수 있지만, 그걸 확인하는 게 이 테스트입니다"
        )
        roles = tuple(ROLE_ALIASES[n] for n in names)
        assert roles == expected, (
            f"{event}: SDK 인자 순서가 {roles} 로 바뀌었습니다 "
            f"(기대 {expected}, SDK 변수 {names}). entrypoint.py 의 핸들러도 같이 "
            "고쳐야 합니다 — 어긋나면 예외 없이 조용히 엉뚱한 객체를 씁니다"
        )


#: 가짜 SDK 소스. `_sdk_emit_sites` 가 `ast` 로 읽으므로 실행 가능한 파이썬이어야 합니다.
FAKE_SDK = """
class Room:
    def _on_event(self):
        self.emit("track_subscribed", {args})
"""


def _fake_sdk(tmp_path: Path, args: str) -> Path:
    path = tmp_path / "fake_room.py"
    path.write_text(FAKE_SDK.format(args=args), encoding="utf-8")
    return path


def test_a_renamed_sdk_variable_passes(tmp_path: Path):
    """livekit 1.1.14 가 실제로 한 일 — 이름만 바꿨고 순서는 그대로. 통과해야 한다."""
    source = _fake_sdk(tmp_path, "remote_audio_track, subscribed, subscribed_participant")
    _check_sites("track_subscribed", _sdk_emit_sites("track_subscribed", source))


def test_a_reordered_sdk_would_still_fail(tmp_path: Path):
    """**이 파일의 존재 이유.** 순서가 바뀌면 반드시 깨져야 한다 —
    이름으로 판정하던 것을 의미로 바꾸면서 이빨이 빠지지 않았는지 본다."""
    source = _fake_sdk(tmp_path, "subscribed, remote_audio_track, subscribed_participant")
    with pytest.raises(AssertionError, match="순서가"):
        _check_sites("track_subscribed", _sdk_emit_sites("track_subscribed", source))


def test_an_unknown_sdk_variable_fails_instead_of_guessing(tmp_path: Path):
    """모르는 이름을 publication 으로 떨어뜨리면 인자가 하나 끼어드는 날 조용히
    통과한다 — 이 파일이 막으려는 사고가 정확히 그 모양이다."""
    source = _fake_sdk(tmp_path, "remote_audio_track, subscribed, mystery_arg")
    with pytest.raises(AssertionError, match="mystery_arg"):
        _check_sites("track_subscribed", _sdk_emit_sites("track_subscribed", source))


def test_a_second_emit_site_is_not_skipped(tmp_path: Path):
    """1.1.14 는 video/audio 두 곳에서 emit 하고 우리가 쓰는 것은 audio 쪽이다.
    예전 `re.search` 는 앞의 것만 봐서, 뒤쪽이 틀려도 통과했다."""
    path = tmp_path / "fake_room.py"
    path.write_text(
        FAKE_SDK.format(args="remote_video_track, subscribed, subscribed_participant")
        + '        self.emit("track_subscribed", subscribed, remote_audio_track, '
        'subscribed_participant)\n',
        encoding="utf-8",
    )
    sites = _sdk_emit_sites("track_subscribed", path)
    assert len(sites) == 2, "emit 자리를 하나만 찾았습니다"
    with pytest.raises(AssertionError, match="순서가"):
        _check_sites("track_subscribed", sites)


def test_every_alias_maps_to_a_role_we_actually_expect():
    """표에 오타로 새 역할을 만들면 어떤 순서와도 안 맞아 항상 실패합니다 —
    원인이 "SDK 가 바뀌었다" 로 읽혀서 찾는 데 오래 걸립니다."""
    roles = {role for order in EXPECTED.values() for role in order}
    assert set(ROLE_ALIASES.values()) <= roles, (
        f"모르는 역할이 있습니다: {set(ROLE_ALIASES.values()) - roles}"
    )


@pytest.mark.parametrize("event", sorted(EXPECTED))
def test_our_handler_takes_the_arguments_in_that_order(event: str):
    """우리 핸들러의 파라미터 이름이 SDK 순서와 맞는지.

    **이름을 검사하는 것이 요점입니다.** 타입 힌트는 런타임에 아무 일도 하지 않으므로
    `publication: rtc.TrackPublication` 이라고 적어두고 Participant 를 받아도 조용합니다.
    """
    params = _handler_params(event)
    assert params is not None, f"{event} 핸들러를 entrypoint.py 에서 찾지 못했습니다"

    expected = EXPECTED[event]
    assert len(params) == len(expected), (
        f"{event} 핸들러 인자 개수가 {params} 입니다 — SDK 는 {expected} 를 넘깁니다"
    )
    for got, want in zip(params, expected, strict=True):
        assert want in got, (
            f"{event}: {got!r} 자리에는 {want!r} 가 와야 합니다. "
            f"순서가 뒤바뀌면 예외 없이 조용히 엉뚱한 객체를 씁니다 (SDK 순서: {expected})"
        )
