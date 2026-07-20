package com.example.starter.domain.auth.entity;

import java.util.Locale;

import com.example.starter.global.exception.BusinessException;
import com.example.starter.global.exception.ErrorCode;

public enum OAuthProvider {
	KAKAO;

	public static OAuthProvider fromRegistrationId(String registrationId) {
		try {
			return valueOf(registrationId.toUpperCase(Locale.ROOT));
		} catch (IllegalArgumentException | NullPointerException exception) {
			throw new BusinessException(ErrorCode.OAUTH_LOGIN_FAILED);
		}
	}
}
