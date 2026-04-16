package com.Connectedm.backend.domain.user.service;

import com.Connectedm.backend.domain.content.entity.Content;
import com.Connectedm.backend.domain.content.repository.ContentRepository;
import com.Connectedm.backend.domain.user.dto.WishlistResponse;
import com.Connectedm.backend.domain.user.entity.User;
import com.Connectedm.backend.domain.user.entity.Wishlist;
import com.Connectedm.backend.domain.user.repository.UserRepository;
import com.Connectedm.backend.domain.user.repository.WishlistRepository;
import com.Connectedm.backend.global.error.CustomException;
import com.Connectedm.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ContentRepository contentRepository;

    @Transactional
    public String toggleWishlist(Long userId, Long contentId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND)); // [cite: 187]
        Content content = contentRepository.findById(contentId)
                .orElseThrow(() -> new CustomException(ErrorCode.CONTENT_NOT_FOUND));

        return wishlistRepository.findByUserAndContent(user, content)
                .map(wishlist -> {
                    wishlistRepository.delete(wishlist);
                    return "찜 해제 완료";
                })
                .orElseGet(() -> {
                    wishlistRepository.save(Wishlist.builder()
                            .user(user)
                            .content(content)
                            .build());
                    return "찜 추가 완료 ️";
                });
    }

    public List<WishlistResponse> getMyWishlist(Long userId) {
        return wishlistRepository.findAllByUserId(userId).stream()
                .map(w -> WishlistResponse.builder()
                        .wishlistId(w.getId())
                        .contentId(w.getContent().getId())
                        .title(w.getContent().getTitle())
                        .posterPath(w.getContent().getPosterPath())
                        .build())
                .collect(Collectors.toList()); //
    }

}
