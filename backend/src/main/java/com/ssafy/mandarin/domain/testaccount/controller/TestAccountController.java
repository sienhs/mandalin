package com.ssafy.mandarin.domain.testaccount.controller;

import java.util.List;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.dto.LoginResponse;
import com.ssafy.mandarin.domain.auth.service.AuthService;
import com.ssafy.mandarin.domain.testaccount.dto.TestAccountResponse;
import com.ssafy.mandarin.domain.testaccount.dto.TestLoginRequest;
import com.ssafy.mandarin.domain.testaccount.service.TestAccountService;
import com.ssafy.mandarin.global.response.ApiResponse;
import com.ssafy.mandarin.global.security.RefreshTokenCookie;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

/**
 * 테스트 계정 전용 로그인 통로.
 *
 * <p>카카오 로그인과 <b>같은 자리에서 갈라진다</b>. 카카오는
 * {@code OAuth2LoginSuccessHandler} → 1회용 code → {@code /api/auth/oauth/exchange} 를 지나
 * {@code AuthService.loginWithOAuth} 에 닿는데, 여기서는 앞의 두 단계만 건너뛰고 같은 메서드를
 * 부른다. 그래서 액세스 토큰·리프레시 쿠키·기기 세션이 실제 사용자와 동일하다 — 이 계정으로
 * 확인한 화면이 실제 사용자의 화면과 같다고 말할 수 있는 근거다.
 *
 * <p>{@code app.test-login.enabled=false} 면 이 컨트롤러 자체가 등록되지 않아 404 가 된다.
 * 프론트는 계정 목록 조회가 실패하면 입구를 그리지 않는다.
 *
 * <p><b>정식 서비스 전에 반드시 끈다.</b> 인증 없이 특정 계정으로 들어올 수 있는 통로다.
 */
@RestController
@RequestMapping("/api/auth/test")
@ConditionalOnProperty(name = "app.test-login.enabled", havingValue = "true")
@RequiredArgsConstructor
@Tag(name = "TestAccount", description = "테스트 계정 로그인 (정식 서비스 전 제거 대상)")
public class TestAccountController {

	private final TestAccountService testAccountService;
	private final AuthService authService;
	private final RefreshTokenCookie refreshTokenCookie;

	@GetMapping("/accounts")
	@Operation(
			summary = "[테스트] 테스트 계정 목록",
			description = "로그인 화면이 입구를 그릴 때 쓴다. 이 호출로 계정이 만들어지지는 않는다."
	)
	public ResponseEntity<ApiResponse<List<TestAccountResponse>>> accounts() {
		return ResponseEntity.ok(ApiResponse.success("테스트 계정 목록", testAccountService.accounts()));
	}

	@PostMapping("/login")
	@Operation(
			summary = "[테스트] 테스트 계정으로 로그인",
			description = "처음 호출하면 계정 세 개를 만들고 만다라트·건물·친구 관계를 심는다. "
					+ "두 번째부터는 심지 않고 로그인만 한다."
	)
	public ResponseEntity<ApiResponse<LoginResponse>> login(
			@RequestBody @Valid TestLoginRequest request,
			HttpServletResponse response
	) {
		Long userId = testAccountService.prepareAndGetUserId(request.slot());
		LoginResponse loginResponse = authService.loginWithOAuth(userId);
		// 카카오 경로와 같다 — refreshToken 은 본문에 실리지 않고 쿠키로만 나간다.
		refreshTokenCookie.set(response, loginResponse.refreshToken());

		return ResponseEntity.ok(ApiResponse.success("테스트 계정 로그인 성공", loginResponse));
	}
}
