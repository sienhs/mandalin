package com.ssafy.mandarin.domain.friend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.friend.dto.FriendRequestResponse;
import com.ssafy.mandarin.domain.friend.dto.FriendResponse;
import com.ssafy.mandarin.domain.friend.dto.FriendSendRequest;
import com.ssafy.mandarin.domain.friend.dto.FriendSheetResponse;
import com.ssafy.mandarin.domain.friend.dto.UserSearchResponse;
import com.ssafy.mandarin.domain.friend.service.FriendService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 친구 관계 API.
 *
 * <p>요청자는 항상 액세스 토큰에서 가져온다({@code @AuthenticationPrincipal}). 예전에는
 * {@code @RequestParam userId} 로 받았는데, 그러면 로그인한 아무 사용자가 남의 userId 를 적어
 * 친구를 삭제하거나 요청을 대신 수락할 수 있었다.
 */
@RestController
@RequestMapping("/api/v1/friends")
@RequiredArgsConstructor
@Tag(name = "Friend", description = "Friend list, search, requests management, deletion, and friend's sheets")
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    @Operation(summary = "Get my friend list")
    public ResponseEntity<ApiResponse<List<FriendResponse>>> getMyFriends(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<FriendResponse> result = friendService.getMyFriends(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Friend list retrieved", result));
    }

    /**
     * UUID 로 사용자를 찾는다. 친구 추가 화면의 검색창이 쓴다.
     *
     * <p>예전에는 {@code GET /api/v1/users/{uuid}} 였다. 응답에 친구 여부(isFriend)가 붙고
     * 구현도 {@code FriendService} 에 있어, 이름만 유저 조회이고 실제로는 친구 검색이었다.
     */
    @GetMapping("/search")
    @Operation(summary = "Search user by UUID", description = "친구 추가 대상을 찾는다. 이미 친구인지도 함께 반환한다.")
    public ResponseEntity<ApiResponse<UserSearchResponse>> searchUser(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestParam String uuid
    ) {
        UserSearchResponse result = friendService.searchUserByUuid(uuid, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("User found", result));
    }

    @GetMapping("/{friendId}/sheets")
    @Operation(summary = "Get friend's public sheets")
    public ResponseEntity<ApiResponse<List<FriendSheetResponse>>> getFriendPublicSheets(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long friendId
    ) {
        List<FriendSheetResponse> result = friendService.getFriendPublicSheets(friendId, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Friend's public sheets retrieved", result));
    }

    @PostMapping("/requests")
    @Operation(summary = "Send friend request")
    public ResponseEntity<ApiResponse<Void>> sendFriendRequest(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestBody @Valid FriendSendRequest request
    ) {
        friendService.sendFriendRequest(request.targetUuid(), userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Friend request sent"));
    }

    @GetMapping("/requests")
    @Operation(summary = "Get received friend requests")
    public ResponseEntity<ApiResponse<List<FriendRequestResponse>>> getReceivedRequests(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<FriendRequestResponse> result = friendService.getReceivedRequests(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Received requests retrieved", result));
    }

    @PatchMapping("/requests/{requestId}/accept")
    @Operation(summary = "Accept friend request")
    public ResponseEntity<ApiResponse<Void>> acceptRequest(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long requestId
    ) {
        friendService.acceptRequest(requestId, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Friend request accepted"));
    }

    @PatchMapping("/requests/{requestId}/reject")
    @Operation(summary = "Reject friend request")
    public ResponseEntity<ApiResponse<Void>> rejectRequest(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long requestId
    ) {
        friendService.rejectRequest(requestId, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Friend request rejected"));
    }

    @DeleteMapping("/{friendId}")
    @Operation(summary = "Delete friend", description = "friendId 는 유저 ID 가 아니라 친구 관계 ID(friendRelationId)다.")
    public ResponseEntity<ApiResponse<Void>> deleteFriend(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long friendId
    ) {
        friendService.deleteFriend(friendId, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Friend deleted"));
    }
}
