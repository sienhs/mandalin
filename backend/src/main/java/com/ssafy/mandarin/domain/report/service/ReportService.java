package com.ssafy.mandarin.domain.report.service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.ssafy.mandarin.domain.report.dto.DomainAnalyzeContent;
import com.ssafy.mandarin.domain.report.dto.ReportMetricContent;
import com.ssafy.mandarin.domain.report.dto.WeeklyReportResponse;
import com.ssafy.mandarin.domain.sheet.entity.Domain;
import com.ssafy.mandarin.domain.sheet.entity.Sheet;
import com.ssafy.mandarin.domain.sheet.repository.DomainRepository;
import com.ssafy.mandarin.domain.sheet.repository.SheetRepository;
import com.ssafy.mandarin.domain.subject.entity.SubjectLog;
import com.ssafy.mandarin.domain.subject.repository.SubjectLogRepository;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final String REPORT_KEY_PREFIX = "report:weekly:";

    private final SubjectLogRepository subjectLogRepository;
    private final SheetRepository sheetRepository;
    private final DomainRepository domainRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public WeeklyReportResponse createWeeklyReport(Long userId) {
        LocalDate lastWeekDate = LocalDate.now().minusWeeks(1);
        LocalDate monday = lastWeekDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = lastWeekDate.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        // 한 주 실천 과제 가져오기
        List<SubjectLog> logs = subjectLogRepository.findWeeklyLogsByUserId(
                userId, monday.atStartOfDay(), sunday.atTime(LocalTime.MAX));

        List<Domain> domains = findLatestSheetDomains(userId);

        Map<Long, Long> completedByDomainId = logs.stream()
                .collect(Collectors.groupingBy(
                        log -> log.getSubject().getDomain().getId(),
                        Collectors.counting()));

        List<DomainAnalyzeContent> categories = domains.stream()
                .map(domain -> new DomainAnalyzeContent(
                        domain.getTitle(),
                        toRate(completedByDomainId.getOrDefault(domain.getId(), 0L), subjectCountOf(domain))))
                .toList();

        long totalSubjectCount = domains.stream().mapToLong(this::subjectCountOf).sum();
        int overallRate = toRate(logs.size(), totalSubjectCount);
        long earnedPoints = logs.stream().mapToLong(SubjectLog::getEarnedPoint).sum();

        // gemini 호출
        String prompt = buildPrompt(monday, sunday, logs.size(), earnedPoints, overallRate, categories);
        JsonNode analysis = requestAnalysis(prompt);

        List<ReportMetricContent> metrics = List.of(
                new ReportMetricContent("주간 달성률", overallRate + "%"),
                new ReportMetricContent("완료 과제", String.valueOf(logs.size()))
        );

        WeeklyReportResponse report = new WeeklyReportResponse(
                analysis.path("title").asString(""),
                analysis.path("summary").asString(""),
                metrics,
                toStringList(analysis.path("strength")),
                toStringList(analysis.path("weakness")),
                categories
        );

        redisTemplate.opsForValue().set(cacheKey(userId, monday), report, ttlUntilNextWeek());
        return report;
    }

    public WeeklyReportResponse getWeeklyReport(Long userId) {
        WeeklyReportResponse cached = findCachedReport(userId);
        return cached;
    }

    private WeeklyReportResponse findCachedReport(Long userId) {
        LocalDate monday = LocalDate.now().minusWeeks(1)
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));

        Object cached = redisTemplate.opsForValue().get(cacheKey(userId, monday));
        if (cached == null) {
            return null;
        }
        return objectMapper.convertValue(cached, WeeklyReportResponse.class);
    }

    // 주가 바뀌면 키도 바뀌므로 새 레포트가 자동으로 생성된다
    private String cacheKey(Long userId, LocalDate monday) {
        return REPORT_KEY_PREFIX + userId + ":" + monday;
    }

    // 리포트 주기와 어긋나지 않도록 다음 주 월요일 00:00 에 만료시킨다
    private Duration ttlUntilNextWeek() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime nextMonday = now.toLocalDate()
                .with(TemporalAdjusters.next(DayOfWeek.MONDAY))
                .atStartOfDay();
        return Duration.between(now, nextMonday);
    }

    private List<Domain> findLatestSheetDomains(Long userId) {
        List<Sheet> sheets = sheetRepository.findByUserIdOrderByCreatedAtDesc(userId);
        if (sheets.isEmpty()) {
            return List.of();
        }
        return domainRepository.findBySheetIdOrderByPositionAsc(sheets.get(0).getId());
    }

    private long subjectCountOf(Domain domain) {
        return domain.getSubjectCount() == null ? 0L : domain.getSubjectCount();
    }

    private int toRate(long completed, long total) {
        if (total <= 0) {
            return 0;
        }
        return (int) Math.min(100, Math.round(completed * 100.0 / total));
    }

    private JsonNode requestAnalysis(String prompt) {
        try {
            return objectMapper.readTree(geminiService.generateJson(prompt));
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.REPORT_GENERATION_FAILED);
        }
    }

    private List<String> toStringList(JsonNode node) {
        List<String> values = new ArrayList<>();
        if (node.isArray()) {
            node.forEach(item -> values.add(item.asString()));
        }
        return values;
    }

    private String buildPrompt(LocalDate monday, LocalDate sunday, int completedCount,
                               long earnedPoints, int overallRate, List<DomainAnalyzeContent> domainRate) {
        String domainLines = domainRate.isEmpty()
                ? "- 등록된 도메인 없음"
                : domainRate.stream()
                        .map(d -> "- %s: 달성률 %d%%".formatted(d.label(), d.value()))
                        .collect(Collectors.joining("\n"));

        return """
                너는 만다라트 목표 관리 서비스의 코치다. 아래 사용자의 지난주 수행 데이터를 보고 주간 리포트를 작성해라.

                [기간] %s ~ %s
                [완료 과제 수] %d건
                [획득 포인트] %d점
                [전체 달성률] %d%%
                [도메인별 달성률]
                %s

                다음 JSON 형식으로만 응답해라. 모든 문장은 한국어 존댓말로 쓴다.
                {
                  "title": "리포트 한 줄 제목 (20자 이내)",
                  "summary": "이번 주 수행에 대한 총평 (2~3문장)",
                  "strength": ["잘한 점 2~3개, 각 40자 이내"],
                  "weakness": ["보완할 점 2~3개, 각 40자 이내"]
                }
                """.formatted(monday, sunday, completedCount, earnedPoints, overallRate, domainLines);
    }
}
