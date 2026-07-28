package com.ssafy.mandarin.domain.building.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.mandarin.domain.building.entity.BuildingItem;

public interface BuildingItemRepository extends JpaRepository<BuildingItem, Long> {

	Optional<BuildingItem> findByItemKey(String itemKey);

	List<BuildingItem> findAllByDefaultGrantedTrue();
}
