"""AI 봇을 "그냥 참가자 한 명" 으로 취급하는 계층.

봇은 WebSocket 을 열지 않습니다. 사람과 똑같이 `RoomManager.join()` 으로
방에 들어가고, 그때 넘긴 `send` 콜백이 수신함 역할을 합니다.
`chat.fan_out` 이 DataChannel 없는 참가자에게 `Participant.send` 로
폴백하도록 이미 만들어져 있어서, 봇은 그 경로로 채팅을 받습니다.

**그래서 시그널링 프로토콜도 브라우저 코드도 전혀 바뀌지 않았습니다.**
봇은 `welcome.peers` 와 `peer-joined` 에 사람과 똑같이 실려 나갑니다.
클라이언트 입장에서는 미디어를 안 보내는 참가자(`publishing: false`) 하나가
더 있을 뿐입니다.

담당하는 것은 세 가지입니다.
  1. 방 생성/소멸에 맞춘 봇의 입퇴장
  2. 대화 히스토리 관리와 LLM 호출 (동시성·비용 제어 포함)
  3. 푸시투토크 음성 캡처
"""
from __future__ import annotations

import asyncio
import logging

from app.bot.goal import GoalPipeline, GoalResult
from app.bot.llm import LlmBackend, LlmError, Turn, build_backend
from app.bot.prompt import SystemPrompt
from app.bot.voice import VoiceCapture, to_upload_format
from app.chat.service import build_payload, fan_out
from app.config import Settings
from app.rooms.manager import RoomError, RoomManager
from app.rooms.models import Participant
from app.schemas import DomainRef

logger = logging.getLogger(__name__)


