"""LiveKit worker 엔트리포인트 — 텍스트 + 음성 입력(STT)까지입니다.

    참가자 입장 ─▶ 토큰의 시트 읽기 ─┬─ 텍스트 발화 ──┐
                                      └─ 오디오 트랙 ─STT─┴─▶ GoalPipeline ─▶ 텍스트 응답

**TTS 는 도입하지 않습니다(결정).** 응답은 텍스트로만 나갑니다 — `../ai` 와 같은
모양입니다. 그래서 **이 에이전트는 오디오 트랙을 발행하지 않습니다.**

`AgentSession` 을 쓰지 않습니다. 프레임워크의 job 수명주기와 방 접속만 쓰는
**프로그램적 참가자**입니다 — `../ai` 의 봇이 WebSocket 없이 `RoomManager.join()` 으로
들어갔던 것과 같은 위치입니다. 이유가 둘입니다 — `AgentSession` 은 STT-LLM-TTS 를 자기가
조율하는데 ① LLM 자리에 들어갈 것이 단일 모델 호출이 아니라 **3단계 파이프라인**이고
② TTS 를 안 하므로 조율할 출력이 없습니다.

음성을 텍스트보다 나중에 붙인 이유는 **실패 지점을 하나만 남기기 위해서**였고,
실제로 효과가 있었습니다 — 텍스트 단계에서 나온 두 버그(`.env` 미로딩, editable 설치
실패)가 음성과 섞여 있었다면 원인을 가리기 어려웠습니다.

## 실행

    python -m agent dev                 # 개발 (로그 상세)
    python -m agent start               # 운영

**`.env` 는 `agent/__main__.py` 가 올립니다** — `livekit-agents` 는 `.env` 를 스스로
읽지 않습니다. 이 모듈을 직접 실행하지 말고 `python -m agent` 를 쓰세요.

`dev` 에 자동 재시작은 없습니다 — "in-process auto-reload has been removed from the
Python CLI" 라고 알려주고, 핫리로드는 별도 도구(`lk agent dev`)의 몫입니다.

`livekit-agents` 1.6 계열 API 입니다(`AgentServer` + `@server.rtc_session()`).
1.x 초기의 `cli.run_app(WorkerOptions(entrypoint_fnc=...))` 와 다릅니다 —
`WorkerOptions` 는 `ServerOptions` 로 이름이 바뀌었고 구 이름은 별칭으로 남아
있습니다. **버전을 올릴 때 이 파일을 먼저 확인하세요.**

- https://docs.livekit.io/agents/server/job/
- https://docs.livekit.io/transport/data/text-streams/
"""
from __future__ import annotations

import asyncio
import json
import logging

from livekit import rtc
from livekit.agents import AgentServer, JobContext

from agent.conversation import Conversation
from agent.listen import TrackListener, TranscriptionRegistry, build_stt
from agent.reuse import GoalPipeline, build_backend, get_settings
from agent.sheet_transfer import SHEET_TOPIC, parse_sheet, sheet_from_participant

logger = logging.getLogger("mandarin.agent")

#: 사용자 발화를 받는 토픽. `lk.chat` 은 LiveKit 클라이언트 SDK 의 채팅 관례라
#: 프론트에서 별도 배선 없이 보낼 수 있습니다.
CHAT_TOPIC = "lk.chat"

#: 구조화 결과(과제 카드)를 내려보내는 토픽. `../ai` 에서 채팅 payload 의 `goal`
#: 필드가 하던 역할입니다 — 프론트의 담기 버튼이 이 값을 씁니다.
GOAL_TOPIC = "mandarin.goal"

#: 사용자 발화의 전사문. `{"text": ..., "final": bool}` JSON 입니다.
#:
#: **`lk.chat` 으로 보내지 않습니다.** 그 토픽에는 AI 응답이 흐르는데, 전사문을 같이
#: 실으면 프론트가 "내가 말한 것" 과 "AI 가 답한 것" 을 구분할 방법이 없습니다.
#: `final` 이 거짓이면 지워질 캡션이고, 참이면 대화 로그에 남습니다.
TRANSCRIPT_TOPIC = "mandarin.transcript"

