package com.ssafy.mandarin.domain.sheet.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.sheet.dto.SheetCreateRequest;
import com.ssafy.mandarin.domain.sheet.dto.SheetDetailResponse;
import com.ssafy.mandarin.domain.sheet.dto.SheetLikeResponse;
import com.ssafy.mandarin.domain.sheet.dto.SheetListResponse;
import com.ssafy.mandarin.domain.sheet.entity.Domain;
import com.ssafy.mandarin.domain.sheet.entity.Likes;
import com.ssafy.mandarin.domain.sheet.entity.LikesId;
import com.ssafy.mandarin.domain.sheet.entity.Sheet;
import com.ssafy.mandarin.domain.sheet.repository.DomainRepository;
import com.ssafy.mandarin.domain.sheet.repository.LikesRepository;
import com.ssafy.mandarin.domain.sheet.repository.SheetRepository;
import com.ssafy.mandarin.domain.subject.entity.Subject;
import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;
import com.ssafy.mandarin.domain.subject.repository.SubjectRepository;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.domain.village.entity.ItemDir;
import com.ssafy.mandarin.domain.village.entity.ItemSpot;
import com.ssafy.mandarin.domain.village.repository.ItemSpotRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SheetService {

    // 만다라트 시트 1개당 작성되는 총 세부 과제 고정 개수 (8개 도메인 x 8개 과제)
    private static final double TOTAL_SUBJECT_COUNT = 64.0;

    private final SheetRepository sheetRepository;
    private final DomainRepository domainRepository;
    private final SubjectRepository subjectRepository;
    private final LikesRepository likesRepository;
    private final ItemSpotRepository itemSpotRepository;
    private final UserRepository userRepository;

    /**
     * 신규 만다라트 시트 생성
     * 시트 정보, 8개 도메인, 64개 세부 과제, 3D 마을 건물 배치 정보를 저장
     *
     * @param userId  생성할 유저 ID
     * @param request 시트 생성 데이터 (기본 설정, 도메인/과제 리스트, 건물 배치 리스트)
     * @return 생성된 Sheet ID
     */
    @Transactional
    public Long createSheet(Long userId, SheetCreateRequest request) {
        // 1. 작성자 유저 존재 검증
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다. id=" + userId));

        // 2. 만다라트 최상위 시트 엔티티 생성 및 저장
        Sheet sheet = Sheet.builder()
                .user(user)
                .title(request.getTitle())
                .isOpen(request.getIsOpen() != null ? request.getIsOpen() : false)
                .expiredAt(request.getExpiredAt())
                .likeCount(0L)
                .build();

        Sheet savedSheet = sheetRepository.save(sheet);

        // 3. 시작일은 시트 생성일(LocalDate.now()), 종료일(expiredAt)과의 총 일수(totalDays) 계산
        long totalDays = 30; // 기본값 30일
        if (savedSheet.getExpiredAt() != null) {
            LocalDate startDate = LocalDate.now(); // 시작일은 생성 날짜
            LocalDate endDate = savedSheet.getExpiredAt().toLocalDate();
            totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
            if (totalDays <= 0) {
                totalDays = 1;
            }
        }

        // 4. 8개 도메인 및 하위 64개 세부 과제 저장
        if (request.getDomains() != null) {
            for (SheetCreateRequest.DomainCreateRequest domainReq : request.getDomains()) {
                Domain domain = Domain.builder()
                        .sheet(savedSheet)
                        .title(domainReq.getTitle())
                        .position(domainReq.getPosition())
                        .subjectCount(0) // 완료된 과제 수 초기값 0
                        .build();

                Domain savedDomain = domainRepository.save(domain);

                if (domainReq.getSubjects() != null) {
                    for (SheetCreateRequest.SubjectCreateRequest subjectReq : domainReq.getSubjects()) {
                        // 과제 주기(daily, weekly, none) 확인 및 미지정 시 NONE 적용
                        SubjectPeriod period = subjectReq.getPeriod() != null ? subjectReq.getPeriod()
                                : SubjectPeriod.NONE;

                        // period별 target_count 자동 산정
                        // daily -> total_days / 1 | weekly -> total_days / 7 | none -> 1
                        int calculatedTargetCount;
                        if (subjectReq.getTargetCount() != null && subjectReq.getTargetCount() > 0) {
                            calculatedTargetCount = subjectReq.getTargetCount();
                        } else {
                            if (period == SubjectPeriod.DAILY) {
                                calculatedTargetCount = (int) totalDays;
                            } else if (period == SubjectPeriod.WEEKLY) {
                                calculatedTargetCount = (int) (totalDays / 7);
                                if (calculatedTargetCount < 1) {
                                    calculatedTargetCount = 1;
                                }
                            } else {
                                calculatedTargetCount = 1;
                            }
                        }

                        Subject subject = Subject.builder()
                                .domain(savedDomain)
                                .user(user)
                                .title(subjectReq.getTitle())
                                .position(subjectReq.getPosition())
                                .period(period)
                                .point(subjectReq.getPoint() != null ? subjectReq.getPoint() : 100L)
                                .targetCount(calculatedTargetCount)
                                .tryCount(0)
                                .isDone(false)
                                .build();

                        subjectRepository.save(subject);
                    }
                }
            }
        }

        // 5. 3D 건물 배치 정보 처리 (드래그 앤 드롭 배치 및 미배치 구역 기본 건물 자동 배치)
        Map<Integer, SheetCreateRequest.ItemSpotCreateRequest> userSpotMap = new HashMap<>();
        if (request.getItemSpots() != null) {
            for (SheetCreateRequest.ItemSpotCreateRequest spotReq : request.getItemSpots()) {
                if (spotReq.getDomainPosition() != null) {
                    userSpotMap.put(spotReq.getDomainPosition(), spotReq);
                }
            }
        }

        for (int pos = 1; pos <= 8; pos++) {
            if (userSpotMap.containsKey(pos)) {
                SheetCreateRequest.ItemSpotCreateRequest spotReq = userSpotMap.get(pos);
                ItemSpot itemSpot = ItemSpot.builder()
                        .sheet(savedSheet)
                        .domainPosition(pos)
                        .invenId(spotReq.getInvenId())
                        .itemPosition(spotReq.getItemPosition() != null ? spotReq.getItemPosition() : pos)
                        .dir(spotReq.getDir() != null ? spotReq.getDir() : ItemDir.DEG_0)
                        .build();
                itemSpotRepository.save(itemSpot);
            } else {
                // 유저가 건물을 배치하지 않은 빈 구역인 경우: 기본 건물로 자동 생성
                ItemSpot defaultSpot = ItemSpot.builder()
                        .sheet(savedSheet)
                        .domainPosition(pos)
                        .invenId(null) // 기본 건물 = null
                        .itemPosition(pos)
                        .dir(ItemDir.DEG_0)
                        .build();
                itemSpotRepository.save(defaultSpot);
            }
        }

        return savedSheet.getId();
    }

    /**
     * 내 만다라트 목록 조회
     * 작성자의 모든 만다라트 시트를 최신순으로 조회하며, 64개 과제 대비 달성률(%)을 연산하여 반환
     */
    public List<SheetListResponse> getMySheets(Long userId) {
        List<Sheet> sheets = sheetRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<SheetListResponse> responses = new ArrayList<>();

        for (Sheet sheet : sheets) {
            long doneSubjects = subjectRepository.countByDomainSheetIdAndIsDoneTrue(sheet.getId());
            double achievementRate = (doneSubjects / TOTAL_SUBJECT_COUNT) * 100.0;

            responses.add(SheetListResponse.builder()
                    .sheetId(sheet.getId())
                    .title(sheet.getTitle())
                    .isOpen(sheet.getIsOpen())
                    .likeCount(sheet.getLikeCount() != null ? sheet.getLikeCount() : 0L)
                    .achievementRate(Math.round(achievementRate * 10.0) / 10.0) // 소수점 버림
                    .createdAt(sheet.getCreatedAt())
                    .expiredAt(sheet.getExpiredAt())
                    .build());
        }

        return responses;
    }

    /**
     * 만다라트 상세 정보 조회
     * 특정 만다라트 시트의 81개 과제 상태 및 도메인 구조를 조회
     */
    public SheetDetailResponse getSheetDetail(Long sheetId) {
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 만다라트 시트입니다. id=" + sheetId));

        List<Domain> domains = domainRepository.findBySheetIdOrderByPositionAsc(sheetId);
        List<SheetDetailResponse.DomainDetailResponse> domainResponses = new ArrayList<>();

        long doneSubjects = 0;

        for (Domain domain : domains) {
            List<Subject> subjects = subjectRepository.findByDomainIdOrderByPositionAsc(domain.getId());
            List<SheetDetailResponse.SubjectDetailResponse> subjectResponses = new ArrayList<>();

            for (Subject subject : subjects) {
                if (Boolean.TRUE.equals(subject.getIsDone())) {
                    doneSubjects++;
                }

                subjectResponses.add(SheetDetailResponse.SubjectDetailResponse.builder()
                        .subjectId(subject.getId())
                        .position(subject.getPosition())
                        .title(subject.getTitle())
                        .period(subject.getPeriod())
                        .point(subject.getPoint())
                        .targetCount(subject.getTargetCount())
                        .tryCount(subject.getTryCount())
                        .isDone(subject.getIsDone())
                        .build());
            }

            domainResponses.add(SheetDetailResponse.DomainDetailResponse.builder()
                    .domainId(domain.getId())
                    .position(domain.getPosition())
                    .title(domain.getTitle())
                    .subjects(subjectResponses)
                    .build());
        }

        double achievementRate = (doneSubjects / TOTAL_SUBJECT_COUNT) * 100.0;

        return SheetDetailResponse.builder()
                .sheetId(sheet.getId())
                .userId(sheet.getUser().getId())
                .title(sheet.getTitle())
                .isOpen(sheet.getIsOpen())
                .likeCount(sheet.getLikeCount() != null ? sheet.getLikeCount() : 0L)
                .achievementRate(Math.round(achievementRate * 10.0) / 10.0)
                .createdAt(sheet.getCreatedAt())
                .expiredAt(sheet.getExpiredAt())
                .domains(domainResponses)
                .build();
    }

    /**
     * 만다라트 삭제
     * 
     * @param userId  요청한 유저 ID (소유자 검증용)
     * @param sheetId 삭제할 시트 ID
     */
    @Transactional
    public void deleteSheet(Long userId, Long sheetId) {
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 만다라트 시트입니다. id=" + sheetId));

        if (!sheet.getUser().getId().equals(userId)) {
            throw new IllegalStateException("해당 만다라트를 삭제할 권한이 없습니다.");
        }

        // 1. 연관된 좋아요(Likes) 삭제
        likesRepository.deleteByIdSheetId(sheetId);

        // 2. 연관된 3D 건물 배치 삭제
        List<ItemSpot> itemSpots = itemSpotRepository.findBySheetId(sheetId);
        itemSpotRepository.deleteAll(itemSpots);

        // 3. 연관된 과제 및 도메인 CASCADE 삭제
        List<Domain> domains = domainRepository.findBySheetIdOrderByPositionAsc(sheetId);
        for (Domain domain : domains) {
            List<Subject> subjects = subjectRepository.findByDomainIdOrderByPositionAsc(domain.getId());
            subjectRepository.deleteAll(subjects);
        }
        domainRepository.deleteAll(domains);

        // 4. 최상위 시트 삭제
        sheetRepository.delete(sheet);
    }

    /**
     * 만다라트 좋아요 토글
     * 타인의 만다라트에 좋아요를 추가하거나 이미 누른 경우 좋아요를 취소한다.
     *
     * @param userId  요청한 유저 ID
     * @param sheetId 대상 시트 ID
     * @return 변경된 좋아요 상태 및 현재 총 좋아요 수
     */
    @Transactional
    public SheetLikeResponse toggleLike(Long userId, Long sheetId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다. id=" + userId));

        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 만다라트 시트입니다. id=" + sheetId));

        // 복합키 생성
        LikesId likesId = new LikesId(userId, sheetId);

        // 기존에 좋아요를 누른 내역이 있는지 DB 조회
        Optional<Likes> existingLike = likesRepository.findById(likesId);

        boolean isLiked;
        if (existingLike.isPresent()) {
            // 1. 이미 좋아요를 누른 상태 : 좋아요 취소 (DB 레코드 삭제, likeCount 1 감소)
            likesRepository.delete(existingLike.get());
            sheet.decrementLikeCount();
            isLiked = false;
        } else {
            // 2. 좋아요를 누르지 않은 상태 : 좋아요 등록 (DB 레코드 생성, likeCount 1 증가)
            Likes likes = Likes.builder()
                    .id(likesId)
                    .user(user)
                    .sheet(sheet)
                    .build();
            likesRepository.save(likes);
            sheet.incrementLikeCount();
            isLiked = true;
        }

        // 3. 최신 좋아요 상태 및 변경된 총 좋아요 수를 DTO에 담아 반환
        return SheetLikeResponse.builder()
                .sheetId(sheetId)
                .isLiked(isLiked)
                .likeCount(sheet.getLikeCount())
                .build();
    }
}
