"""ICE 설정과 후보 변환.

ICE 는 "NAT 뒤에 있는 두 지점이 서로 통할 수 있는 경로를 찾는" 절차입니다.
후보(candidate)에는 세 종류가 있습니다.

- **host**: 내 랜카드 주소. 같은 LAN 이면 이걸로 붙습니다.
- **srflx**: STUN 으로 알아낸 내 공인 IP:포트. 대부분의 NAT 를 넘습니다.
- **relay**: TURN 서버를 경유. 위 둘이 모두 막혔을 때의 최후 수단이며,
  트래픽이 전부 TURN 을 거치므로 대역폭 비용이 발생합니다.

이 프로젝트에는 ICE 설정이 두 벌 있고 용도가 다릅니다.

- `Settings.client_ice_servers` — **브라우저용**. `welcome` 메시지에 담아
  내려보냅니다. TURN 자격증명을 프론트엔드에 하드코딩하지 않고 서버가 쥐고
  있다가 필요할 때만 주기 위해서입니다.
- `server_rtc_configuration` (이 파일) — **SFU 자신용**. 서버가 공인 IP 를
  가지고 있다면 host 후보만으로 충분해서 기본값이 훨씬 단출합니다.
"""
from __future__ import annotations

from aiortc import RTCConfiguration, RTCIceServer

from app.config import Settings
from app.schemas import IceCandidatePayload


def server_rtc_configuration(settings: Settings) -> RTCConfiguration:
    """SFU 쪽 PeerConnection 이 사용할 ICE 설정.

    TURN 은 기본적으로 넣지 않습니다. 서버가 자기 트래픽을 굳이 TURN 으로
    우회시킬 이유가 없고, 잘못 켜면 모든 미디어가 TURN 을 거쳐 대역폭 비용이
    폭증합니다. SFU 자체가 NAT 뒤(사내망, 개발 PC)에 있을 때만
    `SERVER_USES_TURN=true` 로 켜세요.
    """
    ice_servers: list[RTCIceServer] = []
    if settings.stun_urls:
        ice_servers.append(RTCIceServer(urls=list(settings.stun_urls)))
    if settings.server_uses_turn and settings.turn_urls:
        ice_servers.append(
            RTCIceServer(
                urls=list(settings.turn_urls),
                username=settings.turn_username,
                credential=settings.turn_credential,
            )
        )
    return RTCConfiguration(iceServers=ice_servers)


def parse_ice_candidate(payload: IceCandidatePayload):
    """브라우저 ICE 후보를 aiortc 의 `RTCIceCandidate` 로 변환합니다.

    브라우저는 `RTCIceCandidate.toJSON()` 결과를 그대로 보내는데, 그 안의
    `candidate` 문자열은 보통 `"candidate:"` 접두사로 시작합니다. aiortc 의
    `candidate_from_sdp` 는 접두사를 뺀 본문을 기대하므로 잘라냅니다.
    (브라우저에 따라 접두사가 없는 경우도 있어 양쪽 다 처리합니다.)

    빈 문자열은 "후보 수집 끝" 을 알리는 신호라 `None` 을 돌려줍니다.
    """
    from aiortc.sdp import candidate_from_sdp

    raw = (payload.candidate or "").strip()
    if not raw:
        return None
    if raw.startswith("candidate:"):
        raw = raw[len("candidate:") :]

    candidate = candidate_from_sdp(raw)
    # sdpMid / sdpMLineIndex 는 이 후보가 어느 m-line 소속인지 알려줍니다.
    # 빠뜨리면 aiortc 가 어떤 트랜스포트에 붙일지 몰라 후보를 무시합니다.
    candidate.sdpMid = payload.sdpMid
    candidate.sdpMLineIndex = payload.sdpMLineIndex
    return candidate
