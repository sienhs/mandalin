package com.ssafy.mandarin.domain.subject.dto;

import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TodoListResponse {

    private Long subjectId;
    private Long domainId;
    private String domainTitle;
    private String title;
    private SubjectPeriod period;
    private Long point;
    private Integer targetCount;
    private Integer tryCount;
    private Integer position;
    private Boolean isDone;
    private Boolean isDoneToday;
}
