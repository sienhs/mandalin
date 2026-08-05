package com.ssafy.mandarin.domain.testaccount.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.IntStream;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.entity.BuildingType;
import com.ssafy.mandarin.domain.building.entity.UserBuilding;
import com.ssafy.mandarin.domain.building.repository.BuildingItemRepository;
import com.ssafy.mandarin.domain.building.repository.UserBuildingRepository;
import com.ssafy.mandarin.domain.friend.entity.Friends;
import com.ssafy.mandarin.domain.friend.repository.FriendsRepository;
import com.ssafy.mandarin.domain.sheet.dto.SheetCreateRequest;
import com.ssafy.mandarin.domain.sheet.service.SheetService;
import com.ssafy.mandarin.domain.subject.entity.Subject;
import com.ssafy.mandarin.domain.subject.repository.SubjectRepository;
import com.ssafy.mandarin.domain.testaccount.dto.TestAccountResponse;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.domain.village.entity.Terrain;
import com.ssafy.mandarin.domain.village.service.MandalartGrid;
import com.ssafy.mandarin.domain.village.service.VillageService;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 테스트 계정.
 *
 * <p>카카오 로그인 없이 들어가 서비스를 직접 평가하기 위한 계정이다. 로그인 자체는
 * {@code TestAccountController} 가 <b>카카오와 같은 경로</b>({@code AuthService.loginWithOAuth})로
 * 처리한다 — 토큰 발급·리프레시 쿠키·세션 회전이 실제 사용자와 한 글자도 다르지 않아야, 이
 * 계정으로 본 것이 실제 사용자가 볼 것과 같다고 말할 수 있다.
 *
 * <p><b>계정 세 개를 한꺼번에 만든다.</b> 요청받은 슬롯만 만들면 친구 관계를 맺을 상대가 아직
 * 없어서, 첫 번째로 로그인한 계정만 친구 목록이 비어 보인다. "셋이 모두 같은 상태" 가 깨지는
 * 것이라 첫 호출에서 셋을 다 세운 뒤 관계를 잇는다.
 *
 * <p><b>다시 로그인해도 다시 심지 않는다.</b> 계정 행이 이미 있으면 로그인만 한다 — 테스터가
 * 과제를 완료하고 건물을 사 둔 상태를 되돌리면 그게 더 놀랍다. 초기 상태로 되돌리는 통로는
 * 두지 않았다(DB 에서 uuid {@code tester-N} 세 행을 지우면 다음 로그인에 다시 심긴다).
 *
 * <p>{@code app.test-login.enabled} 로 켜고 끈다. <b>정식 서비스 전에 반드시 끈다</b> —
 * 주소만 알면 누구나 남의 테스트 계정으로 들어올 수 있는 통로다.
 */
@Slf4j
@Service
@ConditionalOnProperty(name = "app.test-login.enabled", havingValue = "true")
@RequiredArgsConstructor
public class TestAccountService {

	/** 테스터1 ~ 테스터3. */
	public static final int ACCOUNT_COUNT = 3;

	/**
	 * 시작 포인트.
	 *
	 * <p>일반 건물이 300P 다. 15채를 살 수 있는 양이라 "포인트로 건물을 산다" 는 흐름을 여러 번
	 * 밟아 볼 수 있고, 남은 130여 채를 다 살 수는 없어서 <b>구매할 것이 남아 있는</b> 상태가
	 * 유지된다. 가입 축하 포인트(10,000P)보다 적게 잡은 이유가 그것이다.
	 */
	private static final int SEED_POINT = 4_500;

	/**
	 * 테마별로 해금해 둘 건물 수.
	 *
	 * <p>테마 13종 × 9채 = 117채를 미리 준다. 마을을 꾸미려면 손에 여러 테마가 있어야 하고(한
	 * 테마만 주면 마을이 한 가지 색으로만 채워진다), 그렇다고 다 주면 상점과 포인트가 할 일이
	 * 없어진다. 테마마다 11채 남짓이 상점에 남는다.
	 *
	 * <p>기본 지급 건물(BASIC 15채)은 이 수와 무관하게 모든 계정에 들어온다 —
	 * {@code BuildingInventoryService.grantDefaultBuildings} 가 조회 시점에 채운다.
	 */
	private static final int UNLOCKED_PER_THEME = 9;

	/**
	 * 심은 과제를 며칠 전에 손댄 것으로 둘지.
	 *
	 * <p>주간 과제의 기준이 이번 주 월~일이라, 이번 주 밖으로 나가려면 최대 7일이 필요하다.
	 * 10일이면 어느 요일에 심어도 지난주로 물린다({@link #clearTodayCheck}).
	 */
	private static final int SEED_IDLE_DAYS = 10;

