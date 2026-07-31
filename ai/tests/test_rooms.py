import pytest

from app.config import Settings
from app.rooms.manager import RoomError, RoomManager


async def _noop(_message: dict) -> None:
    return None


def make_manager(**overrides) -> RoomManager:
    return RoomManager(Settings(_env_file=None, **overrides))


async def test_join_creates_room_and_assigns_unique_ids():
    rooms = make_manager()
    a = await rooms.join("demo", "우찬", _noop)
    b = await rooms.join("demo", "friend", _noop)

    room = rooms.get("demo")
    assert room is not None
    assert set(room.participants) == {a.id, b.id}
    assert a.id != b.id
    assert [p.id for p in room.others(a.id)] == [b.id]


async def test_room_is_disposed_when_last_participant_leaves():
    rooms = make_manager()
    a = await rooms.join("demo", "a", _noop)
    b = await rooms.join("demo", "b", _noop)

    assert await rooms.leave(a) is not None
    assert await rooms.leave(b) is None
    assert rooms.get("demo") is None


async def test_capacity_is_enforced():
    rooms = make_manager(max_participants_per_room=2)
    await rooms.join("demo", "a", _noop)
    await rooms.join("demo", "b", _noop)

    with pytest.raises(RoomError) as exc:
        await rooms.join("demo", "c", _noop)
    assert exc.value.code == "ROOM_FULL"


async def test_room_limit_is_enforced():
    rooms = make_manager(max_rooms=1)
    await rooms.join("one", "a", _noop)

    with pytest.raises(RoomError) as exc:
        await rooms.join("two", "b", _noop)
    assert exc.value.code == "ROOM_LIMIT"


async def test_broadcast_skips_the_sender():
    rooms = make_manager()
    received: dict[str, list[dict]] = {}

    def recorder(key: str):
        received[key] = []

        async def _send(message: dict) -> None:
            received[key].append(message)

        return _send

    a = await rooms.join("demo", "a", recorder("a"))
    await rooms.join("demo", "b", recorder("b"))

    room = rooms.get("demo")
    await room.broadcast({"type": "ping"}, exclude=a.id)

    assert received["a"] == []
    assert received["b"] == [{"type": "ping"}]
