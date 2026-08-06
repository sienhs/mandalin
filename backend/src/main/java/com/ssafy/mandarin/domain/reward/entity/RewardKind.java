package com.ssafy.mandarin.domain.reward.entity;

/**
 * 마일스톤 보상 종류.
 *
 * <p>구간별로 무엇을 주는지는 {@link RewardTrack} 의 표가 정한다 — 이 enum 은 "무엇을 받았나"를
 * 기록하는 값일 뿐이다.
 */
public enum RewardKind {

	/** 포인트. 금액은 {@link RewardTrack#CREDIT_AMOUNT}. */
	CREDIT,

	/** 랜드마크 건물. 미보유 중에서 무작위로 뽑는다. 100% 구간은 남은 전종을 준다. */
	LANDMARK
}
