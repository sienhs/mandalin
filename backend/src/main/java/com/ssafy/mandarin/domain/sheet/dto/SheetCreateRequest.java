package com.ssafy.mandarin.domain.sheet.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;
import com.ssafy.mandarin.domain.village.entity.ItemDir;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record SheetCreateRequest(
        @NotBlank(message = "시트 제목은 필수입니다.")
        String title,

        @NotNull(message = "공개 여부는 필수입니다.")
        Boolean isOpen,

        LocalDateTime expiredAt,

        List<DomainCreateRequest> domains,

        List<ItemSpotCreateRequest> itemSpots
) {
    @Builder
    public record DomainCreateRequest(
            @NotNull
            Integer position,

            @NotBlank
            String title,

            List<SubjectCreateRequest> subjects
    ) {
    }

    @Builder
    public record SubjectCreateRequest(
            @NotNull
            Integer position,

            @NotBlank
            String title,

            SubjectPeriod period,

            Long point,

            Integer targetCount
    ) {
    }

    @Builder
    public record ItemSpotCreateRequest(
            Long invenId,

            @NotNull
            Integer domainPosition,

            Integer itemPosition,

            ItemDir dir
    ) {
    }
}
