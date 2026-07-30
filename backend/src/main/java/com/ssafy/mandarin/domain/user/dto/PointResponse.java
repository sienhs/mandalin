package com.ssafy.mandarin.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "포인트 정보 응답 DTO")
public record PointResponse(
    @Schema(description = "현재 보유 포인트", example = "100")
    int point
) {
    public static PointResponse of(int point) {
        return new PointResponse(point);
    }
}
