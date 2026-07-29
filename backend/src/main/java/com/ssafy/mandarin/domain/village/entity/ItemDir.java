package com.ssafy.mandarin.domain.village.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum ItemDir {
    DEG_0("0"),
    DEG_90("90"),
    DEG_180("180"),
    DEG_270("270");

    private final String value;

    ItemDir(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static ItemDir fromValue(String value) {
        if (value == null) return DEG_0;
        for (ItemDir dir : ItemDir.values()) {
            if (dir.value.equals(value)) {
                return dir;
            }
        }
        return DEG_0;
    }
}
