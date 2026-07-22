package com.example.starter.global.response;

import lombok.Getter;

@Getter
public class ApiResponse<T> {
	private final boolean success;
	private final String message;
	private final T data;

	public ApiResponse(boolean success, String message, T data) {
		this.success = success;
		this.message = message;
		this.data = data;
	}

	public static <T> ApiResponse<T> success(String message, T data) {
		return new ApiResponse<>(true, message, data);
	}

	public static <T> ApiResponse<T> success(String message) {
		return new ApiResponse<>(true, message, null);
	}

	public static <T> ApiResponse<T> fail(String message) {
		return new ApiResponse<>(false, message, null);
	}
}
