package com.Connectedm.backend.domain.content.service;

import com.Connectedm.backend.domain.content.dto.ExpertReviewCreateRequestDto;
import com.Connectedm.backend.domain.content.dto.ReviewResponseDto;
import com.Connectedm.backend.domain.content.entity.Cine21Source;
import com.Connectedm.backend.domain.content.entity.Content;
import com.Connectedm.backend.domain.content.entity.ExpertReview;
import com.Connectedm.backend.domain.content.repository.Cine21SourceRepository;
import com.Connectedm.backend.domain.content.repository.ContentRepository;
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
    private final Cine21SourceRepository cine21SourceRepository;
    private final ContentRepository contentRepository;

    @Transactional
    public void saveExpertReview(ExpertReviewCreateRequestDto dto) {
        // 1. 씨네21 소스 확보(없으면 생성)
        Cine21Source source = cine21SourceRepository.findByExternalMovieId(dto.getExternalMovieId())
                .orElseGet(() -> cine21SourceRepository.save(
                        Cine21Source.builder()
                                .externalMovieId(dto.getExternalMovieId())
                                .rawTitle(dto.getRawTitle())
                                .build()
                ));

        // 2. 우리 DB의 Content 확보
        Content content = contentRepository.findById(dto.getContentId())
                .orElseThrow(() -> new RuntimeException("콘텐츠 없음 ID:" + dto.getContentId()));

        // 3. 리뷰 저장
        ExpertReview review = ExpertReview.builder()
                .content(content)
                .cine21Source(source)
                .criticName(dto.getCriticName())
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();

        expertReviewRepository.save(review);
    }
    // 전문가 리뷰 가져오기
    public List<ReviewResponseDto> getExpertReviews(Long contentId) {
        return expertReviewRepository.findByContentId(contentId).stream()
                .map(review -> ReviewResponseDto.builder()
                        .id(review.getId())
                        .criticName(review.getCriticName())
                        .comment(review.getComment())
                        .rating(review.getRating())
                        .sourceName(review.getSource())
                        .movieTitle(review.getContent().getTitle()) // 엔티티 수정에 따라 수정
                        .build())
                .collect(Collectors.toList());
    }

    // 사용자 리뷰 가져오기
    public List<ReviewResponseDto> getUserReviews(Long contentId) {
        return userReviewRepository.findByContentId(contentId).stream()
                .map(review -> ReviewResponseDto.builder()
                        .criticName(review.getUser().getNickname()) // 유저 닉네임
                        .comment(review.getComment())
                        .rating(review.getRating()) // String 그대로 전달
                        .build())
                .collect(Collectors.toList());
    }

    public List<ReviewResponseDto> getAllExpertReviews() {
        return expertReviewRepository.findAll().stream()
                .map(review -> ReviewResponseDto.builder()
                        .id(review.getId())
                        .criticName(review.getCriticName())
                        .rating(review.getRating())
                        .comment(review.getComment())
                        .sourceName(review.getSource())
                        .movieTitle(review.getContent().getTitle())
                        .build())
                .toList();
    }
}
