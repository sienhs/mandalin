package com.ssafy.mandarin.domain.report.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.serializer.GenericJacksonJsonRedisSerializer;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

// 레포트는 Redis 에 캐시되므로 record 가 RedisConfig 의 직렬화기로 왕복되어야 한다.
class WeeklyReportResponseSerializationTest {

	private final GenericJacksonJsonRedisSerializer serializer = GenericJacksonJsonRedisSerializer.builder().build();
	private final ObjectMapper objectMapper = JsonMapper.builder().build();

	@Test
	@DisplayName("Redis 직렬화기로 저장한 레포트를 그대로 복원한다")
	void roundTrip() {
		WeeklyReportResponse report = new WeeklyReportResponse(
				"꾸준함이 빛난 한 주",
				"지난주에는 12건의 과제를 완료했습니다.",
				List.of(new ReportMetricContent("주간 달성률", "34%"), new ReportMetricContent("수행 횟수", "100회")),
				List.of("운동 도메인을 매일 수행했습니다"),
				List.of("독서 도메인이 비어 있습니다"),
				List.of(new SheetAnalyzeContent(1L, "2026 상반기 목표", 100, 296, 34,
						List.of(new DomainAnalyzeContent("운동", 90), new DomainAnalyzeContent("독서", 0))))
		);

		Object restored = serializer.deserialize(serializer.serialize(report));

		assertThat(objectMapper.convertValue(restored, WeeklyReportResponse.class)).isEqualTo(report);
	}
}
