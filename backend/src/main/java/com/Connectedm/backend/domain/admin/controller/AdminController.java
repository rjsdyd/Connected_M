package com.Connectedm.backend.domain.admin.controller;

import com.Connectedm.backend.domain.admin.dto.*;
import com.Connectedm.backend.domain.admin.service.AdminService;
import com.Connectedm.backend.domain.content.entity.ReviewStatus;
import com.Connectedm.backend.domain.user.entity.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin") // 슬래시(/) 추가로 경로 안정성 확보 ㅋ
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // ==========================================================
    // 1. 유저 관리 (User Management)
    // ==========================================================

    // [GET] 전체 유저 목록 조회 (최신순)
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponseDto>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // [GET] 상습 신고 유저 조회 ㅋ (기존 명세 경로 수정: /reported)
    @GetMapping("/users/reported")
    public ResponseEntity<List<AdminUserResponseDto>> getReportedUsers() {
        return ResponseEntity.ok(adminService.getReportedUsers());
    }

    // [PATCH] 유저 상태 변경 (ACTIVE, BANNED 등)
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Void> updateUsersStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status) {
        adminService.updateUserStatus(id, status);
        return ResponseEntity.ok().build();
    }

    // ==========================================================
    // 2. 리뷰 및 콘텐츠 관리 (Review & Stats)
    // ==========================================================

    // [GET] 신고된 리뷰 목록 조회
    @GetMapping("/reviews/reported")
    public ResponseEntity<List<AdminReviewResponseDto>> getReportedReviews() {
        return ResponseEntity.ok(adminService.getReportedReviews());
    }

    // [PATCH] 리뷰 상태 변경 (NORMAL <-> HIDDEN)
    @PatchMapping("/reviews/{id}/status") // 복수형 /reviews로 통일 ㅋ
    public ResponseEntity<Void> updateReviewStatus(
            @PathVariable Long id,
            @RequestParam ReviewStatus status) {
        adminService.updateReviewStatus(id, status);
        return ResponseEntity.ok().build();
    }

    // [DELETE] 리뷰 영구 삭제
    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        adminService.deleteReview(id);
        return ResponseEntity.ok().build();
    }

    // [GET] 콘텐츠 인기 통계 조회 (조회수/찜수 순)
    @GetMapping("/stats/contents")
    public ResponseEntity<List<AdminContentStateResponseDto>> getContentStats() {
        return ResponseEntity.ok(adminService.getContentStats());
    }

    // ==========================================================
    // 3. 보안 및 시스템 로그 (System Logs)
    // ==========================================================

    // [GET] 전체 로그인 히스토리 조회
    @GetMapping("/logs/login")
    public ResponseEntity<List<LoginLogResponseDto>> getLoginLogs() {
        return ResponseEntity.ok(adminService.getLoginLogs());
    }
}