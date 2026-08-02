package com.ssafy.mandarin.domain.report.dto;

import java.util.List;

public record WeeklyReportResponse(
    String title,
    String summary,
    Integer rate,
    Integer subjectCount,
    List<String> strength,
    List<String> weakness,
    List<DomainAnalyzeContent> domainRate
) {

}
