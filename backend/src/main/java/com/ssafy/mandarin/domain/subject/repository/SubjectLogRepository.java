package com.ssafy.mandarin.domain.subject.repository;

import java.time.LocalDateTime;
import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.SubjectLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SubjectLogRepository extends JpaRepository<SubjectLog, Long> {

    // 특정 세부 과제의 전체 수행 기록 목록 조회
    List<SubjectLog> findBySubjectIdOrderByCreatedAtDesc(Long subjectId);

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
}

