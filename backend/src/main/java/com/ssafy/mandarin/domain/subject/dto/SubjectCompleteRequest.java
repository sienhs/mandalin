package com.ssafy.mandarin.domain.subject.dto;

import java.util.List;

public record SubjectCompleteRequest(
        List<Long> subjectIds
) {
}
