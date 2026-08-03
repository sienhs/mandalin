package com.ssafy.mandarin.domain.village.dto;

import java.util.List;

import com.ssafy.mandarin.domain.village.entity.Terrain;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 마을 배치 전체.
 *
 * <p>기존 {@code VillageResponse} 는 "보유 건물 목록"이라 어디에 무엇이 서 있는지를 알 수 없었다.
 * 이 응답은 타일 73칸(중앙 1 + 8구역 × 9칸)을 그대로 담아, 프론트가 좌표 계산 없이 그릴 수 있게 한다.
 */
@Schema(description = "시트 한 장의 마을 배치")
public record VillageLayoutResponse(
        @Schema(example = "12") Long sheetId,

        @Schema(description = "고른 적 없으면 기본값(GRASS_PATH)", example = "GRASS_PATH")
        Terrain terrain,

        @Schema(description = "전체 달성률 0~100. 랜드마크 성장 단계를 정한다", example = "61")
        Integer achievementRate,

        @Schema(description = "타일 목록. 구역·타일 순으로 정렬돼 있다")
        List<ItemSpotResponse> spots
) {
}
