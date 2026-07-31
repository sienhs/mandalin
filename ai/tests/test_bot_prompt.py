"""프리셋 시스템 프롬프트 — 파일 로딩과 무재시작 반영."""
import asyncio
import os

import httpx
import pytest

from app.bot.manager import BotManager
from app.bot.prompt import SystemPrompt
from app.chat.service import build_payload, fan_out
from app.config import Settings, get_settings
from app.main import create_app
from app.rooms.manager import RoomManager

DEFAULT = "코드에 박힌 기본 인격"


def make_settings(**overrides) -> Settings:
    base = dict(
        bot_enabled=True,
        bot_provider="echo",
        bot_display_name="AI",
        bot_system_prompt=DEFAULT,
    )
    base.update(overrides)
    return Settings(_env_file=None, **base)


def write(path, text: str, *, bump: float = 0.0) -> None:
    """파일을 쓰고 필요하면 mtime 을 밀어 변경을 확실히 감지시킵니다.

    같은 밀리초에 같은 길이로 덮어쓰면 (mtime, size) 캐시 키가 그대로일 수
    있습니다. 실사용에서는 사람이 편집하는 속도라 문제가 안 되지만, 테스트는
    그 창을 정확히 때립니다.
    """
    path.write_text(text, encoding="utf-8")
    if bump:
        stat = path.stat()
        os.utime(path, (stat.st_atime + bump, stat.st_mtime + bump))


class RecordingBackend:
    """모델에 실제로 들어간 system 문자열을 기록합니다."""

    name = "recording"

    def __init__(self) -> None:
        self.systems: list[str] = []

    async def reply(self, system: str, history) -> str:
        self.systems.append(system)
        return "네"

    async def aclose(self) -> None:
        return None


# ── 로딩 ──────────────────────────────────────────────────────────────
def test_no_file_configured_falls_back_to_the_setting():
    prompt = SystemPrompt(make_settings())
    assert prompt.path is None
    assert prompt.text() == DEFAULT
    assert prompt.describe()["source"] == "settings"


def test_file_contents_win_over_the_setting(tmp_path):
    path = tmp_path / "system.md"
    write(path, "너는 해적처럼 말한다.\n")

    prompt = SystemPrompt(make_settings(bot_system_prompt_file=str(path)))
    assert prompt.text() == "너는 해적처럼 말한다."  # 앞뒤 공백은 제거
    described = prompt.describe()
    assert described["source"] == "file"
    assert described["path"] == str(path)
    assert described["modified"] is not None


def test_multiline_markdown_survives_intact(tmp_path):
    path = tmp_path / "system.md"
    body = "너는 어시스턴트다.\n\n## 규칙\n- 3문장 이내\n- 모르면 모른다고 한다"
    write(path, body)

    assert SystemPrompt(make_settings(bot_system_prompt_file=str(path))).text() == body


def test_relative_paths_resolve_against_the_repo_root():
    """CWD 가 어디든 같은 파일을 봐야 합니다."""
    prompt = SystemPrompt(make_settings(bot_system_prompt_file="./prompts/system.md"))
    assert prompt.path is not None and prompt.path.is_absolute()
    assert prompt.path.parts[-2:] == ("prompts", "system.md")


def test_the_shipped_prompt_file_actually_loads():
    """저장소에 들어 있는 prompts/system.md 가 실제로 읽혀야 합니다.

    내용은 단정하지 않습니다 — 프롬프트는 사람이 계속 고치는 콘텐츠라,
    문구를 검사하면 프롬프트를 다듬을 때마다 테스트가 깨집니다. 여기서
    지켜야 할 것은 "파일이 실제로 읽혔는가" 뿐입니다.
    """
    prompt = SystemPrompt(make_settings(bot_system_prompt_file="./prompts/system.md"))
    described = prompt.describe()
    assert described["source"] == "file"
    assert described["chars"] > 0
    assert prompt.text() != DEFAULT


# ── 무재시작 반영 ──────────────────────────────────────────────────────
def test_edits_are_picked_up_without_a_restart(tmp_path):
    path = tmp_path / "system.md"
    write(path, "1번 인격")
    prompt = SystemPrompt(make_settings(bot_system_prompt_file=str(path)))
    assert prompt.text() == "1번 인격"

    write(path, "2번 인격으로 교체됨", bump=2)
    assert prompt.text() == "2번 인격으로 교체됨"


def test_unchanged_file_is_not_reread(tmp_path, monkeypatch):
    """매 응답마다 stat 은 해도 read 는 하지 않아야 합니다."""
    path = tmp_path / "system.md"
    write(path, "고정 인격")
    prompt = SystemPrompt(make_settings(bot_system_prompt_file=str(path)))
    prompt.text()  # 최초 로딩

    reads = 0
    original = type(path).read_text

    def counting_read(self, *args, **kwargs):
        nonlocal reads
        reads += 1
        return original(self, *args, **kwargs)

    monkeypatch.setattr(type(path), "read_text", counting_read)
    for _ in range(5):
        assert prompt.text() == "고정 인격"
    assert reads == 0


# ── 실패 처리 ──────────────────────────────────────────────────────────
def test_missing_file_falls_back_instead_of_crashing(tmp_path):
    prompt = SystemPrompt(
        make_settings(bot_system_prompt_file=str(tmp_path / "nope.md"))
    )
    assert prompt.text() == DEFAULT
    assert prompt.describe()["source"] == "settings"


def test_a_file_that_appears_later_is_picked_up(tmp_path):
    path = tmp_path / "late.md"
    prompt = SystemPrompt(make_settings(bot_system_prompt_file=str(path)))
    assert prompt.text() == DEFAULT

    write(path, "이제 생겼다")
    assert prompt.text() == "이제 생겼다"


