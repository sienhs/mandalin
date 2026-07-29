package com.ssafy.mandarin.domain.group.dto;

import java.util.List;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "그룹 멤버 초대 요청 DTO")
public class GroupInviteRequest {

    @NotEmpty(message = "초대할 유저 ID를 입력해 주세요.")
    @Size(max = 3, message = "한 번에 최대 3명까지 초대할 수 있습니다.")
    @Schema(description = "초대할 유저 ID 리스트 (최대 3명)", example = "[2, 3, 4]")
    private List<Long> inviteUserIds;
}
