package com.ssafy.mandarin.domain.sheet.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.sheet.dto.SheetProgressDto;
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
import com.ssafy.mandarin.domain.subject.repository.SubjectLogRepository;
import com.ssafy.mandarin.domain.subject.repository.SubjectRepository;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.domain.village.entity.ItemDir;
import com.ssafy.mandarin.domain.village.entity.ItemSpot;
import com.ssafy.mandarin.domain.village.repository.ItemSpotRepository;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

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
    private final SubjectLogRepository subjectLogRepository;
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
        // 0. 81칸이 온전히 채워졌는지. 생성 이후에는 고칠 수 없으므로 여기서 막지 않으면
        //    빈 칸이 영구히 남는다. 개수는 DTO 제약이 보고, 여기서는 위치 중복을 본다.
        validatePositions(request);

        // 1. 작성자 유저 존재 검증
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다. id=" + userId));

        // 2. 만다라트 최상위 시트 엔티티 생성 및 저장
        // 2. 만다라트 최상위 시트 엔티티 생성 및 저장
        Sheet sheet = Sheet.builder()
                .user(user)
                .title(request.title())
                .isOpen(request.isOpen() != null ? request.isOpen() : false)
                .expiredAt(request.expiredAt())
                .likeCount(0L)
                .build();

        Sheet savedSheet = sheetRepository.save(sheet);

        // 3. 시작일은 시트 생성일(LocalDate.now()), 종료일(expiredAt)과의 총 일수(totalDays) 계산
        long totalDays = 30; // 기본값 30일
        if (savedSheet.getExpiredAt() != null) {
            LocalDate startDate = LocalDate.now(ZoneId.of("Asia/Seoul")); // 시작일은 생성 날짜
            LocalDate endDate = savedSheet.getExpiredAt().toLocalDate();
            totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
            if (totalDays <= 0) {
                totalDays = 1;
            }
        }

        // 4. 8개 도메인 및 하위 64개 세부 과제 저장
        if (request.domains() != null) {
            for (SheetCreateRequest.DomainCreateRequest domainReq : request.domains()) {
                Domain domain = Domain.builder()
                        .sheet(savedSheet)
                        .title(domainReq.title())
                        .position(domainReq.position())
                        .subjectCount(0) // 완료된 과제 수 초기값 0
                        .build();

                Domain savedDomain = domainRepository.save(domain);

                if (domainReq.subjects() != null) {
                    for (SheetCreateRequest.SubjectCreateRequest subjectReq : domainReq.subjects()) {
                        // 과제 주기(daily, weekly, monthly, none) 확인 및 미지정 시 NONE 적용
                        SubjectPeriod period = subjectReq.period() != null ? subjectReq.period()
                                : SubjectPeriod.NONE;

                        // 주당/월당 목표 횟수 (기본값 1)
                        int countPerPeriod = (subjectReq.countPerPeriod() != null && subjectReq.countPerPeriod() > 0)
                                ? subjectReq.countPerPeriod() : 1;

                        // period별 target_count 자동 산정 공식
                        int calculatedTargetCount;
                        if (subjectReq.targetCount() != null && subjectReq.targetCount() > 0) {
                            calculatedTargetCount = subjectReq.targetCount();
                        } else {
                            if (period == SubjectPeriod.DAILY) {
                                calculatedTargetCount = (int) totalDays;
                            } else if (period == SubjectPeriod.WEEKLY) {
                                int weeks = (int) (totalDays / 7);
                                calculatedTargetCount = Math.max(1, weeks) * countPerPeriod;
                            } else if (period == SubjectPeriod.MONTHLY) {
                                int months = (int) (totalDays / 30);
                                calculatedTargetCount = Math.max(1, months) * countPerPeriod;
                            } else {
                                calculatedTargetCount = 1;
                            }
                        }

                        Subject subject = Subject.builder()
                                .domain(savedDomain)
                                .user(user)
                                .title(subjectReq.title())
                                .position(subjectReq.position())
                                .period(period)
                                .point(subjectReq.point() != null ? subjectReq.point() : 100L)
                                .targetCount(calculatedTargetCount)
                                .countPerPeriod(countPerPeriod)
                                .tryCount(0)
                                .isDone(false)
                                .build();

                        subjectRepository.save(subject);
                    }
                }
            }
        }

        // 5. 3D 건물 배치 정보 처리 
        Map<String, SheetCreateRequest.ItemSpotCreateRequest> userSpotMap = new HashMap<>();

        if (request.itemSpots() != null) {
            for (SheetCreateRequest.ItemSpotCreateRequest spotReq : request.itemSpots()) {
                int domPos = spotReq.domainPosition();
                int itemPos = spotReq.itemPosition() != null ? spotReq.itemPosition() : 5;
                userSpotMap.put(domPos + "_" + itemPos, spotReq);
            }
        }

        // 9개 구역 (domainPosition = 1 ~ 9)
        for (int dPos = 1; dPos <= 9; dPos++) {
            if (dPos == 5) {
                // [중앙 랜드마크 구역]: 3x3 1개 (itemPosition = 5)
                String key = "5_5";
                SheetCreateRequest.ItemSpotCreateRequest spotReq = userSpotMap.get(key);
                ItemSpot landmarkSpot = ItemSpot.builder()
                        .sheet(savedSheet)
                        .domainPosition(5)
                        .itemPosition(5)
                        .invenId(spotReq != null ? spotReq.invenId() : null) // 유저 지정 스킨 or 기본 랜드마크 스킨(null)
                        .dir(spotReq != null && spotReq.dir() != null ? spotReq.dir() : ItemDir.DEG_0)
                        .build();
                itemSpotRepository.save(landmarkSpot);
            } else {
                // [주변 8개 도메인 구역]: 각 9개 타일 전체 (대표 건물 1개 + 세부 과제 건물 8개)
                for (int iPos = 1; iPos <= 9; iPos++) {
                    String key = dPos + "_" + iPos;
                    SheetCreateRequest.ItemSpotCreateRequest spotReq = userSpotMap.get(key);

                    ItemSpot itemSpot = ItemSpot.builder()
                            .sheet(savedSheet)
                            .domainPosition(dPos)
                            .itemPosition(iPos)
                            .invenId(spotReq != null ? spotReq.invenId() : null) // 유저 지정 스킨 or 기본 스킨(null)
                            .dir(spotReq != null && spotReq.dir() != null ? spotReq.dir() : ItemDir.DEG_0)
                            .build();
                    itemSpotRepository.save(itemSpot);
                }
            }
        }

        return savedSheet.getId();
    }

    /**
     * 세부 목표 8칸·과제 8칸의 위치가 겹치지 않는지.
     *
     * <p>개수(8개)는 {@code SheetCreateRequest} 의 {@code @Size} 가 본다. 하지만 개수만
     * 맞고 위치가 {@code [0,0,1,2,3,4,5,6]} 처럼 겹치면 한 칸이 비고 다른 칸이 덮인다.
     * 생성 이후에 고칠 수 없으니 이 상태로 저장되면 되돌릴 방법이 없다.
     */
    private void validatePositions(SheetCreateRequest request) {
        Set<Integer> domainPositions = new HashSet<>();

        for (SheetCreateRequest.DomainCreateRequest domain : request.domains()) {
            if (!domainPositions.add(domain.position())) {
                throw new BusinessException(ErrorCode.DUPLICATE_POSITION);
            }

            Set<Integer> subjectPositions = new HashSet<>();
            for (SheetCreateRequest.SubjectCreateRequest subject : domain.subjects()) {
                if (!subjectPositions.add(subject.position())) {
                    throw new BusinessException(ErrorCode.DUPLICATE_POSITION);
                }
            }
        }
    }

    /**
     * 내 만다라트 목록 조회
     * 작성자의 모든 만다라트 시트를 최신순으로 조회하며, 64개 과제 대비 달성률(%)을 연산하여 반환
     */
    public List<SheetListResponse> getMySheets(Long userId) {
        List<Sheet> sheets = sheetRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<SheetListResponse> responses = new ArrayList<>();

        // 좋아요 여부는 한 번에 받아 대조한다. 시트마다 exists 를 부르면 N+1 이다.
        Set<Long> likedSheetIds = likesRepository.findLikedSheetIdsByUserId(userId);

        // QueryDSL로 단 1번의 쿼리로 모든 시트의 진행률/달성률 집계 Map 가져오기
        Map<Long, SheetProgressDto> progressMap = sheetRepository.findSheetProgressesByUserId(userId);

        for (Sheet sheet : sheets) {
            SheetProgressDto progressDto = progressMap.getOrDefault(
                    sheet.getId(),
                    new SheetProgressDto(sheet.getId(), 0.0, 0.0)
            );

            responses.add(SheetListResponse.builder()
                    .sheetId(sheet.getId())
                    .title(sheet.getTitle())
                    .isOpen(sheet.getIsOpen())
                    .likeCount(sheet.getLikeCount() != null ? sheet.getLikeCount() : 0L)
                    .isLiked(likedSheetIds.contains(sheet.getId()))
                    .achievementRate(progressDto.achievementRate())
                    .progress(progressDto.progress())
                    .createdAt(sheet.getCreatedAt())
                    .expiredAt(sheet.getExpiredAt())
                    .build());
        }

        return responses;
    }

    /**
     * 공개 여부 변경.
     *
     * <p><b>만다라트 내용은 고칠 수 없다.</b> 핵심 목표·세부 목표·실천 과제는 생성 시점에
     * 확정되고 그 뒤로는 수행만 한다 — 목표를 쉽게 바꿀 수 있으면 채우기 어려운 칸을 지워
     * 버리게 되고, 그러면 81칸으로 나눠 놓은 의미가 사라진다.
     *
     * <p>공개 여부만 예외로 둔다. 이건 목표의 내용이 아니라 누구에게 보일지에 대한 설정이라
     * 언제든 되돌릴 수 있어야 한다.
     */
    @Transactional
    public SheetDetailResponse updateVisibility(Long userId, Long sheetId, Boolean isOpen) {
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHEET_NOT_FOUND));

        if (!sheet.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.SHEET_NOT_OWNED);
        }

        sheet.updateIsOpen(isOpen);
        return getSheetDetail(userId, sheetId);
    }

    /**
     * 과제 진행률 0~100.
     *
     * <p>완료 표시된 과제는 목표 횟수를 다 채우지 않았어도 100 이다 — 사용자가 완료로 표시한
     * 것을 미완성으로 보여주면 화면과 데이터가 어긋난다. 그 외에는 시도/목표 비율을 쓴다.
     *
     * <p>targetCount 가 0 이나 null 인 과제는 비율을 낼 수 없어 0 으로 둔다. 생성 시 항상
     * 1 이상이 들어가지만(SheetService.createSheet), 과거 데이터나 직접 수정된 행이 있을 수 있다.
     */
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

    /**
     * 만다라트 상세 정보 조회
     * 특정 만다라트 시트의 64개 과제 상태 및 도메인 구조를 조회
     *
     * <p>비공개 시트는 소유자만 볼 수 있다. 이 검사가 없으면 로그인한 아무 사용자가 sheetId 를
     * 훑어 남의 목표를 전부 읽을 수 있다 — 공개 여부(isOpen)를 두는 의미가 없어진다.
     *
     * @param userId 조회를 요청한 사용자
     * @throws BusinessException 시트가 없거나(404), 비공개 시트에 남이 접근할 때(403)
     */
    public SheetDetailResponse getSheetDetail(Long userId, Long sheetId) {
        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new BusinessException(ErrorCode.SHEET_NOT_FOUND));

        if (!Boolean.TRUE.equals(sheet.getIsOpen()) && !sheet.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.SHEET_ACCESS_DENIED);
        }

        boolean isLiked = false;
        if (userId != null) {
            isLiked = likesRepository.existsByIdUserIdAndIdSheetId(userId, sheetId);
        }

        List<Domain> domains = domainRepository.findBySheetIdOrderByPositionAsc(sheetId);
        List<SheetDetailResponse.DomainDetailResponse> domainResponses = new ArrayList<>();

        long doneSubjects = 0;

        for (Domain domain : domains) {
            List<Subject> subjects = subjectRepository.findByDomainIdOrderByPositionAsc(domain.getId());
            List<SheetDetailResponse.SubjectDetailResponse> subjectResponses = new ArrayList<>();

            LocalDate today = LocalDate.now(ZoneId.of("Asia/Seoul"));
            LocalDateTime mondayStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
            LocalDateTime sundayEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(23, 59, 59);
            LocalDateTime monthStart = today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
            LocalDateTime monthEnd = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);

            for (Subject subject : subjects) {
                if (Boolean.TRUE.equals(subject.getIsDone())) {
                    doneSubjects++;
                }

                boolean isDoneToday = (subject.getUpdatedAt() != null)
                        && subject.getUpdatedAt().toLocalDate().isEqual(today);

                /*
                  이번 주기에 몇 번 했는지.

                  updatedAt(마지막 수행 시각) 하나로는 셀 수 없어서 수행 이력을 센다.
                  "주 3회" 같은 과제는 같은 주에 여러 번 체크되므로 횟수가 필요하다.
                */
                long currentPeriodCount;
                if (subject.getPeriod() == SubjectPeriod.WEEKLY) {
                    currentPeriodCount = subjectLogRepository.countBySubjectIdAndCreatedAtBetween(
                            subject.getId(), mondayStart, sundayEnd);
                } else if (subject.getPeriod() == SubjectPeriod.MONTHLY) {
                    currentPeriodCount = subjectLogRepository.countBySubjectIdAndCreatedAtBetween(
                            subject.getId(), monthStart, monthEnd);
                } else {
                    currentPeriodCount = isDoneToday ? 1 : 0;
                }

                boolean canExecute = !Boolean.TRUE.equals(subject.getIsDone())
                        && !isDoneToday
                        && (currentPeriodCount < subject.getCountPerPeriod());

                // 주기(일/주/월)별 목표 완료 여부 연산
                boolean isDonePeriod = false;
                if (Boolean.TRUE.equals(subject.getIsDone())) {
                    // 1. 과제 자체가 최종 완수된 경우 -> 항상 완료(true)
                    isDonePeriod = true;
                } else if (subject.getPeriod() == SubjectPeriod.DAILY) {
                    // 2. 일간 과제 -> 오늘 완료 체크 여부(isDoneToday)와 동일
                    isDonePeriod = isDoneToday;
                } else if (subject.getPeriod() == SubjectPeriod.WEEKLY
                        || subject.getPeriod() == SubjectPeriod.MONTHLY) {
                    // 3. 주간/월간 -> 이번 주/달 수행 횟수가 목표 횟수 이상인가
                    isDonePeriod = (currentPeriodCount >= subject.getCountPerPeriod());
                }

                int subjectProgress = progressOf(subject);

                subjectResponses.add(SheetDetailResponse.SubjectDetailResponse.builder()
                        .subjectId(subject.getId())
                        .position(subject.getPosition())
                        .title(subject.getTitle())
                        .period(subject.getPeriod())
                        .countPerPeriod(subject.getCountPerPeriod())
                        .currentPeriodCount(currentPeriodCount)
                        .point(subject.getPoint())
                        .targetCount(subject.getTargetCount())
                        .tryCount(subject.getTryCount())
                        .isDone(subject.getIsDone())
                        .isDoneToday(isDoneToday)
                        .canExecute(canExecute)
                        .isDonePeriod(isDonePeriod)
                        .progress(subjectProgress)
                        .build());
            }

            double domainProgress = subjectResponses.isEmpty() ? 0.0
                    : subjectResponses.stream().mapToDouble(SheetDetailResponse.SubjectDetailResponse::progress).average().orElse(0.0);
            double roundedDomainProgress = Math.round(domainProgress * 10.0) / 10.0;

            domainResponses.add(SheetDetailResponse.DomainDetailResponse.builder()
                    .domainId(domain.getId())
                    .position(domain.getPosition())
                    .title(domain.getTitle())
                    .progress(roundedDomainProgress)
                    .subjects(subjectResponses)
                    .build());
        }

        double sheetProgress = domainResponses.isEmpty() ? 0.0
                : domainResponses.stream().mapToDouble(SheetDetailResponse.DomainDetailResponse::progress).average().orElse(0.0);
        double roundedSheetProgress = Math.round(sheetProgress * 10.0) / 10.0;

        double achievementRate = (doneSubjects / TOTAL_SUBJECT_COUNT) * 100.0;

        return SheetDetailResponse.builder()
                .sheetId(sheet.getId())
                .userId(sheet.getUser().getId())
                .title(sheet.getTitle())
                .isOpen(sheet.getIsOpen())
                .likeCount(sheet.getLikeCount() != null ? sheet.getLikeCount() : 0L)
                .isLiked(isLiked)
                .achievementRate(Math.round(achievementRate * 10.0) / 10.0)
                .progress(roundedSheetProgress)
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
