package com.Connectedm.backend.domain.user.service;

import com.Connectedm.backend.domain.content.entity.Content;
import com.Connectedm.backend.domain.user.entity.RecentView;
import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.repository.RecentViewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecentViewService {

    private final RecentViewRepository recentViewRepository;
    private final int MAX_RECENT_COUNT = 10;    // 최근 본 영화 갯(수정 가능)

    /**
     *  최근 열람 기록 저장 및 업데이트(UPSERT)
     */
    @Transactional
    public void saveOrUpdateRecentView(User user, Content content) {
        // 1. 이미 본 적 있는지 리포지토리 확인
        Optional<RecentView> existingView = recentViewRepository.findByUserAndContent(user, content);

        if (existingView.isPresent()) {
            // 2. 있으면 시간만 갱신
            existingView.get().updateViewedAt();
        } else {
            // 3. 없으면 새로 생성해서 저장
            RecentView newView = RecentView.builder()
                    .user(user)
                    .content(content)
                    .build();
            recentViewRepository.save(newView);
        }

        // 4. 기록이 너무 많으면 가장 오래된 기록 삭제
        cleanUpOldRecords(user);
    }

    /**
     * 유저별 기록 개수 제한 로직
     */
    private void cleanUpOldRecords(User user) {
        Long count = recentViewRepository.countByUser(user);
        if (count>MAX_RECENT_COUNT) {
            recentViewRepository.deleteFirstByUserOrderByViewedAtAsc(user);
        }
    }

    /**
     * 마이페이지용 최근 열람 목록 조회
     */
    public List<RecentView> getRecentViews(User user) {
        return recentViewRepository.findByUserOrderByViewedAtDesc(user);
    }
}
