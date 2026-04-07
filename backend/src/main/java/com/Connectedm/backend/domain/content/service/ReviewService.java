package com.Connectedm.backend.domain.content.service;

import com.Connectedm.backend.domain.content.dto.ReviewResponseDto;
import com.Connectedm.backend.domain.content.repository.ExpertReviewRepository;
import com.Connectedm.backend.domain.content.repository.UserReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class ReviewService {

    private final ExpertReviewRepository expertReviewRepository;
    private final UserReviewRepository userReviewRepository;

    // 전문가 리뷰 가져오기
    public List<ReviewResponseDto> getExpertReviews(Long contentId) {
        return expertReviewRepository.findByContentId(contentId).stream()
                .map(review -> ReviewResponseDto.builder()
                        .id(review.getId())
                        .criticName(review.getCriticName())
                        .comment(review.getComment())
                        .rating(review.getRating()) // String 그대로 전달
                        .source(review.getSource())
                        .movieTitle(review.getMovieTitle())
                        .build())
                .collect(Collectors.toList());
    }

    // 사용자 리뷰 가져오기
    public List<ReviewResponseDto> getUserReviews(Long contentId) {
        return userReviewRepository.findByContentId(contentId).stream()
                .map(review -> ReviewResponseDto.builder()
                        .id(review.getId())
                        .criticName(review.getUser() != null ? review.getUser().getNickname() : "익명")
                        .comment(review.getComment())
                        .rating(review.getRating()) // String 그대로 전달
                        .build())
                .collect(Collectors.toList());
    }
}
