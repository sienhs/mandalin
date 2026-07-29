package com.ssafy.mandarin.domain.sheet.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SheetListResponse {

    private Long sheetId;
    private String title;
    private Boolean isOpen;
    private Long likeCount;
    private Double achievementRate;
    private LocalDateTime createdAt;
    private LocalDateTime expiredAt;
}
