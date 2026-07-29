package com.ssafy.mandarin.domain.group.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "미확인 그룹 초대 건수 응답 DTO")
public record GroupRequestCountResponse(
    @Schema(description = "미확인 초대 건수", example = "2")
    long count
) {
    public static GroupRequestCountResponse of(long count) {
        return GroupRequestCountResponse.builder()
            .count(count)
            .build();
    }
}
