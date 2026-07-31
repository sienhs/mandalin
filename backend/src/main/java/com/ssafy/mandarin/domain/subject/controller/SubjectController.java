package com.ssafy.mandarin.domain.subject.controller;

import java.util.List;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.subject.dto.SubjectCompleteRequest;
import com.ssafy.mandarin.domain.subject.dto.SubjectCompleteResponse;
import com.ssafy.mandarin.domain.subject.dto.TodoListResponse;
import com.ssafy.mandarin.domain.subject.service.SubjectService;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Subject", description = "세부 과제 및 To-do 관련 API")
@RestController
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    // '오늘의 할 일' 전체 To-do 리스트 조회 API
    @Operation(summary = "유저 전체 오늘의 할 일(DAILY 과제) 목록 조회", description = "유저가 보유한 모든 만다라트 시트의 매일 반복(DAILY) 과제 전체 목록 및 당일 수행 여부를 조회합니다.")
    @GetMapping("/api/v1/subjects/todo")
    public ResponseEntity<ApiResponse<List<TodoListResponse>>> getDailyTodoList(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<TodoListResponse> todoList = subjectService.getDailyTodoList(userDetails.getUserId());
        return ResponseEntity.ok(ApiResponse.success("오늘의 할 일 전체 목록 조회가 완료되었습니다.", todoList));
    }

    // 과제 수행 완료 API (단건 및 다중 일괄 처리 지원)
    @Operation(summary = "과제 수행 완료 처리 (단건/다중 지원)", description = "과제 수행 버튼 또는 To-do 리스트 체크 후 과제를 완료 처리하고 보상 포인트를 적립합니다.")
    @PatchMapping("/api/v1/sheets/{sheetId}/subjects/complete")
    public ResponseEntity<ApiResponse<SubjectCompleteResponse>> completeSubjects(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long sheetId,
            @RequestBody SubjectCompleteRequest request) {

        SubjectCompleteResponse response = subjectService.completeSubjects(userDetails.getUserId(), sheetId, request);
        return ResponseEntity.ok(ApiResponse.success("과제 수행 완료가 정상 처리되었습니다.", response));
    }
}
