package com.ssafy.mandarin.domain.friend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ssafy.mandarin.domain.friend.entity.Friends;
import com.ssafy.mandarin.domain.user.entity.User;

public interface FriendsRepository extends JpaRepository<Friends, Long> {

    /**
     * 내 친구 목록 조회 (양방향 — user1 또는 user2에 포함된 경우 모두)
     */
    @Query("SELECT f FROM Friends f WHERE f.user1 = :user OR f.user2 = :user ORDER BY f.createdAt DESC")
    List<Friends> findAllByUser(@Param("user") User user);

    /**
     * 두 유저 사이에 친구 관계가 존재하는지 확인
     * user_id1 < user_id2 정렬을 반영하여 양쪽 방향 모두 확인
     */
    @Query("SELECT COUNT(f) > 0 FROM Friends f WHERE (f.user1 = :u1 AND f.user2 = :u2) OR (f.user1 = :u2 AND f.user2 = :u1)")
    boolean existsFriendship(@Param("u1") User u1, @Param("u2") User u2);

    /**
     * 친구 관계 ID + 해당 유저가 포함된 관계인지 검증하여 조회 (양쪽 모두 삭제 가능)
     */
    @Query("SELECT f FROM Friends f WHERE f.id = :id AND (f.user1 = :user OR f.user2 = :user)")
    Optional<Friends> findByIdAndUser(@Param("id") Long id, @Param("user") User user);
}
