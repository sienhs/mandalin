package com.ssafy.mandarin.domain.village.dto;

import com.ssafy.mandarin.domain.village.entity.Terrain;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "마을 지형 변경")
public record TerrainUpdateRequest(
		@NotNull(message = "terrain is required")
		@Schema(example = "CITY_ROAD", allowableValues = {"CITY_ROAD", "DIRT_ROAD", "GRASS_PATH", "WATER_WAY"})
		Terrain terrain
) {
}
