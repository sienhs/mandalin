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

    /** 타일 한 칸. (sheet, domainPosition, itemPosition) 은 DB 에서 UNIQUE 다. */
    Optional<ItemSpot> findBySheetIdAndDomainPositionAndItemPosition(
            Long sheetId, Integer domainPosition, Integer itemPosition);

    List<ItemSpot> findBySheetIdOrderByDomainPositionAscItemPositionAsc(Long sheetId);

    /**
     * 건물을 어느 칸에서 쓰고 있는지 역으로 찾는다.
     * 보유 건물을 내려놓을 때(같은 건물을 다른 칸으로 옮길 때) 기존 칸을 비우는 데 쓴다.
     */
    List<ItemSpot> findBySheetIdAndInvenId(Long sheetId, Long invenId);
}
