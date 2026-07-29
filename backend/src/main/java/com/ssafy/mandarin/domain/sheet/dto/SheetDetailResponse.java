package com.ssafy.mandarin.domain.sheet.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SheetDetailResponse {

    private Long sheetId;
    private Long userId;
    private String title;
    private Boolean isOpen;
    private Long likeCount;
    private Double achievementRate;
    private LocalDateTime createdAt;
    private LocalDateTime expiredAt;
    private List<DomainDetailResponse> domains;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DomainDetailResponse {
        private Long domainId;
        private Integer position;
        private String title;
        private List<SubjectDetailResponse> subjects;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubjectDetailResponse {
        private Long subjectId;
        private Integer position;
        private String title;
        private SubjectPeriod period;
        private Long point;
        private Integer targetCount;
        private Integer tryCount;
        private Boolean isDone;
        private Boolean isDonePeriod;
    }
}
