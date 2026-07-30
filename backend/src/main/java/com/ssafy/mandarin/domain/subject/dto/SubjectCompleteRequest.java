package com.ssafy.mandarin.domain.subject.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SubjectCompleteRequest {

    private List<Long> subjectIds;
}
