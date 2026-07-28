package com.ssafy.mandarin.domain.auth.dto;

/**
 * 재발급 결과 — 서비스 내부 전달용.
 *
 * <p>리프레시 토큰을 회전시키므로 액세스 토큰과 함께 새 리프레시 토큰도 나온다.
 * 컨트롤러가 후자를 쿠키로 다시 심어야 하며, 응답 본문에는 액세스 토큰만 실린다.
 */
public record ReissuedTokens(String accessToken, String refreshToken) {
}
