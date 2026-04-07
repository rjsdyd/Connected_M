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
    private final TmdbService tmdbService;


    @Transactional
    public void updateContentWithTmdb(Long id) {
        // 1. DB에서 해당 콘텐츠 조회
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("콘텐츠를 찾을 수 없습니다. ID: " + id));

        // 2. 영화 제목으로 진짜 TMDB ID 찾아오기
        Long realTmdbId = tmdbService.searchMovieIdByTitle(content.getTitle());
        
        if (realTmdbId == null) {
            throw new RuntimeException("TMDB에서 해당 영화를 찾을 수 없습니다: " + content.getTitle());
        }

        // 3. 찾은 진짜 TMDB ID로 상세 정보 가져오기
        TmdbMovieResponseDto tmdbData = tmdbService.getMovieDetails(realTmdbId);

        // 4. API 응답 데이터 중 poster_path 앞에는 "https://image.tmdb.org/t/p/w500"를 붙여서 전체 경로 생성
        String fullPosterPath = (tmdbData.getPoster_path() != null) 
                ? "https://image.tmdb.org/t/p/w500" + tmdbData.getPoster_path() 
                : null;
        
        // 5. OTT 로고 데이터 준비
        String logos = tmdbData.getOttLogos() != null ? tmdbData.getOttLogos() : "";

        // 6. 장르 동기화 로직 추가
        if (tmdbData.getGenres() != null) {
            for (TmdbMovieResponseDto.TmdbGenre tmdbGenre : tmdbData.getGenres()) {
                String genreName = tmdbGenre.getName();

                // 6-1. 장르가 DB에 없는 경우 새로 생성 후 저장
                Genre genre = genreRepository.findByName(genreName)
                        .orElseGet(() -> genreRepository.save(Genre.builder().name(genreName).build()));

                // 6-2. 현재 영화와 해당 장르가 이미 연결되어 있는지 확인
                boolean alreadyLinked = content.getContentGenres().stream()
                        .anyMatch(cg -> cg.getGenre().getName().equals(genreName));

                // 6-3. 연결되어 있지 않다면 ContentGenre 생성 및 추가
                if (!alreadyLinked) {
                    ContentGenre contentGenre = ContentGenre.builder()
                            .content(content)
                            .genre(genre)
                            .build();
                    content.addGenre(contentGenre);
                }
            }
        }

        // 7. 진짜 TMDB ID와 함께 모든 정보 업데이트
        content.updateTmdbInfo(
            String.valueOf(realTmdbId), // 진짜 TMDB ID로 교체
            tmdbData.getOverview(), 
            fullPosterPath, 
            logos
        );

        // 8. 명시적으로 변경 사항 저장 (변경 감지에 의존하나 확실한 반영을 위해 호출)
        contentRepository.save(content);
    }

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
        Content content = contentRepository.findById(id)
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
