package com.ssafy.mandarin.domain.sheet.dto;

public record SheetProgressDto(
        Long sheetId,
        Double achievementRate,
        Double progress
) {
}
