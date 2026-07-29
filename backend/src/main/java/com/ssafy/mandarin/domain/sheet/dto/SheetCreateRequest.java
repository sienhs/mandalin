package com.ssafy.mandarin.domain.sheet.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;
import com.ssafy.mandarin.domain.village.entity.ItemDir;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SheetCreateRequest {

    @NotBlank(message = "시트 제목은 필수입니다.")
    private String title;

    @NotNull(message = "공개 여부는 필수입니다.")
    private Boolean isOpen;

    private LocalDateTime expiredAt; // 만료 날짜 (시작일은 생성 시각 createdAt)

    private List<DomainCreateRequest> domains;

    private List<ItemSpotCreateRequest> itemSpots;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DomainCreateRequest {
        @NotNull
        private Integer position;

        @NotBlank
        private String title;

        private List<SubjectCreateRequest> subjects;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SubjectCreateRequest {
        @NotNull
        private Integer position;

        @NotBlank
        private String title;

        private SubjectPeriod period;

        private Long point;

        private Integer targetCount;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemSpotCreateRequest {
        private Long invenId;
        @NotNull
        private Integer domainPosition;
        private Integer itemPosition;
        private ItemDir dir;
    }
}
