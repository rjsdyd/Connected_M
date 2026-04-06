package com.Connectedm.backend.domain.content.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TmdbService {

    // 1. properties 파일에서 설정값 읽어오기
    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.api.token}")
    private String apiToken;

    @Value("${tmdb.api.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * 영화 상세 정보 가져오기 예시
     * @param movieId TMDB 전용 영화 ID
     * @return API 응답 결과 (JSON 문자열)
     */
    public String getMovieDetails(Long movieId) {
        // 2. URL 빌더를 사용하여 깔끔하게 주소 생성
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .path("/movie/{movieId}")
                .queryParam("api_key", apiKey)
                .queryParam("language", "ko-KR") // 한국어 설정
                .buildAndExpand(movieId)
                .toUriString();

        // 3. 실제 API 호출
        return restTemplate.getForObject(url, String.class);
    }
}