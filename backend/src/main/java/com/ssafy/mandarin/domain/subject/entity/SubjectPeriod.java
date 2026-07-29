package com.ssafy.mandarin.domain.subject.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum SubjectPeriod {
    DAILY("daily"),
    WEEKLY("weekly"),
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
