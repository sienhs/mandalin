package com.ssafy.mandarin.domain.reward.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.entity.BuildingType;
import com.ssafy.mandarin.domain.building.entity.UserBuilding;
import com.ssafy.mandarin.domain.building.repository.BuildingItemRepository;
import com.ssafy.mandarin.domain.building.repository.UserBuildingRepository;
import com.ssafy.mandarin.domain.reward.dto.RewardClaimResponse;
import com.ssafy.mandarin.domain.reward.dto.RewardTrackResponse;
import com.ssafy.mandarin.domain.reward.entity.RewardClaim;
import com.ssafy.mandarin.domain.reward.entity.RewardClaimItem;
import com.ssafy.mandarin.domain.reward.entity.RewardKind;
import com.ssafy.mandarin.domain.reward.entity.RewardTrack;
import com.ssafy.mandarin.domain.reward.repository.RewardClaimRepository;
import com.ssafy.mandarin.domain.sheet.dto.SheetProgressDto;
import com.ssafy.mandarin.domain.sheet.entity.Sheet;
import com.ssafy.mandarin.domain.sheet.repository.SheetRepository;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 만다라트 진행률 마일스톤 보상.
 *
 * <p>보상 규칙은 {@link RewardTrack} 이 갖고, 이 서비스는 <b>누가 어디까지 왔고 무엇을 받을 수
 * 있는지</b>만 판단한다.
 *
 * <h3>계정당 1회를 어떻게 지키는가</h3>
 * <p>수령 기록({@code reward_claim})이 <b>시트를 갖지 않는다</b>. 그래서 시트를 새로 만들어도
 * 이미 받은 구간은 다시 열리지 않는다. 그런데 진행률은 시트별 값이라 "어느 시트로 판정하는가"를
 * 정해야 하고, <b>가장 먼저 만든 시트</b>로 고정한다.
 *
 * <p>가장 높은 시트(max)로 하지 않은 이유: 시트를 여러 개 만들어 각각 조금씩 밀면 가장 쉬운
 * 구간만 골라 넘길 수 있다. 첫 시트로 묶으면 하나를 끝까지 밀어야 한다. 첫 시트를 지웠으면
 * 남은 것 중 가장 오래된 것으로 넘어간다 — 이미 받은 것은 계정에 남으니 잃지 않는다.
 *
 * <h3>어느 수로 판정하는가</h3>
 * <p><b>{@code progress}</b> — 과제 64개의 개별 진행률 평균이다. 화면의 진행률 링과 랜드마크
 * 성장 단계가 보는 것과 같은 수다. 자세한 사정은 {@link #rewardRateOf} 주석에 있다.
 *
 * <h3>진행률은 되돌아가지 않는다</h3>
 * <p>과제 수행에는 취소가 없어 {@code tryCount} 가 줄지 않는다. 그래서 "도달했다가 내려가
 * 수령을 놓치는" 상황은 없고, 도달 판정을 그 순간의 값으로 해도 안전하다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RewardTrackService {

	private final RewardClaimRepository rewardClaimRepository;
	private final SheetRepository sheetRepository;
	private final BuildingItemRepository buildingItemRepository;
	private final UserBuildingRepository userBuildingRepository;
	private final UserRepository userRepository;

	/**
	 * 랜덤 추첨용.
	 *
	 * <p>보안 목적이 아니라 "어느 랜드마크가 나올지 모른다" 는 재미를 위한 것이라 {@link Random}
	 * 으로 충분하다. 시드를 고정하지 않는다 — 고정하면 모든 계정이 같은 순서로 받는다.
	 */
	private final Random random = new Random();

	/** 보상 트랙 현황. 구간 8개의 보상 종류·도달 여부·수령 여부를 함께 돌려준다. */
	public RewardTrackResponse getTrack(Long userId) {
		Optional<Sheet> bound = findBoundSheet(userId);
		double rate = bound.map(sheet -> rewardRateOf(userId, sheet.getId())).orElse(0.0);

		Map<Short, RewardClaim> claims = claimsByMilestone(userId);

		List<RewardTrackResponse.MilestoneResponse> milestones = new ArrayList<>();
		for (int m = 1; m <= RewardTrack.MILESTONE_COUNT; m++) {
			RewardClaim claim = claims.get((short) m);
			milestones.add(RewardTrackResponse.MilestoneResponse.builder()
					.milestone(m)
					.percent(RewardTrack.percentOf(m))
					.kind(RewardTrack.kindOf(m))
					.creditAmount(RewardTrack.kindOf(m) == RewardKind.CREDIT ? RewardTrack.CREDIT_AMOUNT : null)
					.reached(rate >= RewardTrack.percentOf(m))
					.claimed(claim != null)
					.grantedPoint(claim != null ? claim.getGrantedPoint() : null)
					.grantedNames(claim == null ? List.of() : grantedNames(claim))
					.build());
		}

		return RewardTrackResponse.builder()
				// 선물상자를 어느 시트에 그릴지 프론트가 알아야 한다. 없으면(시트 0개) null.
				.sheetId(bound.map(Sheet::getId).orElse(null))
				.achievementRate(Math.round(rate * 10.0) / 10.0)
				.milestones(milestones)
				.build();
	}

	/**
	 * 구간 하나를 수령한다.
	 *
	 * <p>진행률 검증을 <b>서버가</b> 한다 — 클라이언트가 "도달했다" 고 주장하는 것을 믿으면
	 * 아무 구간이나 받을 수 있다.
	 */
	@Transactional
	public RewardClaimResponse claim(Long userId, int milestone) {
		if (!RewardTrack.isValid(milestone)) {
			throw new BusinessException(ErrorCode.INVALID_INPUT);
		}
		if (rewardClaimRepository.existsByUserIdAndMilestone(userId, (short) milestone)) {
			throw new BusinessException(ErrorCode.REWARD_ALREADY_CLAIMED);
		}

		Sheet bound = findBoundSheet(userId).orElseThrow(() -> new BusinessException(ErrorCode.SHEET_NOT_FOUND));
		double rate = rewardRateOf(userId, bound.getId());
		if (rate < RewardTrack.percentOf(milestone)) {
			throw new BusinessException(ErrorCode.REWARD_NOT_REACHED);
		}

		return RewardTrack.kindOf(milestone) == RewardKind.CREDIT
				? grantCredit(userId, milestone)
				: grantLandmark(userId, milestone);
	}

	/* ── 지급 ─────────────────────────────────────────────────────────────── */

	private RewardClaimResponse grantCredit(Long userId, int milestone) {
		int point = RewardTrack.CREDIT_AMOUNT;
		User user = addPointBypassingDailyCap(userId, point);
		rewardClaimRepository.save(RewardClaim.credit(userId, milestone, point));

		return RewardClaimResponse.builder()
				.milestone(milestone)
				.kind(RewardKind.CREDIT)
				.grantedPoint(point)
				.landmarks(List.of())
				.currentPoint(user.getPoint())
				.build();
	}

	/**
	 * 랜드마크 지급.
	 *
	 * <p>마지막 구간은 <b>남은 전종</b>, 그 외에는 미보유 중 무작위 1종이다. 이미 보유한 것을
	 * 다시 주지 않으므로 "중복이 나와서 손해" 가 없다.
	 *
	 * <p>뽑을 것이 없으면(시연 API 로 13종을 이미 다 받은 계정) 크레딧으로 대신 준다.
	 * 아무것도 주지 않으면 수령 버튼이 고장난 것처럼 보인다.
	 */
	private RewardClaimResponse grantLandmark(Long userId, int milestone) {
		List<BuildingItem> candidates = unownedLandmarks(userId);

		if (candidates.isEmpty()) {
			int point = RewardTrack.CREDIT_AMOUNT;
			User user = addPointBypassingDailyCap(userId, point);
			rewardClaimRepository.save(RewardClaim.landmarkFallbackToCredit(userId, milestone, point));
			log.info("Landmark reward fell back to credit (user {} already owns every landmark)", userId);

			return RewardClaimResponse.builder()
					.milestone(milestone)
					.kind(RewardKind.CREDIT)
					.grantedPoint(point)
					.landmarks(List.of())
					.currentPoint(user.getPoint())
					.fallbackFromLandmark(true)
					.build();
		}

		List<BuildingItem> granted = RewardTrack.isFinal(milestone)
				? candidates
				: List.of(candidates.get(random.nextInt(candidates.size())));

		List<UserBuilding> owned = granted.stream()
				.map(item -> UserBuilding.of(userId, item))
				.toList();
		userBuildingRepository.saveAll(owned);
		rewardClaimRepository.save(RewardClaim.landmark(userId, milestone, granted));

		return RewardClaimResponse.builder()
				.milestone(milestone)
				.kind(RewardKind.LANDMARK)
				.landmarks(granted.stream().map(RewardClaimResponse.LandmarkResponse::from).toList())
				.currentPoint(userRepository.findById(userId).map(User::getPoint).orElse(0))
				.build();
	}

	/**
	 * 포인트를 <b>일일 상한을 거치지 않고</b> 더한다.
	 *
	 * <p>{@code SubjectService} 의 지급 경로는 {@code DAILY_POINT_LIMIT}(1000) 안에서만 준다.
	 * 마일스톤 크레딧도 1000 이라 그 경로를 타면 그날 과제를 하나라도 한 유저는 0원을 받는다 —
	 * 구간 도달은 과제 수행으로 일어나므로 사실상 항상 그렇다. 상한은 "같은 과제를 반복해
	 * 파밍하는 것" 을 막는 장치이고 일회성 보상은 그 대상이 아니다.
	 */
	private User addPointBypassingDailyCap(Long userId, int point) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
		user.addPoint(point);
		return user;
	}

	/* ── 조회 보조 ────────────────────────────────────────────────────────── */

	/**
	 * 보상 판정에 쓰는 시트 — 가장 먼저 만든 것.
	 *
	 * <p>`findByUserIdOrderByCreatedAtDesc` 를 그대로 쓰고 마지막을 집는다. 오름차순 메서드를
	 * 새로 만들지 않는 이유는 시트가 계정당 몇 개뿐이라 정렬 방향이 성능에 영향이 없고,
	 * 리포지토리에 거의 같은 메서드를 둘 두면 어느 쪽을 써야 하는지 헷갈리기 때문이다.
	 */
	private Optional<Sheet> findBoundSheet(Long userId) {
		return sheetRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
				.min(Comparator.comparing(Sheet::getCreatedAt));
	}

	/**
	 * 보상 판정에 쓰는 진행률 — <b>{@code progress}(과제별 진행률의 평균)</b>다.
	 *
	 * <p>예전에는 {@code achievementRate}(완전히 끝낸 과제 ÷ 64)를 썼다. 그런데 화면이 크게
	 * 보여주는 수는 {@code progress} 라서(`SheetDetail.tsx` 의 진행률 링, `IsoVillage` 의 랜드마크
	 * 성장 단계) 사용자는 둘이 같은 값이라고 읽는다. 반쯤 한 과제가 많으면 두 수가 두 배 가까이
	 * 벌어져(예: 링 47.5% 대 판정 23.4%) "48% 인데 12.5% 구간만 열린다" 가 된다.
	 *
	 * <p>랜드마크 단계는 {@code landmarkStageFromPercent(progress)} 로 이미 {@code progress} 를
	 * 보고 있었다. 보상만 다른 수를 보고 있었던 것이라, 여기를 맞추면 {@link RewardTrack} 이
	 * 말하는 "구간 하나를 넘길 때마다 랜드마크가 한 단계 자라고 보상이 하나 열린다" 가 비로소
	 * 성립한다.
	 *
	 * <p>되돌아가지 않는 성질은 그대로다 — 과제 수행에 취소가 없어 {@code tryCount} 가 줄지 않고,
	 * 평균도 따라서 줄지 않는다.
	 */
	private double rewardRateOf(Long userId, Long sheetId) {
		Map<Long, SheetProgressDto> progresses = sheetRepository.findSheetProgressesByUserId(userId);
		SheetProgressDto dto = progresses.get(sheetId);
		if (dto == null || dto.progress() == null) {
			return 0.0;
		}
		return dto.progress();
	}

	private Map<Short, RewardClaim> claimsByMilestone(Long userId) {
		Map<Short, RewardClaim> byMilestone = new java.util.HashMap<>();
		for (RewardClaim claim : rewardClaimRepository.findByUserId(userId)) {
			byMilestone.put(claim.getMilestone(), claim);
		}
		return byMilestone;
	}

	private List<String> grantedNames(RewardClaim claim) {
		return claim.getItems().stream()
				.map(RewardClaimItem::getBuildingItem)
				.map(BuildingItem::getName)
				.toList();
	}

	/** 아직 안 가진 랜드마크. sortOrder 순 — 마지막 구간에서 여러 개를 줄 때 순서가 일정하다. */
	private List<BuildingItem> unownedLandmarks(Long userId) {
		Set<Long> owned = userBuildingRepository.findOwnedItemIdsByUserId(userId);
		return buildingItemRepository.findAllByTypeOrderBySortOrderAsc(BuildingType.LANDMARK).stream()
				.filter(item -> !owned.contains(item.getId()))
				.toList();
	}
}
