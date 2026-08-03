package com.ssafy.mandarin.domain.subject.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;


import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.sheet.entity.Sheet;
import com.ssafy.mandarin.domain.sheet.repository.SheetRepository;
import com.ssafy.mandarin.domain.subject.dto.SubjectCompleteRequest;
import com.ssafy.mandarin.domain.subject.dto.SubjectCompleteResponse;
import com.ssafy.mandarin.domain.subject.dto.TodoListResponse;
import com.ssafy.mandarin.domain.subject.entity.Subject;
import com.ssafy.mandarin.domain.subject.entity.SubjectLog;
import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;
import com.ssafy.mandarin.domain.subject.repository.SubjectLogRepository;
import com.ssafy.mandarin.domain.subject.repository.SubjectRepository;
import com.ssafy.mandarin.domain.user.entity.User;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final SubjectLogRepository subjectLogRepository;
    private final SheetRepository sheetRepository;
    private final UserRepository userRepository;


    /**
     * '오늘의 할 일' DAILY 과제 전체 목록 조회
     * 특정 유저가 보유한 모든 만다라트 시트의 period = DAILY인 과제 전체를 조회하며, 오늘 수행 완료 여부(isDoneToday)를 동적 연산
     *
     * @param userId 요청 유저 ID
     * @return DAILY 과제 전체 리스트
     */
    public List<TodoListResponse> getDailyTodoList(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다. id=" + userId));

        // 유저가 작성한 모든 만다라트 시트 전체의 DAILY 과제 목록 조회
        List<Subject> dailySubjects = subjectRepository.findByUserIdAndPeriod(user.getId(), SubjectPeriod.DAILY);

        List<TodoListResponse> responses = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (Subject subject : dailySubjects) {
            LocalDateTime updatedAt = subject.getUpdatedAt();
            // 유저가 오늘 이미 수행 체크 버튼을 눌렀는지 여부(true : 오늘 이미 완료함)
            boolean isDoneToday = (updatedAt != null) && updatedAt.toLocalDate().isEqual(today);

            responses.add(TodoListResponse.builder()
                    .sheetId(subject.getDomain().getSheet().getId())
                    .subjectId(subject.getId())
                    .domainId(subject.getDomain().getId())
                    .domainTitle(subject.getDomain().getTitle())
                    .title(subject.getTitle())
                    .period(subject.getPeriod())
                    .point(subject.getPoint())
                    .targetCount(subject.getTargetCount())
                    .tryCount(subject.getTryCount())
                    .position(subject.getPosition())
                    .isDone(subject.getIsDone())
                    .isDoneToday(isDoneToday)
                    .build());
        }

        return responses;
    }

    /**
     * 과제 수행 완료 처리
     * 유저가 오늘의 할 일 또는 만다라트 화면에서 수행 완료 버튼을 누를 때 호출
     *
     * @param userId  수행 유저 ID
     * @param sheetId 대상 만다라트 시트 ID
     * @param request 수행할 과제 ID 리스트
     * @return 수행 결과 (완료된 과제 ID 목록, 획득한 총 포인트, 최신 유저 포인트)
     */
    @Transactional
    public SubjectCompleteResponse completeSubjects(Long userId, Long sheetId, SubjectCompleteRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다. id=" + userId));

        Sheet sheet = sheetRepository.findById(sheetId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 만다라트 시트입니다. id=" + sheetId));

        if (!sheet.getUser().getId().equals(userId)) {
            throw new IllegalStateException("해당 만다라트 시트의 과제를 수행할 권한이 없습니다.");
        }

        List<Long> completedSubjectIds = new ArrayList<>();
        long totalEarnedPoint = 0L;
        LocalDate today = LocalDate.now();

        if (request.subjectIds() != null) {
            for (Long subjectId : request.subjectIds()) {
                Subject subject = subjectRepository.findById(subjectId)
                        .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 과제입니다. id=" + subjectId));

                // 1. 해당 과제가 요청한 시트에 속해 있는지 확인
                if (!subject.getDomain().getSheet().getId().equals(sheetId)) {
                    throw new IllegalArgumentException("요청한 시트에 속하지 않은 과제입니다. id=" + subjectId);
                }

                // 2. 이미 최종 완료되었거나 당일/당주 수행 클릭을 마친 과제인지 이중 방어 검증
                if (Boolean.TRUE.equals(subject.getIsDone())) {
                    // 이미 최종 완료된 과제는 중복 클릭 및 포인트 지급 방지
                    continue;
                }

                LocalDateTime updatedAt = subject.getUpdatedAt();
                if (updatedAt != null) {
                    if (subject.getPeriod() == SubjectPeriod.DAILY && updatedAt.toLocalDate().isEqual(today)) {
                        // daily : 오늘 이미 클릭한 과제는 건너뜀
                        continue;
                    } else if (subject.getPeriod() == SubjectPeriod.WEEKLY) {
                        // weekly : 이번 주(월~일)에 이미 클릭한 과제는 건너뜀
                        LocalDate updatedDate = updatedAt.toLocalDate();
                        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                        LocalDate sunday = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
                        if (!updatedDate.isBefore(monday) && !updatedDate.isAfter(sunday)) {
                            continue;
                        }
                    }
                }


                // 3. 수행 횟수 1 증가
                subject.incrementTryCount();

                // 4. 목표 횟수 달성 시 최종 과제 완료 및 도메인 완료 과제 수 +1
                if (subject.getTryCount() >= subject.getTargetCount()) {
                    if (!Boolean.TRUE.equals(subject.getIsDone())) {
                        subject.updateIsDone(true);
                        subject.getDomain().incrementSubjectCount();
                    }
                }

                // 5. 보상 포인트 지급
                int rewardPoint = subject.getPoint().intValue();
                user.addPoint(rewardPoint);
                totalEarnedPoint += rewardPoint;
                completedSubjectIds.add(subjectId);

                // 6. 과제 수행 이력 저장
                subjectLogRepository.save(SubjectLog.builder()
                        .user(user)
                        .subject(subject)
                        .earnedPoint((long) rewardPoint)
                        .build());

            }
        }

        return SubjectCompleteResponse.builder()
                .completedSubjectIds(completedSubjectIds)
                .totalEarnedPoint(totalEarnedPoint)
                .totalUserPoint(user.getPoint())
                .build();
    }
}
