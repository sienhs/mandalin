package com.ssafy.mandarin.domain.notification.dto;

import java.time.LocalDateTime;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 알림 목록.
 *
 * <p><b>알림 전용 테이블이 없다.</b> 새 테이블을 만들면 "읽음" 상태를 어디에 둘지, 언제 지울지,
 * 어떤 이벤트를 적재할지까지 함께 정해야 해서 범위가 커진다. 지금 사용자에게 알려야 할 것은
 * 이미 다른 테이블에 다 있으므로(받은 친구 요청, 받은 그룹 초대, 오늘 남은 할 일),
 * 그것들을 모아 내려주는 조회 전용 API 로 만들었다.
 *
 * <p>그래서 읽음 처리가 없다. 클라이언트가 마지막으로 확인한 시각을 로컬에 두고
 * {@code createdAt} 과 비교해 점을 그리면 된다.
 */
@Schema(description = "알림 목록 (조회 전용, 여러 소스를 모은 결과)")
public record NotificationResponse(
        @Schema(description = "확인이 필요한 항목 수. 헤더 배지에 그대로 쓴다", example = "3")
        int actionRequiredCount,

        List<Item> items
) {

    @Schema(description = "알림 한 건")
    public record Item(
            @Schema(description = "종류", example = "FRIEND_REQUEST")
            NotificationKind kind,

            @Schema(description = "원본 식별자. 종류에 따라 requestId 등", example = "17")
            Long referenceId,

            @Schema(example = "권병수님이 친구를 신청했어요")
            String title,

            @Schema(example = "수락하면 서로의 공개 만다라트를 볼 수 있어요")
            String body,

            @Schema(description = "사용자가 눌러야 처리되는 항목인지", example = "true")
            boolean actionRequired,

            LocalDateTime createdAt
    ) {
    }

    @Schema(description = "알림 종류")
    public enum NotificationKind {
        /** 받은 친구 요청 — 수락/거절이 필요하다 */
        FRIEND_REQUEST,
        /** 받은 그룹 초대 — 수락/거절이 필요하다 */
        GROUP_INVITE,
        /** 오늘 남은 할 일 — 확인만 하면 된다 */
        TODO_REMAINING
    }
}
