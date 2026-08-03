package com.ssafy.mandarin.domain.report.dto;

import java.util.List;

// 이 응답이 기준이고 프론트가 맞춘다
public record WeeklyReportResponse(
    String title,
    String summary,
    List<ReportMetricContent> metrics,
    List<String> strengths,
    List<String> improvements,
    List<SheetAnalyzeContent> sheets
) {

}
