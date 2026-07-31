package com.ssafy.mandarin.domain.demo.service;

import java.util.List;
import java.util.Set;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.entity.BuildingType;
import com.ssafy.mandarin.domain.building.entity.UserBuilding;
import com.ssafy.mandarin.domain.building.repository.BuildingItemRepository;
import com.ssafy.mandarin.domain.building.repository.UserBuildingRepository;
import com.ssafy.mandarin.domain.demo.dto.DemoUnlockResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 시연용 건물 해금.
 *
 * <p>랜드마크(정중앙 3×3 자리 전용)는 포인트로 사는 물건이 아니라 <b>만다라트 완성 보상</b>으로
 * 줄 예정이다. 그 보상 지급이 아직 없어서, 지금은 해금할 방법이 전혀 없다 — 기본 지급 1종
 * ({@code lm_civic_plaza}) 말고는 마을 정중앙에 세워 볼 수가 없다.
 *
 * <p>그래서 보상 로직을 대신하는 임시 통로를 둔다. 포인트를 거치지 않는다 — 랜드마크는 상점
 * 재화가 아니므로, 여기서 포인트를 깎으면 없앨 예정인 가격 개념을 오히려 굳히게 된다.
 *
 * <p>{@code app.demo.enabled} 로 시연용 API 전체와 함께 꺼진다. 실제 완성 보상이 붙으면
 * 이 클래스는 제거 대상이다.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.demo.enabled", havingValue = "true")
@RequiredArgsConstructor
public class DemoBuildingService {

	private final BuildingItemRepository buildingItemRepository;
	private final UserBuildingRepository userBuildingRepository;

	/**
	 * 랜드마크 전 종을 해금한다.
	 *
	 * <p>이미 보유한 종은 건너뛴다. {@code uk_user_building} 유니크 제약이 중복을 막지만,
	 * 걸리면 요청 전체가 실패해서 "두 번 누르면 에러"가 된다 — 먼저 걸러내야 멱등해진다.
	 *
	 * @return 새로 지급한 종수 + 지급 후 보유 종수 + 전체 종수
	 */
	@Transactional
	public DemoUnlockResponse unlockAllLandmarks(Long userId) {
		List<BuildingItem> landmarks =
				buildingItemRepository.findAllByTypeOrderBySortOrderAsc(BuildingType.LANDMARK);

		Set<Long> owned = userBuildingRepository.findOwnedItemIdsByUserId(userId);
		List<UserBuilding> missing = landmarks.stream()
				.filter(item -> !owned.contains(item.getId()))
				.map(item -> UserBuilding.of(userId, item))
				.toList();

		if (!missing.isEmpty()) {
			userBuildingRepository.saveAll(missing);
			log.warn("[demo] user {} 에게 랜드마크 {}종 해금 — 시연용 기능", userId, missing.size());
		}

		long ownedAfter = landmarks.stream().filter(item -> owned.contains(item.getId())).count()
				+ missing.size();
		return new DemoUnlockResponse(missing.size(), (int) ownedAfter, landmarks.size());
	}
}
