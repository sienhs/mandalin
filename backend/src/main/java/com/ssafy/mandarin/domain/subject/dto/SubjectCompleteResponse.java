package com.ssafy.mandarin.domain.subject.dto;

import java.util.List;

import lombok.Builder;

@Builder
public record SubjectCompleteResponse(
        List<Long> completedSubjectIds,
        Long totalEarnedPoint,
        Integer totalUserPoint
) {
}
