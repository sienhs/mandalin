package com.ssafy.mandarin.domain.reward.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.mandarin.domain.reward.entity.RewardClaim;

public interface RewardClaimRepository extends JpaRepository<RewardClaim, Long> {

	/**
	 * 이 계정이 지금까지 받은 것 전부.
	 *
	 * <p>지급된 건물까지 같이 끌어온다 — 트랙 화면이 구간마다 "무엇을 받았는지" 를 보여주므로,
	 * 없으면 구간 수만큼 추가 쿼리가 나간다(N+1).
	 */
	@EntityGraph(attributePaths = {"items", "items.buildingItem"})
	List<RewardClaim> findByUserId(Long userId);

	Optional<RewardClaim> findByUserIdAndMilestone(Long userId, Short milestone);

	boolean existsByUserIdAndMilestone(Long userId, Short milestone);
}
