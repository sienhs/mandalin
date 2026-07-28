package com.ssafy.mandarin.domain.friend.dto;

import java.time.LocalDateTime;

import com.ssafy.mandarin.domain.friend.entity.FriendRequest;
import com.ssafy.mandarin.domain.friend.entity.RequestProgress;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "받은 친구 요청 응답")
public class FriendRequestResponse {

    @Schema(description = "친구 요청 ID", example = "1")
    private Long requestId;

    @Schema(description = "보낸 사람 UUID", example = "a1b2c3d4-...")
    private String senderUuid;

    @Schema(description = "보낸 사람 닉네임", example = "만다린유저")
    private String senderNickname;

    @Schema(description = "보낸 사람 프로필 이미지 URL")
    private String senderProfileImage;

    @Schema(description = "요청 상태", example = "NOT_READ")
    private RequestProgress progress;

    @Schema(description = "요청 생성 시각")
    private LocalDateTime createdAt;

    public static FriendRequestResponse from(FriendRequest request) {
        return FriendRequestResponse.builder()
            .requestId(request.getId())
            .senderUuid(request.getSender().getUuid())
            .senderNickname(request.getSender().getNickname())
            .senderProfileImage(request.getSender().getProfileImage())
            .progress(request.getProgress())
            .createdAt(request.getCreatedAt())
            .build();
    }
}
