package com.ssafy.mandarin.global.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

	@Value("${cors.allowed-origins}")
	private String allowedOrigins;

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();

		// 쉼표 뒤 공백이 섞이면 origin 매칭이 조용히 실패한다 — 값을 다듬어서 넣는다.
		config.setAllowedOrigins(Arrays.stream(allowedOrigins.split(","))
				.map(String::trim)
				.filter(origin -> !origin.isEmpty())
				.toList());

		config.setAllowedMethods(List.of(
				"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
		));

		config.setAllowedHeaders(List.of(
				"Authorization",
				"Content-Type"
		));

		config.setAllowCredentials(true);
		config.setExposedHeaders(List.of("Authorization"));
		config.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);

		return source;
	}
}
