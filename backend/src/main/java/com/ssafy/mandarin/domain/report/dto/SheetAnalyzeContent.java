package com.ssafy.mandarin.domain.report.dto;

import java.util.List;

// 시트 하나의 지난주 성적표.
// targetCount 는 "지난주에 했어야 할 횟수" 다 — 과제 수가 아니라 수행 횟수 기준이고,
// 화면에서 "100 / 296 (34%)" 처럼 분모까지 그대로 보여줄 수 있다.
public record SheetAnalyzeContent(
        Long sheetId,
        String title,
        Integer completedCount,
        Integer targetCount,
        Integer achievementRate,
        List<DomainAnalyzeContent> domains
) {

}
