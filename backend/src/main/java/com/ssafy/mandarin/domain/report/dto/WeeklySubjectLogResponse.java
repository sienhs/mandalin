package com.ssafy.mandarin.domain.report.dto;

import java.time.LocalDate;
import java.util.List;

public record WeeklySubjectLogResponse(
        LocalDate startDate,
        LocalDate endDate,
        long totalCompletedCount,
        long totalEarnedPoints,
        List<SubjectLogItemDto> logs
) {
}
