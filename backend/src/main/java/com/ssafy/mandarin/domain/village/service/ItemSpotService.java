package com.ssafy.mandarin.domain.village.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.building.dto.BuildingSizeResponse;
import com.ssafy.mandarin.domain.building.entity.BuildingItem;
import com.ssafy.mandarin.domain.building.entity.BuildingType;
import com.ssafy.mandarin.domain.building.entity.UserBuilding;
import com.ssafy.mandarin.domain.building.repository.UserBuildingRepository;
import com.ssafy.mandarin.domain.building.service.BuildingInventoryService;
import com.ssafy.mandarin.domain.sheet.entity.Domain;
import com.ssafy.mandarin.domain.sheet.entity.Sheet;
import com.ssafy.mandarin.domain.sheet.repository.DomainRepository;
import com.ssafy.mandarin.domain.sheet.repository.SheetRepository;
import com.ssafy.mandarin.domain.subject.entity.Subject;
import com.ssafy.mandarin.domain.subject.repository.SubjectRepository;
import com.ssafy.mandarin.domain.village.dto.ItemSpotResponse;
import com.ssafy.mandarin.domain.village.dto.ItemSpotUpdateRequest;
import com.ssafy.mandarin.domain.village.dto.VillageLayoutResponse;
import com.ssafy.mandarin.domain.village.entity.ItemDir;
import com.ssafy.mandarin.domain.village.entity.ItemSpot;
import com.ssafy.mandarin.domain.village.entity.Terrain;
import com.ssafy.mandarin.domain.village.repository.ItemSpotRepository;
import com.ssafy.mandarin.domain.village.repository.UserVillageRepository;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * 마을 건물 배치.
 *
 * <p>배치 칸(item_spot)은 시트를 만들 때 73칸이 한 번에 생성돼 있다(SheetService.createSheet).
 * 이 서비스는 그 칸에 <b>어떤 건물을 놓을지</b>만 바꾼다 — 칸을 새로 만들거나 지우지 않는다.
 * 칸이 사라지면 만다라트 격자에 구멍이 생기기 때문이다.
 *
 * <p>규칙 세 가지를 지킨다.
 * <ol>
 *   <li>내 시트여야 한다. 남의 시트 칸을 바꿀 수 없다.</li>
 *   <li>내가 보유한 건물이어야 한다({@code user_building.user_id} 대조).</li>
 *   <li>중앙 구역(5)에는 LANDMARK 만, 나머지 칸에는 NORMAL 만 놓을 수 있다.</li>
 * </ol>
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ItemSpotService {

    private static final double TOTAL_SUBJECT_COUNT = 64.0;

    private final ItemSpotRepository itemSpotRepository;
    private final SheetRepository sheetRepository;
    private final DomainRepository domainRepository;
    private final SubjectRepository subjectRepository;
    private final UserBuildingRepository userBuildingRepository;
    private final UserVillageRepository userVillageRepository;
    private final BuildingInventoryService buildingInventoryService;

    /**
     * 시트 한 장의 마을 배치 전체.
     *
     * <p>비공개 시트는 소유자만 볼 수 있다 — 상세 조회와 같은 기준이다.
     */
    public VillageLayoutResponse getLayout(Long userId, Long sheetId) {
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHEET_NOT_FOUND));

        if (!Boolean.TRUE.equals(sheet.getIsOpen()) && !sheet.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.SHEET_ACCESS_DENIED);
        }

        List<ItemSpot> spots = itemSpotRepository
                .findBySheetIdOrderByDomainPositionAscItemPositionAsc(sheetId);

        // 아직 배치 칸이 없는 시트(구버전 데이터)면 여기서 만들어 준다.
        if (spots.isEmpty()) {
            spots = createMissingSpots(sheet);
        }

        Map<Long, UserBuilding> buildings = loadBuildings(spots);
        Map<String, Subject> subjects = indexSubjects(sheetId);

        List<ItemSpotResponse> responses = new ArrayList<>(spots.size());
        for (ItemSpot spot : spots) {
            responses.add(toResponse(spot, buildings, subjects));
        }

        long done = subjectRepository.countByDomainSheetIdAndIsDoneTrue(sheetId);
        int rate = (int) Math.round(done / TOTAL_SUBJECT_COUNT * 100.0);

        Terrain terrain = userVillageRepository.findByUserIdAndSheetId(sheet.getUser().getId(), sheetId)
                .map(v -> v.getTerrain())
                .orElse(Terrain.DEFAULT);

        return new VillageLayoutResponse(sheetId, terrain, rate, responses);
    }

    /** 타일 한 칸에 건물을 놓거나(invenId) 기본 스킨으로 되돌린다(null). */
    @Transactional
    public ItemSpotResponse placeOne(Long userId, Long sheetId, Integer domainPosition,
            Integer itemPosition, ItemSpotUpdateRequest request) {
        Sheet sheet = requireOwnedSheet(userId, sheetId);

        ItemSpot spot = itemSpotRepository
                .findBySheetIdAndDomainPositionAndItemPosition(sheetId, domainPosition, itemPosition)
                .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_SPOT_NOT_FOUND));

        applyPlacement(userId, sheetId, spot, request.invenId(), request.dir());

        Map<Long, UserBuilding> buildings = loadBuildings(List.of(spot));
        return toResponse(spot, buildings, indexSubjects(sheet.getId()));
    }

    /**
     * 여러 칸을 한 번에.
     *
     * <p>한 칸이라도 규칙을 어기면 전부 되돌린다 — 절반만 반영되면 사용자는 무엇이 저장됐는지
     * 알 수 없다. {@code @Transactional} 이 그 역할을 한다.
     */
    @Transactional
    public VillageLayoutResponse placeMany(Long userId, Long sheetId,
            ItemSpotUpdateRequest.Bulk request) {
        requireOwnedSheet(userId, sheetId);

        for (ItemSpotUpdateRequest.Entry entry : request.spots()) {
            ItemSpot spot = itemSpotRepository
                    .findBySheetIdAndDomainPositionAndItemPosition(
                            sheetId, entry.domainPosition(), entry.itemPosition())
                    .orElseThrow(() -> new BusinessException(ErrorCode.ITEM_SPOT_NOT_FOUND));

            applyPlacement(userId, sheetId, spot, entry.invenId(), entry.dir());
        }

        return getLayout(userId, sheetId);
    }

    /* ─────────────────────────  내부  ───────────────────────── */

    private Sheet requireOwnedSheet(Long userId, Long sheetId) {
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHEET_NOT_FOUND));
        if (!sheet.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.SHEET_NOT_OWNED);
        }
        return sheet;
    }

    /**
     * 배치 한 건 적용.
     *
     * <p>같은 건물이 이미 다른 칸에 서 있으면 그 칸을 비운다. 건물 하나를 여러 칸에 복제해
     * 세울 수 있게 두면 인벤토리 개념이 무의미해진다.
     */
    private void applyPlacement(Long userId, Long sheetId, ItemSpot spot, Long invenId, ItemDir dir) {
        ItemDir direction = dir != null ? dir : ItemDir.DEG_0;

        if (invenId == null) {
            spot.updateSpot(null, spot.getDomainPosition(), spot.getItemPosition(), direction);
            return;
        }

        UserBuilding owned = userBuildingRepository.findOwnedWithItem(invenId, userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.BUILDING_NOT_OWNED));

        boolean center = MandalartGrid.isCenterBlock(spot.getDomainPosition());
        boolean landmark = owned.getBuildingItem().getType() == BuildingType.LANDMARK;

        if (center && !landmark) {
            throw new BusinessException(ErrorCode.ITEM_SPOT_LANDMARK_ONLY);
        }
        if (!center && landmark) {
            throw new BusinessException(ErrorCode.ITEM_SPOT_NORMAL_ONLY);
        }

        for (ItemSpot previous : itemSpotRepository.findBySheetIdAndInvenId(sheetId, invenId)) {
            if (!previous.getId().equals(spot.getId())) {
                previous.updateSpot(null, previous.getDomainPosition(), previous.getItemPosition(),
                        previous.getDir());
            }
        }

        spot.updateSpot(invenId, spot.getDomainPosition(), spot.getItemPosition(), direction);
    }

    /**
     * 배치 칸이 하나도 없는 시트를 위한 보정.
     *
     * <p>배치 API 가 없던 시절에 만들어진 시트, 또는 생성 도중 실패한 시트가 여기 걸린다.
     * SheetService.createSheet 와 같은 규칙(중앙 1칸 + 8구역 × 9칸)으로 채운다.
     */
    @Transactional
    protected List<ItemSpot> createMissingSpots(Sheet sheet) {
        List<ItemSpot> created = new ArrayList<>(73);

        for (int dPos = 1; dPos <= 9; dPos++) {
            if (dPos == MandalartGrid.CENTER) {
                created.add(ItemSpot.builder()
                        .sheet(sheet)
                        .domainPosition(MandalartGrid.CENTER)
                        .itemPosition(MandalartGrid.CENTER)
                        .dir(ItemDir.DEG_0)
                        .build());
                continue;
            }
            for (int iPos = 1; iPos <= 9; iPos++) {
                created.add(ItemSpot.builder()
                        .sheet(sheet)
                        .domainPosition(dPos)
                        .itemPosition(iPos)
                        .dir(ItemDir.DEG_0)
                        .build());
            }
        }

        return itemSpotRepository.saveAll(created);
    }

    /** 칸에 걸린 inven_id 를 한 번에 풀어 둔다 — 칸마다 조회하면 73번 나간다. */
    private Map<Long, UserBuilding> loadBuildings(List<ItemSpot> spots) {
        Set<Long> ids = new HashSet<>();
        for (ItemSpot spot : spots) {
            if (spot.getInvenId() != null) {
                ids.add(spot.getInvenId());
            }
        }
        if (ids.isEmpty()) {
            return Map.of();
        }

        Map<Long, UserBuilding> map = new HashMap<>();
        for (UserBuilding building : userBuildingRepository.findAllWithItemByIds(ids)) {
            map.put(building.getId(), building);
        }
        return map;
    }

    /** "{domainPosition}_{itemPosition}" → 그 칸이 가리키는 과제. */
    private Map<String, Subject> indexSubjects(Long sheetId) {
        Map<Integer, Domain> byIndex = new HashMap<>();
        for (Domain domain : domainRepository.findBySheetIdOrderByPositionAsc(sheetId)) {
            byIndex.put(domain.getPosition(), domain);
        }

        Map<String, Subject> map = new HashMap<>();
        for (Map.Entry<Integer, Domain> entry : byIndex.entrySet()) {
            Integer domainPosition = MandalartGrid.toGrid(entry.getKey());
            if (domainPosition == null) {
                continue;
            }
            for (Subject subject : subjectRepository.findByDomainIdOrderByPositionAsc(entry.getValue().getId())) {
                Integer itemPosition = MandalartGrid.toGrid(subject.getPosition());
                if (itemPosition == null) {
                    continue;
                }
                map.put(domainPosition + "_" + itemPosition, subject);
            }
        }
        return map;
    }

    private ItemSpotResponse toResponse(ItemSpot spot, Map<Long, UserBuilding> buildings,
            Map<String, Subject> subjects) {
        Integer domainIndex = MandalartGrid.isCenterBlock(spot.getDomainPosition())
                ? null
                : MandalartGrid.toIndex(spot.getDomainPosition());

        Integer subjectPosition = MandalartGrid.isCenterBlock(spot.getDomainPosition())
                ? null
                : MandalartGrid.toIndex(spot.getItemPosition());

        Subject subject = subjects.get(spot.getDomainPosition() + "_" + spot.getItemPosition());
        UserBuilding building = spot.getInvenId() == null ? null : buildings.get(spot.getInvenId());
        BuildingItem item = building == null ? null : building.getBuildingItem();

        return ItemSpotResponse.builder()
                .domainPosition(spot.getDomainPosition())
                .itemPosition(spot.getItemPosition())
                .domainIndex(domainIndex)
                .subjectPosition(subjectPosition)
                .subjectId(subject == null ? null : subject.getId())
                .subjectTitle(subject == null ? null : subject.getTitle())
                .progress(subject == null ? null : progressOf(subject))
                .invenId(spot.getInvenId())
                .itemId(item == null ? null : item.getId())
                .itemKey(item == null ? null : item.getItemKey())
                .name(item == null ? null : item.getName())
                .theme(item == null ? null : item.getTheme())
                .type(item == null ? null : item.getType())
                .thumbnailUrl(item == null ? null : item.getThumbnailUrl())
                .size(item == null ? null : BuildingSizeResponse.from(item))
                .dir(spot.getDir())
                .build();
    }

    /** SheetService.progressOf 와 같은 규칙. */
    private Integer progressOf(Subject subject) {
        if (Boolean.TRUE.equals(subject.getIsDone())) {
            return 100;
        }
        Integer target = subject.getTargetCount();
        Integer tries = subject.getTryCount();
        if (target == null || target <= 0 || tries == null || tries <= 0) {
            return 0;
        }
        return Math.min(100, (int) Math.round(tries * 100.0 / target));
    }

    /** 기본 지급 건물이 없는 계정을 위해 한 번 채워 준다. 배치 화면에서 고를 것이 없으면 곤란하다. */
    @Transactional
    public void ensureDefaultBuildings(Long userId) {
        buildingInventoryService.grantDefaultBuildings(userId);
    }
}
