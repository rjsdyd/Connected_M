package com.Connectedm.backend.domain.content.controller;

import com.Connectedm.backend.domain.content.dto.ContentDetailResponseDto;
import com.Connectedm.backend.domain.content.dto.ExpertReviewCreateRequestDto;
import com.Connectedm.backend.domain.content.dto.MainPageResponseDto;
import com.Connectedm.backend.domain.content.dto.ReviewResponseDto;
import com.Connectedm.backend.domain.content.repository.ExpertReviewRepository;
import com.Connectedm.backend.domain.content.service.ContentService;
import com.Connectedm.backend.domain.content.service.ReviewService;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    private final ReviewService reviewService; //

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


        return ResponseEntity.ok(reviewService.getAllExpertReviews());
    }

    //  크롤링 데이터 수신용 POST API
    @PostMapping("/reviews")
    public ResponseEntity<String> saveExpertReview(@RequestBody ExpertReviewCreateRequestDto dto) {
        reviewService.saveExpertReview(dto);
        return ResponseEntity.ok("씨네21 리뷰 저장 완료! ㅋㅋㅋㅋ");
    }
}
