package com.ssafy.mandarin.domain.group.dto;

import java.time.LocalDateTime;

import com.ssafy.mandarin.domain.group.entity.GroupRequest;
import com.ssafy.mandarin.domain.group.entity.GroupRequestProgress;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "그룹 초대 요청 응답 DTO")
public record GroupRequestResponse(
    @Schema(description = "초대 요청 ID", example = "1")
    Long requestId,

    @Schema(description = "그룹 ID", example = "10")
    Long groupId,

    @Schema(description = "그룹 이름", example = "SSAFY 15기 D106 팀방")
    String groupTitle,

    @Schema(description = "초대한 팀장 이름", example = "홍길동")
    String creatorName,

    @Schema(description = "요청 상태", example = "NOT_READ")
    GroupRequestProgress progress,

    @Schema(description = "요청 생성 시각")
    LocalDateTime createdAt
) {
    public static GroupRequestResponse from(GroupRequest request) {
        return GroupRequestResponse.builder()
            .requestId(request.getId())
            .groupId(request.getGroup().getId())
            .groupTitle(request.getGroup().getTitle())
            .creatorName(request.getCreator().getName())
            .progress(request.getProgress())
            .createdAt(request.getCreatedAt())
            .build();
    }
}
