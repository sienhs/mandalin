package com.ssafy.mandarin.domain.report.controller;

import com.ssafy.mandarin.domain.report.dto.WeeklyReportResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
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
            summary = "주간 과제 수행 레포트 제공",
            description = "AI가 분석하여 사용자의 주간 과제 수행 레포트를 제공합니다."
    )
    @GetMapping
    public ResponseEntity<ApiResponse<WeeklyReportResponse>> getWeeklyReport(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        WeeklyReportResponse response = reportService.getWeeklyReport(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("주간 AI 분석 레포트가 조회되었습니다.", response));
    }

    @Operation(
            summary = "주간 과제 수행 레포트 재생성",
            description = "기존 레포트를 무시하고 AI 분석 레포트를 새로 생성합니다."
    )
    @PostMapping
    public ResponseEntity<ApiResponse<WeeklyReportResponse>> createWeeklyReport(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        WeeklyReportResponse response = reportService.createWeeklyReport(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("주간 AI 분석 레포트가 성공적으로 생성했습니다.", response));
    }
}
