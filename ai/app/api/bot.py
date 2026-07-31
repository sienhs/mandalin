"""Bot inspection endpoints.

방에 들어가지 않고 LLM 설정을 확인하기 위한 용도입니다. 실제 대화는
`BotManager` 가 방 채팅으로 처리하고, 여기서는 히스토리를 쌓지 않습니다.

**전부 진단용이라 `DEBUG_API_ENABLED=true` 일 때만 등록됩니다.** 인증이 없어서
열어두면 주소만 아는 누구나 `/ask` 와 `/probe-audio` 로 **LLM 크레딧을 태우고**,
`/prompt` 로 시스템 프롬프트 전문을 읽고, `/`(상태)로 접속 중인 사용자의 방
목록을 볼 수 있습니다.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.bot.llm import LlmError, Turn
from app.bot.voice import to_upload_format
from app.config import get_settings

debug_router = APIRouter(prefix="/api/bot", tags=["bot-debug"])


class AskRequest(BaseModel):
    text: str = Field(min_length=1, max_length=4000)
    system: str | None = None


@debug_router.get("")
async def bot_status(request: Request) -> dict:
    settings = get_settings()
    bots = request.app.state.bots
    prompt = bots.prompt.describe()
    return {
        "enabled": settings.bot_enabled,
        "provider": bots.backend.name,
        "model": settings.bot_default_model,
        # 키 자체는 절대 반환하지 않습니다.
        "hasApiKey": bool(settings.bot_api_key),
        "trigger": settings.bot_trigger,
        "activeRooms": bots.active_rooms(),
        # 본문은 빼고 출처만. 전체는 GET /api/bot/prompt 에서 봅니다.
        "prompt": {k: v for k, v in prompt.items() if k != "text"},
    }


@debug_router.get("/prompt")
async def bot_prompt(request: Request) -> dict:
    """지금 모델에 들어가는 프리셋 프롬프트 전문.

    "파일을 고쳤는데 반영이 됐나" 를 확인하는 곳입니다. 호출할 때마다 파일을
    다시 확인하므로, 저장한 뒤 새로고침하면 바뀐 내용이 그대로 보입니다.
    `source` 가 `settings` 로 나오면 파일을 못 찾은 것이니 `path` 를 보세요.
    """
    return request.app.state.bots.prompt.describe()


@debug_router.post("/ask")
async def bot_ask(body: AskRequest, request: Request) -> dict:
    settings = get_settings()
    bots = request.app.state.bots
    backend = bots.backend
    try:
        reply = await backend.reply(
            # 기본값은 방에서 쓰는 것과 **같은** 프리셋 프롬프트입니다. 그래야
            # 이 엔드포인트가 프롬프트를 시험해 보는 용도로 쓸 수 있습니다.
            body.system or bots.system_prompt(),
            [Turn(role="user", text=body.text)],
        )
    except LlmError as exc:
        # 502: 우리 잘못이 아니라 업스트림 LLM 이 거부한 것
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return {"provider": backend.name, "model": settings.bot_default_model, "reply": reply}


def _tone_wav(seconds: float = 1.0, rate: int = 16_000, hz: int = 440) -> bytes:
    """진단용 합성 오디오. 마이크 없이 오디오 경로만 시험합니다."""
    import io
    import math
    import struct
    import wave

    pcm = b"".join(
        struct.pack("<h", int(8000 * math.sin(2 * math.pi * hz * i / rate)))
        for i in range(int(rate * seconds))
    )
    buffer = io.BytesIO()
    with wave.open(buffer, "wb") as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(rate)
        wav.writeframes(pcm)
    return buffer.getvalue()


@debug_router.post("/probe-audio")
async def bot_probe_audio(request: Request, codec: str = "opus") -> dict:
    """오디오 업로드 경로만 격리해서 시험합니다.

    마이크·WebRTC·캡처를 전부 건너뛰고, 작은 합성 오디오 하나를 그대로
    모델에 보냅니다. 여기서 400 이 나면 게이트웨이가 inlineData 를 통과시키지
    못하는 것이고, 200 이 나면 문제는 캡처 쪽에 있습니다.
    """
    settings = get_settings()
    backend = request.app.state.bots.backend

    wav = _tone_wav()
    audio, mime = to_upload_format(wav) if codec == "opus" else (wav, "audio/wav")

    try:
        reply = await backend.reply(
            "너는 오디오를 확인하는 도우미다.",
            [Turn(role="user", text="이 오디오에 무엇이 들리는지 한 문장으로 말해줘.",
                  audio=audio, audio_mime=mime)],
        )
    except LlmError as exc:
        raise HTTPException(
            status_code=502,
            detail={
                "error": str(exc),
                "sentMime": mime,
                "sentBytes": len(audio),
                "base64Bytes": len(audio) * 4 // 3,
            },
        ) from exc

    return {
        "ok": True,
        "provider": backend.name,
        "model": settings.bot_default_model,
        "sentMime": mime,
        "sentBytes": len(audio),
        "reply": reply,
    }
