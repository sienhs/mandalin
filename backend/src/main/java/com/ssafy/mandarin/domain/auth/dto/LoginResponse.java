package com.ssafy.mandarin.domain.auth.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonIgnore;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 소셜 로그인 교환 응답.
 *
 * <p>프로필 필드를 평평하게 펼쳐 담는다 — 프론트가 이 응답 하나로 세션(토큰)과
 * 사용자 정보를 동시에 채우기 때문이다. {@link UserProfileResponse} 와 필드가 같다.
 *
 * <p>{@code refreshToken} 은 HttpOnly 쿠키로만 나가야 하므로 직렬화에서 제외한다.
 * 예전에는 컨트롤러가 이 필드를 뺀 사본을 다시 만들었는데, 한 번만 빠뜨려도 응답 본문에
 * 리프레시 토큰이 실려 나가는 구조였다.
 */
@Schema(description = "로그인 응답")
public record LoginResponse(
		@Schema(example = "eyJhbGciOiJIUzI1NiJ9...") String accessToken,
		@Schema(example = "1") Long id,
		@Schema(nullable = true, example = "3812345678") String kakaoId,
		@Schema(example = "정희성") String name,
		@Schema(example = "3f2a9c10-1b4e-4a77-9c2d-8f1e6b0d5a33") String uuid,
		@Schema(example = "1250") int point,
		@Schema(nullable = true) String profileImageUrl,
		LocalDateTime createdAt,
		@Schema(nullable = true) LocalDateTime deletedAt,

		@JsonIgnore String refreshToken
) {

	public static LoginResponse of(UserProfileResponse profile, String accessToken, String refreshToken) {
		return new LoginResponse(
				accessToken,
				profile.id(),
				profile.kakaoId(),
				profile.name(),
				profile.uuid(),
				profile.point(),
				profile.profileImageUrl(),
				profile.createdAt(),
				profile.deletedAt(),
				refreshToken
		);
	}
}
