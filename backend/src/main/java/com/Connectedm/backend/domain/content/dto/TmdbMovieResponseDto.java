package com.Connectedm.backend.domain.content.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
public class TmdbMovieResponseDto {
    private Long id;
    private String title;
    private String overview;
    private String poster_path;

    // 장르 리스트 추가
    private List<TmdbGenre> genres;

    // JSON의 "watch/providers" 키를 이 필드에 매핑
    @JsonProperty("watch/providers")
    private WatchProviders watchProviders;

    /**
     * 한국(KR)의 OTT 플랫폼 로고 경로들을 쉼표로 구분된 문자열로 반환
     */
    public String getOttLogos() {
        if (watchProviders == null || watchProviders.getResults() == null) {
            return "";
        }

        // 한국 데이터(KR) 추출
        CountryResult krData = watchProviders.getResults().get("KR");
        if (krData == null || krData.getFlatrate() == null || krData.getFlatrate().isEmpty()) {
            return "";
        }

        // flatrate 리스트에 있는 모든 logo_path를 추출하여 쉼표로 결합
        return krData.getFlatrate().stream()
                .map(ProviderDetail::getLogo_path)
                .filter(path -> path != null && !path.isEmpty())
                .collect(Collectors.joining(","));
    }

    // --- 정적 내부 클래스 구조 (JSON 계층 구조 대응) ---

    @Getter
    @NoArgsConstructor
    public static class TmdbGenre {
        private Long id;
        private String name;
    }

    @Getter
    @NoArgsConstructor
    public static class WatchProviders {
        private Map<String, CountryResult> results;
    }

    @Getter
    @NoArgsConstructor
    public static class CountryResult {
        private List<ProviderDetail> flatrate;
    }

    @Getter
    @NoArgsConstructor
    public static class ProviderDetail {
        private String logo_path;
        private String provider_name;
    }
}
