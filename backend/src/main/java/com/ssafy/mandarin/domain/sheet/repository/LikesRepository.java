package com.ssafy.mandarin.domain.sheet.repository;

import java.util.Optional;
import java.util.Set;

import com.ssafy.mandarin.domain.sheet.entity.Likes;
import com.ssafy.mandarin.domain.sheet.entity.LikesId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LikesRepository extends JpaRepository<Likes, LikesId> {

    // 특정 유저가 특정 시트에 좋아요를 눌렀는지 여부 확인
    boolean existsByIdUserIdAndIdSheetId(Long userId, Long sheetId);

    // 특정 유저의 특정 시트 좋아요 엔티티 조회
    Optional<Likes> findByIdUserIdAndIdSheetId(Long userId, Long sheetId);

    // 특정 시트에 눌린 모든 좋아요 삭제 (시트 삭제 시 CASCADE 연쇄 삭제용)
    void deleteByIdSheetId(Long sheetId);

    /**
     * 내가 좋아요를 누른 시트 아이디 집합.
     *
     * <p>목록 응답에 isLiked 를 채우려고 시트마다 exists 를 부르면 N+1 이 된다.
     * 한 번에 받아 메모리에서 대조한다.
     */
    @Query("select l.id.sheetId from Likes l where l.id.userId = :userId")
    Set<Long> findLikedSheetIdsByUserId(@Param("userId") Long userId);
}
