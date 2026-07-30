package com.ssafy.mandarin.domain.friend.dto;

import com.ssafy.mandarin.domain.user.entity.User;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "UUID로 유저 검색 응답")
public record UserSearchResponse(
    @Schema(description = "유저 ID", example = "7")
    Long userId,

    @Schema(description = "유저 UUID", example = "a1b2c3d4-...")
    String uuid,

    @Schema(description = "유저 이름", example = "홍길동")
    String name,

    @Schema(description = "유저 프로필 이미지 URL")
    String profileImage,

    @Schema(description = "이미 친구 여부", example = "false")
    boolean isFriend
) {
    public static UserSearchResponse of(User target, boolean isFriend) {
        return new UserSearchResponse(
            target.getId(),
            target.getUuid(),
            target.getName(),
            target.getProfileImage(),
            isFriend
        );
    }
}