	private final EntityManager entityManager;
	private final UserRepository userRepository;
	private final BuildingItemRepository buildingItemRepository;
	private final UserBuildingRepository userBuildingRepository;
	private final FriendsRepository friendsRepository;
	private final SubjectRepository subjectRepository;
	private final SheetService sheetService;
	private final VillageService villageService;

	/** 로그인 화면이 보여줄 목록. 계정을 만들지는 않는다 — 실제 로그인 시점에 만든다. */
	public List<TestAccountResponse> accounts() {
		return IntStream.rangeClosed(1, ACCOUNT_COUNT)
				.mapToObj(slot -> new TestAccountResponse(slot, nameOf(slot), uuidOf(slot)))
				.toList();
	}

	/**
	 * 슬롯의 계정을 준비하고 그 userId 를 돌려준다.
	 *
	 * @throws BusinessException 슬롯 번호가 범위를 벗어날 때
	 */
	@Transactional
	public Long prepareAndGetUserId(int slot) {
		if (slot < 1 || slot > ACCOUNT_COUNT) {
			throw new BusinessException(ErrorCode.INVALID_INPUT);
		}

		List<User> testers = IntStream.rangeClosed(1, ACCOUNT_COUNT)
				.mapToObj(this::findOrSeed)
				.toList();

		linkAsFriends(testers);
		return testers.get(slot - 1).getId();
	}

	/* ─────────────────────────  계정 하나  ───────────────────────── */

	private User findOrSeed(int slot) {
		return userRepository.findByUuid(uuidOf(slot))
				.orElseGet(() -> seed(slot));
	}

	private User seed(int slot) {
		User user = userRepository.save(User.builder()
				.uuid(uuidOf(slot))
				.name(nameOf(slot))
				.point(SEED_POINT)
				.build());

		List<UserBuilding> unlocked = unlockBuildings(user.getId());
		seedSheets(user.getId(), unlocked);

		log.info("[test-account] 테스트 계정 생성: slot={}, userId={}, 건물 {}채",
				slot, user.getId(), unlocked.size());
		return user;
	}

	/**
	 * 테마마다 앞선 {@value #UNLOCKED_PER_THEME} 채를 지급한다.
	 *
	 * <p>"앞선" 은 상점 진열 순서({@code sortOrder})다. 무작위로 고르면 계정마다 손에 든 건물이
	 * 달라져 "셋이 모두 같은 상태" 가 깨지고, 화면을 비교하다 원인을 건물 차이에서 찾게 된다.
	 *
	 * <p>랜드마크도 한 테마로 취급해 9종을 준다. 상점에서 살 수 없는 물건이라(만다라트 완성
	 * 보상) 주지 않으면 마을 정중앙을 바꿔 볼 방법이 아예 없다. 남은 4종은 잠긴 채로 둔다.
	 */
	private List<UserBuilding> unlockBuildings(Long userId) {
		Map<String, List<BuildingItem>> byTheme = new LinkedHashMap<>();
		for (BuildingItem item : buildingItemRepository.findAllByOrderBySortOrderAsc()) {
			byTheme.computeIfAbsent(item.getTheme(), key -> new ArrayList<>()).add(item);
		}

		Set<Long> alreadyOwned = userBuildingRepository.findOwnedItemIdsByUserId(userId);
		List<UserBuilding> granted = byTheme.values().stream()
				.flatMap(items -> items.stream().limit(UNLOCKED_PER_THEME))
				.filter(item -> !alreadyOwned.contains(item.getId()))
				.map(item -> UserBuilding.of(userId, item))
				.toList();

		return userBuildingRepository.saveAll(granted);
	}

	/* ─────────────────────────  만다라트  ───────────────────────── */

	private void seedSheets(Long userId, List<UserBuilding> unlocked) {
		for (TestSheetBlueprint.SheetSpec spec : TestSheetBlueprint.all()) {
			Long sheetId = sheetService.createSheet(userId, toCreateRequest(spec, unlocked));
			villageService.changeTerrain(userId, sheetId, spec.terrain());
			applyProgress(sheetId, spec);
		}
	}

