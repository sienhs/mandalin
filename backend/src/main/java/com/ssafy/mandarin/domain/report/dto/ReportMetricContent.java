package com.ssafy.mandarin.domain.report.dto;

// 프론트는 value 를 그대로 String 으로 찍는다. % 같은 단위는 여기서 붙여 보낸다
public record ReportMetricContent(
        String label,
        String value
) {

}
