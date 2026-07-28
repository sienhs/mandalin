package com.ssafy.mandarin.domain.friend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.friend.dto.FriendRequestResponse;
import com.ssafy.mandarin.domain.friend.dto.FriendResponse;
import com.ssafy.mandarin.domain.friend.dto.FriendSendRequest;
import com.ssafy.mandarin.domain.friend.service.FriendService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/friends")
@RequiredArgsConstructor
@Tag(name = "Friend", description = "Friend list, requests management, and deletion")
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    @Operation(summary = "Get my friend list")
    public ResponseEntity<ApiResponse<List<FriendResponse>>> getMyFriends(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<FriendResponse> result = friendService.getMyFriends(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Friend list retrieved", result));
    }

    @PostMapping("/requests")
    @Operation(summary = "Send friend request")
    public ResponseEntity<ApiResponse<Void>> sendFriendRequest(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestBody @Valid FriendSendRequest request
    ) {
        friendService.sendFriendRequest(request.targetUuid(), userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Friend request sent"));
    }

    @GetMapping("/requests")
    @Operation(summary = "Get received friend requests")
    public ResponseEntity<ApiResponse<List<FriendRequestResponse>>> getReceivedRequests(
        @AuthenticationPrincipal UserDetails userDetails
    ) {
        List<FriendRequestResponse> result = friendService.getReceivedRequests(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Received requests retrieved", result));
    }

    @PatchMapping("/requests/{requestId}/accept")
    @Operation(summary = "Accept friend request")
    public ResponseEntity<ApiResponse<Void>> acceptRequest(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long requestId
    ) {
        friendService.acceptRequest(requestId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Friend request accepted"));
    }

    @PatchMapping("/requests/{requestId}/reject")
    @Operation(summary = "Reject friend request")
    public ResponseEntity<ApiResponse<Void>> rejectRequest(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long requestId
    ) {
        friendService.rejectRequest(requestId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Friend request rejected"));
    }

    @DeleteMapping("/{friendId}")
    @Operation(summary = "Delete friend")
    public ResponseEntity<ApiResponse<Void>> deleteFriend(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable Long friendId
    ) {
        friendService.deleteFriend(friendId, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Friend deleted"));
    }
}
