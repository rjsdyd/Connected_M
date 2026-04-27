package com.Connectedm.backend.domain.admin.service;

import com.Connectedm.backend.domain.admin.dto.AdminReviewResponseDto;
import com.Connectedm.backend.domain.admin.dto.AdminUserResponseDto;
import com.Connectedm.backend.domain.content.entity.ReviewStatus;
import com.Connectedm.backend.domain.content.entity.UserReview;
import com.Connectedm.backend.domain.content.repository.UserReviewRepository;
import com.Connectedm.backend.domain.content.service.ReviewService;
import com.Connectedm.backend.domain.user.entity.UserStatus;
import com.Connectedm.backend.domain.user.repository.UserRepository;
import com.Connectedm.backend.domain.user.service.UserService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AdminService {

    private final UserReviewRepository userReviewRepository;
    private final UserRepository userRepository;
    private final ReviewService reviewService;
    private final UserService userService;

    // ==========================================================
    // 1. [조회] 명세 대응
    // ==========================================================

    /**
     * [조회] 신고된 리뷰 목록(신고 많은 순)
     */
    public List<AdminReviewResponseDto> getReportedReviews() {
        return userReviewRepository.findAllByReportCountGreaterThanOrderByReportCountDesc(0)
                .stream()
                .map(review -> AdminReviewResponseDto.builder()
                        .reviewId(review.getId())
                        .writeNickname(review.getUser().getNickname())
                        .movieTitle(review.getContent().getTitle())
                        .comment(review.getComment())
                        .reportCount(review.getReportCount())
                        .status(review.getStatus())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * [조회] 상습 신고 유저 목록(신고 많은 순)
     */
    public List<AdminUserResponseDto> getReportedUsers() {
        return userRepository.findAllByReportedCountGreaterThanOrderByReportedCountDesc(0)
                .stream()
                .map(user -> AdminUserResponseDto.builder()
                        .userId(user.getId())
                        .email(user.getEmail())
                        .nickname(user.getNickname())
                        .reportedCount(user.getReportedCount())
                        .status(user.getStatus())
                        .build())
                .collect(Collectors.toList());
    }
    // ==========================================================
    // 2. [변경/처분]
    // ==========================================================

    /**
     * [PATCH] 리뷰 상태 변경 (NORMAL <-> HIDDEN)
     */
    @Transactional
    public void updateReviewStatus(Long reviewId, ReviewStatus status) {
        UserReview review = userReviewRepository.findById(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("리뷰 없음"));
        review.changeStatusByAdmin(status);
    }

    /**
     * [DELETE] 리뷰 삭제
     */
    @Transactional
    public void deleteReview(Long reviewId) {
        reviewService.deleteUserReview(0L, "ROLE_ADMIN", reviewId);
    }

    /**
     * [PATCH] 유저 상태 변경(ACTIVE, PENDING, BANNED)
     */
    @Transactional
    public void updateUserStatus(Long userId, UserStatus status) {
        userService.updateUserStatus(userId,status);
    }

}
