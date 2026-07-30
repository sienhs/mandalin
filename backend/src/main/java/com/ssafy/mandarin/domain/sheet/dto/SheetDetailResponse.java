package com.ssafy.mandarin.domain.sheet.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;

import lombok.Builder;

@Builder
public record SheetDetailResponse(
        Long sheetId,
        Long userId,
        String title,
        Boolean isOpen,
        Long likeCount,
        Double achievementRate,
        LocalDateTime createdAt,
        LocalDateTime expiredAt,
        List<DomainDetailResponse> domains
) {
    @Builder
    public record DomainDetailResponse(
            Long domainId,
            Integer position,
            String title,
            List<SubjectDetailResponse> subjects
    ) {
    }

    @Builder
    public record SubjectDetailResponse(
            Long subjectId,
            Integer position,
            String title,
            SubjectPeriod period,
            Long point,
            Integer targetCount,
            Integer tryCount,
            Boolean isDone,
            Boolean isDonePeriod,
            Integer progress
    ) {
    }
}