	private SheetCreateRequest toCreateRequest(
			TestSheetBlueprint.SheetSpec spec, List<UserBuilding> unlocked) {
		List<SheetCreateRequest.DomainCreateRequest> domains = new ArrayList<>();

		for (int index = 0; index < spec.domains().size(); index++) {
			TestSheetBlueprint.DomainSpec domainSpec = spec.domains().get(index);
			List<SheetCreateRequest.SubjectCreateRequest> subjects = new ArrayList<>();

			for (int slot = 0; slot < domainSpec.tasks().size(); slot++) {
				TestSheetBlueprint.Task task = domainSpec.tasks().get(slot);
				subjects.add(SheetCreateRequest.SubjectCreateRequest.builder()
						.position(slot)
						.title(task.title())
						.period(task.period())
						.countPerPeriod(task.countPerPeriod())
						// 목표 횟수는 비워 둔다 — 주기와 기간으로 SheetService 가 계산한다.
						.point(100L)
						.build());
			}

			domains.add(SheetCreateRequest.DomainCreateRequest.builder()
					.position(index)
					.title(domainSpec.title())
					.subjects(subjects)
					.build());
		}

		return SheetCreateRequest.builder()
				.title(spec.title())
				.isOpen(spec.open())
				.expiredAt(LocalDateTime.now().plusDays(spec.expiresInDays()))
				.domains(domains)
				.itemSpots(placements(spec, unlocked))
				.build();
	}

	/**
	 * 미리 세워 둘 건물.
	 *
	 * <p><b>일부만 세운다.</b> 전 칸을 채우면 "마을을 꾸민다" 를 해 볼 자리가 없고, 하나도 안
	 * 세우면 기본 스킨만 늘어선 마을이 되어 배치 기능이 있는지조차 모른다. 정중앙 랜드마크와
	 * 진행률이 높은 두 구역만 채우고 나머지 60여 칸은 비워 둔다.
	 *
	 * <p>진행률 0인 시트에는 아무것도 세우지 않는다 — 갓 만든 마을의 첫인상을 그대로 봐야 한다.
	 */
	private List<SheetCreateRequest.ItemSpotCreateRequest> placements(
			TestSheetBlueprint.SheetSpec spec, List<UserBuilding> unlocked) {
		boolean untouched = spec.domains().stream()
				.flatMap(domain -> domain.progress().stream())
				.allMatch(progress -> progress == 0);
		if (untouched) {
			return List.of();
		}

		List<SheetCreateRequest.ItemSpotCreateRequest> spots = new ArrayList<>();

		// 정중앙(랜드마크 구역)에는 랜드마크만 설 수 있다.
		ownedOf(unlocked, BuildingType.LANDMARK, 0).ifPresent(landmark ->
				spots.add(SheetCreateRequest.ItemSpotCreateRequest.builder()
						.domainPosition(MandalartGrid.CENTER)
						.itemPosition(MandalartGrid.CENTER)
						.invenId(landmark)
						.build()));

		/*
		 * 진행률이 높은 두 구역(만다라트 번호 0·1)의 과제 칸에 서로 다른 테마를 섞어 세운다.
		 * 한 테마로만 채우면 테마 렌더링 차이를 눈으로 비교할 수 없다.
		 */
		int picked = 0;
		for (int domainIndex = 0; domainIndex <= 1; domainIndex++) {
			Integer gridDomain = MandalartGrid.toGrid(domainIndex);
			for (int taskIndex = 0; taskIndex < 3; taskIndex++) {
				Integer gridItem = MandalartGrid.toGrid(taskIndex);
				int offset = picked++;
				ownedOf(unlocked, BuildingType.NORMAL, offset * UNLOCKED_PER_THEME).ifPresent(building ->
						spots.add(SheetCreateRequest.ItemSpotCreateRequest.builder()
								.domainPosition(gridDomain)
								.itemPosition(gridItem)
								.invenId(building)
								.build()));
			}
		}

		return spots;
	}

	/**
	 * 지급한 인벤토리에서 종류가 맞는 것을 하나 고른다.
	 *
	 * <p>{@code skip} 은 테마를 흩기 위한 것이다 — 지급 목록이 진열 순서라서 테마별로 뭉쳐 있고,
	 * 테마 크기만큼 건너뛰면 매번 다른 테마가 잡힌다.
	 */
	private Optional<Long> ownedOf(List<UserBuilding> unlocked, BuildingType type, int skip) {
		List<UserBuilding> candidates = unlocked.stream()
				.filter(owned -> owned.getBuildingItem().getType() == type)
				.sorted(Comparator.comparingInt((UserBuilding owned) -> owned.getBuildingItem().getSortOrder()))
				.toList();

		if (candidates.isEmpty()) {
			return Optional.empty();
		}
		return Optional.of(candidates.get(skip % candidates.size()).getId());
	}

