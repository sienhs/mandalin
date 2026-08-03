package com.ssafy.mandarin.domain.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.notification.dto.NotificationResponse;
import com.ssafy.mandarin.domain.notification.service.NotificationService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification", description = "알림 (조회 전용)")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(
            summary = "내 알림 목록",
            description = "받은 친구 요청·그룹 초대·오늘 남은 할 일을 한 번에 모아 반환한다. "
                    + "알림 전용 테이블이 없어 읽음 처리는 제공하지 않는다 — 클라이언트가 마지막 확인 시각을 "
                    + "보관하고 createdAt 과 비교해 새 알림을 표시하면 된다. "
                    + "actionRequiredCount 는 수락/거절이 필요한 항목 수라 헤더 배지에 그대로 쓸 수 있다."
    )
    public ResponseEntity<ApiResponse<NotificationResponse>> getMyNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Long userId = userDetails != null ? userDetails.getUserId() : null;
        NotificationResponse response = notificationService.getMyNotifications(userId);
        return ResponseEntity.ok(ApiResponse.success("알림 조회 성공", response));
    }
}
