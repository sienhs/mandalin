package com.ssafy.mandarin.domain.user.dto;

import com.ssafy.mandarin.domain.user.entity.User;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "내 정보 응답 DTO")
public record MyProfileResponse(
    @Schema(description = "유저 ID", example = "1")
    Long userId,

    @Schema(description = "유저 이름", example = "홍길동")
    String name,

    @Schema(description = "유저 UUID", example = "a1b2c3d4-...")
    String uuid,

    @Schema(description = "포인트", example = "100")
    int point,

    @Schema(description = "프로필 이미지 URL", example = "https://...")
    String profileImage
) {
    public static MyProfileResponse from(User user) {
        return new MyProfileResponse(
            user.getId(),
            user.getName(),
            user.getUuid(),
            user.getPoint(),
            user.getProfileImage()
        );
    }
}