class BotManager:
    def __init__(
        self,
        settings: Settings,
        rooms: RoomManager,
        backend: LlmBackend | None = None,
    ) -> None:
        self._settings = settings
        self._rooms = rooms
        self._backend = backend or build_backend(settings)
        #: 프리셋 프롬프트. 파일을 보고 있다가 바뀌면 다음 응답부터 반영합니다.
        self._prompt = SystemPrompt(settings)
        #: `BOT_MODE=goal` 일 때만 켜집니다. 기본값 `chat` 에서는 None 이라
        #: 기존 경로(프롬프트 하나로 한 번 호출)가 그대로 돕니다.
        self._pipeline: GoalPipeline | None = (
            GoalPipeline(settings, self._backend)
            if settings.bot_mode == "goal"
            else None
        )
        if self._pipeline is not None:
            logger.info("bot mode=goal (분류 -> 후보 검색 -> 판단)")
        self._bots: dict[str, Participant] = {}          # room_id -> 봇 참가자
        self._history: dict[str, list[Turn]] = {}        # room_id -> 대화 기록
        #: room_id -> 사용자 시트의 도메인 칸 목록 (`join` 이 실어 보냅니다).
        #:
        #: **고정 목록이 없어서 이 값이 유일한 출처입니다.** 도메인은 시트마다 다르고
        #: 사용자가 만들 수 있으므로 서버가 미리 알 수 없습니다. 비어 있으면 AI 는
        #: 모든 도메인을 새 칸으로 제안합니다.
        self._domains: dict[str, list[DomainRef]] = {}
        self._locks: dict[str, asyncio.Lock] = {}        # room_id -> 생성 중 잠금
        self._captures: dict[str, VoiceCapture] = {}     # participant_id -> 진행 중인 캡처
        # 백그라운드 태스크의 강한 참조. 안 들고 있으면 GC 가 실행 중인
        # 태스크를 수거해 응답이 조용히 사라질 수 있습니다.
        self._tasks: set[asyncio.Task] = set()

    # -- 봇 입퇴장 ---------------------------------------------------------
    async def ensure(self, room_id: str) -> Participant | None:
        """봇이 없으면 방에 넣습니다. **`welcome` 을 만들기 전에** 불러야 합니다.

        `welcome.peers` 는 `room.others()` 로 만들어지므로, 그 전에 들어와 있지
        않으면 첫 입장자에게는 봇이 안 보입니다.
        """
        if not self._settings.bot_enabled:
            return None

        # 이미 들어가 있으면 그대로 씁니다. 방이 폐기됐다가 같은 이름으로
        # 다시 생긴 경우에는 참가자 목록에 없으므로 새로 만듭니다.
        existing = self._bots.get(room_id)
        room = self._rooms.get(room_id)
        if existing is not None and room is not None and existing.id in room.participants:
            return existing

        try:
            bot = await self._rooms.join(
                room_id,
                self._settings.bot_display_name,
                lambda message: self._on_message(room_id, message),
            )
        except RoomError as exc:
            # 봇도 정원을 한 자리 차지합니다. 사람으로 꽉 찬 방에는 못 들어갑니다.
            logger.warning("bot could not join room=%s: %s", room_id, exc.message)
            return None

        self._bots[room_id] = bot
        self._history[room_id] = []
        self._locks[room_id] = asyncio.Lock()
        logger.info("bot joined room=%s id=%s provider=%s", room_id, bot.id, self._backend.name)
        return bot

    async def release_if_only_bots(self, room_id: str) -> None:
        """사람이 모두 나가면 봇도 내보내 방이 폐기되게 합니다.

        `RoomManager` 는 참가자가 0명이 될 때 방을 지우는데, 봇이 남아 있으면
        그 조건이 영원히 성립하지 않습니다. 이 호출을 빠뜨리면 방과 대화
        기록이 계속 쌓이는 누수가 됩니다.
        """
        room = self._rooms.get(room_id)
        bot = self._bots.get(room_id)
        if room is None or bot is None:
            self._forget(room_id)
            return

        if any(pid != bot.id for pid in room.participants):
            return

        await self._rooms.leave(bot)
        self._forget(room_id)
        logger.info("bot released room=%s", room_id)

    def set_domains(self, room_id: str, domains: list[DomainRef]) -> None:
        """`join` 이 실어 보낸 도메인 칸 목록을 보관합니다.

        **`ensure()` 뒤에 불러야 합니다.** 봇 입장이 방 상태를 초기화하므로 앞에서
        넣으면 지워집니다.

        고정 목록이 없어진 뒤로 이게 도메인의 유일한 출처입니다. 비어 있으면
        (시트가 빈 사용자이거나 클라이언트가 안 보냈으면) AI 는 모든 도메인을
        새 칸으로 제안합니다 — 막지 않습니다. 기획상 새 도메인 제안이 정상 동작입니다.
        """
        self._domains[room_id] = list(domains)
        if domains:
            logger.info(
                "bot domains room=%s %d칸: %s",
                room_id, len(domains), [d.title for d in domains],
            )

    def _forget(self, room_id: str) -> None:
        self._bots.pop(room_id, None)
        self._history.pop(room_id, None)
        self._locks.pop(room_id, None)
        self._domains.pop(room_id, None)

    # -- 푸시투토크 --------------------------------------------------------
    async def start_listening(self, room_id: str, participant: Participant) -> str | None:
        """버튼을 누른 순간부터 이 참가자의 오디오를 모으기 시작합니다.

        실패 이유를 예외 대신 문자열 코드로 돌려줍니다. 그대로 클라이언트
        에러 메시지가 되어 사용자가 원인을 알 수 있습니다.

        주의: 트랙이 존재한다고 RTP 가 흐르는 건 아닙니다. `tracks["audio"]`
        는 SDP 협상 시점에 만들어지므로, ICE/DTLS 가 끝나기 전에 시작하면
        검사는 통과하지만 프레임이 0개로 끝납니다. 그래서 클라이언트가
        `publisher-state === "connected"` 전까지 버튼을 막습니다.
        """
        if not self._settings.bot_enabled or not self._settings.bot_voice_enabled:
            return "BOT_VOICE_DISABLED"
        if self._bots.get(room_id) is None:
            return "BOT_ABSENT"
        if participant.id in self._captures:
            return None  # 이미 듣는 중. 중복 pointerdown 은 무시합니다.

        publisher = participant.publisher
        track = publisher.tracks.get("audio") if publisher is not None else None
        if track is None:
            return "NO_AUDIO_TRACK"

        from app.media.peer import relay  # 순환 import 방지를 위한 지역 import

        capture = VoiceCapture(
            # 원본이 아니라 relay 프록시를 넘깁니다. 원본에서 직접 당기면
            # 다른 참가자에게 갈 프레임을 가로채게 됩니다.
            relay.subscribe(track, buffered=False),
            self._settings.bot_voice_max_seconds,
            on_limit=lambda: self._finalise(room_id, participant, "limit"),
        )
        self._captures[participant.id] = capture
        capture.start()
        logger.info("listening started room=%s participant=%s", room_id, participant.id)
        return None

    async def stop_listening(self, room_id: str, participant: Participant) -> None:
        """버튼에서 손을 뗐을 때. 여기서 바로 모델 호출이 예약됩니다."""
        await self._finalise(room_id, participant, "stop")

    async def cancel_listening(self, participant: Participant) -> None:
        """연결이 끊겼을 때. 버퍼는 버리고 모델을 호출하지 않습니다."""
        capture = self._captures.pop(participant.id, None)
        if capture is not None:
            await capture.stop()

    async def _finalise(self, room_id: str, participant: Participant, reason: str) -> None:
        """캡처를 끝내고 모델 호출까지 이어붙입니다.

        `reason` 은 `"stop"`(사용자가 뗌) 또는 `"limit"`(최대 길이 도달)이며,
        클라이언트가 이 값으로 안내 문구를 구분합니다.
        """
        capture = self._captures.pop(participant.id, None)
        if capture is None:
            return

        wav = await capture.stop()
        await participant.send_safe(
            {
                "type": "bot-listen",
                "state": "stopped",
                "reason": reason,
                "seconds": round(capture.seconds, 2),
                "captured": wav is not None,
            }
        )
        if wav is None:
            # 조용히 넘어가면 사용자는 아무 일도 안 일어난 것처럼 보입니다.
            logger.warning(
                "voice capture empty room=%s participant=%s %.2fs — "
                "오디오 트랙에서 프레임을 못 받았거나 너무 짧습니다",
                room_id, participant.id, capture.seconds,
            )
            return

        logger.info(
            "voice captured room=%s participant=%s %.1fs wav=%d bytes",
            room_id, participant.id, capture.seconds, len(wav),
        )
        history = self._history.setdefault(room_id, [])
        if self._settings.bot_voice_debug_dir:
            # 사람이 들어볼 수 있도록 덤프는 항상 WAV 로 남깁니다.
            self._dump_wav(participant, wav)

        # WAV 는 16kHz 모노에서도 초당 32KB 라 1분이면 base64 로 2.5MB 를
        # 넘습니다. 게이트웨이의 본문 크기 제한에 걸리기 쉬워 기본은 opus 입니다.
        if self._settings.bot_voice_codec == "opus":
            audio, mime = to_upload_format(wav)
        else:
            audio, mime = wav, "audio/wav"

        history.append(
            Turn(
                role="user",
                # 텍스트 파트가 자리표시자면 모델이 그걸 질문으로 오해합니다.
                # 오디오를 들으라고 명시적으로 지시합니다.
                text="다음 오디오가 내 발언입니다. 내용을 듣고 답해 주세요.",
                speaker=participant.display_name,
                audio=audio,
                audio_mime=mime,
            )
        )
        self._trim(history)

        # 음성은 채팅과 달리 버리지 않고 반드시 응답합니다. 사용자가 명시적으로
        # 버튼을 눌렀으므로 무시하면 고장으로 보입니다.
        lock = self._locks.setdefault(room_id, asyncio.Lock())
        task = asyncio.create_task(self._respond(room_id, lock))
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)

    def _dump_wav(self, participant: Participant, wav: bytes) -> None:
        """캡처한 음성을 파일로 남깁니다 (`BOT_VOICE_DEBUG_DIR` 설정 시).

        "오디오가 나쁜 건지 모델이 못 알아듣는 건지" 를 가르는 유일한 방법이
        직접 들어보는 것입니다. 압축 전 WAV 로 남겨 바로 재생할 수 있게 합니다.
        """
        import time
        from pathlib import Path

        try:
            directory = Path(self._settings.bot_voice_debug_dir)
            directory.mkdir(parents=True, exist_ok=True)
            path = directory / f"{int(time.time())}-{participant.id}.wav"
            path.write_bytes(wav)
            logger.info("voice dump written: %s (%d bytes)", path, len(wav))
        except Exception:  # noqa: BLE001 - 진단 기능이 대화를 막으면 안 됩니다
            logger.warning("voice dump failed", exc_info=True)

    @property
    def backend(self) -> LlmBackend:
        return self._backend

    @property
    def prompt(self) -> SystemPrompt:
        return self._prompt

    def system_prompt(self) -> str:
        """지금 모델에 들어갈 프리셋 프롬프트. 호출 시점에 파일을 다시 확인합니다."""
        return self._prompt.text()

    def active_rooms(self) -> list[str]:
        return sorted(self._bots)

    def is_bot(self, participant_id: str) -> bool:
        return any(bot.id == participant_id for bot in self._bots.values())

    async def aclose(self) -> None:
        for task in list(self._tasks):
            task.cancel()
        # 파이프라인이 단계별 모델용으로 직접 만든 백엔드가 있으면 그것도 닫습니다.
        # 주입받은 공용 백엔드는 아래에서 한 번만 닫습니다(이중 종료 방지).
        if self._pipeline is not None:
            await self._pipeline.aclose()
        await self._backend.aclose()

    # -- 수신 ---------------------------------------------------------------
    async def _on_message(self, room_id: str, message: dict) -> None:
        """봇의 수신함. 방에서 봇에게 가는 모든 메시지가 여기로 옵니다."""
        if message.get("type") != "chat":
            return  # peer-joined / peer-left / media-state 등은 무시

        text = (message.get("text") or "").strip()
        if not text:
            return

        history = self._history.setdefault(room_id, [])
        history.append(Turn(role="user", text=text, speaker=message.get("displayName", "")))
        self._trim(history)

        if not self._should_reply(text):
            return

        lock = self._locks.setdefault(room_id, asyncio.Lock())
        if lock.locked():
            # 생성 중에 들어온 말은 큐에 쌓지 않고 버립니다. 쌓아두면 한참 뒤에
            # 답변이 몰려 나와서 대화 흐름이 깨집니다.
            logger.debug("bot busy, dropping turn room=%s", room_id)
            return

        # 여기서 await 하면 안 됩니다. `_on_message` 는 `fan_out` 안에서
        # 불리고, 그건 다시 말한 사람의 메시지 루프 안입니다. 즉 LLM 응답이
        # 끝날 때까지 그 사람의 시그널링이 통째로 멈춥니다.
        task = asyncio.create_task(self._respond(room_id, lock))
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)

    def _should_reply(self, text: str) -> bool:
        """`BOT_TRIGGER=mention` 이면 `@ai` 가 붙은 말에만 답합니다.

        사람이 여럿인 방에서는 이쪽이 자연스럽습니다. 언급이 없어도 히스토리에는
        쌓이므로 맥락은 유지됩니다.
        """
        if self._settings.bot_trigger == "mention":
            return self._settings.bot_mention.lower() in text.lower()
        return True

    def _trim(self, history: list[Turn]) -> None:
        """오래된 턴을 버립니다. 방치하면 입력 토큰이 무한히 늘어납니다."""
        limit = max(2, self._settings.bot_history_turns)
        if len(history) > limit:
            del history[: len(history) - limit]

    # -- 응답 ---------------------------------------------------------------
    async def _respond(self, room_id: str, lock: asyncio.Lock) -> None:
        """LLM 을 호출하고 결과를 방에 뿌립니다.

        실패해도 반드시 무언가를 말합니다. 침묵하면 사용자는 봇이 죽었는지
        생각 중인지 알 수 없습니다.
        """
        async with lock:
            bot = self._bots.get(room_id)
            room = self._rooms.get(room_id)
            if bot is None or room is None:
                return

            history = list(self._history.get(room_id, []))
            result: GoalResult | None = None
            try:
                if self._pipeline is not None:
                    # 분류 -> 후보 검색 -> 판단. 단계별 타임아웃은 파이프라인이
                    # 직접 걸고, 여기서는 체인 전체의 상한만 봅니다.
                    result = await asyncio.wait_for(
                        self._pipeline.run(history, self._domains.get(room_id, [])),
                        timeout=self._settings.bot_timeout_seconds,
                    )
                    reply = result.text
                else:
                    reply = await asyncio.wait_for(
                        # 호출 직전에 읽습니다. 프롬프트 파일을 고치면 서버를
                        # 재시작하지 않아도 바로 다음 응답부터 반영됩니다.
                        self._backend.reply(self._prompt.text(), history),
                        timeout=self._settings.bot_timeout_seconds,
                    )
            except TimeoutError:
                reply = "(응답이 지연되어 취소했습니다)"
            except LlmError as exc:
                logger.warning("bot reply failed room=%s: %s", room_id, exc)
                reply = f"(AI 응답 실패: {exc})"
            except Exception as exc:  # noqa: BLE001 - 봇 오류가 방을 끊으면 안 됩니다
                logger.exception("bot crashed room=%s", room_id)
                reply = f"(AI 내부 오류: {str(exc)[:120]})"
            else:
                self._history.setdefault(room_id, []).append(
                    Turn(role="assistant", text=reply)
                )
                self._trim(self._history[room_id])

            # 오디오는 한 번만 보냅니다. 히스토리에 남겨두면 다음 턴마다 다시
            # 업로드되어 비용과 지연이 눈덩이처럼 불어납니다.
            #
            # 전사문을 받아온 경우(goal 모드)에는 자리표시자 대신 그 텍스트를
            # 남깁니다. 그래야 다음 턴에서도 무슨 말을 했는지 맥락이 유지됩니다.
            spoken = (result.transcript if result else None) or "(음성 메시지)"
            for turn in self._history.get(room_id, []):
                if turn.audio is not None:
                    turn.audio = None
                    turn.text = spoken

            payload = build_payload(bot, reply, self._settings.chat_message_max_length)
            if result is not None and result.data is not None:
                # UI 가 과제 카드를 그릴 수 있도록 구조화 결과를 함께 실어
                # 보냅니다. 지금 프론트엔드는 모르는 필드를 무시하므로 안전합니다.
                payload["goal"] = result.data
            await fan_out(room, bot, payload)
