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

    /**
     * 달성률 0~100.
     *
     * <p>친구 카드에 진행률을 그리려면 필요하다. 이 값이 없던 동안 프론트는 친구 시트마다
     * 상세를 한 번씩 더 부르거나 진행률 표시를 포기해야 했다.
     */
    @Schema(description = "달성률(%)", example = "62.5")
    Double achievementRate,

    @Schema(description = "생성 시각")
    LocalDateTime createdAt,

    @Schema(description = "만료 시각")
    LocalDateTime expiredAt
) {

    /** 달성률을 모르는 자리에서 쓰는 변환. 0 으로 채운다. */
    public static FriendSheetResponse from(Sheet sheet) {
        return of(sheet, 0.0);
    }

    public static FriendSheetResponse of(Sheet sheet, double achievementRate) {
        return new FriendSheetResponse(
            sheet.getId(),
            sheet.getTitle(),
            sheet.getIsOpen(),
            sheet.getLikeCount(),
            Math.round(achievementRate * 10.0) / 10.0,
            sheet.getCreatedAt(),
            sheet.getExpiredAt()
        );
    }
}
