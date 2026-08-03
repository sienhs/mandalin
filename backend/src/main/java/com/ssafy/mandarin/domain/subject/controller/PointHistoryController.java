package com.ssafy.mandarin.domain.subject.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.subject.dto.PointHistoryResponse;
import com.ssafy.mandarin.domain.subject.entity.SubjectLog;
import com.ssafy.mandarin.domain.subject.repository.SubjectLogRepository;
import com.ssafy.mandarin.domain.user.entity.User;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 포인트 적립 내역.
 *
 * <p>포인트가 늘어나는 경로가 과제 수행 하나뿐이라 수행 이력(subject_log)이 곧 적립 이력이다.
 * 별도 테이블을 두지 않았다.
 */
@RestController
@RequestMapping("/api/v1/users/me")
@RequiredArgsConstructor
@Tag(name = "Point", description = "포인트 적립 내역 API")
public class PointHistoryController {

    private static final int MAX_PAGE_SIZE = 100;

    private final SubjectLogRepository subjectLogRepository;
    private final UserRepository userRepository;

    @GetMapping("/point-history")
    @Operation(
            summary = "포인트 적립 내역",
            description = "언제 무엇을 해서 포인트를 받았는지 최신순으로 보여줍니다. "
                    + "구매로 차감된 내역은 포함되지 않습니다(구매 이력 테이블이 없습니다)."
    )
    public ResponseEntity<ApiResponse<PointHistoryResponse>> getPointHistory(
            @AuthenticationPrincipal CustomUserDetails customUserDetails,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Long userId = customUserDetails != null ? customUserDetails.getUserId() : null;
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Page<SubjectLog> logs = subjectLogRepository.findPointHistory(
                userId, PageRequest.of(page, Math.min(size, MAX_PAGE_SIZE)));

        PointHistoryResponse response = new PointHistoryResponse(
                user.getPoint(),
                logs.getTotalPages(),
                logs.getTotalElements(),
                logs.getContent().stream().map(PointHistoryResponse.Item::from).toList());

        return ResponseEntity.ok(ApiResponse.success("포인트 내역 조회 성공", response));
    }
}
