package com.Connectedm.backend.domain.content.service;

import java.util.List;
import java.util.Map;

import com.Connectedm.backend.domain.content.dto.TmdbMovieResponseDto;

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
     * 영화 제목으로 진짜 TMDB ID 찾아오기
     */
    public Long searchMovieIdByTitle(String title) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .path("/search/movie")
                .queryParam("api_key", apiKey)
                .queryParam("query", title)
                .queryParam("language", "ko-KR")
                .toUriString();

        // 1. 검색 API 호출
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);

        // 2. 검색 결과에서 첫 번째 영화의 ID 추출
        if (response != null && response.get("results") != null) {
            List<Map<String, Object>> results = (List<Map<String, Object>>) response.get("results");
            
            if (results != null && !results.isEmpty()) {
                // 가장 연관도 높은 첫 번째 결과의 ID 반환
                return Long.valueOf(results.get(0).get("id").toString());
            }
        }

        return null; // 검색 결과가 없을 경우
    }

    /**
     * 영화 상세 정보 가져오기
     */
    public TmdbMovieResponseDto getMovieDetails(Long tmdbId) {
        String url = UriComponentsBuilder.fromHttpUrl(baseUrl)
                .path("/movie/{movieId}")
                .queryParam("api_key", apiKey)
                .queryParam("language", "ko-KR") // 한국어 설정
                .queryParam("append_to_response", "watch/providers")
                .buildAndExpand(tmdbId)
                .toUriString();

        return restTemplate.getForObject(url, TmdbMovieResponseDto.class);
    }
}
