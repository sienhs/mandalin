package com.ssafy.mandarin.domain.reward.entity;

import com.ssafy.mandarin.domain.building.entity.BuildingItem;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 수령 1건으로 지급된 건물 하나.
 *
 * <p>{@link RewardClaim} 과 1:N 인 이유는 마지막 구간(100%)이 <b>남은 랜드마크 전종</b>을
 * 주기 때문이다. 한 종만 준다고 가정하고 컬럼 하나로 두면 그 구간을 담을 수 없다.
 *
 * <p>이 표가 {@code user_building} 을 대체하지는 않는다 — 보유 판정은 여전히 그쪽이고, 여기는
 * "이 구간에서 무엇이 나왔는지" 를 화면에 다시 보여주기 위한 기록이다.
 */
@Entity
@Table(name = "reward_claim_item")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RewardClaimItem {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "building_item_id", nullable = false)
	private BuildingItem buildingItem;

	private RewardClaimItem(BuildingItem buildingItem) {
		this.buildingItem = buildingItem;
	}

	static RewardClaimItem of(BuildingItem buildingItem) {
		return new RewardClaimItem(buildingItem);
	}
}
