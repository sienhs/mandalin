package com.ssafy.mandarin.domain.friend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "친구 요청 전송 바디")
public record FriendSendRequest(
    @NotBlank
    @Schema(description = "친구 요청 대상 유저의 UUID", example = "a1b2c3d4-...")
    String targetUuid
) {}
