package com.Connectedm.backend.domain.admin.controller;

import com.Connectedm.backend.domain.admin.dto.AdminReviewResponseDto;
import com.Connectedm.backend.domain.admin.dto.AdminUserResponseDto;
import com.Connectedm.backend.domain.admin.service.AdminService;
import com.Connectedm.backend.domain.content.entity.ReviewStatus;
import com.Connectedm.backend.domain.user.entity.UserStatus;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/admin")
@RequiredArgsConstructor
public class AdminController {
    private final AdminService adminService;

    // [GET] 신고된 리뷰 목록 조회
    @GetMapping("/reviews/reported")
    public ResponseEntity<List<AdminReviewResponseDto>> getReportedReviews() {
        return ResponseEntity.ok(adminService.getReportedReviews());
    }

    // [PATCH] 리뷰 상태 변경
    @PatchMapping("/review/{id}/status")
    public ResponseEntity<Void> updateReviewStatus(
            @PathVariable(value = "id") Long id,
            @RequestParam(value = "status") ReviewStatus status) {
        adminService.updateReviewStatus(id, status);;
        return ResponseEntity.ok().build();
    }

    // [DELETE] 리뷰 삭제
    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long id) {
        adminService.deleteReview(id);
        return ResponseEntity.ok().build();
    }

    // [GET] 상습 신고 유저 조회
    @GetMapping("/users/{id}/status")
    public ResponseEntity<List<AdminUserResponseDto>> getReportedUsers() {
        return ResponseEntity.ok(adminService.getReportedUsers());
    }

    // [PATCH] 유저 상태 변경
    @PatchMapping("/users/{id}/status")
    public ResponseEntity<Void> updateUsersStatus(
            @PathVariable Long id,
            @RequestParam UserStatus status) {
        adminService.updateUserStatus(id, status);
        return ResponseEntity.ok().build();
    }
}
