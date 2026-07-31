package com.ssafy.mandarin.domain.leaderboard.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "리더보드 랭킹 페이징 응답 DTO")
public record LeaderboardResponse(
    @Schema(description = "총 페이지 수", example = "2")
    int totalPages,

    @Schema(description = "랭킹 시트 목록")
    List<LeaderboardItemResponse> content
) {}
