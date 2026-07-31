package com.ssafy.mandarin.domain.group.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.group.dto.GroupInviteStatusRequest;
import com.ssafy.mandarin.domain.group.dto.GroupRequestCountResponse;
import com.ssafy.mandarin.domain.group.dto.GroupRequestResponse;
import com.ssafy.mandarin.domain.group.service.GroupService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 그룹 초대 요청 API.
 *
 * <p>요청자는 액세스 토큰에서 가져온다. 초대 수락/거절은 수신자 본인만 할 수 있어야 하므로
 * 신원을 요청 파라미터로 받으면 안 된다.
 */
@RestController
@RequestMapping("/api/v1/group-requests")
@RequiredArgsConstructor
@Tag(name = "Group Request", description = "Group invitation requests and status updates")
public class GroupRequestController {

    private final GroupService groupService;

    @GetMapping
    @Operation(summary = "Get pending group invitations")
    public ResponseEntity<ApiResponse<Page<GroupRequestResponse>>> getPendingInvites(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GroupRequestResponse> response = groupService.getPendingInvites(userDetails.getUserId(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Pending group invitations retrieved", response));
    }

    @GetMapping("/count")
    @Operation(summary = "Get unread group invitation count")
    public ResponseEntity<ApiResponse<GroupRequestCountResponse>> getPendingInviteCount(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        GroupRequestCountResponse response = groupService.getPendingInviteCount(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Unread invitation count retrieved", response));
    }

    @PatchMapping("/{requestId}/status")
    @Operation(summary = "Update group invitation status (accept/reject)")
    public ResponseEntity<ApiResponse<Void>> updateInviteStatus(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long requestId,
        @RequestBody @Valid GroupInviteStatusRequest request
    ) {
        groupService.updateInviteStatus(requestId, userDetails.getUserId(), request);
        String message = Boolean.TRUE.equals(request.accept()) ? "Group invitation accepted" : "Group invitation rejected";
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
