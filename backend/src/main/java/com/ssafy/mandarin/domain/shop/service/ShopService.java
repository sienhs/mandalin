package com.ssafy.mandarin.domain.shop.service;

import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.entity.BuildingType;
import com.ssafy.mandarin.domain.building.entity.UserBuilding;
import com.ssafy.mandarin.domain.building.repository.BuildingItemRepository;
import com.ssafy.mandarin.domain.building.repository.UserBuildingRepository;
import com.ssafy.mandarin.domain.building.service.BuildingInventoryService;
import com.ssafy.mandarin.domain.building.service.BuildingPartsReader;
import com.ssafy.mandarin.domain.shop.dto.BuildingPurchaseResponse;
import com.ssafy.mandarin.domain.shop.dto.ShopBuildingDetailResponse;
import com.ssafy.mandarin.domain.shop.dto.ShopBuildingResponse;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 건물 상점.
 *
 * <p>마을({@code VillageService})이 "보유한 건물"만 다루는 것과 달리 상점은 카탈로그 전체를
 * 보여주고, 각 건물에 보유 여부를 붙인다. 구매는 포인트 차감과 보유 등록이 한 트랜잭션에서
 * 같이 성공하거나 같이 실패해야 한다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ShopService {

	private final BuildingItemRepository buildingItemRepository;
	private final UserBuildingRepository userBuildingRepository;
	private final UserRepository userRepository;
	private final BuildingInventoryService buildingInventoryService;
	private final BuildingPartsReader buildingPartsReader;

	/**
	 * 상점 목록 — 카탈로그 전체에 보유 여부를 표시한다.
	 *
	 * <p>기본 지급을 먼저 반영하는 이유: 이걸 빼면 신규 유저에게 기본 제공 건물이
	 * "미보유(=구매 가능)"로 보이고, 사려고 하면 이미 갖고 있다는 오류가 난다.
	 *
	 * <p>랜드마크({@code type=LANDMARK}, 마을 정중앙 3×3)는 진열하지 않는다 — 포인트로 사는
	 * 물건이 아니라 만다라트 완성 보상으로 해금한다. 목록에서만 빼고 {@link #purchase} 는
	 * 따로 막는다: 목록에 없다고 해서 itemId 를 직접 넣은 요청이 막히는 것은 아니다.
	 */
	@Transactional
	public List<ShopBuildingResponse> findAll(Long userId) {
		buildingInventoryService.grantDefaultBuildings(userId);

		Set<Long> ownedItemIds = userBuildingRepository.findOwnedItemIdsByUserId(userId);
		return buildingItemRepository.findAllByOrderBySortOrderAsc().stream()
				.filter(item -> item.getType() != BuildingType.LANDMARK)
				.map(item -> ShopBuildingResponse.of(item, ownedItemIds.contains(item.getId())))
				.toList();
	}

	/** 상세 조회 — 목록에서 뺀 모델링 데이터를 여기서 준다. */
	@Transactional(readOnly = true)
	public ShopBuildingDetailResponse findOne(Long userId, Long itemId) {
		BuildingItem item = findItem(itemId);
		boolean owned = userBuildingRepository.existsByUserIdAndBuildingItemId(userId, itemId);
		return ShopBuildingDetailResponse.of(item, owned, buildingPartsReader.read(item));
	}

	/**
	 * 건물을 구매한다.
	 *
	 * <p>순서가 중요하다. 유저 행을 먼저 잠그고 나서 보유 여부를 확인한다 — 잠금 전에 확인하면
	 * 같은 유저의 동시 요청 두 건이 모두 "미보유"를 읽고 통과해, 포인트가 두 번 빠진다
	 * (건물 자체는 {@code uk_user_building} 유니크 제약이 막지만 그때는 이미 차감된 뒤다).
	 *
	 * @throws BusinessException 건물이 없거나(404), 판매 대상이 아니거나(400), 이미 보유했거나(409),
	 *                           포인트가 부족할 때(400)
	 */
	@Transactional
	public BuildingPurchaseResponse purchase(Long userId, Long itemId) {
		BuildingItem item = findItem(itemId);

		/*
		 * 랜드마크는 완성 보상이라 값이 0 이다. 목록에서 뺀 것만으로는 못 막는다 — itemId 를
		 * 직접 넣은 요청이 그대로 통과해 0P 로 전 종을 긁어갈 수 있다.
		 */
		if (item.getType() == BuildingType.LANDMARK) {
			throw new BusinessException(ErrorCode.BUILDING_NOT_PURCHASABLE);
		}

		User user = userRepository.findByIdForUpdate(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

		if (userBuildingRepository.existsByUserIdAndBuildingItemId(userId, itemId)) {
			throw new BusinessException(ErrorCode.BUILDING_ALREADY_OWNED);
		}

		user.usePoint(item.getPrice());
		userBuildingRepository.save(UserBuilding.of(userId, item));

		log.info("User {} purchased building {} for {} points", userId, item.getItemKey(), item.getPrice());
		return BuildingPurchaseResponse.of(item, user.getPoint());
	}

	private BuildingItem findItem(Long itemId) {
		return buildingItemRepository.findById(itemId)
				.orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_FOUND));
	}
}
