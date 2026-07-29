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
        /**
         * 진행률 0~100.
         *
         * <p>클라이언트가 tryCount/targetCount 로 직접 계산하지 않도록 서버가 확정해 준다.
         * targetCount 산정 규칙(daily=기간일수, weekly=기간/7, none=1)이 서버에만 있어서,
         * 계산을 클라이언트에 두면 주기 정책을 바꿀 때 양쪽을 같이 고쳐야 하고 빠뜨리면
         * 조용히 어긋난다. 마을의 건물 성장 단계가 이 값을 그대로 쓴다.
         */
        private Integer progress;
    }
}
