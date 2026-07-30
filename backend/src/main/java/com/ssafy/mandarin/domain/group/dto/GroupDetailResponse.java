package com.ssafy.mandarin.domain.group.dto;

import java.time.LocalDateTime;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "그룹 만다라트 상세 조회 응답 DTO")
public record GroupDetailResponse(
    @Schema(description = "그룹 ID", example = "1")
    Long groupId,

    @Schema(description = "그룹 이름", example = "SSAFY 15기 D106 팀방")
    String title,

    @Schema(description = "팀장 유저 ID", example = "1")
    Long creatorId,

    @Schema(description = "팀장 이름", example = "홍길동")
    String creatorName,

    @Schema(description = "중앙 랜드마크 건물 ID", example = "5")
    Long landmarkBuildingId,

    @Schema(description = "그룹 전체 달성률 (%)", example = "45.5")
    double groupAchievementRate,

    @Schema(description = "맵핑 완료된 도메인 수 (최대 8개)", example = "4")
    int mappedDomainCount,

    @Schema(description = "그룹 멤버별 기여 정보 목록")
    List<MemberContributionResponse> members,

    @Schema(description = "생성 시각")
    LocalDateTime createdAt
) {

    @Builder
    @Schema(description = "그룹 멤버별 기여 정보")
    public record MemberContributionResponse(
        @Schema(description = "유저 ID", example = "1")
        Long userId,

        @Schema(description = "유저 이름", example = "홍길동")
        String name,

        @Schema(description = "팀장 여부", example = "true")
        boolean isCreator,

        @Schema(description = "멤버 개인 달성률 (%)", example = "50.0")
        double memberAchievementRate,

        @Schema(description = "기여 도메인 목록")
        List<DomainSummaryResponse> domains
    ) {}

    @Builder
    @Schema(description = "기여 도메인 요약 정보")
    public record DomainSummaryResponse(
        @Schema(description = "도메인 ID", example = "101")
        Long domainId,

        @Schema(description = "도메인 제목", example = "운동 및 건강")
        String title,

        @Schema(description = "도메인 슬롯 번호 (1~8)", example = "1")
        int slotIndex,

        @Schema(description = "완료된 과제 수 (최대 8개)", example = "4")
        int completedSubjectCount,

        @Schema(description = "도메인 달성률 (%)", example = "50.0")
        double achievementRate
    ) {}
}
