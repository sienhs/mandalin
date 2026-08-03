package com.ssafy.mandarin.domain.group.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "그룹 도메인 맵핑 요청 DTO")
public record GroupDomainMappingRequest(
    @NotNull(message = "개인 만다라트 시트 ID를 입력해 주세요.")
    @Schema(description = "팀원의 개인 만다라트 시트 ID", example = "2")
    Long sheetId,

    @NotNull(message = "도메인 ID 리스트를 전달해 주세요.")
    @Size(min = 2, max = 2, message = "그룹에 기여할 도메인은 정확히 2개 선택해야 합니다.")
    @Schema(description = "그룹에 맵핑할 개인 시트의 도메인 ID 2개", example = "[201, 202]")
    List<Long> domainIds
) {
}
