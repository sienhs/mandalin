package com.ssafy.mandarin.domain.village.dto;

import com.ssafy.mandarin.domain.building.dto.BuildingSizeResponse;
import com.ssafy.mandarin.domain.building.entity.BuildingType;
import com.ssafy.mandarin.domain.village.entity.ItemDir;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

/**
 * 마을 타일 한 칸.
 *
 * <p><b>좌표 두 벌이 함께 들어 있다.</b> {@code domainPosition}/{@code itemPosition} 은
 * item_spot 테이블의 9×9 격자 좌표(1-based)이고, {@code domainIndex}/{@code subjectPosition} 은
 * 만다라트의 세부 목표·과제 번호(0-based)다. 서버가 둘을 이어 주지 않으면 프론트가 같은
 * 변환 규칙을 다시 구현해야 하고, 규칙이 어긋나면 엉뚱한 칸에 건물이 선다.
 *
 * <pre>
 *   domainPosition  1 2 3        domainIndex  0 1 2
 *                   4 5 6   →                3 · 4     (5 = 중앙 랜드마크 구역)
 *                   7 8 9                    5 6 7
 *
 *   itemPosition    1 2 3        subjectPosition  0 1 2
 *                   4 5 6   →                    3 · 4  (5 = 블록 중앙 = 세부 목표 간판)
 *                   7 8 9                        5 6 7
 * </pre>
 */
@Builder
@Schema(description = "마을 타일 한 칸의 건물 배치")
public record ItemSpotResponse(
        @Schema(description = "item_spot 격자 구역(1~9). 5 는 중앙 랜드마크", example = "1")
        Integer domainPosition,

        @Schema(description = "구역 안 타일(1~9). 5 는 구역 중앙", example = "3")
        Integer itemPosition,

        @Schema(description = "세부 목표 번호(0~7). 중앙 구역이면 null", example = "0")
        Integer domainIndex,

        @Schema(description = "과제 번호(0~7). 구역 중앙 타일이면 null", example = "2")
        Integer subjectPosition,

        @Schema(description = "이 칸이 가리키는 과제. 아직 과제가 없으면 null", example = "41")
        Long subjectId,

        @Schema(description = "과제 제목. 없으면 null", example = "아침 스트레칭 10분")
        String subjectTitle,

        @Schema(description = "과제 진행률 0~100. 건물이 자라는 단계를 정한다", example = "63")
        Integer progress,

        @Schema(description = "이 칸에 놓인 보유 건물(user_building.id). null 이면 기본 스킨", example = "12")
        Long invenId,

        @Schema(description = "카탈로그 건물 아이디", example = "104")
        Long itemId,

        @Schema(example = "medieval_clocktower")
        String itemKey,

        @Schema(example = "시계탑")
        String name,

        @Schema(example = "MEDIEVAL")
        String theme,

        @Schema(example = "LANDMARK")
        BuildingType type,

        @Schema(nullable = true)
        String thumbnailUrl,

        BuildingSizeResponse size,

        @Schema(description = "회전. 0 / 90 / 180 / 270", example = "0")
        ItemDir dir
) {

        /** 중앙 랜드마크 구역인지. 프론트가 굳이 5 를 외우지 않아도 되게 한다. */
        @Schema(description = "중앙 랜드마크 칸이면 true")
        public boolean isLandmarkSlot() {
                return domainPosition != null && domainPosition == 5;
        }
}
