package com.ssafy.mandarin.domain.subject.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.ssafy.mandarin.domain.subject.entity.SubjectLog;

import io.swagger.v3.oas.annotations.media.Schema;

/**
 * 포인트 적립 내역.
 *
 * <p>별도 테이블을 만들지 않고 {@code subject_log} 를 그대로 읽는다 — 포인트가 늘어나는 경로가
 * 과제 수행 하나뿐이라 수행 이력이 곧 적립 이력이다. 구매로 <b>차감</b>되는 내역은 여기 없다
 * (구매 이력 테이블이 없다). 화면에서는 "적립"만 보여주면 된다.
 */
@Schema(description = "포인트 적립 내역 페이지")
public record PointHistoryResponse(
        @Schema(description = "현재 잔액", example = "1240") Integer currentPoint,
        @Schema(example = "3") int totalPages,
        @Schema(example = "27") long totalElements,
        List<Item> content
) {

    @Schema(description = "적립 한 건")
    public record Item(
            @Schema(example = "381") Long logId,
            @Schema(example = "41") Long subjectId,
            @Schema(description = "무엇을 해서 받았는지", example = "아침 스트레칭 10분") String subjectTitle,
            @Schema(example = "규칙적인 운동") String domainTitle,
            @Schema(description = "적립 포인트", example = "100") Long earnedPoint,
            LocalDateTime createdAt
    ) {

        public static Item from(SubjectLog log) {
            return new Item(
                    log.getId(),
                    log.getSubject().getId(),
                    log.getSubject().getTitle(),
                    log.getSubject().getDomain().getTitle(),
                    log.getEarnedPoint(),
                    log.getCreatedAt());
        }
    }
}
