"""푸시투토크 오디오 캡처.

**SFU 구조라서 가능한 기능입니다.** 서버가 이미 Opus 를 디코드해 PCM 을
쥐고 있으므로, 참가자 트랙에서 프레임을 당겨 오디오 파일로 만들면 끝입니다.
Mesh(P2P) 였다면 서버에 미디어가 없어 불가능했습니다.

    tracks["audio"] ─relay─▶ 48kHz 스테레오 ─리샘플─▶ 16kHz 모노 PCM
                                                          │
                                Gemini inlineData ◀─opus─┘

별도 STT 단계가 없습니다. Gemini 가 오디오를 직접 받기 때문입니다.
"""
from __future__ import annotations

import asyncio
import io
import logging
import wave
from collections.abc import Awaitable, Callable
from fractions import Fraction

from av.audio.resampler import AudioResampler

logger = logging.getLogger(__name__)

TARGET_SAMPLE_RATE = 16_000
SAMPLE_WIDTH_BYTES = 2  # s16
MIN_SECONDS = 0.3       # 버튼을 스치듯 눌렀을 때 무시
OPUS_SAMPLE_RATE = 48_000
OPUS_BIT_RATE = 24_000  # 음성에는 충분하고 WAV 대비 약 1/20


def pcm_bytes(frame) -> bytes:
    """리샘플된 s16 모노 프레임에서 PCM 을 꺼냅니다.

    `AudioFrame.to_ndarray()` 는 numpy 를 요구합니다. 여기서 하는 일은 바이트
    복사뿐이라 버퍼 프로토콜로 직접 읽습니다. 플레인은 정렬 때문에 뒤에 패딩이
    붙을 수 있으므로 실제 샘플 수만큼만 잘라냅니다.
    """
    plane = frame.planes[0]
    return bytes(plane)[: frame.samples * SAMPLE_WIDTH_BYTES]


class VoiceCapture:
    """발화 한 건을 버퍼링합니다. 재사용하지 않고 매번 새로 만듭니다.

    상태를 가진 리샘플러와 버퍼를 들고 있어서, 재사용하면 이전 발화가 섞입니다.
    """

    def __init__(
        self,
        track,
        max_seconds: float,
        on_limit: Callable[[], Awaitable[None]] | None = None,
    ) -> None:
        self._track = track
        self._max_samples = int(TARGET_SAMPLE_RATE * max_seconds)
        self._on_limit = on_limit
        self._resampler = AudioResampler(format="s16", layout="mono", rate=TARGET_SAMPLE_RATE)
        self._chunks: list[bytes] = []
        self._samples = 0
        self._task: asyncio.Task | None = None
        self._stopped = asyncio.Event()

    # -- 생명주기 -----------------------------------------------------------
    def start(self) -> None:
        """프레임 수집을 백그라운드 태스크로 시작합니다."""
        if self._task is None:
            self._task = asyncio.create_task(self._pump())

    async def stop(self) -> bytes | None:
        """캡처를 끝내고 WAV 바이트를 돌려줍니다. 너무 짧으면 None."""
        self._stopped.set()
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except (asyncio.CancelledError, Exception):  # noqa: BLE001
                pass
            self._task = None

        try:
            self._track.stop()
        except Exception:  # noqa: BLE001 - 이미 닫힌 프록시 트랙
            pass

        # 리샘플러 내부 버퍼에 남은 꼬리를 회수합니다.
        try:
            for tail in self._normalise(self._resampler.resample(None)):
                self._chunks.append(pcm_bytes(tail))
                self._samples += tail.samples
        except Exception:  # noqa: BLE001 - 꼬리 몇 ms 때문에 세션을 죽이지 않습니다
            logger.warning("resampler flush failed", exc_info=True)

        if self.seconds < MIN_SECONDS:
            logger.info(
                "capture dropped: %.3fs (<%.1fs), %d chunks",
                self.seconds, MIN_SECONDS, len(self._chunks),
            )
            return None
        return self._to_wav()

    @property
    def seconds(self) -> float:
        return self._samples / TARGET_SAMPLE_RATE

    # -- 내부 ---------------------------------------------------------------
    async def _pump(self) -> None:
        """트랙에서 프레임을 계속 당겨 16kHz 모노 PCM 으로 쌓습니다."""
        while not self._stopped.is_set():
            try:
                frame = await self._track.recv()
            except Exception:  # noqa: BLE001 - 트랙 종료
                return

            try:
                for resampled in self._normalise(self._resampler.resample(frame)):
                    self._chunks.append(pcm_bytes(resampled))
                    self._samples += resampled.samples
            except Exception:  # noqa: BLE001
                logger.warning("resample failed, capture aborted", exc_info=True)
                return

            if self._samples >= self._max_samples:
                logger.info("capture hit the %.0fs cap", self.seconds)
                if self._on_limit is not None:
                    asyncio.create_task(self._on_limit())
                return

    @staticmethod
    def _normalise(resampled) -> list:
        """PyAV 버전별 반환 타입 차이(단일 프레임 / 리스트 / None)를 흡수합니다."""
        # PyAV 버전에 따라 단일 프레임 / 리스트 / None 을 돌려줍니다.
        if resampled is None:
            return []
        if isinstance(resampled, list):
            return resampled
        return [resampled]

    def _to_wav(self) -> bytes:
        """모은 PCM 앞에 WAV 헤더(44바이트)를 붙입니다."""
        buffer = io.BytesIO()
        with wave.open(buffer, "wb") as wav:
            wav.setnchannels(1)
            wav.setsampwidth(SAMPLE_WIDTH_BYTES)
            wav.setframerate(TARGET_SAMPLE_RATE)
            wav.writeframes(b"".join(self._chunks))
        return buffer.getvalue()


