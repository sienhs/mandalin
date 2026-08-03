package com.ssafy.mandarin.domain.report.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.ssafy.mandarin.global.exception.BusinessException;
import com.ssafy.mandarin.global.exception.ErrorCode;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
public class GeminiService {

    private final RestTemplate restTemplate = createRestTemplate();
    private final ObjectMapper objectMapper;

    @Value("${GEMINI_API_KEY:cant_find_api_key}")
    private String apiKey;

    @Value("${GEMINI_URL:https://generativelanguage.googleapis.com}")
    private String baseUrl;

    @Value("${GEMINI_MODEL:gemini-2.5-flash}")
    private String model;

    private static RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(10));
        factory.setReadTimeout(Duration.ofSeconds(45));
        return new RestTemplate(factory);
    }

    public String generateJson(String prompt) {
        return extractText(call(prompt, true));
    }

    private String call(String prompt, boolean jsonMode) {
        Map<String, Object> content = Map.of("parts", List.of(Map.of("text", prompt)));
        Map<String, Object> body = jsonMode
                ? Map.of("contents", List.of(content),
                         "generationConfig", Map.of("responseMimeType", "application/json"))
                : Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-goog-api-key", apiKey);

        try {
            HttpEntity<String> entity = new HttpEntity<>(objectMapper.writeValueAsString(body), headers);
            return restTemplate.postForObject(generateContentUrl(), entity, String.class);
        } catch (Exception e) {
            // 직렬화 실패는 거의 실패X => AI 요청 실패만 감지
            throw new BusinessException(ErrorCode.AI_REQUEST_FAILED);
        }
    }

    // SSAFY GMS 는 쿼리스트링 키를 요구한다 (ai_livekit 의 BOT_API_KEY_IN_QUERY=true)
    private String generateContentUrl() {
        return baseUrl.replaceAll("/+$", "")
                + "/v1beta/models/" + model + ":generateContent"
                + "?key=" + URLEncoder.encode(apiKey, StandardCharsets.UTF_8);
    }

    private String extractText(String rawResponse) {
        try {
            JsonNode text = objectMapper.readTree(rawResponse)
                    .path("candidates").path(0)
                    .path("content").path("parts").path(0)
                    .path("text");

            if (text.isMissingNode() || text.asString().isBlank()) {
                throw new BusinessException(ErrorCode.AI_REQUEST_FAILED);
            }
            return stripCodeFence(text.asString());
        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException(ErrorCode.AI_REQUEST_FAILED);
        }
    }

    private String stripCodeFence(String text) {
        String trimmed = text.trim();
        if (!trimmed.startsWith("```")) {
            return trimmed;
        }
        int firstLineEnd = trimmed.indexOf('\n');
        int closing = trimmed.lastIndexOf("```");
        if (firstLineEnd < 0 || closing <= firstLineEnd) {
            return trimmed;
        }
        return trimmed.substring(firstLineEnd + 1, closing).trim();
    }
}
