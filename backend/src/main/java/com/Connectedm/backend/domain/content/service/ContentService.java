package com.Connectedm.backend.domain.content.service;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.Connectedm.backend.domain.content.dto.*;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Connectedm.backend.domain.content.entity.Content;
import com.Connectedm.backend.domain.content.entity.ContentGenre;
import com.Connectedm.backend.domain.content.entity.Genre;
import com.Connectedm.backend.domain.content.repository.AnalysisCacheRepository;
import com.Connectedm.backend.domain.content.repository.ContentGenreRepository;
import com.Connectedm.backend.domain.content.repository.ContentRepository;
import com.Connectedm.backend.domain.content.repository.GenreRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;
    private final GenreRepository genreRepository;
    private final AnalysisCacheRepository analysisCacheRepository;
    private final ContentGenreRepository contentGenreRepository;
    private final ReviewService reviewService;
    private final TmdbService tmdbService;

    /**
     * TMDB 상세 정보를 강제로 업데이트하고 장르를 동기화함
     */
    @Transactional
    public void updateContentWithTmdb(Long id) {
        // 1. DB에서 해당 콘텐츠 조회
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("콘텐츠를 찾을 수 없습니다. ID: " + id));

        // 2. TMDB ID 결정 (기존 ID 우선, 없으면 제목 검색)
        String tmdbIdToUse = content.getTmdbId();
        if (tmdbIdToUse == null || tmdbIdToUse.isBlank()) {
            Long searchedId = tmdbService.searchMovieIdByTitle(content.getTitle().trim());
            if (searchedId == null) {
                throw new RuntimeException("TMDB에서 해당 영화 제목을 찾을 수 없습니다: " + content.getTitle());
            }
            tmdbIdToUse = String.valueOf(searchedId);
        }

        // 3. TMDB API 호출
        TmdbMovieResponseDto tmdbData = tmdbService.getMovieDetail(tmdbIdToUse);
        if (tmdbData == null) {
            throw new RuntimeException("TMDB 상세 정보를 불러올 수 없습니다. ID: " + tmdbIdToUse);
        }

        // 4. 이미지 경로 생성 (포스터: w500, 배경: w1280)
        String fullPosterPath = (tmdbData.getPoster_path() != null)
                ? "https://image.tmdb.org/t/p/w500" + tmdbData.getPoster_path()
                : content.getPosterPath();

        String fullBackdropPath = (tmdbData.getBackdrop_path() != null)
                ? "https://image.tmdb.org/t/p/w1280" + tmdbData.getBackdrop_path()
                : content.getBackdropPath();

        // 5. OTT 로고 데이터 준비
        String logos = (tmdbData.getOttLogos() != null) ? tmdbData.getOttLogos() : "";

        // 6. 장르 동기화 로직
        if (tmdbData.getGenres() != null) {
            for (TmdbMovieResponseDto.TmdbGenre tmdbGenre : tmdbData.getGenres()) {
                String genreName = tmdbGenre.getName();

                Genre genre = genreRepository.findByName(genreName)
                        .orElseGet(() -> genreRepository.save(Genre.builder().name(genreName).build()));

                boolean alreadyLinked = content.getContentGenres().stream()
                        .anyMatch(cg -> cg.getGenre().getName().equals(genreName));

                if (!alreadyLinked) {
                    ContentGenre contentGenre = ContentGenre.builder()
                            .content(content)
                            .genre(genre)
                            .build();
                    content.addGenre(contentGenre);
                }
            }
        }

        // 7. 통합 업데이트 메서드 호출 (Content.java에서 수정한 FullInfo 메서드)
        content.updateFullInfo(
                tmdbIdToUse,
                tmdbData.getOverview(),
                fullPosterPath,
                fullBackdropPath,
                logos,
                tmdbData.getRuntime(),
                tmdbData.getAgeRating()
        );

        contentRepository.save(content);
    }

    /**
     * 콘텐츠 상세 조회 및 누락된 데이터 자동 보완
     */
    @Transactional
    public ContentDetailResponseDto getContentDetail(Long id) {
        Content content = contentRepository.findWithCacheById(id)
                .orElseThrow(() -> new RuntimeException("해당 콘텐츠를 찾을 수 없습니다. ID: " + id));

        TmdbMovieResponseDto tmdbData = tmdbService.getMovieDetail(content.getTmdbId());

        // 데이터 업데이트 조건 확인 (줄거리, 포스터, 또는 배경 이미지가 비어있는 경우)
        boolean isOverviewEmpty = content.getOverview() == null || content.getOverview().isBlank();
        boolean isPosterBroken = content.getPosterPath() == null || content.getPosterPath().endsWith("/w500/");
        boolean isBackdropEmpty = content.getBackdropPath() == null || content.getBackdropPath().isBlank();
        boolean isExtraInfoEmpty = content.getRuntime() == null || content.getAgeRating() == null;

        if ((isOverviewEmpty || isPosterBroken || isBackdropEmpty || isExtraInfoEmpty) && tmdbData != null) {
            String realPosterPath = (tmdbData.getPoster_path() != null)
                    ? "https://image.tmdb.org/t/p/w500" + tmdbData.getPoster_path()
                    : content.getPosterPath();

            String realBackdropPath = (tmdbData.getBackdrop_path() != null)
                    ? "https://image.tmdb.org/t/p/w1280" + tmdbData.getBackdrop_path()
                    : content.getBackdropPath();

            String logos = tmdbData.getOttLogos() != null ? tmdbData.getOttLogos() : "";

            // DB 업데이트
            content.updateFullInfo(content.getTmdbId(), tmdbData.getOverview(), realPosterPath, realBackdropPath, logos, tmdbData.getRuntime(), tmdbData.getAgeRating());
            contentRepository.saveAndFlush(content);
        }

        // DTO 조립용 변수 준비
        List<String> genreNames = content.getContentGenres().stream()
                .map(cg -> cg.getGenre().getName())
                .collect(Collectors.toList());

        String summary = (content.getAnalysisCache() != null) ? content.getAnalysisCache().getSummary() : "분석 중입니다.";
        Double ratio = (content.getAnalysisCache() != null) ? content.getAnalysisCache().getPositiveRatio() : 0.0;
        List<String> keywords = Collections.emptyList();

        List<ReviewResponseDto> expertReviews = reviewService.getExpertReviews(id);
        List<UserReviewResponseDto> userReviews = reviewService.getUserReviews(id);

        List<TmdbMovieResponseDto.TmdbCastItem> majorCasts = Collections.emptyList();
        if (tmdbData != null && tmdbData.getCredits() != null && tmdbData.getCredits().getCast() != null) {
            majorCasts = tmdbData.getCredits().getCast().stream()
                    .filter(cast -> cast.getOrder() < 10)
                    .limit(8)
                    .collect(Collectors.toList());
        }

        // 최종 DTO 빌드
        return ContentDetailResponseDto.builder()
                .id(content.getId())
                .title(content.getTitle())
                .overview(content.getOverview())
                .posterPath(content.getPosterPath())
                .backdropPath(content.getBackdropPath()) // ✨ 추가
                .castList(majorCasts)
                .ottLogos(content.getOttLogos())
                .genres(genreNames)
                .aiSummary(summary)
                .positiveRatio(ratio)
                .topKeywords(keywords)
                .expertReviews(expertReviews)
                .userReviews(userReviews)
                .runtime(content.getRuntime())
                .ageRating(content.getAgeRating())
                .build();
    }

    // --- 이하 기존 메인페이지 및 저장 로직 (유지) ---

    public void saveCrawledContent(ContentCreateRequestDto dto) {
        if (contentRepository.findByTmdbId(dto.getTmdbId()).isPresent()) return;
        Content content = contentRepository.save(dto.toEntity());
        for (String genreName : dto.getGenres()) {
            Genre genre = genreRepository.findByName(genreName)
                    .orElseThrow(() -> new RuntimeException("장르 미정 : " + genreName));
            ContentGenre cg = ContentGenre.builder()
                    .content(content)
                    .genre(genre)
                    .build();
            content.addGenre(cg);
        }
    }

    @Transactional(readOnly = true)
    public MainPageResponseDto getMainPageData() {
        List<Content> allContents = contentRepository.findAll();
        String backgroundImage = "";
        if (!allContents.isEmpty()) {
            Collections.shuffle(allContents);
            backgroundImage = allContents.get(0).getPosterPath();
        }

        List<ContentSummaryDto> todayRecommendations = analysisCacheRepository.findAll(
                        Sort.by(Sort.Direction.DESC, "positiveRatio")
                ).stream()
                .limit(10)
                .map(cache -> ContentSummaryDto.builder()
                        .id(cache.getContent().getId())
                        .title(cache.getContent().getTitle())
                        .posterPath(cache.getContent().getPosterPath())
                        .positiveRatio(cache.getPositiveRatio())
                        .build())
                .collect(Collectors.toList());

        List<Genre> genres = genreRepository.findAll();
        Map<String, List<ContentSummaryDto>> genreContents = new HashMap<>();
        for (Genre genre : genres) {
            List<ContentSummaryDto> contents = contentGenreRepository.findByGenre(genre).stream()
                    .limit(15)
                    .map(cg -> {
                        Content content = cg.getContent();
                        Double ratio = (content.getAnalysisCache() != null) ?
                                content.getAnalysisCache().getPositiveRatio() : 0.0;
                        return ContentSummaryDto.builder()
                                .id(content.getId())
                                .title(content.getTitle())
                                .posterPath(content.getPosterPath())
                                .positiveRatio(ratio)
                                .build();
                    })
                    .collect(Collectors.toList());
            genreContents.put(genre.getName(), contents);
        }
        return MainPageResponseDto.builder()
                .backgroundImage(backgroundImage)
                .todayRecommendations(todayRecommendations)
                .genreContents(genreContents)
                .build();
    }

    @Transactional(readOnly = true)
    public Content findById(Long contentId) {
        return contentRepository.findById(contentId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 콘텐츠입니다. ID: " + contentId));
    }
}