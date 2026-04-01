package com.Connectedm.backend.domain.content.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "Content")
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "tmdb_id", nullable = false, unique = true, length = 50)
    private String tmdbId;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;

    @Column(name = "poster_path")
    private String posterPath;

    @Column(name = "ott_logos")
    private String ottLogos;

    // 장르와 연결 (1:N)
    @Builder.Default
    @OneToMany(mappedBy = "content", cascade = CascadeType.ALL, orphanRemoval = true )
    private List<ContentGenre> contentGenres = new ArrayList<>();

    // AI 분석 결과와의 연결 (1:1)
    @OneToOne(mappedBy = "content", cascade = CascadeType.ALL)
    private AnalysisCache analysisCache;

    // 장르 추가 시 양방향 매핑 메서드
    public void addGenre(ContentGenre contentGenre) {
        this.contentGenres.add(contentGenre);
        if (contentGenre.getContent() != this) {
            contentGenre.setContent(this);
        }
    }
}
