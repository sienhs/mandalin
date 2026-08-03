package com.ssafy.mandarin.domain.voice.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** 클라이언트가 {@code room.connect(url, token)} 에 그대로 넘기는 값들. */
@Schema(description = "AI 음성 세션 입장 정보")
public record VoiceSessionResponse(

		@Schema(description = "입장할 방 식별자. 클라이언트가 고르는 값이 아니라 서버가 정한다.", example = "u_42")
		String roomId,

		@Schema(description = "붙을 LiveKit 서버 주소. 이 서버가 아니라 AI 쪽이다.",
				example = "wss://livekit.example.com")
		String url,

		@Schema(description = "LiveKit 서버에 제출할 단기 access token.")
		String token,

		@Schema(description = "토큰 유효 시간(초). 이 안에 연결하지 않으면 재발급이 필요하다.", example = "120")
		long expiresInSeconds
) {
}
