package com.ssafy.mandarin.domain.friend.dto;

import java.time.LocalDateTime;

import com.ssafy.mandarin.domain.friend.entity.Friends;
import com.ssafy.mandarin.domain.user.entity.User;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "친구 목록 응답")
public record FriendResponse(
    @Schema(description = "친구 관계 ID (삭제 시 사용)", example = "1")
    Long friendRelationId,

    @Schema(description = "친구 유저 ID", example = "7")
    Long friendUserId,

    @Schema(description = "친구 UUID", example = "a1b2c3d4-...")
    String uuid,

    @Schema(description = "친구 이름", example = "홍길동")
    String name,

    @Schema(description = "친구 프로필 이미지 URL")
    String profileImage,

    @Schema(description = "친구가 된 시각")
    LocalDateTime createdAt
) {
    public static FriendResponse of(Friends friends, User me) {
        User counterpart = friends.getCounterpart(me);
        return new FriendResponse(
            friends.getId(),
            counterpart.getId(),
            counterpart.getUuid(),
            counterpart.getName(),
            counterpart.getProfileImage(),
            friends.getCreatedAt()
        );
    }
}
