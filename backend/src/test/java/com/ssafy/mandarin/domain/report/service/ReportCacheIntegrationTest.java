package com.ssafy.mandarin.domain.report.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIf;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.ssafy.mandarin.domain.report.dto.WeeklyReportResponse;
import com.ssafy.mandarin.domain.sheet.repository.DomainRepository;
import com.ssafy.mandarin.domain.subject.repository.SubjectLogRepository;
import com.ssafy.mandarin.domain.subject.repository.SubjectRepository;
import com.ssafy.mandarin.domain.sheet.repository.SheetRepository;
import com.ssafy.mandarin.global.config.RedisConfig;

import tools.jackson.databind.json.JsonMapper;

// 실제 Redis 왕복을 확인한다. 접속이 안 되면 통째로 건너뛴다.
@ExtendWith(SpringExtension.class)
@ContextConfiguration(classes = {RedisConfig.class, ReportCacheIntegrationTest.TestRedisConnection.class})
@EnabledIf("redisAvailable")
class ReportCacheIntegrationTest {

	// application.yml 과 같은 환경변수·기본값을 쓴다
	private static final String HOST = System.getenv().getOrDefault("REDIS_HOST", "localhost");
	private static final int PORT = Integer.parseInt(System.getenv().getOrDefault("REDIS_PORT", "6379"));

	// 부트 자동설정 없이 도는 컨텍스트라 커넥션 팩토리는 여기서 준다
	@Configuration
	static class TestRedisConnection {
		@Bean
		RedisConnectionFactory redisConnectionFactory() {
			return new LettuceConnectionFactory(HOST, PORT);
		}
	}

	private static final Long USER_ID = 9_999_001L;

	private static final String GEMINI_RESPONSE = """
			{
			  "title": "꾸준함이 빛난 한 주",
			  "summary": "지난주에는 과제를 성실히 수행했습니다.",
			  "strength": ["매일 기록을 남겼습니다", "포인트를 꾸준히 모았습니다"],
			  "weakness": ["독서 도메인이 비어 있습니다"]
			}
			""";

	@Autowired
	private RedisTemplate<String, Object> redisTemplate;

	private ReportService reportService;

	static boolean redisAvailable() {
		try (Socket socket = new Socket()) {
			socket.connect(new InetSocketAddress(HOST, PORT), 500);
			return true;
		} catch (IOException e) {
			return false;
		}
	}

	@BeforeEach
	void setUp() {
		SubjectLogRepository subjectLogRepository = mock(SubjectLogRepository.class);
		SubjectRepository subjectRepository = mock(SubjectRepository.class);
		SheetRepository sheetRepository = mock(SheetRepository.class);
		DomainRepository domainRepository = mock(DomainRepository.class);
		GeminiService geminiService = mock(GeminiService.class);

		when(subjectLogRepository.findWeeklyLogsByUserId(anyLong(), any(), any())).thenReturn(List.of());
		when(sheetRepository.findByUserIdOrderByCreatedAtDesc(anyLong())).thenReturn(List.of());
		when(geminiService.generateJson(any())).thenReturn(GEMINI_RESPONSE);

		reportService = new ReportService(
				subjectLogRepository,
				subjectRepository,
				sheetRepository,
				domainRepository,
				redisTemplate,
				geminiService,
				JsonMapper.builder().build()
		);

		redisTemplate.delete(cacheKey());
	}

	@AfterEach
	void tearDown() {
		redisTemplate.delete(cacheKey());
	}

	@Test
	@DisplayName("생성 전에는 캐시가 비어 있어 null 을 반환한다")
	void returnsNullWhenNotGenerated() {
		assertThat(reportService.getWeeklyReport(USER_ID)).isNull();
	}

	@Test
	@DisplayName("생성한 레포트를 Redis 에서 그대로 다시 읽어 온다")
	void readsBackGeneratedReport() {
		WeeklyReportResponse created = reportService.createWeeklyReport(USER_ID);
		WeeklyReportResponse cached = reportService.getWeeklyReport(USER_ID);

		assertThat(cached).isEqualTo(created);
		assertThat(cached.title()).isEqualTo("꾸준함이 빛난 한 주");
		assertThat(cached.strengths()).containsExactly("매일 기록을 남겼습니다", "포인트를 꾸준히 모았습니다");
		assertThat(cached.improvements()).containsExactly("독서 도메인이 비어 있습니다");
		assertThat(cached.metrics()).extracting("label", "value")
				.containsExactly(tuple("주간 달성률", "0%"), tuple("수행 횟수", "0회"));
		assertThat(cached.sheets()).isEmpty();
	}

	@Test
	@DisplayName("TTL 이 다음 주 월요일 00:00 에 맞춰 걸린다")
	void expiresAtNextMonday() {
		reportService.createWeeklyReport(USER_ID);

		Long actual = redisTemplate.getExpire(cacheKey(), TimeUnit.SECONDS);

		LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Seoul"));
		long expected = Duration.between(
				now,
				now.toLocalDate().with(TemporalAdjusters.next(DayOfWeek.MONDAY)).atStartOfDay()
		).getSeconds();

		assertThat(actual).isNotNull();
		assertThat(actual).isCloseTo(expected, org.assertj.core.data.Offset.offset(5L));
		assertThat(actual).isLessThanOrEqualTo(Duration.ofDays(7).getSeconds());
	}

	private String cacheKey() {
		LocalDate monday = LocalDate.now(ZoneId.of("Asia/Seoul")).minusWeeks(1)
				.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
		return "report:weekly:" + USER_ID + ":" + monday;
	}
}
