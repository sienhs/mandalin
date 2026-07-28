package com.ssafy.mandarin.domain.user.dto;

import com.ssafy.mandarin.domain.user.entity.User;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "내 정보 응답 DTO")
public class MyProfileResponse {

    @Schema(description = "유저 ID", example = "1")
    private Long userId;

    @Schema(description = "유저 이름", example = "홍길동")
    private String name;

    @Schema(description = "유저 UUID", example = "a1b2c3d4-...")
    private String uuid;

    @Schema(description = "포인트", example = "100")
    private int point;

    @Schema(description = "프로필 이미지 URL", example = "https://...")
    private String profileImage;

    public static MyProfileResponse from(User user) {
        return MyProfileResponse.builder()
            .userId(user.getId())
            .name(user.getName())
            .uuid(user.getUuid())
            .point(user.getPoint())
            .profileImage(user.getProfileImage())
            .build();
    }
}
