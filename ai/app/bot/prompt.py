"""프리셋 시스템 프롬프트 로더.

프롬프트는 코드가 아니라 **콘텐츠**입니다. 한 글자 고칠 때마다 서버를
재시작해야 한다면 문구를 다듬는 반복 작업이 사실상 불가능해집니다. 그래서
파일에 두고, 모델을 부르기 직전에 갱신 여부만 확인합니다.

    prompts/system.md ──stat──▶ 바뀌었나? ──▶ 다시 읽기 ──▶ systemInstruction

`stat` 한 번은 마이크로초 단위라, 뒤이어 일어나는 수백 밀리초짜리 모델 호출에
비하면 없는 비용입니다. 캐시 무효화를 영리하게 만들 이유가 없어서 매번 확인하고,
내용이 그대로면 파일을 다시 읽지 않습니다.

**우선순위는 파일 > `BOT_SYSTEM_PROMPT` > 코드 기본값**입니다. 파일이 없거나
비어 있거나 읽을 수 없으면 조용히 다음 순위로 내려갑니다. 프롬프트 파일 하나
때문에 봇 전체가 멈추는 것보다는 기본 인격으로라도 답하는 편이 낫습니다.

한 가지 의도적인 예외가 있습니다. **한 번 성공적으로 읽은 뒤 파일이 사라지면
마지막 값을 유지합니다.** 많은 에디터가 "임시 파일에 쓰고 이름 바꾸기" 로
저장하기 때문에, 저장하는 찰나에 `stat` 이 실패할 수 있습니다. 그때 기본값으로
튕기면 사용자는 저장했을 뿐인데 봇의 인격이 잠깐 바뀌는 걸 보게 됩니다.
"""
from __future__ import annotations

import logging
from datetime import datetime
from pathlib import Path

from app.config import Settings

logger = logging.getLogger(__name__)

#: 상대 경로의 기준점. `app/bot/prompt.py` -> 저장소 루트.
#:
#: CWD 기준으로 두면 uvicorn 을 다른 디렉터리에서 띄웠을 때 파일을 못 찾고
#: 조용히 기본값으로 떨어집니다. "프롬프트를 고쳤는데 반영이 안 된다" 는
#: 증상으로만 보여서 원인을 찾기 어려운 종류의 실패입니다.
PROJECT_ROOT = Path(__file__).resolve().parents[2]


class SystemPrompt:
    """`BOT_SYSTEM_PROMPT_FILE` 을 따라다니는 살아 있는 프롬프트.

    설정이 비어 있으면 아무 일도 하지 않고 `BOT_SYSTEM_PROMPT` 를 돌려줍니다.
    즉 이 클래스를 끼워 넣어도 기존 동작은 그대로입니다.
    """

    def __init__(
        self,
        settings: Settings,
        *,
        file: str | None = None,
        fallback: str | None = None,
    ) -> None:
        """`file`/`fallback` 을 주면 시스템 프롬프트 외의 파일에도 씁니다.

        목표 설계 파이프라인의 분류 프롬프트처럼 프롬프트가 여러 개로 늘어나도
        같은 로딩 규칙(무재시작 반영·폴백)을 그대로 물려받게 하려는 것입니다.
        """
        self._settings = settings
        self._fallback = fallback if fallback is not None else settings.bot_system_prompt
        self._path = self._resolve(
            file if file is not None else settings.bot_system_prompt_file
        )
        #: (mtime_ns, size). 둘 다 봐야 같은 밀리초에 같은 길이로 덮어쓰는
        #: 경우를 제외한 대부분의 변경을 잡아냅니다.
        self._key: tuple[int, int] | None = None
        self._cached: str | None = None
        #: 같은 실패를 매 응답마다 로그로 도배하지 않기 위한 표식.
        self._warned: set[str] = set()

        if self._path is not None:
            logger.info("system prompt file: %s", self._path)

    # -- 조회 ---------------------------------------------------------------
    @property
    def path(self) -> Path | None:
        return self._path

    def text(self) -> str:
        """지금 모델에 넣어야 할 시스템 프롬프트.

        모델을 부르기 직전에 호출하세요. 여기서 파일 변경을 감지합니다.
        """
        if self._path is not None:
            self._refresh()
        if self._cached is not None:
            return self._cached
        return self._fallback

    def describe(self) -> dict:
        """`GET /api/bot/prompt` 용 요약.

        "내 파일이 실제로 먹었는가" 를 확인하는 게 목적이라 본문을 그대로
        돌려줍니다. 프롬프트는 비밀이 아니고, 앞부분만 잘라 보여주면 정작
        확인하고 싶은 끝부분을 못 봅니다.
        """
        text = self.text()
        from_file = self._cached is not None
        return {
            "source": "file" if from_file else "settings",
            "path": str(self._path) if self._path is not None else None,
            "chars": len(text),
            "modified": self._modified_at() if from_file else None,
            "text": text,
        }

    # -- 내부 ---------------------------------------------------------------
    @staticmethod
    def _resolve(raw: str | None) -> Path | None:
        if not raw or not raw.strip():
            return None
        path = Path(raw.strip()).expanduser()
        return path if path.is_absolute() else PROJECT_ROOT / path

    def _modified_at(self) -> str | None:
        if self._path is None:
            return None
        try:
            mtime = self._path.stat().st_mtime
        except OSError:
            return None
        return datetime.fromtimestamp(mtime).isoformat(timespec="seconds")

    def _refresh(self) -> None:
        """파일이 바뀌었으면 다시 읽습니다. 실패하면 마지막 값을 유지합니다."""
        assert self._path is not None

        try:
            stat = self._path.stat()
        except OSError:
            # 파일이 아직 없거나(설정만 해두고 안 만든 경우) 저장 중입니다.
            self._warn_once(
                "stat",
                "프롬프트 파일을 읽을 수 없습니다 (%s). %s 를 사용합니다",
                self._path,
                "직전에 읽은 내용" if self._cached else "기본 프롬프트",
            )
            return

        key = (stat.st_mtime_ns, stat.st_size)
        if key == self._key:
            return  # 변경 없음 — 여기가 대부분의 호출이 끝나는 지점입니다.

        try:
            raw = self._path.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            self._warn_once(
                "read", "프롬프트 파일을 여는 데 실패했습니다: %s", self._path
            )
            return

        # 읽기에 성공했으면 이전 실패는 해소된 것으로 봅니다.
        self._key = key
        self._warned.clear()

        text = raw.strip()
        if not text:
            # 파일을 통째로 비우는 건 "기본값으로 돌려줘" 로 해석합니다.
            logger.info("프롬프트 파일이 비어 기본 프롬프트로 돌아갑니다: %s", self._path)
            self._cached = None
            return

        cap = self._settings.bot_system_prompt_max_chars
        if len(text) > cap:
            # 실수로 로그 파일 같은 걸 가리켰을 때 매 요청마다 통째로 실려
            # 나가지 않게 막습니다. 잘라서라도 동작시키고 경고를 남깁니다.
            logger.warning(
                "프롬프트가 %d 자로 상한(%d)을 넘어 잘랐습니다: %s",
                len(text), cap, self._path,
            )
            text = text[:cap]

        self._cached = text
        logger.info("system prompt loaded: %s (%d 자)", self._path, len(text))

    def _warn_once(self, reason: str, message: str, *args) -> None:
        if reason in self._warned:
            return
        self._warned.add(reason)
        logger.warning(message, *args)
