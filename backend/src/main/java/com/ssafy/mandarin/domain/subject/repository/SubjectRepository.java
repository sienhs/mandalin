package com.ssafy.mandarin.domain.subject.repository;

import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.Subject;
import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository extends JpaRepository<Subject, Long> {

    // 특정 도메인에 속한 세부 과제 목록을 위치 좌표(position: 1~8) 오름차순으로 조회
    List<Subject> findByDomainIdOrderByPositionAsc(Long domainId);

    // 특정 만다라트 시트 전체에 속한 세부 과제 목록 조회
    List<Subject> findByDomainSheetId(Long sheetId);

    // 특정 유저의 주기별(daily, weekly, none) 과제 목록 조회 (To-do 리스트용)
    List<Subject> findByUserIdAndPeriod(Long userId, SubjectPeriod period);

    // 특정 만다라트 시트 전체에 속한 세부 과제의 총 개수 카운트
    long countByDomainSheetId(Long sheetId);

    // 특정 만다라트 시트에서 최종 완료(is_done = true) 상태인 과제 개수 카운트 (달성률 계산용)
    long countByDomainSheetIdAndIsDoneTrue(Long sheetId);
}
