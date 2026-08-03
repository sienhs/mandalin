package com.ssafy.mandarin.domain.village.service;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * 격자 좌표 ↔ 만다라트 번호 변환.
 *
 * <p>이 변환이 어긋나면 건물이 엉뚱한 과제 자리에 서는데, 화면에는 아무 에러도 나지 않고
 * "왜 저 칸이 자라지?" 로만 보인다. 눈으로 확인하기 어려운 종류라 표로 고정해 둔다.
 */
class MandalartGridTest {

    @DisplayName("격자 번호를 만다라트 번호로 바꾼다 — 가운데(5)는 건너뛴다")
    @ParameterizedTest(name = "격자 {0} → 번호 {1}")
    @CsvSource({
            "1, 0",
            "2, 1",
            "3, 2",
            "4, 3",
            "6, 4",
            "7, 5",
            "8, 6",
            "9, 7",
    })
    void toIndex(int grid, int expected) {
        assertThat(MandalartGrid.toIndex(grid)).isEqualTo(expected);
    }

    @DisplayName("가운데 칸은 과제가 아니라 null 이다")
    @Test
    void centerHasNoIndex() {
        assertThat(MandalartGrid.toIndex(MandalartGrid.CENTER)).isNull();
    }

    @DisplayName("범위 밖 격자 번호는 null 이다")
    @ParameterizedTest
    @ValueSource(ints = {0, 10, -1, 100})
    void outOfRangeGrid(int grid) {
        assertThat(MandalartGrid.toIndex(grid)).isNull();
    }

    @DisplayName("만다라트 번호를 격자 번호로 바꾼다")
    @ParameterizedTest(name = "번호 {0} → 격자 {1}")
    @CsvSource({
            "0, 1",
            "1, 2",
            "2, 3",
            "3, 4",
            "4, 6",
            "5, 7",
            "6, 8",
            "7, 9",
    })
    void toGrid(int index, int expected) {
        assertThat(MandalartGrid.toGrid(index)).isEqualTo(expected);
    }

    @DisplayName("범위 밖 만다라트 번호는 null 이다")
    @ParameterizedTest
    @ValueSource(ints = {-1, 8, 9})
    void outOfRangeIndex(int index) {
        assertThat(MandalartGrid.toGrid(index)).isNull();
    }

    /**
     * 왕복 변환이 제자리로 돌아오는지.
     *
     * <p>배치 조회는 격자 → 번호로, 저장은 번호 → 격자로 간다. 한쪽만 고치면 두 방향이
     * 어긋나므로 왕복을 함께 검사한다.
     */
    @DisplayName("격자 → 번호 → 격자 왕복이 원래 값으로 돌아온다")
    @Test
    void roundTrip() {
        for (int grid = 1; grid <= 9; grid++) {
            if (grid == MandalartGrid.CENTER) {
                continue;
            }
            Integer index = MandalartGrid.toIndex(grid);
            assertThat(MandalartGrid.toGrid(index))
                    .as("격자 %d 왕복", grid)
                    .isEqualTo(grid);
        }
    }

    @DisplayName("8개 번호가 서로 다른 8개 격자 칸으로 흩어진다 — 겹치면 두 과제가 한 칸을 쓴다")
    @Test
    void everyIndexGetsItsOwnTile() {
        Set<Integer> tiles = new HashSet<>();
        for (int index = 0; index < MandalartGrid.SLOTS; index++) {
            tiles.add(MandalartGrid.toGrid(index));
        }

        assertThat(tiles).hasSize(MandalartGrid.SLOTS);
        assertThat(tiles).doesNotContain(MandalartGrid.CENTER);
    }

    @DisplayName("가운데 판정")
    @Test
    void centerChecks() {
        assertThat(MandalartGrid.isCenterBlock(5)).isTrue();
        assertThat(MandalartGrid.isCenterBlock(1)).isFalse();
        assertThat(MandalartGrid.isCenterBlock(null)).isFalse();

        assertThat(MandalartGrid.isBlockSign(5)).isTrue();
        assertThat(MandalartGrid.isBlockSign(9)).isFalse();
        assertThat(MandalartGrid.isBlockSign(null)).isFalse();
    }
}
