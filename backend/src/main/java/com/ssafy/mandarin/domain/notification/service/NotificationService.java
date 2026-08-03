package com.ssafy.mandarin.domain.notification.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.friend.entity.FriendRequest;
import com.ssafy.mandarin.domain.friend.entity.RequestProgress;
import com.ssafy.mandarin.domain.friend.repository.FriendRequestRepository;
import com.ssafy.mandarin.domain.group.entity.GroupRequest;
import com.ssafy.mandarin.domain.group.entity.GroupRequestProgress;
import com.ssafy.mandarin.domain.group.repository.GroupRequestRepository;
import com.ssafy.mandarin.domain.notification.dto.NotificationResponse;
import com.ssafy.mandarin.domain.notification.dto.NotificationResponse.NotificationKind;
import com.ssafy.mandarin.domain.subject.dto.TodoListResponse;
import com.ssafy.mandarin.domain.subject.service.SubjectService;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;

/**
 * 알림 집계.
 *
 * <p>알림 테이블을 새로 만들지 않고 기존 데이터를 모아 내려준다. 자세한 이유는
 * {@link NotificationResponse} 주석에 적었다.
 *
 * <p>그룹 초대는 페이지 응답이라 앞쪽 20건만 본다 — 알림은 최근 것만 보여주면 되고,
 * 전체 목록은 각 화면에서 따로 조회한다.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificationService {

    private static final int GROUP_INVITE_LIMIT = 20;

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;
    private final GroupRequestRepository groupRequestRepository;
    private final SubjectService subjectService;

    public NotificationResponse getMyNotifications(Long userId) {
        User me = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        List<NotificationResponse.Item> items = new ArrayList<>();

        // 1. 받은 친구 요청 — 수락/거절이 필요하다
        List<FriendRequest> friendRequests = friendRequestRepository
                .findByReceiverAndProgressInOrderByCreatedAtDesc(
                        me, List.of(RequestProgress.NOT_READ, RequestProgress.READ));

        for (FriendRequest request : friendRequests) {
            items.add(new NotificationResponse.Item(
                    NotificationKind.FRIEND_REQUEST,
                    request.getId(),
                    request.getSender().getName() + "님이 친구를 신청했어요",
                    "수락하면 서로의 공개 만다라트를 볼 수 있어요.",
                    true,
                    request.getCreatedAt()));
        }

        // 2. 받은 그룹 초대
        List<GroupRequest> groupRequests = groupRequestRepository
                .findByReceiverAndProgressInOrderByCreatedAtDesc(
                        me,
                        List.of(GroupRequestProgress.NOT_READ, GroupRequestProgress.READ),
                        PageRequest.of(0, GROUP_INVITE_LIMIT))
                .getContent();

        for (GroupRequest request : groupRequests) {
            items.add(new NotificationResponse.Item(
                    NotificationKind.GROUP_INVITE,
                    request.getId(),
                    request.getCreator().getName() + "님이 그룹에 초대했어요",
                    "함께 만다라트를 채워 나갈 수 있어요.",
                    true,
                    request.getCreatedAt()));
        }

        int actionRequired = items.size();

        // 3. 오늘 남은 할 일 — 알림이라기보다 안내다. 확인만 하면 되므로 배지 수에 넣지 않는다.
        List<TodoListResponse> todos = subjectService.getDailyTodoList(userId);
        long remaining = todos.stream()
                .filter(todo -> !Boolean.TRUE.equals(todo.isDoneToday()))
                .count();

        if (remaining > 0) {
            items.add(new NotificationResponse.Item(
                    NotificationKind.TODO_REMAINING,
                    null,
                    "오늘 남은 과제가 " + remaining + "개 있어요",
                    "하나만 체크해도 마을의 건물이 자랍니다.",
                    false,
                    null));
        }

        // 시각이 없는 항목(할 일 안내)은 뒤로 보낸다.
        items.sort(Comparator.comparing(
                NotificationResponse.Item::createdAt,
                Comparator.nullsLast(Comparator.reverseOrder())));

        return new NotificationResponse(actionRequired, items);
    }
}