#: 세션 시작 알림 — `{"voice": bool, "name": str}`.
#:
#: `../ai` 의 `welcome` 메시지와 같은 자리입니다("클라이언트가 필요한 초기 상태를 한 번에
#: 전달합니다"). 저쪽은 `iceServers`·`peers` 를 실었고, 여기서는 **음성이 되는지**를
#: 알립니다.
#:
#: **이게 없으면 조용히 실패합니다.** `DEEPGRAM_API_KEY` 가 없을 때 서버는 텍스트만
#: 받는데, 프론트는 그걸 모른 채 마이크 버튼을 켜둡니다. 사용자는 눌러서 말하고 아무 일도
#: 안 일어나는 것을 봅니다 — 에러도 로그도 없습니다.
HELLO_TOPIC = "mandarin.hello"

#: 채팅 로그에 붙는 화자 이름의 접미. **이름을 둘로 나누지 않습니다** — 같은 봇이
#: 모드만 다른 것이라, 이름이 갈리면 봇이 두 개인 것처럼 읽힙니다.
MODE_LABELS = {True: "음성", False: "채팅"}


#: LLM 이 못 쓰는 상태일 때 채팅에 띄울 문구.
#:
#: **STT 와 달리 LLM 은 선택 기능이 아닙니다.** 음성이 없으면 텍스트로 쓰면 되지만,
#: LLM 이 없으면 이 서비스는 아무것도 못 합니다. 그래서 fail-open 이 아니라 **입장 즉시
#: 알립니다** — 발화를 던지고 실패를 기다리게 두면 사용자는 자기 말이 문제인 줄 압니다.
LLM_STATUS_MESSAGES = {
    "missing_key": (
        "AI 응답을 만들 수 없습니다 — 서버에 API 키가 설정되지 않았습니다. "
        "관리자에게 알려주세요. (과제 담기와 시트는 그대로 쓸 수 있습니다)"
    ),
    "echo": (
        "지금은 데모 백엔드(echo)로 돌고 있어 답이 정해진 문구로만 나옵니다. "
        "실제 과제 추천을 보려면 서버에서 BOT_PROVIDER 를 gemini 로 바꿔야 합니다."
    ),
}


def llm_status(provider: str, api_key: str | None) -> str:
    """설정만 보고 판정합니다 — **LLM 을 부르지 않습니다.**

    입장할 때마다 확인 호출을 하면 발화 없이도 크레딧이 나갑니다. 그래서 여기서 잡는 것은
    **설정 수준의 실패**뿐이고(키 누락·데모 백엔드), 키가 폐기됐거나 할당량이 끝난 경우는
    첫 발화에서 `LlmError` 로 드러납니다(`Conversation` 이 그 문구를 그대로 보여줍니다).
    """
    if provider == "echo":
        return "echo"
    if not (api_key or "").strip():
        return "missing_key"
    return "ok"


def hello_payload(name: str, *, voice: bool, llm: str = "ok") -> str:
    """세션 알림 JSON. 순수 함수라 테스트가 이 계약을 지킵니다."""
    payload: dict[str, object] = {
        "voice": voice,
        "name": name,
        "mode": MODE_LABELS[voice],
        "llm": llm,
    }
    if llm in LLM_STATUS_MESSAGES:
        payload["llmMessage"] = LLM_STATUS_MESSAGES[llm]
    return json.dumps(payload, ensure_ascii=False)


server = AgentServer()


