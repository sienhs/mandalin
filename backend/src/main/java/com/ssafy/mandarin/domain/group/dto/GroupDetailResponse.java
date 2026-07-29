package com.ssafy.mandarin.domain.group.dto;

import java.time.LocalDateTime;
import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "그룹 만다라트 상세 조회 응답 DTO")
public class GroupDetailResponse {

    @Schema(description = "그룹 ID", example = "1")
    private Long groupId;

    @Schema(description = "그룹 이름", example = "SSAFY 15기 D106 팀방")
    private String title;

    @Schema(description = "팀장 유저 ID", example = "1")
    private Long creatorId;

    @Schema(description = "팀장 이름", example = "홍길동")
    private String creatorName;

    @Schema(description = "중앙 랜드마크 건물 ID", example = "5")
    private Long landmarkBuildingId;

    @Schema(description = "그룹 전체 달성률 (%)", example = "45.5")
    private double groupAchievementRate;

    @Schema(description = "맵핑 완료된 도메인 수 (최대 8개)", example = "4")
    private int mappedDomainCount;

    @Schema(description = "그룹 멤버별 기여 정보 목록")
    private List<MemberContributionResponse> members;

    @Schema(description = "생성 시각")
    private LocalDateTime createdAt;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "그룹 멤버별 기여 정보")
    public static class MemberContributionResponse {

        @Schema(description = "유저 ID", example = "1")
        private Long userId;

        @Schema(description = "유저 이름", example = "홍길동")
        private String name;

        @Schema(description = "팀장 여부", example = "true")
        private boolean isCreator;

        @Schema(description = "멤버 개인 달성률 (%)", example = "50.0")
        private double memberAchievementRate;

        @Schema(description = "기여 도메인 목록")
        private List<DomainSummaryResponse> domains;
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "기여 도메인 요약 정보")
    public static class DomainSummaryResponse {

        @Schema(description = "도메인 ID", example = "101")
        private Long domainId;

        @Schema(description = "도메인 제목", example = "운동 및 건강")
        private String title;

        @Schema(description = "도메인 슬롯 번호 (1~8)", example = "1")
        private int slotIndex;

        @Schema(description = "완료된 과제 수 (최대 8개)", example = "4")
        private int completedSubjectCount;

        @Schema(description = "도메인 달성률 (%)", example = "50.0")
        private double achievementRate;
    }
}
