package com.ssafy.mandarin.domain.friend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.friend.dto.FriendRequestResponse;
import com.ssafy.mandarin.domain.friend.dto.FriendResponse;
import com.ssafy.mandarin.domain.friend.dto.UserSearchResponse;
import com.ssafy.mandarin.domain.friend.entity.FriendRequest;
import com.ssafy.mandarin.domain.friend.entity.Friends;
import com.ssafy.mandarin.domain.friend.entity.RequestProgress;
import com.ssafy.mandarin.domain.friend.repository.FriendRequestRepository;
import com.ssafy.mandarin.domain.friend.repository.FriendsRepository;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class FriendService {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final FriendsRepository friendsRepository;

    // ─── 유저 UUID 검색 ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public UserSearchResponse searchUserByUuid(String targetUuid, String myUuid) {
        User target = findActiveUserByUuid(targetUuid);
        User me = findActiveUserByUuid(myUuid);
        boolean isFriend = friendsRepository.existsFriendship(me, target);
        return UserSearchResponse.of(target, isFriend);
    }

    // ─── 내 친구 목록 조회 ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<FriendResponse> getMyFriends(String myUuid) {
        User me = findActiveUserByUuid(myUuid);
        return friendsRepository.findAllByUser(me)
            .stream()
            .map(friends -> FriendResponse.of(friends, me))
            .collect(Collectors.toList());
    }

    // ─── 친구 요청 전송 ────────────────────────────────────────────────────

    public void sendFriendRequest(String targetUuid, String myUuid) {
        if (targetUuid.equals(myUuid)) {
            throw new BusinessException(ErrorCode.CANNOT_REQUEST_YOURSELF);
        }

        User me = findActiveUserByUuid(myUuid);
        User target = findActiveUserByUuid(targetUuid);

        // 이미 친구인지 확인
        if (friendsRepository.existsFriendship(me, target)) {
            throw new BusinessException(ErrorCode.ALREADY_FRIEND);
        }

        // 상대방이 나에게 보낸 대기 중인 요청이 이미 있는 경우 -> 자동으로 친구 요청 수락
        Optional<FriendRequest> reverseRequestOpt = friendRequestRepository.findBySenderAndReceiver(target, me);
        if (reverseRequestOpt.isPresent()) {
            FriendRequest reverseRequest = reverseRequestOpt.get();
            if (reverseRequest.getProgress() == RequestProgress.NOT_READ || reverseRequest.getProgress() == RequestProgress.READ) {
                acceptRequest(reverseRequest.getId(), myUuid);
                log.info("Cross friend request auto-accepted: me={}, target={}", me.getId(), target.getId());
                return;
            }
        }

        // 내가 보낸 기존 요청이 존재하면 해당 행 업데이트 (DB UNIQUE(sender_id, receiver_id) 제약 준수)
        Optional<FriendRequest> existingRequestOpt = friendRequestRepository.findBySenderAndReceiver(me, target);
        if (existingRequestOpt.isPresent()) {
            FriendRequest existingRequest = existingRequestOpt.get();
            if (existingRequest.getProgress() == RequestProgress.NOT_READ || existingRequest.getProgress() == RequestProgress.READ) {
                throw new BusinessException(ErrorCode.FRIEND_REQUEST_ALREADY_SENT);
            }
            // 이전 요청이 거절(REJECTED)되었거나, 삭제되어(ACCEPTED 상태였으나 친구목록에서 삭제됨) 다시 요청하는 경우 -> NOT_READ 상태로 재설정하여 재전송
            existingRequest.resetToPending();
            log.info("Friend request re-sent: senderId={}, receiverId={}", me.getId(), target.getId());
            return;
        }

        FriendRequest friendRequest = FriendRequest.builder()
            .sender(me)
            .receiver(target)
            .build();

        friendRequestRepository.save(friendRequest);
        log.info("Friend request sent: senderId={}, receiverId={}", me.getId(), target.getId());
    }

    // ─── 받은 친구 요청 목록 조회 ──────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<FriendRequestResponse> getReceivedRequests(String myUuid) {
        User me = findActiveUserByUuid(myUuid);
        List<RequestProgress> pendingStatuses = List.of(RequestProgress.NOT_READ, RequestProgress.READ);
        return friendRequestRepository.findByReceiverAndProgressInOrderByCreatedAtDesc(me, pendingStatuses)
            .stream()
            .map(FriendRequestResponse::from)
            .collect(Collectors.toList());
    }

    // ─── 친구 요청 수락 ────────────────────────────────────────────────────

    public void acceptRequest(Long requestId, String myUuid) {
        User me = findActiveUserByUuid(myUuid);
        FriendRequest request = friendRequestRepository.findByIdAndReceiver(requestId, me)
            .orElseThrow(() -> new BusinessException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));

        // 이미 친구인지 최종 확인
        if (friendsRepository.existsFriendship(me, request.getSender())) {
            throw new BusinessException(ErrorCode.ALREADY_FRIEND);
        }

        request.accept();

        // user_id1 < user_id2 정렬하여 UNIQUE 제약 활용
        User user1 = request.getSender().getId() < me.getId() ? request.getSender() : me;
        User user2 = request.getSender().getId() < me.getId() ? me : request.getSender();

        Friends friends = Friends.builder()
            .user1(user1)
            .user2(user2)
            .build();

        friendsRepository.save(friends);
        log.info("Friend request accepted: requestId={}, friendsId={}", requestId, friends.getId());
    }

    // ─── 친구 요청 거절 ────────────────────────────────────────────────────

    public void rejectRequest(Long requestId, String myUuid) {
        User me = findActiveUserByUuid(myUuid);
        FriendRequest request = friendRequestRepository.findByIdAndReceiver(requestId, me)
            .orElseThrow(() -> new BusinessException(ErrorCode.FRIEND_REQUEST_NOT_FOUND));

        request.reject();
        log.info("Friend request rejected: requestId={}", requestId);
    }

    // ─── 친구 삭제 ─────────────────────────────────────────────────────────

    public void deleteFriend(Long friendRelationId, String myUuid) {
        User me = findActiveUserByUuid(myUuid);
        Friends friends = friendsRepository.findByIdAndUser(friendRelationId, me)
            .orElseThrow(() -> new BusinessException(ErrorCode.FRIEND_NOT_FOUND));

        friendsRepository.delete(friends);
        log.info("Friendship deleted: friendRelationId={}, userId={}", friendRelationId, me.getId());
    }

    // ─── 내부 헬퍼 ─────────────────────────────────────────────────────────

    private User findActiveUserByUuid(String uuid) {
        return userRepository.findByUuid(uuid)
            .filter(user -> !user.isWithdrawn())
            .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
    }
}