def to_upload_format(wav_bytes: bytes) -> tuple[bytes, str]:
    """업로드용으로 Opus 압축을 시도합니다.

    WAV 는 16kHz 모노에서도 초당 32KB 라, 1분이면 base64 로 2.5MB 를 넘습니다.
    게이트웨이/프록시의 본문 크기 제한에 걸리기 쉬워서 Opus(대략 1/20)로 줄입니다.
    인코더가 없으면 원본 WAV 를 그대로 돌려줍니다.
    """
    try:
        import av
        from av.audio.fifo import AudioFifo
        from av.audio.frame import AudioFrame

        with wave.open(io.BytesIO(wav_bytes), "rb") as wav:
            source_rate = wav.getframerate()
            pcm = wav.readframes(wav.getnframes())

        buffer = io.BytesIO()
        container = av.open(buffer, mode="w", format="ogg")
        stream = container.add_stream("libopus", rate=OPUS_SAMPLE_RATE)
        stream.bit_rate = OPUS_BIT_RATE

        source = AudioFrame(format="s16", layout="mono", samples=len(pcm) // 2)
        source.planes[0].update(pcm)
        source.sample_rate = source_rate
        source.pts = 0
        source.time_base = Fraction(1, source_rate)

        resampler = AudioResampler(format="s16", layout="mono", rate=OPUS_SAMPLE_RATE)
        fifo = AudioFifo()
        for chunk in VoiceCapture._normalise(resampler.resample(source)):
            fifo.write(chunk)

        # Opus 는 고정 프레임 크기를 요구하므로 FIFO 로 잘라 넣습니다.
        while True:
            frame = fifo.read(stream.frame_size)
            if frame is None:
                break
            for packet in stream.encode(frame):
                container.mux(packet)

        remainder = fifo.read()
        if remainder is not None:
            for packet in stream.encode(remainder):
                container.mux(packet)
        for packet in stream.encode(None):
            container.mux(packet)
        container.close()

        encoded = buffer.getvalue()
        if not encoded:
            raise RuntimeError("빈 Opus 출력")
        logger.info(
            "opus 인코딩: %d B -> %d B (%.0f%% 절감)",
            len(wav_bytes), len(encoded), 100 * (1 - len(encoded) / len(wav_bytes)),
        )
        return encoded, "audio/ogg"
    except Exception:  # noqa: BLE001 - 압축 실패가 대화를 막으면 안 됩니다
        logger.warning("opus 인코딩 실패, WAV 로 전송합니다", exc_info=True)
        return wav_bytes, "audio/wav"
