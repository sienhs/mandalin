package com.ssafy.mandarin.global.exception;

import org.springframework.http.HttpStatus;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

	INVALID_CREDENTIALS(HttpStatus.UNAUTHORIZED, "Invalid email or password."),
	INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "Invalid token."),
	EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "Token has expired."),
	UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Authentication is required."),
	DUPLICATE_EMAIL(HttpStatus.CONFLICT, "Email is already in use."),
	TOO_MANY_LOGIN_ATTEMPTS(HttpStatus.TOO_MANY_REQUESTS, "Too many login attempts. Try again later."),
	OAUTH_LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "Social login failed."),
	OAUTH_CODE_INVALID(HttpStatus.UNAUTHORIZED, "Social login code has expired or is invalid."),

	NOT_FOUND(HttpStatus.NOT_FOUND, "Requested resource was not found."),
	INVALID_INPUT(HttpStatus.BAD_REQUEST, "Invalid input."),
	INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "An internal server error occurred."),

	USER_NOT_FOUND(HttpStatus.NOT_FOUND, "User not found."),

	// Friend
	FRIEND_REQUEST_ALREADY_SENT(HttpStatus.CONFLICT, "Friend request already sent."),
	FRIEND_REQUEST_NOT_FOUND(HttpStatus.NOT_FOUND, "Friend request not found."),
	ALREADY_FRIEND(HttpStatus.CONFLICT, "Already friends."),
	CANNOT_REQUEST_YOURSELF(HttpStatus.BAD_REQUEST, "Cannot send friend request to yourself."),
	FRIEND_NOT_FOUND(HttpStatus.NOT_FOUND, "Friend relationship not found.");

	private final HttpStatus status;
	private final String message;
}
