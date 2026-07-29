package com.ssafy.mandarin.domain.group.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "미확인 그룹 초대 건수 응답 DTO")
public class GroupRequestCountResponse {

    @Schema(description = "미확인 초대 건수", example = "2")
    private long count;

    public static GroupRequestCountResponse of(long count) {
        return GroupRequestCountResponse.builder()
            .count(count)
            .build();
    }
}
