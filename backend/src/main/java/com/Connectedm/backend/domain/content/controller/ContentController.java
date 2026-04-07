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

    // 상세 페이지 데이터 조회
    @GetMapping("/{id}")
    public ResponseEntity<ContentDetailResponseDto> getContentDetail(@PathVariable Long id) {
        return ResponseEntity.ok(contentService.getContentDetail(id));
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
