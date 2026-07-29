package com.ssafy.mandarin.domain.village.repository;

import java.util.List;
import java.util.Optional;

import com.ssafy.mandarin.domain.village.entity.ItemSpot;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemSpotRepository extends JpaRepository<ItemSpot, Long> {

    // 특정 만다라트 시트에 속한 모든 건물 배치 데이터 조회
    List<ItemSpot> findBySheetId(Long sheetId);

    // 특정 만다라트 시트의 특정 도메인 위치(position: 1~8)에 대한 건물 배치 정보 조회
    Optional<ItemSpot> findBySheetIdAndDomainPosition(Long sheetId, Integer domainPosition);
}
