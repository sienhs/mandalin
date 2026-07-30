package com.ssafy.mandarin.domain.sheet.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.mandarin.domain.sheet.entity.Sheet;

public interface SheetRepository extends JpaRepository<Sheet, Long> {

    // 특정 유저가 작성한 만다라트 시트 목록을 최신 생성순으로 조회
    List<Sheet> findByUserIdOrderByCreatedAtDesc(Long userId);

    // 공개 설정된 만다라트 시트 목록을 좋아요 수 내림차순, ID 내림차순으로 N개 조회
    List<Sheet> findByIsOpenTrueOrderByLikeCountDescIdDesc(Pageable pageable);
}
