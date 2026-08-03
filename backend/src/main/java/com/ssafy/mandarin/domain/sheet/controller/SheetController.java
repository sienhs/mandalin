package com.ssafy.mandarin.domain.sheet.controller;

import java.util.List;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.sheet.dto.SheetCreateRequest;
import com.ssafy.mandarin.domain.sheet.dto.SheetDetailResponse;
import com.ssafy.mandarin.domain.sheet.dto.SheetLikeResponse;
import com.ssafy.mandarin.domain.sheet.dto.SheetListResponse;
import com.ssafy.mandarin.domain.sheet.dto.SheetVisibilityRequest;
import com.ssafy.mandarin.domain.sheet.service.SheetService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sheets")
@RequiredArgsConstructor
@Tag(name = "Sheet", description = "만다라트 시트 CRUD 및 좋아요 API")
public class SheetController {

    private final SheetService sheetService;

    @PostMapping
    @Operation(summary = "만다라트 생성 완료", description = "새로운 만다라트 시트를 생성합니다.")
    public ResponseEntity<ApiResponse<Long>> createSheet(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestBody @Valid SheetCreateRequest request
    ) {
        Long userId = customUserDetails != null ? customUserDetails.getUserId() : null;
        Long sheetId = sheetService.createSheet(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("만다라트 시트가 성공적으로 생성되었습니다.", sheetId));
    }

    @GetMapping
    @Operation(summary = "내 만다라트 목록 조회", description = "사용자의 만다라트 시트 목록 및 달성률을 조회합니다.")
    public ResponseEntity<ApiResponse<List<SheetListResponse>>> getMySheets(
            @AuthenticationPrincipal CustomUserDetails customUserDetails
    ) {
        Long userId = customUserDetails != null ? customUserDetails.getUserId() : null;
        List<SheetListResponse> sheets = sheetService.getMySheets(userId);
        return ResponseEntity.ok(ApiResponse.success("내 만다라트 목록 조회 성공", sheets));
    }

    @GetMapping("/{sheetId}")
    @Operation(
            summary = "만다라트 상세 정보 조회",
            description = "특정 만다라트의 64개 과제 상태 및 도메인 구조를 조회합니다. "
                    + "비공개(isOpen=false) 시트는 소유자만 조회할 수 있습니다(403)."
    )
    public ResponseEntity<ApiResponse<SheetDetailResponse>> getSheetDetail(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long sheetId
    ) {
        Long userId = customUserDetails != null ? customUserDetails.getUserId() : null;
        SheetDetailResponse response = sheetService.getSheetDetail(userId, sheetId);
        return ResponseEntity.ok(ApiResponse.success("만다라트 상세 정보 조회 성공", response));
    }

    @PatchMapping("/{sheetId}/visibility")
    @Operation(
            summary = "만다라트 공개 여부 변경",
            description = "공개/비공개만 바꿉니다. "
                    + "핵심 목표·세부 목표·실천 과제는 생성 시점에 확정되고 이후 수정할 수 없습니다 — "
                    + "목표를 쉽게 고칠 수 있으면 채우기 어려운 칸을 지워 버리게 되어 "
                    + "81칸으로 나눠 놓은 의미가 사라지기 때문입니다. "
                    + "내용을 바꾸려면 새 만다라트를 만드세요."
    )
    public ResponseEntity<ApiResponse<SheetDetailResponse>> updateVisibility(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long sheetId,
            @RequestBody @Valid SheetVisibilityRequest request
    ) {
        Long userId = customUserDetails != null ? customUserDetails.getUserId() : null;
        SheetDetailResponse response = sheetService.updateVisibility(userId, sheetId, request.isOpen());
        return ResponseEntity.ok(ApiResponse.success("공개 여부가 변경되었습니다.", response));
    }

    @DeleteMapping("/{sheetId}")
    @Operation(summary = "만다라트 삭제", description = "만다라트 시트를 삭제합니다.")
    public ResponseEntity<ApiResponse<Void>> deleteSheet(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long sheetId
    ) {
        Long userId = customUserDetails != null ? customUserDetails.getUserId() : null;
        sheetService.deleteSheet(userId, sheetId);
        return ResponseEntity.ok(ApiResponse.success("만다라트 시트가 삭제되었습니다."));
    }

    @PostMapping("/{sheetId}/likes")
    @Operation(summary = "만다라트 좋아요 토글", description = "만다라트에 좋아요를 추가하거나 취소합니다.")
    public ResponseEntity<ApiResponse<SheetLikeResponse>> toggleLike(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @PathVariable Long sheetId
    ) {
        Long userId = customUserDetails != null ? customUserDetails.getUserId() : null;
        SheetLikeResponse response = sheetService.toggleLike(userId, sheetId);
        return ResponseEntity.ok(ApiResponse.success("좋아요 상태가 변경되었습니다.", response));
    }
}
