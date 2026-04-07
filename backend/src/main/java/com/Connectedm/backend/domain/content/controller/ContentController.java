package com.Connectedm.backend.domain.content.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Connectedm.backend.domain.content.dto.ContentDetailResponseDto;
import com.Connectedm.backend.domain.content.dto.MainPageResponseDto;
import com.Connectedm.backend.domain.content.dto.ReviewResponseDto;
import com.Connectedm.backend.domain.content.repository.ExpertReviewRepository;
import com.Connectedm.backend.domain.content.service.ContentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;
    private final ExpertReviewRepository expertReviewRepository;

    // 메인페이지 데이터 조회
    @GetMapping("/main")
    public ResponseEntity<MainPageResponseDto> getMainPage() {
        return ResponseEntity.ok(contentService.getMainPageData());
    }
    // 상세페이지 데이터 조회 (줄거리, 장르, OTT 정보 포함)
    @GetMapping("/{id}")
        public ResponseEntity<ContentDetailResponseDto> getContentDetail(@PathVariable("id") Long id) {
            // 1. DB에서 현재 상세 데이터 가져오기
            ContentDetailResponseDto detail = contentService.getContentDetail(id);

            // 2. 줄거리가 없거나 장르 리스트가 비어있을 때도 업데이트 실행
            if (detail.getOverview() == null || detail.getOverview().isBlank() || detail.getGenres().isEmpty()) {
                
                // 3. TMDB API를 호출해서 DB를 업데이트 (진짜 ID 찾기 + 줄거리 + OTT + 장르 저장)
                contentService.updateContentWithTmdb(id);
                
                // 4. 업데이트된 최신 데이터를 다시 가져오기
                detail = contentService.getContentDetail(id);
            }

            return ResponseEntity.ok(detail);
        }

    // 전문가 리뷰 전체 API 조회
    @GetMapping("/reviews")
    public ResponseEntity<List<ReviewResponseDto>> getAllExpertReviews() {
        List<ReviewResponseDto> reviews = expertReviewRepository.findAll().stream()
                .map(review -> ReviewResponseDto.builder()
                    .id(review.getId())
                    .criticName(review.getCriticName())
                    .rating(review.getRating())
                    .comment(review.getComment())
                    .source(review.getSource())
                    .movieTitle(review.getMovieTitle())
                    .build())
            .toList();

        return ResponseEntity.ok(reviews);
    }
}
