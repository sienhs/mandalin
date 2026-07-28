package com.ssafy.mandarin.domain.building.service;

import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.entity.UserBuilding;
import com.ssafy.mandarin.domain.building.repository.BuildingItemRepository;
import com.ssafy.mandarin.domain.building.repository.UserBuildingRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/** 유저 건물 인벤토리 — 기본 지급과 보유 조회. */
@Slf4j
@Service
@RequiredArgsConstructor
public class BuildingInventoryService {

	private final BuildingItemRepository buildingItemRepository;
	private final UserBuildingRepository userBuildingRepository;

	/**
	 * 기본 제공 건물 중 아직 없는 것을 지급한다.
	 *
	 * <p>가입 시점이 아니라 조회 시점에 채우는 이유: 가입 훅에만 걸어두면 이미 가입한 유저와
	 * 나중에 기본 제공으로 바뀐 건물이 영영 지급되지 않는다. 보유 상태를 읽는 경로에서 먼저
	 * 호출해 "기본 건물은 항상 있다"를 보장한다.
	 */
	@Transactional
	public void grantDefaultBuildings(Long userId) {
		List<BuildingItem> defaults = buildingItemRepository.findAllByDefaultGrantedTrue();
		if (defaults.isEmpty()) {
			return;
		}

		Set<Long> owned = userBuildingRepository.findOwnedItemIdsByUserId(userId);
		List<UserBuilding> missing = defaults.stream()
				.filter(item -> !owned.contains(item.getId()))
				.map(item -> UserBuilding.of(userId, item))
				.toList();

		if (!missing.isEmpty()) {
			userBuildingRepository.saveAll(missing);
			log.debug("Granted {} default buildings to user {}", missing.size(), userId);
		}
	}

	/** 보유 건물 전체(모델링 parts 포함). 기본 지급을 먼저 반영한 뒤 조회한다. */
	@Transactional
	public List<BuildingItem> findOwnedBuildings(Long userId) {
		grantDefaultBuildings(userId);
		return userBuildingRepository.findAllWithItemByUserId(userId).stream()
				.map(UserBuilding::getBuildingItem)
				.toList();
	}
}
