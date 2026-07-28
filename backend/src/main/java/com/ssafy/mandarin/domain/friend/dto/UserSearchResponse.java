package com.ssafy.mandarin.domain.friend.dto;

import com.ssafy.mandarin.domain.user.entity.User;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "UUID로 유저 검색 응답")
public class UserSearchResponse {

    @Schema(description = "유저 ID", example = "7")
    private Long userId;

    @Schema(description = "유저 UUID", example = "a1b2c3d4-...")
    private String uuid;

    @Schema(description = "유저 닉네임", example = "만다린유저")
    private String nickname;

    @Schema(description = "유저 프로필 이미지 URL")
    private String profileImage;

    @Schema(description = "이미 친구 여부", example = "false")
    private boolean isFriend;

    public static UserSearchResponse of(User target, boolean isFriend) {
        return UserSearchResponse.builder()
            .userId(target.getId())
            .uuid(target.getUuid())
            .nickname(target.getNickname())
            .profileImage(target.getProfileImage())
            .isFriend(isFriend)
            .build();
    }
}
