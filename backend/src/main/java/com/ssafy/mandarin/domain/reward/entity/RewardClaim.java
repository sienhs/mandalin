package com.ssafy.mandarin.domain.reward.entity;

import java.util.ArrayList;
import java.util.List;

import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.global.entity.BaseEntity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 마일스톤 보상 수령 기록 1건.
 *
 * <p><b>시트를 갖지 않는다.</b> 보상은 계정당 구간별 1회이므로 어느 시트로 도달했는지는 성립
 * 조건이 아니다. `sheet_id` 를 키에 넣으면 시트를 새로 만들 때마다 다시 받게 된다.
 *
 * <p>이 행의 존재가 곧 "받았다" 다 — 별도 플래그를 두지 않는다. UNIQUE(user_id, milestone) 이
 * 중복 지급을 DB 에서 막는다.
 */
@Entity
@Table(
		name = "reward_claim",
		uniqueConstraints = @UniqueConstraint(name = "uk_reward_claim", columnNames = {"user_id", "milestone"})
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RewardClaim extends BaseEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "user_id", nullable = false)
	private Long userId;

	/** 구간 번호 1~8. */
	@Column(nullable = false)
	private Short milestone;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private RewardKind kind;

	/** CREDIT 일 때 지급한 포인트. LANDMARK 면 null. */
	@Column(name = "granted_point")
	private Integer grantedPoint;

	/**
	 * 지급한 랜드마크. 보통 1종이지만 마지막 구간은 남은 전종이라 여러 개다.
	 *
	 * <p>`CascadeType.ALL` 로 두어 수령 1건을 저장하면 지급 목록도 같이 들어간다 — 이 목록은
	 * 이 기록에만 딸린 것이라 따로 살아 있을 이유가 없다.
	 */
	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "reward_claim_id", nullable = false)
	private List<RewardClaimItem> items = new ArrayList<>();

	private RewardClaim(Long userId, int milestone, RewardKind kind, Integer grantedPoint) {
		this.userId = userId;
		this.milestone = (short) milestone;
		this.kind = kind;
		this.grantedPoint = grantedPoint;
	}

	public static RewardClaim credit(Long userId, int milestone, int point) {
		return new RewardClaim(userId, milestone, RewardKind.CREDIT, point);
	}

	public static RewardClaim landmark(Long userId, int milestone, List<BuildingItem> granted) {
		RewardClaim claim = new RewardClaim(userId, milestone, RewardKind.LANDMARK, null);
		for (BuildingItem item : granted) {
			claim.items.add(RewardClaimItem.of(item));
		}
		return claim;
	}

	/**
	 * 랜드마크를 뽑을 수 없어 크레딧으로 대신 준 경우.
	 *
	 * <p>시연 API 로 13종을 이미 다 받은 계정에서 일어난다. 이럴 때 아무것도 주지 않으면
	 * 수령 버튼이 먹지 않는 것처럼 보이므로 크레딧으로 대체하고, 종류를 CREDIT 으로 남겨
	 * 나중에 기록만 봐도 무슨 일이 있었는지 알 수 있게 한다.
	 */
	public static RewardClaim landmarkFallbackToCredit(Long userId, int milestone, int point) {
		return new RewardClaim(userId, milestone, RewardKind.CREDIT, point);
	}
}
