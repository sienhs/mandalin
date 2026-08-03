package com.ssafy.mandarin.domain.sheet.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/**
 * 만다라트 공개 여부 변경.
 *
 * <p><b>만다라트는 한 번 세우면 내용을 고치지 않는다.</b> 핵심 목표·세부 목표·실천 과제는
 * 생성 시점에 확정되고 그 뒤로는 수행만 한다 — 목표를 쉽게 바꿀 수 있으면 채우기 어려운 칸을
 * 지워 버리게 되고, 그러면 표를 나눠 놓은 의미가 사라진다.
 *
 * <p>공개 여부는 예외다. 이건 목표의 내용이 아니라 <b>누구에게 보일지</b>에 대한 설정이라
 * 언제든 되돌릴 수 있어야 한다. 그래서 수정 API 를 이 한 가지로만 남겼다.
 */
@Schema(description = "만다라트 공개 여부 변경")
public record SheetVisibilityRequest(
        @Schema(description = "true 면 리더보드·친구 목록에 노출된다", example = "true")
        @NotNull(message = "isOpen 은 필수입니다.")
        Boolean isOpen
) {
}
