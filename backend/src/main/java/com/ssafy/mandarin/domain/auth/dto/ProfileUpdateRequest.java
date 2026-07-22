package com.ssafy.mandarin.domain.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "Profile update request")
public record ProfileUpdateRequest(

		@Schema(description = "New display name", example = "Jane Doe")
		@NotBlank(message = "Name is required.")
		@Size(min = 1, max = 20, message = "Name must be 1-20 characters.")
		String name
) {
}
