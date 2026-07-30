package com.ssafy.mandarin.domain.sheet.dto;

import lombok.Builder;

@Builder
public record SheetLikeResponse(
        Long sheetId,
        Boolean isLiked,
        Long likeCount
) {
}
