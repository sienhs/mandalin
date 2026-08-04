package com.ssafy.mandarin.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;

/** 로그인한 사용자의 보유 포인트 및 일일 포인트 획득 현황. */
@Schema(description = "일일 포인트 획득 현황")
public record DailyPointStatusResponse(
        @Schema(description = "현재 보유 중인 총 포인트", example = "2500")
        int totalUserPoint,

        @Schema(description = "오늘 당일 획득한 포인트", example = "600")
        long todayEarnedPoint,

        @Schema(description = "일일 획득 포인트 상한선", example = "1000")
        long dailyPointLimit,

        @Schema(description = "오늘 추가 획득 가능한 남은 포인트 한도", example = "400")
        long remainingPointLimit
) {
}
