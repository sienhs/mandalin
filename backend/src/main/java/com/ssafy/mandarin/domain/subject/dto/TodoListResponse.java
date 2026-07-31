package com.ssafy.mandarin.domain.subject.dto;

import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;

import lombok.Builder;

@Builder
public record TodoListResponse(
        Long sheetId,
        Long subjectId,
        Long domainId,
        String domainTitle,
        String title,
        SubjectPeriod period,
        Long point,
        Integer targetCount,
        Integer tryCount,
        Integer position,
        Boolean isDone,
        Boolean isDoneToday
) {
}
