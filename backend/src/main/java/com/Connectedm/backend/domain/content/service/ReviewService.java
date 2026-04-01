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
                        .critictName(review.getCriticName())
                        .comment(review.getComment())
                        .rating(review.getRating())
                        .source(review.getSource())
                        .build())
                .collect(Collectors.toList());
    }
    // 사용자 리뷰 가져오기
    public List<ReviewResponseDto> getUserReviews(Long contentId) {
        return userReviewRepository.findByContentId(contentId).stream()
                .map(review -> ReviewResponseDto.builder()
                        .critictName(review.getUser().getNickname()) // 유저 닉네임 ㅋㅋㅋㅋ
                        .comment(review.getComment())
                        .rating(review.getRating())
                        .build())
                .collect(Collectors.toList());
    }
}
