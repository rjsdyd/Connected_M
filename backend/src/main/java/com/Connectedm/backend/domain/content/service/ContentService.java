package com.Connectedm.backend.domain.content.service;

import com.Connectedm.backend.domain.content.dto.*;
import com.Connectedm.backend.domain.content.entity.Content;
import com.Connectedm.backend.domain.content.entity.ContentGenre;
import com.Connectedm.backend.domain.content.entity.Genre;
import com.Connectedm.backend.domain.content.repository.AnalysisCacheRepository;
import com.Connectedm.backend.domain.content.repository.ContentGenreRepository;
import com.Connectedm.backend.domain.content.repository.ContentRepository;
import com.Connectedm.backend.domain.content.repository.GenreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class ContentService {

    private final ContentRepository contentRepository;
    private final GenreRepository genreRepository;
    private final AnalysisCacheRepository analysisCacheRepository;
    private final ContentGenreRepository contentGenreRepository;
    private final ReviewService reviewService;

    // 크롤링 데이터 DB저장
    public void saveCrawledContent(ContentCreateRequestDto dto) {
        // 1. 중복 체크(TMDB ID 기준)
        if (contentRepository.findByTmdbId(dto.getTmdbId()).isPresent()) return;

        // 2. Content 본체 저장
        Content content = contentRepository.save(dto.toEntity());

        // 3. 장르 연결 (ContentGenre 매핑)
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

    // 메인페이지 데이터
    @Transactional(readOnly = true)
    public MainPageResponseDto getMainPageData() {
        // 1. 배경용 랜덤 영화 (포스터 경로만)
        List<Content> allContents = contentRepository.findAll();
        String backgroundImage = "";
        if (!allContents.isEmpty()) {
            Collections.shuffle(allContents);
            backgroundImage = allContents.get(0).getPosterPath();
        }

        // 2. 오늘의 추천작 (평점 높은 순 10개)
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

        // 3. 장르별 3줄 리스트 (5대 장르별 그룹화)
        List<Genre> genres = genreRepository.findAll();
        Map<String, List<ContentSummaryDto>> genreContents = new HashMap<>();

        for (Genre genre : genres) {
            // 각 장르별로 최대 15개씩만 끊어서 가져오기
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

    // 콘텐츠 상세 조회
    @Transactional(readOnly = true)
    public ContentDetailResponseDto getContentDetail(Long id) {
        // 1. 콘텐츠 본체와 AI분석 캐시를 한 번에 가져오기
        Content content = contentRepository.findWithCacheById(id)
                .orElseThrow(() -> new RuntimeException("해당 콘텐츠를 찾을 수 없습니다. ID: " + id));

        // 2. 장르 이름들만 리스트로 뽑기
        List<String> genreNames = content.getContentGenres().stream()
                .map(cg -> cg.getGenre().getName())
                .collect(Collectors.toList());

        // 3. AI 분석 데이터 가져오기 (Null 체크)
        String summary = (content.getAnalysisCache() != null) ? content.getAnalysisCache().getSummary() : "분석 중입니다.";
        Double ratio = (content.getAnalysisCache() != null) ? content.getAnalysisCache().getPositiveRatio() : 0.0;
        // 키워드는 나중에 AnalysisCache에 필드 추가되면 매핑
        List<String> keywords = Collections.emptyList();

        // 4. 리뷰 데이터 가져오기
        // TODO : ReviewService 구현 후 주입받어서 아래 주석 해제
        List<ReviewResponseDto> expertReviews = reviewService.getExpertReviews(id);
        List<ReviewResponseDto> userReviews = reviewService.getUserReviews(id);

        // 5. 최종 DTO 빌드
        return ContentDetailResponseDto.builder()
                .id(content.getId())
                .title(content.getTitle())
                .overview(content.getOverview())
                .posterPath(content.getPosterPath())
                .ottLogos(content.getOttLogos())
                .genres(genreNames)
                .aiSummary(summary)
                .positiveRatio(ratio)
                .topKeywords(keywords)
                .expertReviews(expertReviews)
                .userReviews(userReviews)
                .build();
    }
}
