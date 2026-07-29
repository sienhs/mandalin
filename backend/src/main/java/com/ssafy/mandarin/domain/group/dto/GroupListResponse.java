package com.ssafy.mandarin.domain.group.dto;

import java.time.LocalDateTime;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "소속 그룹 목록 응답 DTO")
public record GroupListResponse(
    @Schema(description = "그룹 ID", example = "1")
    Long groupId,

    @Schema(description = "그룹 이름", example = "SSAFY 15기 D106 팀방")
    String title,

    @Schema(description = "팀장 이름", example = "홍길동")
    String creatorName,

    @Schema(description = "현재 그룹 멤버 수", example = "3")
    int memberCount,

    @Schema(description = "그룹 생성 시각")
    LocalDateTime createdAt
) {
}