	/**
	 * 진행률을 심는다.
	 *
	 * <p>DB 에는 진행률 컬럼이 없다 — 조회할 때 {@code tryCount / targetCount} 로 계산한다.
	 * 그래서 청사진의 비율을 횟수로 역산해 넣는다({@code DemoProgressService} 와 같은 방식이다).
	 *
	 * <p><b>수행 기록(subject_log)은 만들지 않는다.</b> 기록이 없으면 포인트 이력과 주간 리포트가
	 * 비어 있지만, 만들면 "이번 주에 이만큼 했다" 가 심은 날짜에 매달린다 — 다음 주에 로그인한
	 * 사람에게는 지난주 기록으로 보인다. 눌러서 직접 쌓는 편이 확인에도 낫다.
	 */
	private void applyProgress(Long sheetId, TestSheetBlueprint.SheetSpec spec) {
		for (Subject subject : subjectRepository.findByDomainSheetId(sheetId)) {
			TestSheetBlueprint.DomainSpec domain = spec.domains().get(subject.getDomain().getPosition());
			int progress = domain.progress().get(subject.getPosition());
			if (progress == 0) {
				continue;
			}

			Integer target = subject.getTargetCount();
			if (target == null || target <= 0) {
				subject.updateTryCount(progress >= 100 ? 1 : 0);
			} else {
				subject.updateTryCount((int) Math.round(progress / 100.0 * target));
			}
			subject.updateIsDone(progress >= 100);
		}

		clearTodayCheck(sheetId);
	}

	/**
	 * 심은 과제를 "오늘·이번 주에는 아직 안 한" 상태로 되돌린다.
	 *
	 * <p><b>이걸 빼면 오늘의 할 일 전부가 완료로 잠긴다.</b> 서버는 이번 주기에 체크했는지를
	 * {@code subject.updated_at} 으로 판단한다({@code SubjectService.getTodoList}). 진행률을 심는
	 * 것은 곧 그 행을 고치는 것이라, JPA 감사(@LastModifiedDate)가 값을 <i>지금</i>으로 바꿔 놓는다
	 * — 방금 만든 계정인데 예순네 칸이 모두 "오늘 이미 완료" 로 보인다.
	 *
	 * <p>그래서 지난주로 물린다. 하루 전으로는 부족하다 — 주간 과제의 기준이 이번 주 월~일이라
	 * 어제도 이번 주에 들어간다({@code Subject.prePersist} 의 하루 전 처리가 주간 과제에는
	 * 통하지 않는 이유이기도 하다).
	 *
	 * <p>감사 리스너를 피하려고 네이티브 UPDATE 를 쓴다. 엔티티로 값을 넣으면 flush 직전에
	 * 리스너가 다시 <i>지금</i>으로 덮는다. 먼저 flush 로 진행률을 내보낸 뒤 이 UPDATE 를
	 * 실행해야 순서가 맞는다.
	 */
	private void clearTodayCheck(Long sheetId) {
		entityManager.flush();
		entityManager.createNativeQuery("""
						update subject set updated_at = :checkedAt
						where domain_id in (select id from domain where sheet_id = :sheetId)
						""")
				.setParameter("checkedAt", LocalDateTime.now().minusDays(SEED_IDLE_DAYS))
				.setParameter("sheetId", sheetId)
				.executeUpdate();
	}

	/* ─────────────────────────  친구  ───────────────────────── */

	/**
	 * 테스터끼리 친구로 잇는다.
	 *
	 * <p>친구가 없으면 친구 목록 · 친구 시트 열람 · 좋아요 · 리더보드가 모두 빈 화면이라 확인할
	 * 것이 없다. 세 계정을 서로 잇는 것은 대칭이라 "셋이 모두 같은 상태" 를 깨지 않는다.
	 *
	 * <p>친구 <i>요청</i>은 심지 않는다. 한쪽에만 대기 중인 요청이 생겨 상태가 갈리기 때문이다.
	 * 요청 수락·거절을 보려면 다른 테스터의 코드({@code tester-2} 등)로 직접 보내면 된다.
	 */
	private void linkAsFriends(List<User> testers) {
		for (int left = 0; left < testers.size(); left++) {
			for (int right = left + 1; right < testers.size(); right++) {
				User one = testers.get(left);
				User other = testers.get(right);
				if (friendsRepository.existsFriendship(one, other)) {
					continue;
				}

				// user_id1 < user_id2 정렬은 UNIQUE 제약이 요구한다(FriendService 와 같은 규칙).
				User first = one.getId() < other.getId() ? one : other;
				User second = one.getId() < other.getId() ? other : one;
				friendsRepository.save(Friends.builder().user1(first).user2(second).build());
			}
		}
	}

	/* ─────────────────────────  식별자  ───────────────────────── */

	/**
	 * 계정을 다시 찾을 열쇠.
	 *
	 * <p>실제 사용자의 uuid 는 {@code UUID.randomUUID()} 라 이 값과 겹칠 수 없다. 사람이 읽고
	 * 입력할 수 있는 모양으로 둔 이유는 친구 코드가 uuid 이기 때문이다 — 테스터끼리 친구 요청을
	 * 보내 보려면 손으로 적을 수 있어야 한다.
	 */
	private String uuidOf(int slot) {
		return "tester-" + slot;
	}

	private String nameOf(int slot) {
		return "테스터" + slot;
	}
}
