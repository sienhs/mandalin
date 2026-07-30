package com.ssafy.mandarin.domain.sheet.dto;

import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record SheetListResponse(
        Long sheetId,
        String title,
        Boolean isOpen,
        Long likeCount,
        Double achievementRate,
        LocalDateTime createdAt,
        LocalDateTime expiredAt
) {
}
