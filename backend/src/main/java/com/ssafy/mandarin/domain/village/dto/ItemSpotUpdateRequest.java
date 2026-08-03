package com.ssafy.mandarin.domain.village.dto;

import java.util.List;

import com.ssafy.mandarin.domain.village.entity.ItemDir;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/** 타일 한 칸에 건물을 놓거나 치운다. */
@Schema(description = "타일 한 칸의 건물 지정")
public record ItemSpotUpdateRequest(
        @Schema(description = "놓을 보유 건물(user_building.id). null 을 보내면 기본 스킨으로 되돌린다",
                nullable = true, example = "12")
        Long invenId,

        @Schema(description = "회전. 생략하면 0", example = "90")
        ItemDir dir
) {

        /** 여러 칸을 한 번에 저장할 때. 편집 화면에서 드래그로 여러 칸을 바꾼 뒤 한 번만 보낸다. */
        @Schema(description = "여러 칸 일괄 지정")
        public record Bulk(
                @Schema(description = "바꿀 칸 목록")
                @NotNull(message = "spots 는 필수입니다.")
                @Valid
                List<Entry> spots
        ) {
        }

        @Schema(description = "일괄 지정 항목")
        public record Entry(
                @Schema(description = "격자 구역(1~9)", example = "1")
                @NotNull(message = "domainPosition 은 필수입니다.")
                @Min(value = 1, message = "domainPosition 은 1~9 입니다.")
                @Max(value = 9, message = "domainPosition 은 1~9 입니다.")
                Integer domainPosition,

                @Schema(description = "구역 안 타일(1~9)", example = "3")
                @NotNull(message = "itemPosition 은 필수입니다.")
                @Min(value = 1, message = "itemPosition 은 1~9 입니다.")
                @Max(value = 9, message = "itemPosition 은 1~9 입니다.")
                Integer itemPosition,

                @Schema(nullable = true, example = "12")
                Long invenId,

                @Schema(example = "0")
                ItemDir dir
        ) {
        }
}
