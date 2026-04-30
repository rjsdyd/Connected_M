package com.Connectedm.backend.domain.content.service;

import com.Connectedm.backend.domain.content.dto.ContentSearchRequest;
import com.Connectedm.backend.domain.content.dto.ContentSearchResponse;
import com.Connectedm.backend.domain.content.repository.AnalysisCacheRepository;
import com.Connectedm.backend.global.utils.VectorUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SemanticSearchService {
    private final AnalysisCacheRepository analysisCacheRepository;

    public List<ContentSearchResponse> searchBySemantic(ContentSearchRequest request) {
        double[] queryVector = request.getQueryVector();
        String userQuery = request.getQuery();

        if (queryVector == null || queryVector.length == 0) {
            throw new IllegalArgumentException("검색어의 좌표가 생성되지 않았습니다.");
        }

        return analysisCacheRepository.findAll().stream()
                .filter(cache -> cache.getEmbeddingVector() != null)
                .map(cache -> {
                    double[] targetVector = VectorUtils.parseVectorString(cache.getEmbeddingVector());
                    double score = VectorUtils.cosineSimilarity(queryVector, targetVector);

                    if (cache.getSearchKeywords() != null && cache.getSearchKeywords().contains(userQuery)) {
                        score += 10.0;
                    }

                    boolean isGenreMatch = cache.getContent().getContentGenres().stream()
                            .anyMatch(cg -> {
                                String genreName = cg.getGenre().getName();
                                return genreName.equalsIgnoreCase(userQuery) ||
                                        userQuery.contains(genreName) ||
                                        genreName.contains(userQuery);
                            });

                    if (isGenreMatch) {
                        score += 10.0;
                    }

                    return ContentSearchResponse.builder()
                            .contentId(cache.getContent().getId())
                            .title(cache.getContent().getTitle())
                            .posterPath(cache.getContent().getPosterPath())
                            .similaritySource(score)
                            .overview(cache.getContent().getOverview())
                            .genres(cache.getContent().getContentGenres().stream()
                                    .map(cg -> cg.getGenre().getName())
                                    .collect(Collectors.toList()))
                            .positiveRatio(cache.getPositiveRatio())
                            .build();
                })
                .filter(res -> res.getSimilaritySource() >= 0.45)
                .sorted((a, b) -> Double.compare(b.getSimilaritySource(), a.getSimilaritySource()))
                .limit(10)
                .collect(Collectors.toList());
    }
}