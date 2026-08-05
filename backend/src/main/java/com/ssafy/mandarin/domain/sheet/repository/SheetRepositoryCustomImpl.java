package com.ssafy.mandarin.domain.sheet.repository;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Repository;

import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.MathExpressions;
import com.querydsl.core.types.dsl.NumberExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import com.ssafy.mandarin.domain.sheet.dto.SheetProgressDto;
import com.ssafy.mandarin.domain.sheet.entity.QDomain;
import com.ssafy.mandarin.domain.subject.entity.QSubject;

import lombok.RequiredArgsConstructor;

/**
 * 만다라트 시트 집계 연산용 QueryDSL 커스텀 구현체.
 *
 * <p>특정 유저의 모든 시트에 대해 단 1번의 DB 쿼리(GROUP BY)로
 * 각 시트의 달성률(achievementRate) 및 진행률(progress)을 계산하여 반환합니다.
 */
@Repository
@RequiredArgsConstructor
public class SheetRepositoryCustomImpl implements SheetRepositoryCustom {

    // 만다라트 시트 1개당 작성되는 총 세부 과제 고정 개수 (8개 도메인 x 8개 과제 = 64개)
    private static final double TOTAL_SUBJECT_COUNT = 64.0;

    private final JPAQueryFactory queryFactory;

    /**
     * 특정 유저의 모든 만다라트 시트별 (달성률, 진행률) 집계 데이터를 조회
     *
     * @param userId 조회할 유저 ID
     * @return key: sheetId, value: SheetProgressDto (달성률 및 진행률)
     */
    @Override
    public Map<Long, SheetProgressDto> findSheetProgressesByUserId(Long userId) {
        QSubject subject = QSubject.subject;
        QDomain domain = QDomain.domain;

        /*
         * 개별 과제 진행률 수식 정의 (SheetService.progressOf 와 100% 동일하게 연산)
         * - isDone 이 true 이면 -> 100.0%
         * - targetCount 나 tryCount 가 null 이거나 <= 0 이면 -> 0.0%
         * - tryCount >= targetCount 이면 -> 100.0% (최대 100% 보장)
         * - 그 외 -> (tryCount * 100.0 / targetCount) 정수 반올림
         */
        NumberExpression<Double> subjectProgress = new CaseBuilder()
                .when(subject.isDone.isTrue()).then(100.0)
                .when(subject.targetCount.isNull().or(subject.targetCount.loe(0))
                        .or(subject.tryCount.isNull()).or(subject.tryCount.loe(0)))
                .then(0.0)
                .when(subject.tryCount.goe(subject.targetCount)).then(100.0)
                .otherwise(
                        MathExpressions.round(
                                subject.tryCount.doubleValue().multiply(100.0).divide(subject.targetCount.doubleValue()),
                                0
                        )
                );

        /*
         * 완료 과제 개수 집계 수식 정의
         * isDone 이 true 인 과제는 1, 아니면 0
         * 시트 내 최종 완수된 과제의 총 개수를 구한다.
         */
        NumberExpression<Long> doneCount = new CaseBuilder()
                .when(subject.isDone.isTrue()).then(1L)
                .otherwise(0L)
                .sum();

        /*
         * 시트별 전체 과제 진행률 평균 수식
         * 개별 과제 진행률의 평균을 계산한다.
         */
        NumberExpression<Double> avgProgress = subjectProgress.avg();

        /*
         * QueryDSL 쿼리 실행 및 SELECT
         * - SELECT: sheetId, 완료과제 수, 평균 진행률
         * - FROM Subject JOIN Domain 
         * - WHERE: 특정 유저의 시트만 필터링
         * - GROUP BY: 시트 ID 별로 그룹화하여 집계
         */
        List<Tuple> results = queryFactory
                .select(
                        domain.sheet.id,
                        doneCount,
                        avgProgress
                )
                .from(subject)
                .join(subject.domain, domain)
                .where(domain.sheet.user.id.eq(userId))
                .groupBy(domain.sheet.id)
                .fetch();

        /*
         * 조회된 Tuple 결과를 Map<Long, SheetProgressDto> 형태로 변환
         * - sheetId를 key
         */
        return results.stream().collect(Collectors.toMap(
                tuple -> tuple.get(domain.sheet.id),
                tuple -> {
                    Long sheetId = tuple.get(domain.sheet.id);
                    Long done = tuple.get(doneCount);
                    Double rawAvgProgress = tuple.get(avgProgress);

                    // 달성률 계산: (완료한 과제 수 / 64) * 100, 소수점 첫째자리 반올림
                    double doneVal = done != null ? done : 0;
                    double achievementRate = Math.round((doneVal / TOTAL_SUBJECT_COUNT) * 100.0 * 10.0) / 10.0;

                    // 진행률 계산: 과제 진행률 평균, 소수점 첫째자리 반올림
                    double rawAvg = rawAvgProgress != null ? rawAvgProgress : 0.0;
                    double roundedProgress = Math.round(rawAvg * 10.0) / 10.0;

                    return new SheetProgressDto(sheetId, achievementRate, roundedProgress);
                }
        ));
    }
}
