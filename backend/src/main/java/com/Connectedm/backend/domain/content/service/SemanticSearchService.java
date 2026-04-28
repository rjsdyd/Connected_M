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
        // 1. 사용자의 검색어 벡터(queryVector)를 가져온다.
        double[] queryVector = request.getQueryVector();

        if (queryVector == null || queryVector.length == 0) {
            throw  new IllegalArgumentException("검색어의 좌표가 생성되지 않았습니다.");
        }
        // 2. DB의 모든 분석 데이터를 가져와서 유사도 계산 루프
        return analysisCacheRepository.findAll().stream()
                .filter(cache -> cache.getEmbeddingVector() != null) //벡터가 없는 데이터는 패스
                .map(cache -> {
                    // 3. DB문자열 -> 숫자 배열 변환(VectorUtils 활용)
                    double[] targetVector = VectorUtils.parseVectorString(cache.getEmbeddingVector());

                    // 4. 코사인 유사도 연산
                    double score = VectorUtils.cosineSimilarity(queryVector, targetVector);

                    // 5. Response DTO 빌드(1:1매핑 덕분에 연관 객체 접근 가능)
                    return ContentSearchResponse.builder()
                            .contentId(cache.getContent().getId())
                            .title(cache.getContent().getTitle())
                            .posterPath(cache.getContent().getPosterPath())
                            .similaritySource(score)
                            .overview(cache.getContent().getOverview())
                            .build();
                })
                // 6. 유사도 높은 순(내림차순) 정렬
                .sorted((a, b) -> Double.compare(b.getSimilaritySource(), a.getSimilaritySource()))
                .limit(10) // TOP10만 추출
                .collect(Collectors.toList());
    }
}
