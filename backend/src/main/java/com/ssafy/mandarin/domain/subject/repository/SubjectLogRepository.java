package com.ssafy.mandarin.domain.subject.repository;

import java.time.LocalDateTime;
import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.SubjectLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubjectLogRepository extends JpaRepository<SubjectLog, Long> {

    // 특정 세부 과제의 전체 수행 기록 목록 조회
    List<SubjectLog> findBySubjectIdOrderByCreatedAtDesc(Long subjectId);

    /**
     * 한 주기 안에서 이 과제를 몇 번 수행했는지.
     *
     * <p>subject.updatedAt(마지막 수행 시각)만으로는 "이번 주에 몇 번"을 알 수 없다.
     * "주 3회" 처럼 한 주기에 여러 번 수행하는 과제가 생기면서 횟수가 필요해졌고,
     * 수행 이력이 이미 한 줄씩 남으므로 그것을 센다.
     */
    long countBySubjectIdAndCreatedAtBetween(Long subjectId, LocalDateTime start, LocalDateTime end);

    /**
     * 포인트 적립 내역.
     *
     * <p>과제 수행 이력이 곧 적립 내역이라 별도 테이블을 두지 않았다. 무엇을 해서 몇 점을
     * 받았는지 보여주려면 과제 제목이 필요하므로 subject 를 fetch join 한다.
     */
    @Query(value = "SELECT sl FROM SubjectLog sl "
            + "JOIN FETCH sl.subject s "
            + "JOIN FETCH s.domain d "
            + "WHERE sl.user.id = :userId "
            + "ORDER BY sl.createdAt DESC",
            countQuery = "SELECT count(sl) FROM SubjectLog sl WHERE sl.user.id = :userId")
    Page<SubjectLog> findPointHistory(@Param("userId") Long userId, Pageable pageable);

    // 지정된 일시 범위 내 사용자의 과제 수행 기록 목록 조회 (Subject, Domain Fetch Join)
    @Query("SELECT sl FROM SubjectLog sl " +
           "JOIN FETCH sl.subject s " +
           "JOIN FETCH s.domain d " +
           "WHERE sl.user.id = :userId " +
           "AND sl.createdAt >= :startDate " +
           "AND sl.createdAt <= :endDate " +
           "ORDER BY sl.createdAt DESC")
    List<SubjectLog> findWeeklyLogsByUserId(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // 지정된 일시 범위 내 사용자가 획득한 총 포인트 합계 조회
    @Query("SELECT COALESCE(SUM(sl.earnedPoint), 0) FROM SubjectLog sl " +
           "WHERE sl.user.id = :userId " +
           "AND sl.createdAt >= :startDate " +
           "AND sl.createdAt <= :endDate")
    long sumEarnedPointByUserIdAndCreatedAtBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );
}


