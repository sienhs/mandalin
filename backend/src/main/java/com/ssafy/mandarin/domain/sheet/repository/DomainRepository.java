package com.ssafy.mandarin.domain.sheet.repository;

import java.util.List;

import com.ssafy.mandarin.domain.sheet.entity.Domain;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DomainRepository extends JpaRepository<Domain, Long> {

    // 특정 만다라트 시트에 속한 8개 주요 도메인을 위치 좌표(position: 1~8) 순으로 조회
    List<Domain> findBySheetIdOrderByPositionAsc(Long sheetId);
}
