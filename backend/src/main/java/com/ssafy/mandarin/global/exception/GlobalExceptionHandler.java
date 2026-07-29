package com.ssafy.mandarin.global.exception;

import com.ssafy.mandarin.global.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
		log.warn("BusinessException: {}", e.getMessage());
		return ResponseEntity
				.status(e.getErrorCode().getStatus())
				.body(ApiResponse.fail(e.getMessage()));
	}

	@ExceptionHandler({
			MethodArgumentTypeMismatchException.class,
			HttpMessageNotReadableException.class,
			ServletRequestBindingException.class
	})
	public ResponseEntity<ApiResponse<Void>> handleMalformedRequest(Exception e) {
		log.warn("Malformed request: {}", e.getMessage());
		return ResponseEntity.badRequest().body(ApiResponse.fail(ErrorCode.INVALID_INPUT.getMessage()));
	}

	/**
	 * 인가 실패는 403 이다. 이 핸들러가 없으면 아래 Exception 핸들러가 먼저 잡아 500 으로 나간다.
	 */
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException e) {
		log.warn("AccessDenied: {}", e.getMessage());
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(ApiResponse.fail("Access is denied."));
	}

	@ExceptionHandler(NoResourceFoundException.class)
	public ResponseEntity<ApiResponse<Void>> handleNoResourceFound(NoResourceFoundException e) {
		log.warn("Resource not found: {}", e.getResourcePath());
		return ResponseEntity.status(ErrorCode.NOT_FOUND.getStatus())
				.body(ApiResponse.fail(ErrorCode.NOT_FOUND.getMessage()));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException e) {
		String message = e.getBindingResult()
				.getFieldErrors()
				.stream()
				.map(error -> error.getField() + ": " + error.getDefaultMessage())
				.findFirst()
				.orElse(ErrorCode.INVALID_INPUT.getMessage());

		log.warn("ValidationException: {}", message);
		return ResponseEntity.badRequest().body(ApiResponse.fail(message));
	}

	@ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
	public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(org.springframework.dao.DataIntegrityViolationException e) {
		log.warn("DataIntegrityViolationException: {}", e.getMessage());
		return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT)
				.body(ApiResponse.fail("Data integrity error (duplicate or constraint violation)."));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
		log.error("Unexpected Exception: ", e);
		return ResponseEntity.internalServerError().body(ApiResponse.fail(ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
	}
}
