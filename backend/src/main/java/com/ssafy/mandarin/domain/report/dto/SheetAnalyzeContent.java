package com.ssafy.mandarin.domain.report.dto;

import java.util.List;

// completedCount / targetCount 는 과제 수가 아니라 수행 횟수.
// targetCount 는 지난주에 했어야 할 횟수.
public record SheetAnalyzeContent(
        Long sheetId,
        String title,
        Integer completedCount,
        Integer targetCount,
        Integer achievementRate,
        List<DomainAnalyzeContent> domains
) {

}
