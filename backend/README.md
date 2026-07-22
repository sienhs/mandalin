# Mandarin Backend

Spring Boot 4 + Spring Security + JPA + JWT + OAuth2(Kakao) 기반 백엔드입니다.
[backend-starter](https://github.com/sienhs/backend-starter)에서 이식되었으며, 인증 도메인은 구현되어 있고 비즈니스 도메인(만다라트/마을/방 등)부터 개발을 시작하면 됩니다.

---

## 1. 스택

| 항목 | 버전 / 선택 |
|---|---|
| Java | 21 (toolchain) |
| Spring Boot | 4.0.6 |
| DB | PostgreSQL + Flyway 마이그레이션 |
| ORM | Spring Data JPA (Hibernate) + QueryDSL 5.1.0 |
| 인증 | JWT(jjwt 0.12.6) + OAuth2 Client(Kakao) |
| 문서 | springdoc-openapi 3.0.3 (Swagger UI) |
| JSON | Jackson 3. Boot 4부터 패키지가 `tools.jackson.databind` 로 변경되었습니다 |

## 2. 빠른 시작

```bash
cp .env.example .env
```

`.env` 에서 다음 두 항목은 반드시 설정해야 합니다.

| 변수 | 요구사항 |
|---|---|
| `JWT_SECRET` | 32자 이상. 미만이면 `WeakKeyException` 으로 기동에 실패합니다. `openssl rand -base64 48` 로 생성합니다 |
| `DB_PASS` | 기본값이 없습니다 |

```bash
# PostgreSQL
docker run -d --name mandarin-db -p 5432:5432 \
  -e POSTGRES_DB=mandarin -e POSTGRES_USER=mandarin_user -e POSTGRES_PASSWORD=change-me \
  postgres:16

# 실행. Flyway 가 마이그레이션을 자동 적용합니다
./gradlew bootRun
```

- Swagger UI: http://localhost:8080/swagger-ui.html (prod 프로파일에서는 비활성화됩니다)
- 프로덕션 실행은 `SPRING_PROFILES_ACTIVE=prod` 입니다. Swagger 비활성화, Secure 쿠키, `SameSite=None` 이 적용됩니다

## 3. 패키지 구조

```
com.ssafy.mandarin
├── MandarinApplication.java       @EnableJpaAuditing, @EnableScheduling
├── domain/
│   └── auth/
│       ├── controller/   AuthController, UserAccountController
│       ├── dto/          LoginResponse, OAuthCodeExchangeRequest, ProfileUpdateRequest
│       ├── entity/       User, RefreshToken, OAuthIdentity, OAuthProvider
│       ├── repository/   UserRepository, RefreshTokenRepository, OAuthIdentityRepository
│       └── service/      AuthService, OAuthLoginService, UserAccountService,
│                         CustomUserDetailService, OAuthAuthorizationCodeStore
└── global/
    ├── config/     SecurityConfig, CorsConfig, OpenApiConfig
    ├── entity/     BaseEntity (createdAt / updatedAt 자동 감사)
    ├── exception/  BusinessException, ErrorCode, GlobalExceptionHandler
    ├── response/   ApiResponse<T>
    └── security/   JwtFilter, JwtUtil, RefreshTokenCookie,
                    OAuth2Login{Success,Failure}Handler,
                    RestAuthenticationEntryPoint, RestAccessDeniedHandler
```

새 도메인은 `domain/<name>/{controller,dto,entity,repository,service}` 로 동일한 구조를 복제합니다.

## 4. 인증 흐름

```
브라우저 → GET /oauth2/authorization/kakao
        → 카카오 로그인
        → GET /login/oauth2/code/kakao  (Spring Security 처리)
        → OAuth2LoginSuccessHandler
             ├ OAuthLoginService.resolveUser()      : identity 조회 또는 유저 생성
             └ OAuthAuthorizationCodeStore.issue()  : 1회용 코드(64자 hex, TTL 60초)
        → 302 {FRONTEND}/oauth/callback?code=xxx

프론트 → POST /api/auth/oauth/exchange {code}
        → 액세스 토큰(30분)은 응답 body
        → 리프레시 토큰(7일)은 HttpOnly 쿠키, DB에는 SHA-256 해시로 저장

이후    → Authorization: Bearer <accessToken>
        → 만료 시 POST /api/auth/reissue (쿠키 자동 전송) → 새 액세스 토큰
```

### 엔드포인트

| Method | Path | 인증 | 설명 |
|---|---|---|---|
| POST | `/api/auth/oauth/exchange` | 불필요 | 1회용 코드를 토큰으로 교환 |
| POST | `/api/auth/reissue` | 쿠키 | 액세스 토큰 재발급 |
| POST | `/api/auth/logout` | 필요 | 리프레시 토큰 폐기 및 쿠키 삭제 |
| PATCH | `/api/users/me` | 필요 | 닉네임 변경 |
| DELETE | `/api/users/me` | 필요 | 회원 탈퇴 |

## 5. 개발 규칙

### 스키마는 마이그레이션이 우선입니다

`ddl-auto=validate` 설정이므로 엔티티만 수정하면 기동에 실패합니다.
`src/main/resources/db/migration/V2__*.sql` 을 먼저 작성한 뒤 엔티티를 맞춥니다.

### 응답과 예외

- 컨트롤러는 `ApiResponse<T>` 를 반환합니다 (`success` / `fail`)
- 예외는 `throw new BusinessException(ErrorCode.X)` 로 던집니다. `GlobalExceptionHandler` 가 상태 코드까지 처리합니다
- 새로운 에러는 `ErrorCode` enum 에 추가합니다

### 인증된 유저 조회

```java
@AuthenticationPrincipal UserDetails userDetails   // getUsername() 은 이메일입니다. 유저 ID가 아닙니다
```

### 보안 설정

`SecurityConfig` 는 `anyRequest().authenticated()` 이므로, 공개 엔드포인트만 명시적으로 추가합니다.

### 토큰

액세스 토큰과 리프레시 토큰은 `tokenType` 클레임으로 구분합니다.
검증에는 `JwtUtil.isAccessToken()` 또는 `isRefreshToken()` 을 사용하며, 타입을 확인하지 않는 검증 메서드는 추가하지 않습니다.

### 리프레시 쿠키

발급, 삭제, 조회는 모두 `RefreshTokenCookie` 컴포넌트를 경유합니다.
쿠키 속성이 한 곳에 모여 있어야 발급과 삭제의 경로가 일치합니다.

### 이메일

`users.email` 은 로그인 식별자입니다. 저장 시 소문자로 정규화하고, 조회 메서드는 하나로 통일합니다.

### 엔티티

`BaseEntity` 를 상속하면 `createdAt` 과 `updatedAt` 이 자동으로 관리됩니다.

## 6. 다음 할 일

### 0단계 · 선행 결정

아래 세 가지는 스키마와 인프라 구성을 좌우하므로, 코드 작성 전에 결정하는 것을 권장합니다.

- [ ] **로컬 이메일/비밀번호 로그인 지원 여부**
  현재는 소셜 로그인만 동작합니다. `User.password` 필드, `PasswordEncoder` 빈, `INVALID_CREDENTIALS` · `DUPLICATE_EMAIL` · `TOO_MANY_LOGIN_ATTEMPTS` 에러 코드는 정의만 되어 있는 상태입니다.
  - 소셜 로그인만 사용: 위 요소를 제거하여 구조를 단순화
  - 양쪽 모두 사용: 회원가입 및 로그인 엔드포인트, 로그인 실패 rate limit, 비밀번호 재설정 흐름 추가
- [ ] **운영 인스턴스 수**
  `OAuthAuthorizationCodeStore` 는 in-memory 이며, OAuth 인가 상태는 톰캣 로컬 세션에 저장됩니다. 단일 인스턴스라면 현행 유지가 가능하고, 2대 이상이라면 Redis 도입이 필요합니다 (`spring-session-data-redis` 및 코드 저장소 이전).
- [ ] **권한(Role) 도입 여부**
  현재 모든 유저에게 `ROLE_USER` 가 고정 부여되며 `users` 에 role 컬럼이 없습니다. 관리자 기능 계획이 있다면 초기에 반영하는 편이 비용이 적습니다.

### 1단계 · 테스트 기반 구축

`src/test` 가 비어 있습니다. 이후 작성될 테스트의 기준이 되므로 우선 진행합니다.
테스트 의존성(`spring-boot-starter-*-test`)은 이미 포함되어 있습니다.

- [ ] `JwtUtilTest` — 발급, 검증, 만료, 변조 및 액세스/리프레시 토큰의 교차 사용 차단
- [ ] `AuthControllerTest` — `@WebMvcTest` 와 `@WithMockUser` 로 인가 규칙 및 `Set-Cookie` 속성 검증
- [ ] `OAuthLoginServiceTest` — 신규 가입, 기존 identity 연결, 탈퇴 후 재가입
- [ ] Testcontainers(PostgreSQL) 도입 — Flyway 마이그레이션까지 CI에서 검증

### 2단계 · 스키마 확정 (`V2__*.sql`)

0단계의 결정을 반영하여 한 번에 마이그레이션합니다. 스타터가 여러 프로젝트에 이식된 이후에는 변경 비용이 커집니다.

- [ ] `refresh_token` 의 키를 `email` 에서 `user_id` FK 로 변경
  — 이메일 변경 기능이 추가되면 기존 방식에서는 토큰이 유실됩니다
- [ ] `refresh_token` 의 UNIQUE 해제 및 디바이스 식별자 추가 — 다중 기기 로그인 지원
  — 현재는 유저당 토큰이 하나이므로, PC에서 로그인하면 모바일 세션이 종료됩니다
- [ ] `refresh_token.token` 인덱스 추가 — `findByToken` 이 전체 스캔으로 동작합니다
- [ ] `users` 의 이메일 소문자 정규화 및 `lower(email)` UNIQUE 인덱스 추가
- [ ] (결정 시) `users.role` 추가 또는 `users.password` 제거

### 3단계 · 개발 및 운영 환경

- [ ] `docker-compose.yml` 작성 (PostgreSQL, 필요 시 Redis)
- [ ] actuator 추가 및 `/actuator/health` permitAll — 대부분의 배포 플랫폼이 헬스체크를 요구합니다
- [ ] `.env.example` 을 yml 의 전체 변수와 동기화
  — `SERVER_PORT`, `JPA_SHOW_SQL`, `JPA_DDL_AUTO`, `SWAGGER_ENABLED` 가 누락되어 있습니다
- [ ] traceId MDC 필터 추가 — 장애 분석 시 로그를 요청 단위로 추적하기 위함입니다
- [ ] `ApiResponse` 에 `code` 필드 추가 — 프론트엔드 연동 전에 진행합니다
  — 현재는 에러 메시지 문자열로만 구분이 가능하여, 메시지 수정이 클라이언트에 영향을 줍니다

### 4단계 · 인증 강화

- [ ] 리프레시 토큰 회전 및 재사용 탐지
  — 재발급 시 리프레시 토큰도 갱신하고, 사용된 토큰이 재차 요청되면 해당 유저의 전체 세션을 무효화합니다
- [ ] `AccessDeniedException` 핸들러 추가 — `@EnableMethodSecurity` 및 `@PreAuthorize` 도입과 함께 진행합니다
  — `GlobalExceptionHandler` 의 `Exception.class` 핸들러가 먼저 처리하여 403이 500으로 반환됩니다
- [ ] `CorsConfig` 의 origin 파싱에 `trim()` 적용
  — `CORS_ALLOWED_ORIGINS` 값의 쉼표 뒤에 공백이 있으면 매칭에 실패합니다
- [ ] 로그아웃을 `permitAll` 및 쿠키 기준으로 변경하는 방안 검토
  — 현재는 액세스 토큰 만료 시 로그아웃이 불가능하여 서버에 리프레시 토큰이 잔존합니다
- [ ] 탈퇴 유저 하드 삭제 배치 — 개인정보 보관 정책 확정 후 진행합니다

### 5단계 · 첫 비즈니스 도메인

1. `domain/<name>/` 하위에 5개 패키지를 복제합니다
2. `V3__create_<name>.sql` 을 먼저 작성한 뒤 엔티티를 정의합니다
3. 5절 「개발 규칙」에 따라 컨트롤러와 서비스를 작성합니다

## 7. 이식 체크리스트

- [x] `settings.gradle` 의 `rootProject.name`, `build.gradle` 의 `group`, 패키지명 `com.example.starter` 일괄 변경 — `mandarin` / `com.ssafy` / `com.ssafy.mandarin` 으로 변경 완료
- [ ] `JWT_SECRET` 신규 생성 — 32자 이상, 프로젝트 간 재사용 금지 (`infra/.env` 발급 시 진행)
- [ ] `CORS_ALLOWED_ORIGINS` 및 `FRONTEND_BASE_URL` 을 실제 프론트엔드 주소로 설정 (Vercel 배포 주소 확정 후 `infra/.env` 반영)
- [ ] 카카오 개발자 콘솔에 Redirect URI 등록 — `{BASE_URL}/login/oauth2/code/kakao`
- [x] 프론트엔드와 백엔드의 도메인이 다른 경우 HTTPS 및 `SameSite=None` 설정, 클라이언트 fetch 에 `credentials: 'include'` 적용 — `infra/nginx`, `auth.refresh-cookie-same-site`, `frontend/src/api.ts` 참고
- [x] `.env` 의 `.gitignore` 포함 여부 확인 — 기본 포함되어 있습니다
