package com.ssafy.mandarin.domain.sheet.repository;

import java.util.Map;
import com.ssafy.mandarin.domain.sheet.dto.SheetProgressDto;

public interface SheetRepositoryCustom {
    Map<Long, SheetProgressDto> findSheetProgressesByUserId(Long userId);
}
