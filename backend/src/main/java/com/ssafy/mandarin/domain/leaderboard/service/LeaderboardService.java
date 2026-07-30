package com.ssafy.mandarin.domain.leaderboard.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ssafy.mandarin.domain.leaderboard.dto.LeaderboardItemResponse;
import com.ssafy.mandarin.domain.leaderboard.dto.LeaderboardResponse;
import com.ssafy.mandarin.domain.sheet.entity.Sheet;
import com.ssafy.mandarin.domain.sheet.repository.SheetRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeaderboardService {

    private final SheetRepository sheetRepository;

    
    // 리더보드 전체 랭킹 최대 개수
    private static final int MAX_LEADERBOARD_LIMIT = 50;

    /**
     * 리더보드 랭킹 목록 페이징 조회
     * 공개 설정된 만다라트 시트를 좋아요 수 내림차순(동률 시 최신 생성순)으로 정렬하여 조회
     *
     * @param page 조회할 페이지 번호 (0부터 시작)
     * @param size 한 페이지당 보여줄 항목 개수 (기본 10개)
     * @return 총 페이지 수와 랭킹 시트 항목 리스트가 포함된 LeaderboardResponse
     */
    public LeaderboardResponse getLeaderboard(int page, int size) {
        // 1. 페이지 당 항목 수 검증 (0 이하 요청 시 기본 10개로 지정)
        int pageSize = (size <= 0) ? 10 : size;

        // 2. DB에서 상위 n개 항목 가져온다
        Pageable limitPageable = PageRequest.of(0, MAX_LEADERBOARD_LIMIT);
        List<Sheet> topSheets = sheetRepository.findByIsOpenTrueOrderByLikeCountDescIdDesc(limitPageable);

        // 3. 전체 페이지 수 계산
        int totalPages = (int) Math.ceil((double) topSheets.size() / pageSize);

        // 4. 요청한 페이지가 유효한 페이지 범위를 벗어난 경우 빈 목록 반환
        if (page < 0 || page >= totalPages) {
            return new LeaderboardResponse(totalPages, List.of());
        }

        // 5. 요청한 페이지 범위 항목 메모리 슬라이싱
        int fromIndex = page * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, topSheets.size());
        List<Sheet> pageSheets = topSheets.subList(fromIndex, toIndex);

        // 6. Sheet Entity 목록을 DTO로 변환
        List<LeaderboardItemResponse> content = new ArrayList<>();
        for (int i = 0; i < pageSheets.size(); i++) {
            Sheet sheet = pageSheets.get(i);
            content.add(new LeaderboardItemResponse(
                fromIndex + i + 1,
                sheet.getId(),
                sheet.getTitle(),
                sheet.getUser().getName(),
                sheet.getLikeCount()
            ));
        }

        return new LeaderboardResponse(totalPages, content);
    }
}
