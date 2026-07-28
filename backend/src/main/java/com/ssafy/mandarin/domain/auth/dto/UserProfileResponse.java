package com.ssafy.mandarin.domain.auth.dto;

import java.time.LocalDateTime;

import com.ssafy.mandarin.domain.user.entity.User;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 로그인한 사용자 프로필.
 *
 * <p>액세스 토큰만으로는 "누구인지"를 복원할 수 없어(재발급 응답은 토큰 문자열뿐) 프론트가
 * 새로고침 후 이 응답으로 사용자 정보를 되찾는다. 로그인 응답과 같은 필드를 쓴다.
 */
@Schema(description = "사용자 프로필")
public record UserProfileResponse(
		@Schema(example = "1") Long id,
		@Schema(description = "카카오 회원번호. oauth_identities 에서 가져온다", nullable = true, example = "3812345678")
		String kakaoId,
		@Schema(example = "정희성") String name,
		@Schema(example = "3f2a9c10-1b4e-4a77-9c2d-8f1e6b0d5a33") String uuid,
		@Schema(example = "1250") int point,
		@Schema(nullable = true) String profileImageUrl,
		LocalDateTime createdAt,
		@Schema(description = "탈퇴 시각. 활성 사용자면 null", nullable = true) LocalDateTime deletedAt
) {

	public static UserProfileResponse of(User user, String kakaoId) {
		return new UserProfileResponse(
				user.getId(),
				kakaoId,
				user.getName(),
				user.getUuid(),
				user.getPoint(),
				user.getProfileImage(),
				user.getCreatedAt(),
				user.getDeletedAt()
		);
	}
}
