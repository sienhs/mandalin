package com.ssafy.mandarin.domain.report.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.report.dto.WeeklySubjectLogResponse;
import com.ssafy.mandarin.domain.report.service.ReportService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@Tag(name = "Report", description = "AI 리포트 및 통계 데이터 관련 API")
@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(
            summary = "주간 과제 수행 로그 및 통계 조회",
            description = "사용자의 현재 주간(월요일~일요일) 동안의 과제 수행 횟수, 총 획득 포인트, 완료 과제 및 도메인명 상세 목록을 조회합니다."
    )
    @GetMapping("/weekly-logs")
    public ResponseEntity<ApiResponse<WeeklySubjectLogResponse>> getWeeklySubjectLogs(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        WeeklySubjectLogResponse response = reportService.getWeeklySubjectLogs(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("주간 과제 수행 로그 조회가 완료되었습니다.", response));
    }
}
