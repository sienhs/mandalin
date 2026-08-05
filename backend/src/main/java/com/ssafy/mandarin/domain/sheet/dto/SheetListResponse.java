package com.ssafy.mandarin.domain.sheet.dto;

import java.time.LocalDateTime;

import lombok.Builder;

@Builder
public record SheetListResponse(
        Long sheetId,
        String title,
        Boolean isOpen,
        Long likeCount,
        /**
         * 내가 좋아요를 눌렀는지.
         *
         * <p>목록에도 필요하다 — 이 값이 없으면 카드에서 하트를 채워 그릴 수 없어서,
         * 프론트가 시트마다 상세를 한 번씩 더 부르거나 좋아요 버튼을 상세에서만 열어야 했다.
         */
        Boolean isLiked,
        Double achievementRate,
        Double progress,
        LocalDateTime createdAt,
        LocalDateTime expiredAt
) {
}
