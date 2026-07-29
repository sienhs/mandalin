package com.ssafy.mandarin.domain.building.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.mandarin.domain.building.entity.BuildingItem;

public interface BuildingItemRepository extends JpaRepository<BuildingItem, Long> {

	Optional<BuildingItem> findByItemKey(String itemKey);

	List<BuildingItem> findAllByDefaultGrantedTrue();

	/** 상점 진열 순서. 프론트가 정렬을 다시 하지 않도록 시드에서 정한 sort_order 로 내려준다. */
	List<BuildingItem> findAllByOrderBySortOrderAsc();
}
