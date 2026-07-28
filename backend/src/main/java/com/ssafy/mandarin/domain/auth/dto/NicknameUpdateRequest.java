package com.ssafy.mandarin.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "닉네임 변경 요청")
public record NicknameUpdateRequest(

    @Schema(description = "변경할 닉네임", example = "만다린유저")
    @NotBlank(message = "Nickname is required.")
    @Size(min = 1, max = 50, message = "Nickname must be 1-50 characters.")
    String nickname
) {}
