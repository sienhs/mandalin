package com.ssafy.mandarin.domain.leaderboard.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.leaderboard.dto.LeaderboardResponse;
import com.ssafy.mandarin.domain.leaderboard.service.LeaderboardService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
@Tag(name = "Leaderboard", description = "리더보드 (좋아요 랭킹) API")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    @Operation(
        summary = "리더보드 랭킹 조회",
        description = "공개 설정된(isOpen=true) 만다라트 시트 중 좋아요 수가 높은 순으로 내림차순 정렬하여 페이징 조회합니다."
    )
    public ResponseEntity<ApiResponse<LeaderboardResponse>> getLeaderboard(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        LeaderboardResponse response = leaderboardService.getLeaderboard(page, size);
        return ResponseEntity.ok(ApiResponse.success("리더보드 랭킹 조회 성공", response));
    }
}
