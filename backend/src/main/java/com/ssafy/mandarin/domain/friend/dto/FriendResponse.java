package com.ssafy.mandarin.domain.friend.dto;

import java.time.LocalDateTime;

import com.ssafy.mandarin.domain.friend.entity.Friends;
import com.ssafy.mandarin.domain.user.entity.User;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "친구 목록 응답")
public class FriendResponse {

    @Schema(description = "친구 관계 ID (삭제 시 사용)", example = "1")
    private Long friendRelationId;

    @Schema(description = "친구 유저 ID", example = "7")
    private Long friendUserId;

    @Schema(description = "친구 UUID", example = "a1b2c3d4-...")
    private String uuid;

    @Schema(description = "친구 닉네임", example = "만다린유저")
    private String nickname;

    @Schema(description = "친구 프로필 이미지 URL")
    private String profileImage;

    @Schema(description = "친구가 된 시각")
    private LocalDateTime createdAt;

    public static FriendResponse of(Friends friends, User me) {
        User counterpart = friends.getCounterpart(me);
        return FriendResponse.builder()
            .friendRelationId(friends.getId())
            .friendUserId(counterpart.getId())
            .uuid(counterpart.getUuid())
            .nickname(counterpart.getNickname())
            .profileImage(counterpart.getProfileImage())
            .createdAt(friends.getCreatedAt())
            .build();
    }
}
