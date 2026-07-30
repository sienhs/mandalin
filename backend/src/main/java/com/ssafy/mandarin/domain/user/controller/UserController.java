package com.ssafy.mandarin.domain.user.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.friend.dto.UserSearchResponse;
import com.ssafy.mandarin.domain.friend.service.FriendService;
import com.ssafy.mandarin.domain.user.dto.MyProfileResponse;
import com.ssafy.mandarin.domain.user.dto.PointResponse;
import com.ssafy.mandarin.domain.user.service.UserService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User profile and search")
public class UserController {

    private final UserService userService;
    private final FriendService friendService;

    @GetMapping("/me")
    @Operation(summary = "Get my profile")
    public ResponseEntity<ApiResponse<MyProfileResponse>> getMyProfile(
            @RequestParam Long userId) {
        MyProfileResponse profile = userService.getMyProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("My profile retrieved", profile));
    }

    @GetMapping("/me/points")
    @Operation(summary = "Get my points")
    public ResponseEntity<ApiResponse<PointResponse>> getPoints(
            @RequestParam Long userId) {
        PointResponse point = userService.getPoints(userId);
        return ResponseEntity.ok(ApiResponse.success("Points retrieved", point));
    }

    @GetMapping("/{uuid}")
    @Operation(summary = "Search user by UUID")
    public ResponseEntity<ApiResponse<UserSearchResponse>> searchUser(
            @RequestParam Long userId,
            @PathVariable String uuid) {
        UserSearchResponse result = friendService.searchUserByUuid(uuid, userId);
        return ResponseEntity.ok(ApiResponse.success("User found", result));
    }
}
