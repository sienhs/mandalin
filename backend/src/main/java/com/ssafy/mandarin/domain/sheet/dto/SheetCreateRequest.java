package com.ssafy.mandarin.domain.sheet.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;
import com.ssafy.mandarin.domain.village.entity.ItemDir;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Builder;

/**
 * 만다라트 생성 요청.
 *
 * <p><b>여기서 보낸 내용이 그대로 확정된다.</b> 생성 이후에는 핵심 목표·세부 목표·실천 과제를
 * 고칠 수 없다(수정 API 를 두지 않았다). 그래서 이 요청은 81칸을 <b>빠짐없이</b> 담아야 한다 —
 * 세부 목표 8개, 각 목표마다 과제 8개다. 일부만 보내면 남은 칸은 영영 채울 수 없다.
 *
 * <p>중첩 리스트에 {@code @Valid} 가 붙어 있어야 안쪽 제약(제목 @NotBlank 등)이 실제로
 * 검사된다. 없으면 껍데기만 검사하고 통과한다.
 */
@Builder
public record SheetCreateRequest(
        @NotBlank(message = "시트 제목은 필수입니다.")
        @Size(max = 255, message = "시트 제목은 255자 이하입니다.")
        String title,

        @NotNull(message = "공개 여부는 필수입니다.")
        Boolean isOpen,

        LocalDateTime expiredAt,

        @NotEmpty(message = "세부 목표는 필수입니다.")
        @Size(min = 8, max = 8, message = "세부 목표는 정확히 8개여야 합니다. 만다라트는 생성 후 수정할 수 없습니다.")
        @Valid
        List<DomainCreateRequest> domains,

        /** 건물 배치는 선택이다. 생략하면 전 칸이 기본 스킨으로 만들어진다. */
        @Valid
        List<ItemSpotCreateRequest> itemSpots
) {
    @Builder
    public record DomainCreateRequest(
            @NotNull(message = "세부 목표 위치는 필수입니다.")
            @Min(value = 0, message = "세부 목표 위치는 0~7 입니다.")
            @Max(value = 7, message = "세부 목표 위치는 0~7 입니다.")
            Integer position,

            @NotBlank(message = "세부 목표 제목은 필수입니다.")
            @Size(max = 255, message = "세부 목표 제목은 255자 이하입니다.")
            String title,

            @NotEmpty(message = "실천 과제는 필수입니다.")
            @Size(min = 8, max = 8, message = "실천 과제는 세부 목표마다 정확히 8개여야 합니다.")
            @Valid
            List<SubjectCreateRequest> subjects
    ) {
    }

    @Builder
    public record SubjectCreateRequest(
            @NotNull(message = "과제 위치는 필수입니다.")
            @Min(value = 0, message = "과제 위치는 0~7 입니다.")
            @Max(value = 7, message = "과제 위치는 0~7 입니다.")
            Integer position,

            @NotBlank(message = "과제 제목은 필수입니다.")
            @Size(max = 255, message = "과제 제목은 255자 이하입니다.")
            String title,

            SubjectPeriod period,

            @Min(value = 0, message = "포인트는 0 이상입니다.")
            Long point,

            @Min(value = 1, message = "목표 횟수는 1 이상입니다.")
            @Max(value = 3650, message = "목표 횟수는 3650 이하입니다.")
            Integer targetCount,

            /**
             * 한 주기 안에서 수행할 횟수(예: "주 3회" 의 3).
             *
             * <p>상한은 주기마다 다르다(daily 1 / weekly 7 / monthly 30 / none 1).
             * 범위를 여기 어노테이션으로 못 박지 않는 이유는 상한이 period 값에 달려 있어서다 —
             * 생략하거나 0 이하면 1 로 본다. 화면이 주기에 맞는 상한을 걸어 보낸다.
             */
            @Min(value = 1, message = "주기당 횟수는 1 이상입니다.")
            @Max(value = 30, message = "주기당 횟수는 30 이하입니다.")
            Integer countPerPeriod
    ) {
    }

    @Builder
    public record ItemSpotCreateRequest(
            Long invenId,

            @NotNull(message = "건물 배치 구역은 필수입니다.")
            @Min(value = 1, message = "구역은 1~9 입니다.")
            @Max(value = 9, message = "구역은 1~9 입니다.")
            Integer domainPosition,

            @Min(value = 1, message = "타일은 1~9 입니다.")
            @Max(value = 9, message = "타일은 1~9 입니다.")
            Integer itemPosition,

            ItemDir dir
    ) {
    }
}
