package com.ssafy.mandarin.domain.leaderboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "리더보드 랭킹 항목 응답 DTO")
public record LeaderboardItemResponse(
    @Schema(description = "현재 순위 (1부터 시작)", example = "1")
    int rank,

    @Schema(description = "만다라트 시트 ID", example = "892")
    Long sheetId,

    @Schema(description = "만다라트 핵심 목표 제목", example = "미라클 모닝 30일")
    String title,

    @Schema(description = "작성자 이름", example = "박하늘")
    String name,

    @Schema(description = "누적 좋아요 수", example = "412")
    Long likeCount
) {}
