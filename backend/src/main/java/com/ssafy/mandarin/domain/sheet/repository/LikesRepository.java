package com.ssafy.mandarin.domain.sheet.repository;

import java.util.Optional;

import com.ssafy.mandarin.domain.sheet.entity.Likes;
import com.ssafy.mandarin.domain.sheet.entity.LikesId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikesRepository extends JpaRepository<Likes, LikesId> {

    // 특정 유저가 특정 시트에 좋아요를 눌렀는지 여부 확인
    boolean existsByIdUserIdAndIdSheetId(Long userId, Long sheetId);

    // 특정 유저의 특정 시트 좋아요 엔티티 조회
    Optional<Likes> findByIdUserIdAndIdSheetId(Long userId, Long sheetId);

    // 특정 시트에 눌린 모든 좋아요 삭제 (시트 삭제 시 CASCADE 연쇄 삭제용)
    void deleteByIdSheetId(Long sheetId);
}
