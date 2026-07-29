package com.ssafy.mandarin.domain.friend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ssafy.mandarin.domain.friend.entity.FriendRequest;
import com.ssafy.mandarin.domain.friend.entity.RequestProgress;
import com.ssafy.mandarin.domain.user.entity.User;

public interface FriendRequestRepository extends JpaRepository<FriendRequest, Long> {

    /**
     * 수신자 기준으로 처리 대기 중인 요청 목록 조회 (NOT_READ, READ 상태만 — 최신순)
     * ACCEPTED, REJECTED 상태는 제외합니다.
     */
    List<FriendRequest> findByReceiverAndProgressInOrderByCreatedAtDesc(
        User receiver,
        List<RequestProgress> progresses
    );

    /**
     * 요청 ID + 수신자로 조회 (수신자만 수락/거절 가능하도록 권한 검증 포함)
     */
    Optional<FriendRequest> findByIdAndReceiver(Long id, User receiver);

    /**
     * 중복 요청 방지 (A→B 요청이 이미 존재하는지 확인)
     */
    boolean existsBySenderAndReceiver(User sender, User receiver);

    /**
     * 이미 반대 방향으로 요청이 있는지 확인 (B→A 요청 존재 여부)
     */
    boolean existsBySenderAndReceiverAndProgressIn(
        User sender, User receiver,
        List<RequestProgress> progresses
    );

    Optional<FriendRequest> findBySenderAndReceiver(User sender, User receiver);
}
