package com.ssafy.mandarin.domain.sheet.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SheetLikeResponse {

    private Long sheetId;
    private Boolean isLiked;
    private Long likeCount;
}
