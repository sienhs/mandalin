package com.ssafy.mandarin.domain.subject.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

/**
 * 과제 반복 주기.
 *
 * <p>주기마다 <b>한 주기 안에 몇 번까지 수행할 수 있는지</b>가 다르다(Subject.countPerPeriod).
 * <ul>
 *   <li>{@code DAILY} — 하루 1회. 사용자가 바꿀 수 없다.
 *   <li>{@code WEEKLY} — 주 1~7회.
 *   <li>{@code MONTHLY} — 월 1~30회.
 *   <li>{@code NONE} — 기간 내 딱 한 번(자격증 취득 등). 바꿀 수 없다.
 * </ul>
 *
 * <p>⚠️ {@link #fromValue} 는 모르는 값을 {@code NONE} 으로 떨어뜨린다. 화면이 보내는 값과
 * 여기 목록이 어긋나면 오류가 아니라 <b>조용히 다른 주기로 저장</b>되므로, 주기를 늘릴 때는
 * 프론트의 Period 타입도 함께 고쳐야 한다.
 */
@Getter
public enum SubjectPeriod {
    DAILY("daily"),
    WEEKLY("weekly"),
    MONTHLY("monthly"),
    NONE("none");

    private final String value;

    SubjectPeriod(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static SubjectPeriod fromValue(String value) {
        if (value == null) return NONE;
        for (SubjectPeriod period : SubjectPeriod.values()) {
            if (period.value.equalsIgnoreCase(value)) {
                return period;
            }
        }
        return NONE;
    }
}
