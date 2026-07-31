package com.ssafy.mandarin.domain.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@Schema(description = "포인트 정보 응답 DTO")
public class PointResponse {

    @Schema(description = "현재 보유 포인트", example = "100")
    private int point;

    public static PointResponse of(int point) {
        return PointResponse.builder()
            .point(point)
            .build();
    }
}
