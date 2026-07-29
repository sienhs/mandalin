package com.ssafy.mandarin.domain.group.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.group.dto.GroupInviteStatusRequest;
import com.ssafy.mandarin.domain.group.dto.GroupRequestCountResponse;
import com.ssafy.mandarin.domain.group.dto.GroupRequestResponse;
import com.ssafy.mandarin.domain.group.service.GroupService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/group-requests")
@RequiredArgsConstructor
@Tag(name = "Group Request", description = "Group invitation requests and status updates")
public class GroupRequestController {

    private final GroupService groupService;

    @GetMapping
    @Operation(summary = "Get pending group invitations")
    public ResponseEntity<ApiResponse<Page<GroupRequestResponse>>> getPendingInvites(
        @RequestParam Long userId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<GroupRequestResponse> response = groupService.getPendingInvites(userId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Pending group invitations retrieved", response));
    }

    @GetMapping("/count")
    @Operation(summary = "Get unread group invitation count")
    public ResponseEntity<ApiResponse<GroupRequestCountResponse>> getPendingInviteCount(
        @RequestParam Long userId
    ) {
        GroupRequestCountResponse response = groupService.getPendingInviteCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Unread invitation count retrieved", response));
    }

    @PatchMapping("/{requestId}/status")
    @Operation(summary = "Update group invitation status (accept/reject)")
    public ResponseEntity<ApiResponse<Void>> updateInviteStatus(
        @RequestParam Long userId,
        @PathVariable Long requestId,
        @RequestBody @Valid GroupInviteStatusRequest request
    ) {
        groupService.updateInviteStatus(requestId, userId, request);
        String message = Boolean.TRUE.equals(request.getAccept()) ? "Group invitation accepted" : "Group invitation rejected";
        return ResponseEntity.ok(ApiResponse.success(message));
    }
}
