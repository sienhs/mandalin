package com.ssafy.mandarin.domain.friend.dto;

import java.time.LocalDateTime;

import com.ssafy.mandarin.domain.friend.entity.FriendRequest;
import com.ssafy.mandarin.domain.friend.entity.RequestProgress;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "받은 친구 요청 응답")
public record FriendRequestResponse(
    @Schema(description = "친구 요청 ID", example = "1")
    Long requestId,

    @Schema(description = "보낸 사람 UUID", example = "a1b2c3d4-...")
    String senderUuid,

    @Schema(description = "보낸 사람 이름", example = "홍길동")
    String senderName,

    @Schema(description = "보낸 사람 프로필 이미지 URL")
    String senderProfileImage,

    @Schema(description = "요청 상태", example = "NOT_READ")
    RequestProgress progress,

    @Schema(description = "요청 생성 시각")
    LocalDateTime createdAt
) {
    public static FriendRequestResponse from(FriendRequest request) {
        return new FriendRequestResponse(
            request.getId(),
            request.getSender().getUuid(),
            request.getSender().getName(),
            request.getSender().getProfileImage(),
            request.getProgress(),
            request.getCreatedAt()
        );
    }
}
