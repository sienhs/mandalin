package com.ssafy.mandarin.domain.friend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.friend.dto.FriendRequestResponse;
import com.ssafy.mandarin.domain.friend.dto.FriendResponse;
import com.ssafy.mandarin.domain.friend.dto.FriendSendRequest;
import com.ssafy.mandarin.domain.friend.dto.FriendSheetResponse;
import com.ssafy.mandarin.domain.friend.service.FriendService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/friends")
@RequiredArgsConstructor
@Tag(name = "Friend", description = "Friend list, requests management, deletion, and friend's sheets")
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    @Operation(summary = "Get my friend list")
    public ResponseEntity<ApiResponse<List<FriendResponse>>> getMyFriends(
        @RequestParam Long userId
    ) {
        List<FriendResponse> result = friendService.getMyFriends(userId);
        return ResponseEntity.ok(ApiResponse.success("Friend list retrieved", result));
    }

    @GetMapping("/{friendId}/sheets")
    @Operation(summary = "Get friend's public sheets")
    public ResponseEntity<ApiResponse<List<FriendSheetResponse>>> getFriendPublicSheets(
        @RequestParam Long userId,
        @PathVariable Long friendId
    ) {
        List<FriendSheetResponse> result = friendService.getFriendPublicSheets(friendId, userId);
        return ResponseEntity.ok(ApiResponse.success("Friend's public sheets retrieved", result));
    }

    @PostMapping("/requests")
    @Operation(summary = "Send friend request")
    public ResponseEntity<ApiResponse<Void>> sendFriendRequest(
        @RequestParam Long userId,
        @RequestBody @Valid FriendSendRequest request
    ) {
        friendService.sendFriendRequest(request.targetUuid(), userId);
        return ResponseEntity.ok(ApiResponse.success("Friend request sent"));
    }

    @GetMapping("/requests")
    @Operation(summary = "Get received friend requests")
    public ResponseEntity<ApiResponse<List<FriendRequestResponse>>> getReceivedRequests(
        @RequestParam Long userId
    ) {
        List<FriendRequestResponse> result = friendService.getReceivedRequests(userId);
        return ResponseEntity.ok(ApiResponse.success("Received requests retrieved", result));
    }

    @PatchMapping("/requests/{requestId}/accept")
    @Operation(summary = "Accept friend request")
    public ResponseEntity<ApiResponse<Void>> acceptRequest(
        @RequestParam Long userId,
        @PathVariable Long requestId
    ) {
        friendService.acceptRequest(requestId, userId);
        return ResponseEntity.ok(ApiResponse.success("Friend request accepted"));
    }

    @PatchMapping("/requests/{requestId}/reject")
    @Operation(summary = "Reject friend request")
    public ResponseEntity<ApiResponse<Void>> rejectRequest(
        @RequestParam Long userId,
        @PathVariable Long requestId
    ) {
        friendService.rejectRequest(requestId, userId);
        return ResponseEntity.ok(ApiResponse.success("Friend request rejected"));
    }

    @DeleteMapping("/{friendId}")
    @Operation(summary = "Delete friend")
    public ResponseEntity<ApiResponse<Void>> deleteFriend(
        @RequestParam Long userId,
        @PathVariable Long friendId
    ) {
        friendService.deleteFriend(friendId, userId);
        return ResponseEntity.ok(ApiResponse.success("Friend deleted"));
    }
}
