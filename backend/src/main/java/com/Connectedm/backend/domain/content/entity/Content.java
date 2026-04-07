package com.Connectedm.backend.domain.content.entity;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
//@Table(name = "Content")
@Table(name = "content")
public class Content {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "tmdb_id", nullable = false, unique = true, length = 50)
    private String tmdbId;

    @Column(name = "cine21_id", unique = true, length = 50)
    private String cine21Id;

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

    /**
     * TMDB 정보를 한꺼번에 업데이트하는 메서드
     * (사용자 요청에 따라 overview, posterPath, ottLogos 3개 필드 업데이트)
     */
    public void updateTmdbInfo(String overview, String posterPath, String ottLogos) {
        this.overview = overview;
        this.posterPath = posterPath;
        this.ottLogos = ottLogos;
    }

    /**
     * 진짜 TMDB ID와 상세 정보를 함께 업데이트하는 메서드
     */
    public void updateTmdbInfo(String tmdbId, String overview, String posterPath, String ottLogos) {
        this.tmdbId = tmdbId; // 임시 씨네21 ID를 진짜 TMDB ID로 교체
        this.overview = overview;
        this.posterPath = posterPath;
        this.ottLogos = ottLogos;
    }

    // 기존 4개 인자 버전 (title 포함)
    public void updateTmdbInfo1(String title, String overview, String posterPath, String ottLogos) {
        this.title = title;
        this.overview = overview;
        this.posterPath = posterPath;
        this.ottLogos = ottLogos;
    }
}
