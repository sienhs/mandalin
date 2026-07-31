package com.ssafy.mandarin.domain.report.dto;

import java.time.LocalDateTime;

public record SubjectLogItemDto(
        Long logId,
        Long subjectId,
        String subjectTitle,
        Long domainId,
        String domainTitle,
        Long earnedPoint,
        LocalDateTime completedAt
) {
}
