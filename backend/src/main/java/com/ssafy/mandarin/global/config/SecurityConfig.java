package com.ssafy.mandarin.global.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.oauth2.core.endpoint.PkceParameterNames;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.util.UriComponentsBuilder;

import com.ssafy.mandarin.global.security.JwtFilter;
import com.ssafy.mandarin.global.security.OAuth2LoginFailureHandler;
import com.ssafy.mandarin.global.security.OAuth2LoginSuccessHandler;
import com.ssafy.mandarin.global.security.RestAccessDeniedHandler;
import com.ssafy.mandarin.global.security.RestAuthenticationEntryPoint;

import jakarta.servlet.http.HttpServletRequest;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	private final JwtFilter jwtFilter;
	private final CorsConfigurationSource corsConfigurationSource;
	private final RestAuthenticationEntryPoint authenticationEntryPoint;
	private final RestAccessDeniedHandler accessDeniedHandler;
	private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
	private final OAuth2LoginFailureHandler oAuth2LoginFailureHandler;
	private final ClientRegistrationRepository clientRegistrationRepository;

	public SecurityConfig(
			JwtFilter jwtFilter,
			@Qualifier("corsConfigurationSource") CorsConfigurationSource corsConfigurationSource,
			RestAuthenticationEntryPoint authenticationEntryPoint,
			RestAccessDeniedHandler accessDeniedHandler,
			OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler,
			OAuth2LoginFailureHandler oAuth2LoginFailureHandler,
			ClientRegistrationRepository clientRegistrationRepository
	) {
		this.jwtFilter = jwtFilter;
		this.corsConfigurationSource = corsConfigurationSource;
		this.authenticationEntryPoint = authenticationEntryPoint;
		this.accessDeniedHandler = accessDeniedHandler;
		this.oAuth2LoginSuccessHandler = oAuth2LoginSuccessHandler;
		this.oAuth2LoginFailureHandler = oAuth2LoginFailureHandler;
		this.clientRegistrationRepository = clientRegistrationRepository;
	}

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http
				.cors(cors -> cors.configurationSource(corsConfigurationSource))
				.csrf(AbstractHttpConfigurer::disable)
				.formLogin(AbstractHttpConfigurer::disable)
				.httpBasic(AbstractHttpConfigurer::disable)
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(
								"/api/v1/auth/reissue", "/api/v1/auth/oauth/exchange",
								"/oauth2/**", "/login/oauth2/**",
								"/api/v1/test/**")
						.permitAll()
						.requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/v3/api-docs.yaml").permitAll()
						.anyRequest().authenticated())
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint(authenticationEntryPoint)
						.accessDeniedHandler(accessDeniedHandler))
				.oauth2Login(oauth -> oauth
						.authorizationEndpoint(authorization -> authorization
								.authorizationRequestResolver(oAuth2AuthorizationRequestResolver()))
						.successHandler(oAuth2LoginSuccessHandler)
						.failureHandler(oAuth2LoginFailureHandler))
				.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	private OAuth2AuthorizationRequestResolver oAuth2AuthorizationRequestResolver() {
		DefaultOAuth2AuthorizationRequestResolver resolver = new DefaultOAuth2AuthorizationRequestResolver(
				clientRegistrationRepository,
				"/oauth2/authorization"
		);
		resolver.setAuthorizationRequestCustomizer(builder -> {
			builder.attributes(attributes -> attributes.remove(PkceParameterNames.CODE_VERIFIER));
			builder.additionalParameters(parameters -> {
				parameters.remove(PkceParameterNames.CODE_CHALLENGE);
				parameters.remove(PkceParameterNames.CODE_CHALLENGE_METHOD);
			});
		});
		return new OAuth2AuthorizationRequestResolver() {
			@Override
			public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
				return customizeKakaoRequest(resolver.resolve(request));
			}

			@Override
			public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
				return customizeKakaoRequest(resolver.resolve(request, clientRegistrationId));
			}
		};
	}

	private OAuth2AuthorizationRequest customizeKakaoRequest(OAuth2AuthorizationRequest request) {
		if (request == null || !request.getAuthorizationRequestUri().contains("kauth.kakao.com")) {
			return request;
		}
		String authorizationRequestUri = UriComponentsBuilder
				.fromUriString(request.getAuthorizationRequestUri())
				.replaceQueryParam("scope", "profile_nickname")
				.build()
				.toUriString();
		return OAuth2AuthorizationRequest.from(request)
				.authorizationRequestUri(authorizationRequestUri)
				.build();
	}

	@Bean
	public static PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}
