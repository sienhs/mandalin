package com.ssafy.mandarin.domain.building.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
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

	/** 단건 보유 판정. 상세 조회와 구매 중복 검사에 쓴다. */
	boolean existsByUserIdAndBuildingItemId(Long userId, Long buildingItemId);

	/**
	 * 보유 건물 한 건을 카탈로그와 함께.
	 *
	 * <p>배치 API 가 {@code inven_id}(user_building.id)를 받는데, 그 건물이 <b>요청자의 것인지</b>와
	 * <b>랜드마크인지</b>를 같이 봐야 한다. userId 를 조건에 넣어야 남의 인벤토리 아이디를
	 * 적어 넣는 것을 막을 수 있다.
	 */
	@Query("select ub from UserBuilding ub join fetch ub.buildingItem "
			+ "where ub.id = :id and ub.userId = :userId")
	Optional<UserBuilding> findOwnedWithItem(@Param("id") Long id, @Param("userId") Long userId);

	/** 배치 응답에서 inven_id → 건물 정보를 한 번에 풀어주기 위한 조회. */
	@Query("select ub from UserBuilding ub join fetch ub.buildingItem where ub.id in :ids")
	List<UserBuilding> findAllWithItemByIds(@Param("ids") Collection<Long> ids);
}
