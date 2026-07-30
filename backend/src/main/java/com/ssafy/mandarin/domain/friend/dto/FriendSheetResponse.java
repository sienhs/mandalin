package com.ssafy.mandarin.domain.friend.dto;

import java.time.LocalDateTime;

import com.ssafy.mandarin.domain.sheet.entity.Sheet;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "친구의 공개 시트 응답 DTO")
public record FriendSheetResponse(
    @Schema(description = "시트 ID", example = "1")
    Long sheetId,

    @Schema(description = "시트 제목", example = "2026년 목표 만다라트")
    String title,

    @Schema(description = "공개 여부", example = "true")
    Boolean isOpen,

    @Schema(description = "좋아요 수", example = "12")
    Long likeCount,

    @Schema(description = "생성 시각")
    LocalDateTime createdAt,

    @Schema(description = "만료 시각")
    LocalDateTime expiredAt
) {
    public static FriendSheetResponse from(Sheet sheet) {
        return new FriendSheetResponse(
            sheet.getId(),
            sheet.getTitle(),
            sheet.getIsOpen(),
            sheet.getLikeCount(),
            sheet.getCreatedAt(),
            sheet.getExpiredAt()
        );
    }
}
