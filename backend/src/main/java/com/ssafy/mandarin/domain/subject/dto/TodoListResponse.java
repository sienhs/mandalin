package com.ssafy.mandarin.domain.subject.dto;

import com.ssafy.mandarin.domain.subject.entity.SubjectPeriod;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "오늘 해야 하는 과제")
public record TodoListResponse(
        Long subjectId,

        /**
         * 이 과제가 속한 시트.
         *
         * <p>수행 완료 API 가 {@code PATCH /sheets/{sheetId}/subjects/complete} 라 sheetId 가
         * 반드시 필요하다. 이 필드가 없던 동안 프론트는 시트 상세를 전부 받아
         * subjectId → sheetId 표를 직접 만들어야 했다.
         */
        Long sheetId,

        @Schema(description = "시트 제목. 여러 만다라트의 할 일이 한 목록에 섞이므로 출처를 보여준다")
        String sheetTitle,

        Long domainId,
        String domainTitle,
        String title,
        SubjectPeriod period,
        Long point,
        Integer targetCount,
        Integer tryCount,
        Integer position,
        Boolean isDone,

        /**
         * 이번 주기에 이미 수행했는지.
         *
         * <p>이름은 "Today" 지만 주간 과제에서는 "이번 주"를 뜻한다 — 필드명을 바꾸면 쓰고 있는
         * 화면이 깨지므로 의미만 넓혔다. 주간 과제는 월~일 사이에 한 번이라도 했으면 true 다.
         */
        Boolean isDoneToday,

        @Schema(description = "0~100. 서버가 확정한 진행률")
        Integer progress
) {
}
