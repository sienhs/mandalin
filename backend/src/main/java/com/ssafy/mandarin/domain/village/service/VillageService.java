package com.ssafy.mandarin.domain.village.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.building.dto.BuildingSizeResponse;
import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.service.BuildingInventoryService;
import com.ssafy.mandarin.domain.building.service.BuildingPartsReader;
import com.ssafy.mandarin.domain.village.dto.OwnedBuildingResponse;
import com.ssafy.mandarin.domain.village.dto.VillageResponse;
import com.ssafy.mandarin.domain.village.entity.Terrain;
import com.ssafy.mandarin.domain.village.entity.UserVillage;
import com.ssafy.mandarin.domain.village.repository.UserVillageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VillageService {

	private final BuildingInventoryService buildingInventoryService;
	private final BuildingPartsReader buildingPartsReader;
	private final UserVillageRepository userVillageRepository;

	/** 마을 화면 한 방 조회 — 해당 시트의 지형 + 배치 가능한(=보유한) 건물 전체. */
	@Transactional
	public VillageResponse getMyVillage(Long userId, Long sheetId) {
		List<OwnedBuildingResponse> buildings = buildingInventoryService.findOwnedBuildings(userId).stream()
				.map(this::toResponse)
				.toList();

		return new VillageResponse(findTerrain(userId, sheetId), buildings);
	}

	/**
	 * 시트 하나의 지형을 바꾼다. 몇 번을 불러도 같은 결과가 되는 upsert 다.
	 *
	 * @return 적용된 지형
	 */
	@Transactional
	public Terrain changeTerrain(Long userId, Long sheetId, Terrain terrain) {
		userVillageRepository.findByUserIdAndSheetId(userId, sheetId)
				.ifPresentOrElse(
						village -> village.changeTerrain(terrain),
						() -> userVillageRepository.save(UserVillage.of(userId, sheetId, terrain)));
		return terrain;
	}

	/** 고른 적 없으면 기본 지형. 마을이 빈 바닥으로 그려지는 상황을 만들지 않는다. */
	private Terrain findTerrain(Long userId, Long sheetId) {
		return userVillageRepository.findByUserIdAndSheetId(userId, sheetId)
				.map(UserVillage::getTerrain)
				.orElse(Terrain.DEFAULT);
	}

	private OwnedBuildingResponse toResponse(BuildingItem item) {
		return new OwnedBuildingResponse(
				item.getId(),
				item.getItemKey(),
				item.getName(),
				item.getTheme(),
				item.getType(),
				item.getThumbnailUrl(),
				BuildingSizeResponse.from(item),
				buildingPartsReader.read(item));
	}
}
