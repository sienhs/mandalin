package com.ssafy.mandarin.domain.report.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.report.dto.SubjectLogItemDto;
import com.ssafy.mandarin.domain.report.dto.WeeklySubjectLogResponse;
import com.ssafy.mandarin.domain.subject.entity.SubjectLog;
import com.ssafy.mandarin.domain.subject.repository.SubjectLogRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportService {

    private final SubjectLogRepository subjectLogRepository;

    /**
     * 지난주(지난주 월요일 00:00:00 ~ 지난주 일요일 23:59:59)의 과제 수행 이력 및 통계 조회
     *
     * @param userId 대상 사용자 ID
     * @return 지난주 과제 수행 요약 및 항목 목록
     */
    public WeeklySubjectLogResponse getWeeklySubjectLogs(Long userId) {
        // 1. 현재 날짜 기준 지난주 날짜 산정
        LocalDate lastWeekDate = LocalDate.now().minusWeeks(1);

        // 2. 지난주의 월요일 및 일요일 날짜 계산
        LocalDate monday = lastWeekDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = lastWeekDate.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        // 3. 월요일 00:00:00 부터 일요일 23:59:59 시간 생성
        LocalDateTime startDateTime = monday.atStartOfDay();
        LocalDateTime endDateTime = sunday.atTime(LocalTime.MAX);

        // 4. 해당 시간 범위 내 사용자의 과제 수행 로그 목록 조회
        List<SubjectLog> logs = subjectLogRepository.findWeeklyLogsByUserId(userId, startDateTime, endDateTime);

        List<SubjectLogItemDto> logDtos = logs.stream()
                .map(log -> new SubjectLogItemDto(
                        log.getId(),                           // 수행 로그 ID
                        log.getSubject().getId(),              // 과제 ID
                        log.getSubject().getTitle(),           // 과제명
                        log.getSubject().getDomain().getId(),   // 도메인 ID
                        log.getSubject().getDomain().getTitle(), // 도메인명
                        log.getEarnedPoint(),                  // 획득 포인트
                        log.getCreatedAt()                     // 수행 완료 일시
                ))
                .toList();

        // 5. 주간 총 완료 과제 횟수 및 총 획득 포인트 집계
        long totalCompletedCount = logDtos.size();
        long totalEarnedPoints = logs.stream()
                .mapToLong(SubjectLog::getEarnedPoint)
                .sum();

        return new WeeklySubjectLogResponse(
                monday,
                sunday,
                totalCompletedCount,
                totalEarnedPoints,
                logDtos
        );
    }
}
