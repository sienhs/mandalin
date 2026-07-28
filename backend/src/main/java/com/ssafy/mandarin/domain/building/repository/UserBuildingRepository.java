package com.ssafy.mandarin.domain.building.repository;

import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ssafy.mandarin.domain.building.entity.UserBuilding;

public interface UserBuildingRepository extends JpaRepository<UserBuilding, Long> {

	/** 마을 렌더에 필요한 parts 까지 한 번에 — N+1 방지. */
	@Query("select ub from UserBuilding ub join fetch ub.buildingItem bi "
			+ "where ub.userId = :userId order by bi.sortOrder asc")
	List<UserBuilding> findAllWithItemByUserId(@Param("userId") Long userId);

	@Query("select ub.buildingItem.id from UserBuilding ub where ub.userId = :userId")
	Set<Long> findOwnedItemIdsByUserId(@Param("userId") Long userId);
}
