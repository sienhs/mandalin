package com.ssafy.mandarin.domain.report.dto;

import java.util.List;

// 필드명은 프론트의 ReportApiResponse 와 1:1 로 맞춘다. 바꾸면 화면이 조용히 빈다
public record WeeklyReportResponse(
    String title,
    String summary,
    List<ReportMetricContent> metrics,
    List<String> strengths,
    List<String> improvements,
    List<DomainAnalyzeContent> categories
) {

}
