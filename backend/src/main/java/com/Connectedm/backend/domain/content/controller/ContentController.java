package com.Connectedm.backend.domain.content.controller;

import com.Connectedm.backend.domain.content.dto.*; // DTO들 한 번에 소환! ㅋ
import com.Connectedm.backend.domain.content.service.ContentService;
import com.Connectedm.backend.domain.content.service.ReviewService;
import com.Connectedm.backend.domain.content.service.SemanticSearchService;
import com.Connectedm.backend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;
    private final ReviewService reviewService;
    private final SemanticSearchService semanticSearchService;
    private final RestTemplate restTemplate;

    /**
     * 메인페이지 데이터 조회
     */
    @GetMapping("/main")
    public ApiResponse<MainPageResponseDto> getMainPage() {
        return ApiResponse.success(contentService.getMainPageData());
    }

    /**
     * 상세페이지 데이터 조회 (여기서 유저 리뷰 리스트도 같이 나감! ㅋ)
     */
    @GetMapping("/{id}")
    public ApiResponse<ContentDetailResponseDto> getContentDetail(@PathVariable("id") Long id) {
        ContentDetailResponseDto detail = contentService.getContentDetail(id);

        // 줄거리나 장르가 비어있으면 TMDB 동기화 진행 (마스터의 꼼꼼한 로직 ㅋ)
        if (detail.getOverview() == null || detail.getOverview().isBlank() || detail.getGenres().isEmpty()) {
            contentService.updateContentWithTmdb(id);
            detail = contentService.getContentDetail(id);
        }

        return ApiResponse.success(detail);
    }

    /**
     * [전문가 리뷰] 전체 조회 (크롤링 데이터용 ㅋ)
     */
    @GetMapping("/reviews")
    public ApiResponse<List<ReviewResponseDto>> getAllExpertReviews() {
        return ApiResponse.success(reviewService.getAllExpertReviews());
    }

    /**
     * [전문가 리뷰] 크롤링 데이터 수신 전용 POST ㅋ
     */
    @PostMapping("/reviews")
    public ApiResponse<String> saveExpertReview(@RequestBody ExpertReviewCreateRequestDto dto) {
        reviewService.saveExpertReview(dto);
        return ApiResponse.success("전문가 리뷰 저장 완료! ㅋㅋㅋㅋ");
    }

    @PostMapping("/search/semantic")
    public ResponseEntity<List<ContentSearchResponse>> searchSemantic(@RequestBody Map<String, String> requestBody) {
        // 1. 프론트엔드에서 보낸 자연어 쿼리 추출 ㅋㅋㅋㅋ
        String userQuery = requestBody.get("query");

        if (userQuery == null || userQuery.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // 2. 파이썬 사령부(5000번 포트)로 "이 문장 좌표로 바꿔와!"
        String pythonUrl = "http://localhost:5000/vectorize";

        // RestTemplate이 파이썬의 JSON 응답을 double[]로 변환해줍니다!
        double[] vector = restTemplate.postForObject(pythonUrl, Map.of("text", userQuery), double[].class);

        // 3. 받아온 좌표를 DTO에 담아서 서비스 엔진으로 전달
        ContentSearchRequest searchRequest = new ContentSearchRequest();
        searchRequest.setQuery(userQuery);
        searchRequest.setQueryVector(vector);

        // 4. 자바 서비스에서 DB 전수조사 및 유사도 랭킹 산출
        List<ContentSearchResponse> results = semanticSearchService.searchBySemantic(searchRequest);

        // 5. 성공의 리스트 반환
        return ResponseEntity.ok(results);
    }

}