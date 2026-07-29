package com.ssafy.mandarin.domain.group.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "그룹 초대 수락/거절 요청 DTO")
public record GroupInviteStatusRequest(
    @NotNull(message = "수락 여부(accept)를 선택해 주세요.")
    @Schema(description = "수락 여부 (true: 수락, false: 거절)", example = "true")
    Boolean accept
) {
}
