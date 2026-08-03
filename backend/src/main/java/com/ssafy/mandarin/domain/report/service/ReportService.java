package com.ssafy.mandarin.domain.report.service;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.ssafy.mandarin.domain.report.dto.DomainAnalyzeContent;
import com.ssafy.mandarin.domain.report.dto.ReportMetricContent;
import com.ssafy.mandarin.domain.report.dto.SheetAnalyzeContent;
import com.ssafy.mandarin.domain.report.dto.WeeklyReportResponse;
import com.ssafy.mandarin.domain.sheet.entity.Domain;
import com.ssafy.mandarin.domain.sheet.entity.Sheet;
import com.ssafy.mandarin.domain.sheet.repository.DomainRepository;
import com.ssafy.mandarin.domain.sheet.repository.SheetRepository;
import com.ssafy.mandarin.domain.subject.entity.Subject;
import com.ssafy.mandarin.domain.subject.entity.SubjectLog;
import com.ssafy.mandarin.domain.subject.repository.SubjectLogRepository;
import com.ssafy.mandarin.domain.subject.repository.SubjectRepository;
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
    private final SubjectRepository subjectRepository;
    private final SheetRepository sheetRepository;
    private final DomainRepository domainRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    public WeeklyReportResponse createWeeklyReport(Long userId) {
        LocalDate lastWeekDate = LocalDate.now().minusWeeks(1);
        LocalDate monday = lastWeekDate.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate sunday = lastWeekDate.with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));

        List<SubjectLog> logs = subjectLogRepository.findWeeklyLogsByUserId(
                userId, monday.atStartOfDay(), sunday.atTime(LocalTime.MAX));

        List<SheetAnalyzeContent> sheets = analyzeSheets(userId, logs);

        // 분자·분모 모두 시트 집계에서 뽑아서 사용
        int completedCount = sheets.stream().mapToInt(SheetAnalyzeContent::completedCount).sum();
        long totalTargetCount = sheets.stream().mapToLong(SheetAnalyzeContent::targetCount).sum();
        int overallRate = toRate(completedCount, totalTargetCount);
        long earnedPoints = logs.stream().mapToLong(SubjectLog::getEarnedPoint).sum();

        String prompt = buildPrompt(monday, sunday, completedCount, earnedPoints, overallRate, sheets);
        JsonNode analysis = requestAnalysis(prompt);

        List<ReportMetricContent> metrics = List.of(
                new ReportMetricContent("주간 달성률", overallRate + "%"),
                new ReportMetricContent("수행 횟수", completedCount + "회")
        );

        WeeklyReportResponse report = new WeeklyReportResponse(
                analysis.path("title").asString(""),
                analysis.path("summary").asString(""),
                metrics,
                toStringList(analysis.path("strength")),
                toStringList(analysis.path("weakness")),
                sheets
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

    private List<SheetAnalyzeContent> analyzeSheets(Long userId, List<SubjectLog> logs) {
        Map<Long, Long> completedByDomainId = logs.stream()
                .collect(Collectors.groupingBy(
                        log -> log.getSubject().getDomain().getId(),
                        Collectors.counting()));

        List<SheetAnalyzeContent> contents = new ArrayList<>();
        for (Sheet sheet : sheetRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            List<Domain> domains = domainRepository.findBySheetIdOrderByPositionAsc(sheet.getId());
            Map<Long, Double> weeklyTargetByDomainId = weeklyTargetByDomainId(sheet);

            long completed = 0L;
            double target = 0.0;
            List<DomainAnalyzeContent> domainContents = new ArrayList<>();
            for (Domain domain : domains) {
                long domainCompleted = completedByDomainId.getOrDefault(domain.getId(), 0L);
                double domainTarget = weeklyTargetByDomainId.getOrDefault(domain.getId(), 0.0);

                completed += domainCompleted;
                target += domainTarget;
                domainContents.add(new DomainAnalyzeContent(
                        domain.getTitle(), toRate(domainCompleted, domainTarget)));
            }

            contents.add(new SheetAnalyzeContent(
                    sheet.getId(),
                    sheet.getTitle(),
                    (int) completed,
                    (int) Math.round(target),
                    toRate(completed, target),
                    domainContents));
        }
        return contents;
    }

    private Map<Long, Double> weeklyTargetByDomainId(Sheet sheet) {
        int sheetWeeks = weeksOf(sheet);
        return subjectRepository.findBySheetIdWithDomain(sheet.getId()).stream()
                .collect(Collectors.groupingBy(
                        subject -> subject.getDomain().getId(),
                        Collectors.summingDouble(subject -> weeklyTargetOf(subject, sheetWeeks))));
    }

    private double weeklyTargetOf(Subject subject, int sheetWeeks) {
        Integer target = subject.getTargetCount();
        if (sheetWeeks > 0 && target != null && target > 0) {
            return (double) target / sheetWeeks;
        }

        return switch (subject.getPeriod()) {
            case DAILY -> 7.0;
            case WEEKLY -> 1.0;
            default -> 0.0;
        };
    }

    private int weeksOf(Sheet sheet) {
        LocalDateTime start = sheet.getCreatedAt();
        LocalDateTime end = sheet.getExpiredAt();
        if (start == null || end == null || !end.isAfter(start)) {
            return 0;
        }
        long days = ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate()) + 1;
        return (int) Math.max(1, Math.ceil(days / 7.0));
    }

    private int toRate(long completed, double target) {
        if (target <= 0) {
            return 0;
        }
        return (int) Math.min(100, Math.round(completed * 100.0 / target));
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
                               long earnedPoints, int overallRate, List<SheetAnalyzeContent> sheets) {
        String sheetLines = sheets.isEmpty()
                ? "- 등록된 시트 없음"
                : sheets.stream()
                        .map(this::toPromptLine)
                        .collect(Collectors.joining("\n"));

        return """
                너는 만다라트 목표 관리 서비스의 코치다. 아래 사용자의 지난주 수행 데이터를 보고 주간 리포트를 작성해라.

                [기간] %s ~ %s
                [수행 횟수] %d회
                [획득 포인트] %d점
                [전체 달성률] %d%% (지난주에 했어야 할 횟수 대비 실제 수행 횟수)
                [시트별 달성률] (시트 아래 들여쓴 항목은 그 시트의 도메인이다)
                %s

                다음 JSON 형식으로만 응답해라. 모든 문장은 한국어 존댓말로 쓴다.
                {
                  "title": "리포트 한 줄 제목 (20자 이내)",
                  "summary": "이번 주 수행에 대한 총평 (2~3문장)",
                  "strength": ["잘한 점 2~3개, 각 40자 이내"],
                  "weakness": ["보완할 점 2~3개, 각 40자 이내"]
                }
                """.formatted(monday, sunday, completedCount, earnedPoints, overallRate, sheetLines);
    }

    private String toPromptLine(SheetAnalyzeContent sheet) {
        StringBuilder line = new StringBuilder("- %s: 달성률 %d%% (수행 %d회 / 목표 %d회)".formatted(
                sheet.title(), sheet.achievementRate(), sheet.completedCount(), sheet.targetCount()));
        for (DomainAnalyzeContent domain : sheet.domains()) {
            line.append("\n  - %s: 달성률 %d%%".formatted(domain.label(), domain.value()));
        }
        return line.toString();
    }
}
