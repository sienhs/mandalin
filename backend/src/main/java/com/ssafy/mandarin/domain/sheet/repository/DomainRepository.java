package com.ssafy.mandarin.domain.sheet.repository;

import java.util.List;
import java.util.Optional;

import com.ssafy.mandarin.domain.sheet.entity.Domain;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DomainRepository extends JpaRepository<Domain, Long> {

    // 특정 만다라트 시트에 속한 8개 주요 도메인을 위치 좌표(position: 1~8) 순으로 조회
    List<Domain> findBySheetIdOrderByPositionAsc(Long sheetId);

    /** 남의 시트 도메인을 아이디만 알고 건드리는 것을 막는다 — 시트까지 함께 대조한다. */
    Optional<Domain> findByIdAndSheetId(Long id, Long sheetId);

    /*
     * 세부 목표 이름을 고치는 메서드는 두지 않는다.
     * 만다라트는 생성 시점에 확정되고 이후 수행만 한다(SubjectRepository 주석 참고).
     */
}
