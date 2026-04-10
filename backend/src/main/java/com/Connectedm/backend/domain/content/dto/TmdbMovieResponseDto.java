package com.Connectedm.backend.domain.content.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@Getter
@NoArgsConstructor
@Schema(hidden = true)
public class TmdbMovieResponseDto {
    private Long id;
    private String title;
    private String overview;

    @JsonProperty("poster_path")
    private String poster_path;

    // 장르 리스트 추가
    private List<TmdbGenre> genres;

    // 출연진 정보 추가
    private TmdbCreditsResponse credits;

    // JSON의 "watch/providers" 키를 이 필드에 매핑
    @JsonProperty("watch/providers")
    private WatchProviders watchProviders;

    @JsonProperty("backdrop_path")
    private String backdrop_path;

    /**
     * 한국(KR)의 OTT 플랫폼 로고 경로들을 쉼표로 구분된 문자열로 반환
     */
    @Schema(hidden = true)
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
    @Schema(hidden = true)
    public static class TmdbGenre {
        private Long id;
        private String name;
    }

    // ✨ 출연진 정보를 담을 클래스 추가
    @Getter
    @NoArgsConstructor
    @Schema(hidden = true)
    public static class TmdbCreditsResponse {
        private List<TmdbCastItem> cast;
    }

    // ✨ 개별 배우 정보를 담을 클래스 추가
    @Getter
    @NoArgsConstructor
    @Schema(hidden = true)
    public static class TmdbCastItem {
        private String name;
        private String character;
        @JsonProperty("profile_path")
        private String profilePath;
        private int order;
    }

    @Getter
    @NoArgsConstructor
    @Schema(hidden = true)
    public static class WatchProviders {
        private Map<String, CountryResult> results;
    }

    @Getter
    @NoArgsConstructor
    @Schema(hidden = true)
    public static class CountryResult {
        private List<ProviderDetail> flatrate;
    }

    @Getter
    @NoArgsConstructor
    @Schema(hidden = true)
    public static class ProviderDetail {
        private String logo_path;
        private String provider_name;
    }
}
