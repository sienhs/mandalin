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
        Boolean isLiked,
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

            /** 한 주기 안에서 수행해야 하는 횟수(예: "주 3회" 의 3). */
            Integer countPerPeriod,

            /** 이번 주기에 지금까지 수행한 횟수. 화면의 "2/3회" 표시에 쓴다. */
            Long currentPeriodCount,

            Long point,
            Integer targetCount,
            Integer tryCount,
            Boolean isDone,

            /** 오늘 수행했는지. 하루 한 번 규칙이라 주간·월간 과제도 하루에 두 번은 못 한다. */
            Boolean isDoneToday,

            /** 지금 수행 버튼을 누를 수 있는지. 서버가 판단해 내려준다. */
            Boolean canExecute,

            Boolean isDonePeriod,
            Integer progress
    ) {
    }
}
