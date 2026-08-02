package com.ssafy.mandarin.domain.report.dto;

import java.util.List;

// 이 응답이 기준이고 프론트가 맞춘다. sheets 는 유저의 모든 시트를 최신 생성순으로 담는다
public record WeeklyReportResponse(
    String title,
    String summary,
    List<ReportMetricContent> metrics,
    List<String> strengths,
    List<String> improvements,
    List<SheetAnalyzeContent> sheets
) {

}
