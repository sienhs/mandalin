package com.ssafy.mandarin.domain.group.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

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

@RestController
@RequestMapping("/api/v1/groups")
@RequiredArgsConstructor
@Tag(name = "Group", description = "Group Mandarat management, invitations, and domain mapping")
public class GroupController {

    private final GroupService groupService;

    @PostMapping
    @Operation(summary = "Create group Mandarat")
    public ResponseEntity<ApiResponse<Long>> createGroup(
        @RequestParam Long userId,
        @RequestBody @Valid GroupCreateRequest request
    ) {
        Long groupId = groupService.createGroup(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Group created successfully", groupId));
    }

    @PostMapping("/{groupId}/invites")
    @Operation(summary = "Invite group members")
    public ResponseEntity<ApiResponse<Void>> inviteMembers(
        @RequestParam Long userId,
        @PathVariable Long groupId,
        @RequestBody @Valid GroupInviteRequest request
    ) {
        groupService.inviteMembers(groupId, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Group invitations sent successfully"));
    }

    @PatchMapping("/{groupId}/domains")
    @Operation(summary = "Map domains to group Mandarat")
    public ResponseEntity<ApiResponse<Void>> mapDomains(
        @RequestParam Long userId,
        @PathVariable Long groupId,
        @RequestBody @Valid GroupDomainMappingRequest request
    ) {
        groupService.mapDomains(groupId, userId, request);
        return ResponseEntity.ok(ApiResponse.success("Domains mapped successfully"));
    }

    @GetMapping("/{groupId}")
    @Operation(summary = "Get group Mandarat detail")
    public ResponseEntity<ApiResponse<GroupDetailResponse>> getGroupDetail(
        @RequestParam Long userId,
        @PathVariable Long groupId
    ) {
        GroupDetailResponse response = groupService.getGroupDetail(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success("Group details retrieved", response));
    }

    @GetMapping("/me")
    @Operation(summary = "Get my group list")
    public ResponseEntity<ApiResponse<List<GroupListResponse>>> getMyGroups(
        @RequestParam Long userId
    ) {
        List<GroupListResponse> response = groupService.getMyGroups(userId);
        return ResponseEntity.ok(ApiResponse.success("My groups retrieved", response));
    }
}
