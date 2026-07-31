package com.ssafy.mandarin.domain.group.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.group.dto.GroupCreateRequest;
import com.ssafy.mandarin.domain.group.dto.GroupDetailResponse;
import com.ssafy.mandarin.domain.group.dto.GroupDomainMappingRequest;
import com.ssafy.mandarin.domain.group.dto.GroupInviteRequest;
import com.ssafy.mandarin.domain.group.dto.GroupListResponse;
import com.ssafy.mandarin.domain.group.service.GroupService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 그룹 만다라트 API.
 *
 * <p>요청자는 액세스 토큰에서 가져온다. {@code @RequestParam userId} 로 받으면 남의 이름으로
 * 그룹을 만들거나 남의 시트 도메인을 그룹에 매핑할 수 있다.
 */
@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
@Tag(name = "Group", description = "Group Mandarat management, invitations, and domain mapping")
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    @Operation(summary = "Create group Mandarat")
    public ResponseEntity<ApiResponse<Long>> createGroup(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @RequestBody @Valid GroupCreateRequest request
    ) {
        Long groupId = groupService.createGroup(userDetails.getUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Group created successfully", groupId));
    }

    @PostMapping("/{groupId}/invites")
    @Operation(summary = "Invite group members")
    public ResponseEntity<ApiResponse<Void>> inviteMembers(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long groupId,
        @RequestBody @Valid GroupInviteRequest request
    ) {
        groupService.inviteMembers(groupId, userDetails.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Group invitations sent successfully"));
    }

    @PatchMapping("/{groupId}/domains")
    @Operation(summary = "Map domains to group Mandarat")
    public ResponseEntity<ApiResponse<Void>> mapDomains(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long groupId,
        @RequestBody @Valid GroupDomainMappingRequest request
    ) {
        groupService.mapDomains(groupId, userDetails.getUserId(), request);
        return ResponseEntity.ok(ApiResponse.success("Domains mapped successfully"));
    }

    /**
     * 내 그룹 목록.
     *
     * <p>{@code /{groupId}} 보다 먼저 선언한다 — 고정 경로가 경로 변수보다 우선순위가 높아
     * 순서와 무관하게 매칭되지만, 읽는 사람이 "me 가 groupId 로 잡히나?"를 의심하지 않게 한다.
     */
    @GetMapping("/me")
    @Operation(summary = "Get my group list")
    public ResponseEntity<ApiResponse<List<GroupListResponse>>> getMyGroups(
        @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<GroupListResponse> response = groupService.getMyGroups(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("My groups retrieved", response));
    }

    @GetMapping("/{groupId}")
    @Operation(summary = "Get group Mandarat detail")
    public ResponseEntity<ApiResponse<GroupDetailResponse>> getGroupDetail(
        @AuthenticationPrincipal CustomUserDetails userDetails,
        @PathVariable Long groupId
    ) {
        GroupDetailResponse response = groupService.getGroupDetail(groupId, userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("Group details retrieved", response));
    }
}
