package com.example.starter.global.exception;

import com.example.starter.global.response.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
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

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
		log.error("Unexpected Exception: ", e);
		return ResponseEntity.internalServerError().body(ApiResponse.fail(ErrorCode.INTERNAL_SERVER_ERROR.getMessage()));
	}
}
