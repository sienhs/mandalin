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
     * '오늘의 할 일' 목록.
     *
     * <p>매일 과제와 <b>주간 과제</b>를 함께 내린다. 주간 과제도 "이번 주에 해야 하는 일"이라
     * 오늘 목록에서 빠지면 사용자가 다른 화면을 찾아 들어가야 했다.
     *
     * <p>응답에 {@code sheetId} 를 함께 담는다. 수행 완료 API 가
     * {@code PATCH /sheets/{sheetId}/subjects/complete} 라 이 값이 없으면 목록에서 바로
     * 체크할 수 없었다. 시트까지 fetch join 해 추가 쿼리 없이 채운다.
     *
     * @param userId 요청 유저 ID
     * @return 매일·주간 과제 목록. 이미 목표를 채운(isDone) 과제는 제외한다
     */
    public List<TodoListResponse> getDailyTodoList(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다. id=" + userId));

        List<Subject> subjects = subjectRepository.findTodoCandidates(
                user.getId(), List.of(SubjectPeriod.DAILY, SubjectPeriod.WEEKLY));

        List<TodoListResponse> responses = new ArrayList<>();
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        for (Subject subject : subjects) {
            // 목표를 다 채운 과제는 할 일이 아니다.
            if (Boolean.TRUE.equals(subject.getIsDone())) {
                continue;
            }

            Sheet sheet = subject.getDomain().getSheet();
            LocalDateTime updatedAt = subject.getUpdatedAt();

            // 이번 주기(오늘 / 이번 주)에 이미 체크했는지. 완료 API 의 중복 방지 규칙과 같은 기준이다.
            boolean donePeriod = false;
            if (updatedAt != null) {
                LocalDate updatedDate = updatedAt.toLocalDate();
                if (subject.getPeriod() == SubjectPeriod.DAILY) {
                    donePeriod = updatedDate.isEqual(today);
                } else if (subject.getPeriod() == SubjectPeriod.WEEKLY) {
                    donePeriod = !updatedDate.isBefore(monday) && !updatedDate.isAfter(sunday);
                }
            }

            responses.add(TodoListResponse.builder()
                    .subjectId(subject.getId())
                    .sheetId(sheet.getId())
                    .sheetTitle(sheet.getTitle())
                    .domainId(subject.getDomain().getId())
                    .domainTitle(subject.getDomain().getTitle())
                    .title(subject.getTitle())
                    .period(subject.getPeriod())
                    .point(subject.getPoint())
                    .targetCount(subject.getTargetCount())
                    .tryCount(subject.getTryCount())
                    .position(subject.getPosition())
                    .isDone(subject.getIsDone())
                    .isDoneToday(donePeriod)
                    .progress(progressOf(subject))
                    .build());
        }

        return responses;
    }

    /** SheetService.progressOf 와 같은 규칙. 완료 표시된 과제는 횟수와 무관하게 100 이다. */
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

        LocalDateTime mondayStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).atStartOfDay();
        LocalDateTime sundayEnd = today.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY)).atTime(23, 59, 59);
        LocalDateTime monthStart = today.with(TemporalAdjusters.firstDayOfMonth()).atStartOfDay();
        LocalDateTime monthEnd = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(23, 59, 59);

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

                /*
                  하루 1회 제한. 주기와 무관하게 적용한다 —
                  "주 3회" 라도 하루에 세 번 몰아서 누르면 실천이 아니라 클릭이 된다.
                */
                LocalDateTime updatedAt = subject.getUpdatedAt();
                if (updatedAt != null && updatedAt.toLocalDate().isEqual(today)) {
                    continue;
                }

                /*
                  주기별 목표 횟수 초과 검증.

                  예전에는 "이번 주에 한 번이라도 눌렀으면 건너뜀" 이었다. 그래서 주 3회짜리
                  과제도 주 1회까지만 올라가 목표 횟수를 영영 못 채웠다. 수행 이력을 세어
                  주기당 허용 횟수와 비교한다.
                */
                if (subject.getPeriod() == SubjectPeriod.WEEKLY) {
                    long weeklyLogs = subjectLogRepository.countBySubjectIdAndCreatedAtBetween(
                            subjectId, mondayStart, sundayEnd);
                    if (weeklyLogs >= subject.getCountPerPeriod()) {
                        continue;
                    }
                } else if (subject.getPeriod() == SubjectPeriod.MONTHLY) {
                    long monthlyLogs = subjectLogRepository.countBySubjectIdAndCreatedAtBetween(
                            subjectId, monthStart, monthEnd);
                    if (monthlyLogs >= subject.getCountPerPeriod()) {
                        continue;
                    }
                }


                // 3. 수행 횟수 1 증가
                subject.incrementTryCount();

                // 4. 목표 횟수 달성 시 최종 과제 완료 및 도메인 완료 과제 수 +1
                if (subject.getTargetCount() != null && subject.getTryCount() >= subject.getTargetCount()) {
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
