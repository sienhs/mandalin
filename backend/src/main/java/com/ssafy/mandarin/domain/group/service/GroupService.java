package com.ssafy.mandarin.domain.group.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.entity.BuildingType;
import com.ssafy.mandarin.domain.building.entity.UserBuilding;
import com.ssafy.mandarin.domain.building.repository.BuildingItemRepository;
import com.ssafy.mandarin.domain.building.repository.UserBuildingRepository;
import com.ssafy.mandarin.domain.group.dto.GroupCreateRequest;
import com.ssafy.mandarin.domain.group.dto.GroupDetailResponse;
import com.ssafy.mandarin.domain.group.dto.GroupDomainMappingRequest;
import com.ssafy.mandarin.domain.group.dto.GroupInviteRequest;
import com.ssafy.mandarin.domain.group.dto.GroupInviteStatusRequest;
import com.ssafy.mandarin.domain.group.dto.GroupListResponse;
import com.ssafy.mandarin.domain.group.dto.GroupRequestCountResponse;
import com.ssafy.mandarin.domain.group.dto.GroupRequestResponse;
import com.ssafy.mandarin.domain.group.entity.Group;
import com.ssafy.mandarin.domain.group.entity.GroupRequest;
import com.ssafy.mandarin.domain.group.entity.GroupRequestProgress;
import com.ssafy.mandarin.domain.group.entity.GroupSheet;
import com.ssafy.mandarin.domain.group.repository.GroupRepository;
import com.ssafy.mandarin.domain.group.repository.GroupRequestRepository;
import com.ssafy.mandarin.domain.group.repository.GroupSheetRepository;
import com.ssafy.mandarin.domain.sheet.entity.Domain;
import com.ssafy.mandarin.domain.sheet.entity.Sheet;
import com.ssafy.mandarin.domain.sheet.repository.DomainRepository;
import com.ssafy.mandarin.domain.sheet.repository.SheetRepository;
import com.ssafy.mandarin.domain.subject.repository.SubjectRepository;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class GroupService {

    private static final double DOMAIN_SUBJECT_COUNT = 8.0;

    private final UserRepository userRepository;
    private final SheetRepository sheetRepository;
    private final DomainRepository domainRepository;
    private final SubjectRepository subjectRepository;
    private final BuildingItemRepository buildingItemRepository;
    private final UserBuildingRepository userBuildingRepository;
    private final GroupRepository groupRepository;
    private final GroupSheetRepository groupSheetRepository;
    private final GroupRequestRepository groupRequestRepository;

    // ─── 1. 그룹 생성 (팀장) ──────────────────────────────────────────────────

    public Long createGroup(Long userId, GroupCreateRequest request) {
        User creator = findActiveUserById(userId);

        // 개인 시트 소유자 검증
        Sheet personalSheet = findAndValidateOwnedSheet(request.sheetId(), creator);

        // 랜드마크 건물 검증 (LANDMARK 타입 + 팀장 인벤토리 소유 여부)
        UserBuilding invenBuilding = validateLandmarkBuilding(userId, request.centerBuildingId());

        // 팀장의 도메인 2개 검증
        List<Domain> creatorDomains = validateAndGetDomains(personalSheet, request.domainIds());

        // GroupSheet 생성 및 팀장 도메인(1, 2) 세팅
        GroupSheet groupSheet = GroupSheet.builder().build();
        groupSheet.mapCreatorDomains(creatorDomains.get(0), creatorDomains.get(1));
        GroupSheet savedGroupSheet = groupSheetRepository.save(groupSheet);

        // Group 생성
        Group group = Group.builder()
            .title(request.title())
            .creator(creator)
            .groupSheet(savedGroupSheet)
            .inven(invenBuilding)
            .build();

        Group savedGroup = groupRepository.save(group);
        log.info("Group created: groupId={}, creatorId={}", savedGroup.getId(), creator.getId());
        return savedGroup.getId();
    }

    // ─── 2. 그룹 멤버 초대 (팀장) ──────────────────────────────────────────────

    public void inviteMembers(Long groupId, Long userId, GroupInviteRequest request) {
        User creator = findActiveUserById(userId);
        Group group = findGroupById(groupId);

        if (!group.isCreator(creator.getId())) {
            throw new BusinessException(ErrorCode.NOT_GROUP_CREATOR);
        }

        if (group.isFull()) {
            throw new BusinessException(ErrorCode.GROUP_FULL);
        }

        for (Long targetUserId : request.inviteUserIds()) {
            if (targetUserId.equals(creator.getId())) {
                throw new BusinessException(ErrorCode.CANNOT_REQUEST_YOURSELF);
            }

            User target = findActiveUserById(targetUserId);

            if (group.isMember(target.getId())) {
                throw new BusinessException(ErrorCode.GROUP_ALREADY_MEMBER);
            }

            Optional<GroupRequest> existingOpt = groupRequestRepository.findByGroupAndReceiver(group, target);
            if (existingOpt.isPresent()) {
                GroupRequest existing = existingOpt.get();
                if (existing.getProgress() == GroupRequestProgress.NOT_READ || existing.getProgress() == GroupRequestProgress.READ) {
                    throw new BusinessException(ErrorCode.GROUP_REQUEST_ALREADY_SENT);
                }
                existing.resetToPending();
                log.info("Group request re-sent: groupId={}, receiverId={}", groupId, target.getId());
            } else {
                GroupRequest groupRequest = GroupRequest.builder()
                    .group(group)
                    .creator(creator)
                    .receiver(target)
                    .build();
                groupRequestRepository.save(groupRequest);
                log.info("Group request sent: groupId={}, receiverId={}", groupId, target.getId());
            }
        }
    }

    // ─── 3. 그룹 도메인 맵핑 (팀원 전용) ────────────────────────────────────────

    public void mapDomains(Long groupId, Long userId, GroupDomainMappingRequest request) {
        User member = findActiveUserById(userId);
        Group group = findGroupById(groupId);

        // 팀장인 경우 그룹 생성 시 이미 맵핑되었으므로 팀원 전용 엔드포인트에서는 불가
        if (group.isCreator(member.getId())) {
            throw new BusinessException(ErrorCode.NOT_GROUP_CREATOR);
        }

        // 초대 수락 여부 (그룹 멤버 등록 여부) 검증
        if (!group.isMember(member.getId())) {
            throw new BusinessException(ErrorCode.GROUP_INVITE_NOT_ACCEPTED);
        }

        // 개인 시트 소유자 검증
        Sheet personalSheet = findAndValidateOwnedSheet(request.sheetId(), member);

        // 도메인 2개 검증
        List<Domain> memberDomains = validateAndGetDomains(personalSheet, request.domainIds());

        GroupSheet groupSheet = group.getGroupSheet();
        if (groupSheet == null) {
            throw new BusinessException(ErrorCode.GROUP_NOT_FOUND);
        }

        int slotIndex = group.getMemberSlotIndex(member.getId());
        if (slotIndex < 1 || slotIndex > 3) {
            throw new BusinessException(ErrorCode.GROUP_INVITE_NOT_ACCEPTED);
        }

        // 팀원 도메인 맵핑 (slot 1 -> domain3/4, slot 2 -> domain5/6, slot 3 -> domain7/8)
        groupSheet.mapMemberDomains(slotIndex, memberDomains.get(0), memberDomains.get(1));

        log.info("Group member domains mapped: groupId={}, userId={}, slotIndex={}", groupId, member.getId(), slotIndex);
    }

    // ─── 4. 그룹 만다라트 상세 조회 ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public GroupDetailResponse getGroupDetail(Long groupId, Long userId) {
        User user = findActiveUserById(userId);
        Group group = groupRepository.findByIdWithGroupSheet(groupId)
            .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));

        if (!group.isMember(user.getId())) {
            throw new BusinessException(ErrorCode.GROUP_NOT_FOUND);
        }

        GroupSheet sheet = group.getGroupSheet();

        List<GroupDetailResponse.MemberContributionResponse> memberResponses = new ArrayList<>();
        long totalGroupDoneSubjects = 0;
        int mappedDomainCount = 0;

        // 팀장 정보 수집
        List<Domain> creatorDomains = getNonNullDomains(sheet != null ? sheet.getDomain1() : null, sheet != null ? sheet.getDomain2() : null);
        mappedDomainCount += creatorDomains.size();
        long creatorDoneCount = countDoneSubjectsForDomains(creatorDomains);
        totalGroupDoneSubjects += creatorDoneCount;

        memberResponses.add(buildMemberContribution(
            group.getCreator(),
            true,
            creatorDomains,
            creatorDoneCount,
            List.of(1, 2)
        ));

        // 팀원 1~3 정보 수집
        User[] members = new User[]{group.getMember1(), group.getMember2(), group.getMember3()};
        for (int i = 0; i < members.length; i++) {
            User m = members[i];
            if (m != null) {
                Domain d1 = getDomainBySlot(sheet, (i + 1) * 2 + 1);
                Domain d2 = getDomainBySlot(sheet, (i + 1) * 2 + 2);
                List<Domain> mDomains = getNonNullDomains(d1, d2);
                mappedDomainCount += mDomains.size();
                long mDoneCount = countDoneSubjectsForDomains(mDomains);
                totalGroupDoneSubjects += mDoneCount;

                memberResponses.add(buildMemberContribution(
                    m,
                    false,
                    mDomains,
                    mDoneCount,
                    List.of((i + 1) * 2 + 1, (i + 1) * 2 + 2)
                ));
            }
        }

        double groupAchievementRate = (totalGroupDoneSubjects / 64.0) * 100.0;

        Long landmarkId = group.getInven() != null ? group.getInven().getId() : null;

        return GroupDetailResponse.builder()
            .groupId(group.getId())
            .title(group.getTitle())
            .creatorId(group.getCreator().getId())
            .creatorName(group.getCreator().getName())
            .landmarkBuildingId(landmarkId)
            .groupAchievementRate(Math.round(groupAchievementRate * 10.0) / 10.0)
            .mappedDomainCount(mappedDomainCount)
            .members(memberResponses)
            .createdAt(group.getCreatedAt())
            .build();
    }

    // ─── 5. 소속 그룹 목록 조회 ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<GroupListResponse> getMyGroups(Long userId) {
        User user = findActiveUserById(userId);
        List<Group> groups = groupRepository.findAllMyGroups(user);

        return groups.stream().map(g -> {
            int memberCount = 1;
            if (g.getMember1() != null) memberCount++;
            if (g.getMember2() != null) memberCount++;
            if (g.getMember3() != null) memberCount++;

            return GroupListResponse.builder()
                .groupId(g.getId())
                .title(g.getTitle())
                .creatorName(g.getCreator().getName())
                .memberCount(memberCount)
                .createdAt(g.getCreatedAt())
                .build();
        }).collect(Collectors.toList());
    }

    // ─── 6. 그룹 초대 대기 목록 조회 ──────────────────────────────────────────

    public Page<GroupRequestResponse> getPendingInvites(Long userId, Pageable pageable) {
        User receiver = findActiveUserById(userId);
        List<GroupRequestProgress> pendingStatuses = List.of(GroupRequestProgress.NOT_READ, GroupRequestProgress.READ);

        Page<GroupRequest> requests = groupRequestRepository
            .findByReceiverAndProgressInOrderByCreatedAtDesc(receiver, pendingStatuses, pageable);

        // 읽음 처리 (NOT_READ -> READ)
        requests.forEach(GroupRequest::markAsRead);

        return requests.map(GroupRequestResponse::from);
    }

    // ─── 7. 미확인 그룹 초대 건수 조회 ─────────────────────────────────────────

    @Transactional(readOnly = true)
    public GroupRequestCountResponse getPendingInviteCount(Long userId) {
        User receiver = findActiveUserById(userId);
        long count = groupRequestRepository.countByReceiverAndProgress(receiver, GroupRequestProgress.NOT_READ);
        return GroupRequestCountResponse.of(count);
    }

    // ─── 8. 그룹 초대 수락/거절 ───────────────────────────────────────────────

    public void updateInviteStatus(Long requestId, Long userId, GroupInviteStatusRequest request) {
        User receiver = findActiveUserById(userId);
        GroupRequest groupRequest = groupRequestRepository.findById(requestId)
            .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_REQUEST_NOT_FOUND));

        if (!groupRequest.getReceiver().getId().equals(receiver.getId())) {
            throw new BusinessException(ErrorCode.GROUP_REQUEST_NOT_FOUND);
        }

        if (Boolean.TRUE.equals(request.accept())) {
            Group group = groupRequest.getGroup();
            if (group.isFull()) {
                throw new BusinessException(ErrorCode.GROUP_FULL);
            }

            groupRequest.accept();
            group.addMember(receiver);
            log.info("Group request accepted: requestId={}, groupId={}, userId={}", requestId, group.getId(), receiver.getId());
        } else {
            groupRequest.reject();
            log.info("Group request rejected: requestId={}, userId={}", requestId, receiver.getId());
        }
    }

    // ─── 내부 헬퍼 ─────────────────────────────────────────────────────────

    private User findActiveUserById(Long userId) {
        return userRepository.findById(userId)
            .filter(user -> !user.isWithdrawn())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }

    private Group findGroupById(Long groupId) {
        return groupRepository.findById(groupId)
            .orElseThrow(() -> new BusinessException(ErrorCode.GROUP_NOT_FOUND));
    }

    private Sheet findAndValidateOwnedSheet(Long sheetId, User user) {
        Sheet sheet = sheetRepository.findById(sheetId)
            .orElseThrow(() -> new BusinessException(ErrorCode.SHEET_REQUIRED));

        if (!sheet.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.SHEET_NOT_OWNED);
        }
        return sheet;
    }

    private UserBuilding validateLandmarkBuilding(Long userId, Long centerBuildingId) {
        BuildingItem building = buildingItemRepository.findById(centerBuildingId)
            .orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_FOUND));

        if (building.getType() != BuildingType.LANDMARK) {
            throw new BusinessException(ErrorCode.INVALID_LANDMARK);
        }

        return userBuildingRepository.findAllWithItemByUserId(userId).stream()
            .filter(ub -> ub.getBuildingItem().getId().equals(centerBuildingId))
            .findFirst()
            .orElseGet(() -> {
                if (building.isDefaultGranted()) {
                    return userBuildingRepository.save(UserBuilding.of(userId, building));
                }
                throw new BusinessException(ErrorCode.BUILDING_NOT_OWNED);
            });
    }

    private List<Domain> validateAndGetDomains(Sheet sheet, List<Long> domainIds) {
        List<Domain> domains = new ArrayList<>();
        for (Long domainId : domainIds) {
            Domain domain = domainRepository.findById(domainId)
                .orElseThrow(() -> new BusinessException(ErrorCode.DOMAIN_NOT_IN_SHEET));

            if (!domain.getSheet().getId().equals(sheet.getId())) {
                throw new BusinessException(ErrorCode.DOMAIN_NOT_IN_SHEET);
            }
            domains.add(domain);
        }
        return domains;
    }

    private List<Domain> getNonNullDomains(Domain d1, Domain d2) {
        List<Domain> list = new ArrayList<>();
        if (d1 != null) list.add(d1);
        if (d2 != null) list.add(d2);
        return list;
    }

    private Domain getDomainBySlot(GroupSheet sheet, int slotNumber) {
        if (sheet == null) return null;
        switch (slotNumber) {
            case 3: return sheet.getDomain3();
            case 4: return sheet.getDomain4();
            case 5: return sheet.getDomain5();
            case 6: return sheet.getDomain6();
            case 7: return sheet.getDomain7();
            case 8: return sheet.getDomain8();
            default: return null;
        }
    }

    private long countDoneSubjectsForDomains(List<Domain> domains) {
        long count = 0;
        for (Domain domain : domains) {
            count += countDoneSubjectsForDomain(domain.getId());
        }
        return count;
    }

    private long countDoneSubjectsForDomain(Long domainId) {
        return subjectRepository.findByDomainIdOrderByPositionAsc(domainId).stream()
            .filter(subject -> Boolean.TRUE.equals(subject.getIsDone()))
            .count();
    }

    private GroupDetailResponse.MemberContributionResponse buildMemberContribution(
        User member,
        boolean isCreator,
        List<Domain> domains,
        long doneCount,
        List<Integer> slotIndices
    ) {
        List<GroupDetailResponse.DomainSummaryResponse> domainSummaries = new ArrayList<>();
        for (int i = 0; i < domains.size(); i++) {
            Domain d = domains.get(i);
            long dDone = countDoneSubjectsForDomain(d.getId());
            double dRate = (dDone / DOMAIN_SUBJECT_COUNT) * 100.0;

            domainSummaries.add(GroupDetailResponse.DomainSummaryResponse.builder()
                .domainId(d.getId())
                .title(d.getTitle())
                .slotIndex(slotIndices.get(i))
                .completedSubjectCount((int) dDone)
                .achievementRate(Math.round(dRate * 10.0) / 10.0)
                .build());
        }

        double memberRate = (domains.isEmpty()) ? 0.0 : (doneCount / (domains.size() * DOMAIN_SUBJECT_COUNT)) * 100.0;

        return GroupDetailResponse.MemberContributionResponse.builder()
            .userId(member.getId())
            .name(member.getName())
            .isCreator(isCreator)
            .memberAchievementRate(Math.round(memberRate * 10.0) / 10.0)
            .domains(domainSummaries)
            .build();
    }
}
