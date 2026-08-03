package com.ssafy.mandarin.domain.village.service;

/**
 * item_spot 격자 좌표와 만다라트 번호 사이의 변환.
 *
 * <p>두 체계가 공존한다.
 * <ul>
 *   <li><b>격자 좌표</b> — {@code item_spot.domain_position}, {@code item_spot.item_position}.
 *       1~9 의 3×3 배치이고 5 가 한가운데다.</li>
 *   <li><b>만다라트 번호</b> — {@code domain.position}, {@code subject.position}.
 *       0~7 이고 가운데가 없다(가운데는 각각 랜드마크와 세부 목표 간판이 차지한다).</li>
 * </ul>
 *
 * <p>변환 규칙을 서비스마다 따로 적으면 한쪽만 고쳐졌을 때 건물이 엉뚱한 칸에 선다.
 * 계산은 전부 여기를 통한다.
 */
public final class MandalartGrid {

    /** 격자 한가운데. 구역 번호로는 랜드마크 구역, 타일 번호로는 세부 목표 간판이다. */
    public static final int CENTER = 5;

    /** 세부 목표 수 = 구역 안 과제 수 = 8. */
    public static final int SLOTS = 8;

    private MandalartGrid() {
    }

    /**
     * 격자 번호(1~9) → 만다라트 번호(0~7).
     *
     * @return 가운데(5)면 {@code null} — 과제나 세부 목표가 아니라 간판·랜드마크 자리다
     */
    public static Integer toIndex(Integer gridPosition) {
        if (gridPosition == null || gridPosition == CENTER) {
            return null;
        }
        if (gridPosition < 1 || gridPosition > 9) {
            return null;
        }
        return gridPosition < CENTER ? gridPosition - 1 : gridPosition - 2;
    }

    /** 만다라트 번호(0~7) → 격자 번호(1~9). 범위를 벗어나면 {@code null}. */
    public static Integer toGrid(Integer index) {
        if (index == null || index < 0 || index >= SLOTS) {
            return null;
        }
        return index < 4 ? index + 1 : index + 2;
    }

    public static boolean isCenterBlock(Integer domainPosition) {
        return domainPosition != null && domainPosition == CENTER;
    }

    /** 구역 중앙 타일 = 세부 목표 간판. 여기에는 과제가 걸리지 않는다. */
    public static boolean isBlockSign(Integer itemPosition) {
        return itemPosition != null && itemPosition == CENTER;
    }
}