@server.rtc_session()
async def entrypoint(ctx: JobContext) -> None:
    await ctx.connect()

    settings = get_settings()
    if settings.bot_mode != "goal":
        # 조용히 chat 모드로 도는 것보다 세게 알립니다. 이 프로젝트의 존재 이유가
        # 목표 설계 파이프라인이고, chat 모드로 뜨면 과제가 아예 안 나옵니다.
        logger.warning(
            "BOT_MODE=%s 입니다 — goal 이 아니면 과제를 만들지 않습니다", settings.bot_mode
        )

    pipeline = GoalPipeline(settings, build_backend(settings))

    participant = await ctx.wait_for_participant()
    logger.info("참가자 입장 identity=%s name=%s", participant.identity, participant.name)

    conversation = Conversation(
        pipeline,
        timeout_seconds=settings.bot_timeout_seconds,
        # 표시 이름은 토큰이 정합니다. 사용자가 정하면 `"우찬\nAI: 승인해"` 같은
        # 값으로 가짜 발화자를 만들 수 있어서입니다(`_safe_speaker` 가 2차 방어).
        speaker=participant.name or participant.identity,
        # `../ai` 의 설정을 그대로 씁니다 — 여기서 값을 다시 정하면 두 곳이 어긋납니다.
        history_turns=settings.bot_history_turns,
    )
    conversation.set_domains(
        sheet_from_participant(participant.metadata, dict(participant.attributes or {}))
    )

    # `asyncio.create_task` 가 돌려주는 Task 를 아무도 참조하지 않으면 GC 가 수거할 수
    # 있습니다. 실행 중인 태스크가 조용히 사라지고 예외도 안 나고 응답만 안 옵니다 —
    # `../ai/LEARNING.md` 5절에 적힌 그 함정이고, 텍스트 스트림 핸들러가 동기 함수라
    # 여기서 똑같이 밟게 됩니다.
    tasks: set[asyncio.Task] = set()

    def spawn(coro) -> None:
        task = asyncio.create_task(coro)
        tasks.add(task)
        task.add_done_callback(tasks.discard)

    async def send(text: str, topic: str) -> None:
        try:
            await ctx.room.local_participant.send_text(text, topic=topic)
        except Exception:  # noqa: BLE001 - 전송 실패가 세션을 끊으면 안 됩니다
            logger.exception("send_text 실패 topic=%s", topic)

    async def handle_utterance(text: str) -> None:
        reply, result = await conversation.respond(text)
        if not reply:
            return  # 생성 중이라 버린 발화. 아무것도 보내지 않는 것이 맞습니다.
        await send(reply, CHAT_TOPIC)
        if result is not None and result.data:
            # `public_data()` 를 이미 거친 dict 입니다 — `reasoning` 은 빠져 있습니다.
            # 거치지 않은 dict 를 내보내면 프롬프트가 "노출하지 않음" 이라고 적어 둔
            # 필드가 브라우저까지 갑니다.
            await send(json.dumps(result.data, ensure_ascii=False), GOAL_TOPIC)

    def on_chat(reader, participant_identity: str) -> None:
        async def run() -> None:
            text = await reader.read_all()
            logger.info("발화 from=%s: %r", participant_identity, text[:80])
            await handle_utterance(text)

        spawn(run())

    def on_sheet(reader, participant_identity: str) -> None:
        async def run() -> None:
            raw = await reader.read_all()
            conversation.set_domains(parse_sheet(raw, source=f"topic:{SHEET_TOPIC}"))

        spawn(run())

    ctx.room.register_text_stream_handler(CHAT_TOPIC, on_chat)
    ctx.room.register_text_stream_handler(SHEET_TOPIC, on_sheet)

    # ── 음성 입력 ────────────────────────────────────────────────────
    # `build_stt()` 가 `None` 이면 키가 없다는 뜻이고, 그때는 트랙을 구독해도 할 일이
    # 없으므로 아예 배선하지 않습니다. 텍스트 대화는 위 배선으로 그대로 돕니다.
    speech = build_stt()
    if speech is not None:
        async def on_transcript(text: str, *, final: bool) -> None:
            payload = json.dumps({"text": text, "final": final}, ensure_ascii=False)
            await send(payload, TRANSCRIPT_TOPIC)

        async def on_final(text: str) -> None:
            # 전사문을 먼저 내려보냅니다. 이걸 안 보내면 화면에 AI 답만 남아서
            # **무엇에 답한 것인지** 알 수 없습니다.
            await on_transcript(text, final=True)
            # **여기서 파이프라인을 await 하면 안 됩니다.** 이 콜백은 STT 이벤트 루프
            # 안에서 불립니다(`TrackListener.run` 의 `async for`). 파이프라인은 LLM 을
            # 두 번 부르므로 몇 초가 걸리고, 그동안 두 가지가 무너집니다 —
            #
            #   ① 전사 이벤트가 정체됩니다 (실시간 캡션이 멈춤)
            #   ② 그 사이 마이크를 끄면 이 태스크가 취소되어 **응답이 사라집니다**
            #
            # `../ai/LEARNING.md` 5절이 적어둔 그 함정입니다 — 저쪽은 `_on_message` 안에서
            # LLM 을 await 하면 말한 사람의 시그널링 루프가 멈춘다고 했고, 여기서는 STT
            # 루프가 멈춥니다. 태스크로 띄우면 둘 다 사라집니다. 동시 발화는
            # `Conversation` 이 이미 버리므로(락) 겹칠 걱정은 없습니다.
            spawn(handle_utterance(text))

        async def on_interim(text: str) -> None:
            await on_transcript(text, final=False)

        async def on_listening(state: bool) -> None:
            """에이전트가 듣기 시작/중지했음을 브라우저에 알립니다.

            **오디오 유실과 무관합니다.** 목적은 상태 가시성입니다 — 이 신호가 없어서
            `track_muted` 인자 순서 버그가 여러 라운드 숨어 있었습니다.
            """
            await send(json.dumps({"listening": state}), TRANSCRIPT_TOPIC)

        listener = TrackListener(
            speech,
            on_final=on_final,
            on_interim=on_interim,
            on_started=lambda: on_listening(True),
        )

        #: 트랙 sid → 전사 태스크. **mute 되면 취소하고 unmute 되면 다시 띄웁니다.**
        #:
        #: `setMicrophoneEnabled(false)` 는 트랙을 **mute 만** 합니다 — 트랙은 살아 있고
        #: 무음 프레임이 계속 흐릅니다. 그걸 그대로 Deepgram 에 밀어 넣으면 **말하지
        #: 않아도 오디오 시간으로 계속 과금됩니다.** 실측 로그가 이랬습니다 —
        #:
        #:     (마이크 끔)
        #:     stt usage RecognitionUsage(audio_duration=5.04999..., ...)   ← 5초마다 계속
        #:
        #: 프레임만 건너뛰는 방식은 쓰지 않습니다. 스트림을 열어둔 채 입력이 없으면
        #: Deepgram 이 유휴 연결을 끊고, 그 뒤 unmute 하면 죽은 스트림에 밀어 넣게 됩니다.
        #: 태스크를 취소하면 `run()` 의 `finally` 가 스트림과 오디오를 함께 닫습니다.
        #:
        #: 완료 콜백의 경합(mute 직후 unmute 하면 옛 콜백이 새 태스크를 지움)은
        #: `TranscriptionRegistry` 가 compare-and-remove 로 막습니다.
        transcribing = TranscriptionRegistry()
        # job 이 끝날 때 STT 연결을 정리합니다. 안 하면 Deepgram WebSocket 이 닫히기 전에
        # 프로세스가 내려가고 `Task was destroyed but it is pending` 경고가 남습니다.
        ctx.add_shutdown_callback(transcribing.aclose)

        def start_transcribing(track: rtc.Track, sid: str, who: str) -> None:
            if transcribing.start(sid, lambda: listener.run(track)):
                logger.info("전사 시작 track=%s from=%s", sid, who)

        def stop_transcribing(sid: str, reason: str) -> None:
            if transcribing.stop(sid):
                logger.info("전사 중지 track=%s (%s)", sid, reason)
                # 취소된 태스크는 콜백을 못 부르므로 여기서 알립니다.
                spawn(on_listening(False))
                return
            # **조용히 지나가면 안 됩니다.** 인자 순서를 잘못 받아 엉뚱한 sid 로 부르던
            # 버그가 여기서 아무 소리 없이 통과했습니다 — `Participant` 에도 `.sid` 가
            # 있어서 예외조차 안 났고, 증상은 "마이크를 껐는데 과금이 계속됨" 뿐이었습니다.
            # 못 찾은 sid 를 남기면 즉시 드러납니다.
            logger.warning(
                "전사 중지 요청(%s)인데 해당 track 이 없습니다 sid=%s (추적 중: %s)",
                reason, sid, transcribing.tracked,
            )

        @ctx.room.on("track_subscribed")
        def _on_track(
            track: rtc.Track,
            publication: rtc.RemoteTrackPublication,
            participant: rtc.RemoteParticipant,
        ) -> None:
            if track.kind != rtc.TrackKind.KIND_AUDIO:
                return
            # 이미 mute 상태로 구독될 수 있습니다(마이크를 끈 채 접속). 그때 시작하면
            # 첫 발화 전부터 과금이 시작됩니다.
            if publication.muted:
                logger.info("오디오 트랙이 mute 상태입니다 — 전사를 시작하지 않습니다")
                return
            start_transcribing(track, publication.sid, participant.identity)

        # **`track_muted`/`track_unmuted` 는 인자 순서가 다릅니다.**
        #
        #     track_subscribed / track_unsubscribed : (track, publication, participant)
        #     track_muted      / track_unmuted      : (participant, publication)
        #
        # `livekit/rtc/room.py` 의 `self.emit(...)` 이 정본입니다. 순서를 subscribed 와
        # 같다고 가정해 `(publication, participant)` 로 받았더니 **예외 없이 조용히
        # 빗나갔습니다** — `Participant` 에도 `.sid` 가 있어서 참가자 sid(`PA_…`)를
        # 트랙 sid(`TR_…`)로 알고 `dict.pop` 이 아무것도 못 찾았습니다. 증상은 "마이크를
        # 껐는데 stt usage 가 계속 찍힘" 뿐이었고 로그에 에러가 없었습니다.
        @ctx.room.on("track_unmuted")
        def _on_unmuted(
            participant: rtc.Participant, publication: rtc.TrackPublication
        ) -> None:
            track = getattr(publication, "track", None)
            if track is None or track.kind != rtc.TrackKind.KIND_AUDIO:
                return
            start_transcribing(track, publication.sid, participant.identity)

        @ctx.room.on("track_muted")
        def _on_muted(
            participant: rtc.Participant, publication: rtc.TrackPublication
        ) -> None:
            if publication.kind != rtc.TrackKind.KIND_AUDIO:
                return
            stop_transcribing(publication.sid, "mute")

        @ctx.room.on("track_unsubscribed")
        def _on_unsubscribed(
            track: rtc.Track,
            publication: rtc.RemoteTrackPublication,
            participant: rtc.RemoteParticipant,
        ) -> None:
            # 트랙이 사라지면 `AudioStream` 이 끝나서 `run()` 도 자연히 종료되지만,
            # 명시적으로 정리해 `transcribing` 에 죽은 항목이 남지 않게 합니다.
            if track.kind != rtc.TrackKind.KIND_AUDIO:
                return
            stop_transcribing(publication.sid, "unsubscribe")

    @ctx.room.on("participant_attributes_changed")
    def _on_attributes_changed(changed: dict[str, str], p: rtc.Participant) -> None:
        # 시트를 attributes 로 싣는 클라이언트를 위한 경로입니다. metadata 쪽이
        # 우선이지만, 갱신은 attributes 가 더 다루기 쉬운 경우가 있습니다.
        if p.identity != participant.identity:
            return
        domains = sheet_from_participant(None, changed)
        if domains:
            conversation.set_domains(domains)

    # **능력을 먼저 알립니다.** 참가자가 이미 방에 있으므로(위 `wait_for_participant`)
    # 핸들러가 등록된 상태이고, 이 알림을 놓칠 일이 없습니다.
    llm = llm_status(settings.bot_provider, settings.bot_api_key)
    if llm != "ok":
        logger.warning("LLM 상태=%s — 입장 알림으로 사용자에게 전달합니다", llm)
    await send(
        hello_payload(
            settings.bot_display_name, voice=speech is not None, llm=llm
        ),
        HELLO_TOPIC,
    )

    logger.info(
        "준비 완료 — topic=%s / 음성=%s",
        CHAT_TOPIC,
        "활성" if speech is not None else "비활성(DEEPGRAM_API_KEY 없음)",
    )
