package com.ssafy.mandarin.domain.subject.repository;

import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.SubjectLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectLogRepository extends JpaRepository<SubjectLog, Long> {

    // 특정 세부 과제의 전체 수행 기록 목록 조회
    List<SubjectLog> findBySubjectIdOrderByCreatedAtDesc(Long subjectId);
}
