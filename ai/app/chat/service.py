"""채팅 팬아웃.

기본 경로는 각 브라우저가 **업스트림 PeerConnection 위에 여는 `chat`
DataChannel** 입니다. 시그널링 WebSocket 이 아니라 미디어 경로를 재사용하는
이유는, 이미 뚫려 있는 연결을 쓰면 별도 인프라가 필요 없고 지연도 낮기
때문입니다.

SFU 가 채널을 종단하고 받은 메시지를 다른 참가자의 채널로 다시 내보냅니다.
브라우저끼리 직접 연결된 게 아니므로 서버를 거치는 게 필연적입니다.

**폴백이 중요합니다.** 채널이 아직 안 열렸거나(협상 중), 애초에
PeerConnection 이 없는 참가자(= AI 봇)에게는 `Participant.send` 로
내려보냅니다. 이 한 줄 덕분에 봇이 채팅을 받는 데 특별한 코드가 필요 없습니다.
"""
from __future__ import annotations

import json
import time

from app.rooms.models import Participant, Room


def build_payload(sender: Participant, text: str, max_length: int) -> dict:
    """전송용 채팅 메시지를 만듭니다.

    보낸 사람 이름을 함께 담는 이유는, 받는 쪽이 peerId 로 이름을 조회할 필요
    없이 바로 그릴 수 있게 하기 위함입니다. 퇴장한 사람의 과거 메시지도
    이름이 남습니다.
    """
    return {
        "type": "chat",
        "from": sender.id,
        "displayName": sender.display_name,
        "text": text[:max_length],
        "ts": int(time.time() * 1000),
    }


async def fan_out(room: Room, sender: Participant, payload: dict) -> None:
    """보낸 사람을 뺀 전원에게 전달합니다.

    `ensure_ascii=False` 로 직렬화해야 한글이 유니코드 이스케이프로 부풀지
    않습니다. 안 그러면 한 글자가 6바이트가 됩니다.
    """
    encoded = json.dumps(payload, ensure_ascii=False)
    for peer in room.others(sender.id):
        publisher = peer.publisher
        # 1순위: DataChannel. 열려 있으면 True 를 돌려주고 끝냅니다.
        if publisher is not None and publisher.send_chat(encoded):
            continue
        # 2순위: 시그널링 WebSocket (또는 봇의 처리 콜백).
        await peer.send_safe(payload)
