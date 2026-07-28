package com.ssafy.mandarin.domain.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.repository.UserRepository;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;
import com.ssafy.mandarin.global.response.ApiResponse;
import com.ssafy.mandarin.global.security.JwtUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

/**
 * 개발/테스트 전용 컨트롤러 — 프로덕션 배포 전 반드시 삭제하거나 비활성화할 것
 *
 * 특정 UUID에 해당하는 사용자의 JWT Access Token을 즉시 발급합니다.
 * Swagger UI에서 토큰을 발급받아 인증이 필요한 API를 테스트할 수 있습니다.
 */
@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
@Tag(name = "[DEV] Test Auth", description = "개발 전용 — 테스트 토큰 발급 (프로덕션 사용 금지)")
public class TestAuthController {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    /**
     * 사용 가능한 더미 UUID:
     * - 유저A: test-uuid-user-aaaa
     * - 유저B: test-uuid-user-bbbb
     * - 유저C: test-uuid-user-cccc
     */
    @GetMapping("/token")
    @Operation(summary = "[DEV] Issue test token by UUID", description = "입력한 UUID의 유저가 존재하면 JWT Access Token을 즉시 발급합니다.<br>"
            +
            "더미 UUID: <code>test-uuid-user-aaaa</code> / <code>test-uuid-user-bbbb</code> / <code>test-uuid-user-cccc</code>")
    public ResponseEntity<ApiResponse<TestTokenResponse>> issueTestToken(
            @RequestParam String uuid) {
        userRepository.findByUuid(uuid)
                .filter(user -> !user.isWithdrawn())
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        String accessToken = jwtUtil.generateAccessToken(uuid);

        return ResponseEntity.ok(ApiResponse.success("Test token issued",
                new TestTokenResponse(uuid, accessToken)));
    }

    public record TestTokenResponse(
            String uuid,
            String accessToken) {
    }
}
