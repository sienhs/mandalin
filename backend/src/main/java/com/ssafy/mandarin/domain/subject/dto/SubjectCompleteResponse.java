package com.ssafy.mandarin.domain.subject.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectCompleteResponse {

    private List<Long> completedSubjectIds;
    private Long totalEarnedPoint;
    private Integer totalUserPoint;
}
