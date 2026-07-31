package com.ssafy.mandarin.domain.voice.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * AI 음성 코칭 입장 티켓.
 *
 * <p>{@code ticket} 은 URL 이 아니라 시그널링 {@code join} 메시지 본문으로 보내야 한다.
 * 쿼리스트링에 담으면 리버스 프록시 액세스 로그에 토큰이 그대로 남는다.
 */
@Schema(description = "AI 음성 세션 입장 티켓")
public record VoiceSessionResponse(

		@Schema(description = "입장할 방 식별자. 클라이언트가 고르는 값이 아니라 서버가 정한다.", example = "u_42")
		String roomId,

		@Schema(description = "SFU 에 제출할 단기 JWT. join 메시지 본문에 싣는다.")
		String ticket,

		@Schema(description = "티켓 유효 시간(초). 이 안에 연결하지 않으면 재발급이 필요하다.", example = "120")
		long expiresInSeconds
) {
}
