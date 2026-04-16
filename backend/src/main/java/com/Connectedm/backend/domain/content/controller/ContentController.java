package com.Connectedm.backend.domain.content.controller;

import com.Connectedm.backend.domain.content.dto.*;
import com.Connectedm.backend.domain.content.service.ContentService;
import com.Connectedm.backend.domain.content.service.ReviewService;
import com.Connectedm.backend.global.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;
    private final ReviewService reviewService;

    /**
     * 메인페이지 데이터 조회
     */
    @GetMapping("/main")
    public ApiResponse<MainPageResponseDto> getMainPage() {
        return ApiResponse.success(contentService.getMainPageData());
    }

    /**
     * 상세페이지 데이터 조회
     */
    @GetMapping("/{id}")
    public ApiResponse<ContentDetailResponseDto> getContentDetail(@PathVariable("id") Long id) {
        ContentDetailResponseDto detail = contentService.getContentDetail(id);

        // 줄거리나 장르가 비어있으면 TMDB 동기화 진행
        if (detail.getOverview() == null || detail.getOverview().isBlank() ||
                detail.getGenres().isEmpty() ||
                detail.getRuntime() == null ||
                detail.getAgeRating() == null ||
                detail.getAgeRating().equals("정보없음")
            ) {
            contentService.updateContentWithTmdb(id);
            detail = contentService.getContentDetail(id);
        }

        return ApiResponse.success(detail);
    }

    /**
     * [전문가 리뷰] 전체 조회
     */
    @GetMapping("/reviews")
    public ApiResponse<List<ReviewResponseDto>> getAllExpertReviews() {
        return ApiResponse.success(reviewService.getAllExpertReviews());
    }

    /**
     * [전문가 리뷰] 크롤링 데이터 수신 전용 POST
     */
    @PostMapping("/reviews")
    public ApiResponse<String> saveExpertReview(@RequestBody ExpertReviewCreateRequestDto dto) {
        reviewService.saveExpertReview(dto);
        return ApiResponse.success("전문가 리뷰 저장 완료!");
    }

}