def test_emptying_the_file_restores_the_default(tmp_path):
    path = tmp_path / "system.md"
    write(path, "임시 인격")
    prompt = SystemPrompt(make_settings(bot_system_prompt_file=str(path)))
    assert prompt.text() == "임시 인격"

    write(path, "   \n\n", bump=2)
    assert prompt.text() == DEFAULT


def test_a_vanished_file_keeps_the_last_good_value(tmp_path):
    """에디터가 '임시 파일에 쓰고 rename' 으로 저장하는 찰나를 견뎌야 합니다."""
    path = tmp_path / "system.md"
    write(path, "살아있던 인격")
    prompt = SystemPrompt(make_settings(bot_system_prompt_file=str(path)))
    assert prompt.text() == "살아있던 인격"

    path.unlink()
    assert prompt.text() == "살아있던 인격"  # 기본값으로 튕기지 않음


def test_unreadable_path_falls_back(tmp_path):
    # 디렉터리를 가리키면 stat 은 되지만 read 에서 실패합니다.
    directory = tmp_path / "somedir"
    directory.mkdir()
    prompt = SystemPrompt(make_settings(bot_system_prompt_file=str(directory)))
    assert prompt.text() == DEFAULT


def test_oversized_prompts_are_truncated(tmp_path):
    path = tmp_path / "huge.md"
    write(path, "가" * 5000)
    prompt = SystemPrompt(
        make_settings(bot_system_prompt_file=str(path), bot_system_prompt_max_chars=100)
    )
    assert len(prompt.text()) == 100


# ── 실제 대화 경로 ─────────────────────────────────────────────────────
async def test_the_file_prompt_reaches_the_model(tmp_path):
    path = tmp_path / "system.md"
    write(path, "너는 해적처럼 말한다.")

    settings = make_settings(bot_system_prompt_file=str(path))
    rooms = RoomManager(settings)
    backend = RecordingBackend()
    bots = BotManager(settings, rooms, backend)

    human = await rooms.join("demo", "우찬", lambda m: asyncio.sleep(0))
    await bots.ensure("demo")
    room = rooms.get("demo")

    await fan_out(room, human, build_payload(human, "안녕", 1000))
    await asyncio.sleep(0.05)

    assert backend.systems == ["너는 해적처럼 말한다."]


async def test_editing_mid_conversation_affects_the_next_reply(tmp_path):
    """대화 중에 프롬프트를 바꿔도 서버를 재시작할 필요가 없어야 합니다."""
    path = tmp_path / "system.md"
    write(path, "1번 인격")

    settings = make_settings(bot_system_prompt_file=str(path))
    rooms = RoomManager(settings)
    backend = RecordingBackend()
    bots = BotManager(settings, rooms, backend)

    human = await rooms.join("demo", "우찬", lambda m: asyncio.sleep(0))
    await bots.ensure("demo")
    room = rooms.get("demo")

    await fan_out(room, human, build_payload(human, "첫번째", 1000))
    await asyncio.sleep(0.05)

    write(path, "2번 인격", bump=2)

    await fan_out(room, human, build_payload(human, "두번째", 1000))
    await asyncio.sleep(0.05)

    assert backend.systems == ["1번 인격", "2번 인격"]


# ── 조회 엔드포인트 ────────────────────────────────────────────────────
@pytest.fixture
async def client(tmp_path):
    """개발자의 .env 와 무관하게 결정적으로 돌도록 프롬프트를 갈아끼웁니다."""
    path = tmp_path / "system.md"
    write(path, "엔드포인트 확인용 인격")

    # 진단 API 를 쓰는 테스트입니다. 기본값은 꺼짐이라 명시적으로 켭니다
    # (.env 의 다른 설정은 그대로 유지합니다).
    app = create_app(get_settings().model_copy(update={"debug_api_enabled": True}))
    async with app.router.lifespan_context(app):
        app.state.bots._backend = RecordingBackend()
        app.state.bots._prompt = SystemPrompt(
            make_settings(bot_system_prompt_file=str(path))
        )
        transport = httpx.ASGITransport(app=app)
        async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
            yield c, app, path


async def test_prompt_endpoint_returns_the_full_text(client):
    c, _, path = client
    body = (await c.get("/api/bot/prompt")).json()
    assert body["source"] == "file"
    assert body["text"] == "엔드포인트 확인용 인격"
    assert body["chars"] == len("엔드포인트 확인용 인격")
    assert body["path"] == str(path)


async def test_prompt_endpoint_reflects_an_edit(client):
    c, _, path = client
    write(path, "고쳐진 인격", bump=2)
    assert (await c.get("/api/bot/prompt")).json()["text"] == "고쳐진 인격"


async def test_status_summarises_the_prompt_without_the_body(client):
    c, _, _ = client
    prompt = (await c.get("/api/bot")).json()["prompt"]
    assert prompt["source"] == "file"
    assert prompt["chars"] > 0
    assert "text" not in prompt  # 본문은 /api/bot/prompt 에서만


async def test_ask_uses_the_preset_prompt_by_default(client):
    c, app, _ = client
    await c.post("/api/bot/ask", json={"text": "안녕"})
    assert app.state.bots.backend.systems[-1] == "엔드포인트 확인용 인격"


async def test_ask_still_honours_an_explicit_override(client):
    c, app = client[0], client[1]
    await c.post("/api/bot/ask", json={"text": "안녕", "system": "임시 지시문"})
    assert app.state.bots.backend.systems[-1] == "임시 지시문"
