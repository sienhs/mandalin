package com.ssafy.mandarin.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "Login response")
public class LoginResponse {

	@Schema(description = "Authenticated user id", example = "1")
	private Long userId;

	@Schema(description = "JWT access token used for API authentication", example = "eyJhbGciOiJIUzI1NiJ9...")
	private String accessToken;

	@Schema(description = "Refresh token delivered as an HttpOnly cookie. Usually omitted from the response body.", example = "null")
	private String refreshToken;

	@Schema(description = "Authenticated user's display name", example = "Jane Doe")
	private String name;

	@Schema(description = "Authenticated user's email", example = "user uuid")
	private String uuid;
}
