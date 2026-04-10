package com.Connectedm.backend.domain.content.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ContentDetailResponseDto {
    private long id;
    private String title;
    private String overview;
    private String posterPath;
    private String ottLogos;
    private List<String> genres;
    @Schema(hidden = true)
    private List<TmdbMovieResponseDto.TmdbCastItem> castList;

    // AI 분석 영역
    private String aiSummary;
    private Double positiveRatio;
    private List<String> topKeywords;

    // 리뷰 영역
    private List<ReviewResponseDto> expertReviews;
    private List<ReviewResponseDto> userReviews;
}
