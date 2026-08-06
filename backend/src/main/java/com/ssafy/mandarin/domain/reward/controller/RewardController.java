package com.ssafy.mandarin.domain.reward.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ssafy.mandarin.domain.auth.security.CustomUserDetails;
import com.ssafy.mandarin.domain.reward.dto.RewardClaimResponse;
import com.ssafy.mandarin.domain.reward.dto.RewardTrackResponse;
import com.ssafy.mandarin.domain.reward.service.RewardTrackService;
import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;
import com.ssafy.mandarin.global.response.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/rewards")
@RequiredArgsConstructor
@Tag(name = "Reward", description = "만다라트 진행률 마일스톤 보상")
public class RewardController {

	private final RewardTrackService rewardTrackService;

	@GetMapping("/track")
	@Operation(
			summary = "보상 트랙 조회",
			description = """
					진행률 12.5% 구간 8개의 보상 종류·도달 여부·수령 여부를 돌려준다.

					`sheetId` 는 **보상 판정에 쓰는 시트**(가장 먼저 만든 시트)다. 보상은 계정당
					구간별 1회이므로 다른 시트에서는 선물상자를 그리지 않고 진행률만 보여준다 —
					프론트는 보고 있는 시트가 이 값과 같은지로 판단한다.

					랜드마크 구간이 어떤 종을 주는지는 **여기에 없다.** 무작위라 수령하는 순간
					정해지고, 그 결과는 수령 응답에만 담긴다."""
	)
	public ResponseEntity<ApiResponse<RewardTrackResponse>> getTrack(
			@AuthenticationPrincipal CustomUserDetails customUserDetails
	) {
		Long userId = requireUserId(customUserDetails);
		return ResponseEntity.ok(ApiResponse.success(
				"보상 트랙을 조회했습니다.", rewardTrackService.getTrack(userId)));
	}

	@PostMapping("/track/{milestone}/claim")
	@Operation(
			summary = "마일스톤 보상 수령",
			description = """
					구간 하나를 수령한다. **계정당 구간별 1회**다.

					도달 여부를 서버가 다시 확인한다 — 클라이언트가 보낸 구간 번호만 믿으면 아무
					구간이나 받을 수 있다. 이미 받았으면 409, 아직 못 미쳤으면 400 이다.

					랜드마크 구간은 **미보유 중 무작위 1종**이고, 마지막 구간(8, 100%)은 **남은
					전종**을 준다. 이미 13종을 다 가진 계정이면 크레딧으로 대체하고
					`fallbackFromLandmark` 로 알린다.

					크레딧은 일일 포인트 상한을 거치지 않는다 — 상한과 보상액이 같은 1000P 라
					상한을 타면 그날 과제를 한 사람은 0원을 받는다."""
	)
	public ResponseEntity<ApiResponse<RewardClaimResponse>> claim(
			@AuthenticationPrincipal CustomUserDetails customUserDetails,
			@PathVariable int milestone
	) {
		Long userId = requireUserId(customUserDetails);
		return ResponseEntity.ok(ApiResponse.success(
				"보상을 수령했습니다.", rewardTrackService.claim(userId, milestone)));
	}

	private Long requireUserId(CustomUserDetails customUserDetails) {
		if (customUserDetails == null) {
			throw new BusinessException(ErrorCode.UNAUTHORIZED);
		}
		return customUserDetails.getUserId();
	}
}
