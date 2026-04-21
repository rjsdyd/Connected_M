import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt, FaBookmark, FaRegBookmark } from 'react-icons/fa';
import './MovieDetail.css';
import { useAuth } from '../../hooks/useAuth';

interface CastMember {
  name: string;
  character: string;
  profile_path: string;
}

interface ReviewData {
  id: number;
  nickname: string;
  rating: string;
  comment: string;
}

// OTT 제공자 인터페이스
interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

interface MovieDetailData {
  id: number;
  title: string;
  overview: string;
  posterPath: string;
  backdropPath: string;
  genres: string[];
  castList: CastMember[];
  runtime: number;
  ageRating: string;
  topKeywords: string[];
  expertReviews: ReviewData[];
  userReviews: ReviewData[];
  providers: WatchProvider[]; 
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { isLoggedIn, userNickname } = useAuth();
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false); 

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

  // OTT 클릭 시 이동할 URL 매핑
  const getProviderUrl = (id: number) => {
    const urls: { [key: number]: string } = {
      8: "https://www.netflix.com",
      337: "https://www.disneyplus.com",
      370: "https://www.tving.com",         // 티빙
      356: "https://www.wavve.com",         // 웨이브 (추가/수정)
      97: "https://www.watcha.com",
      350: "https://www.coupangplay.com",
      119: "https://www.amazon.com/Prime-Video",
      2: "https://www.apple.com/apple-tv-plus",
    };
    
    // 매핑된 URL이 있으면 해당 URL로, 없으면 영화 제목 구글 검색으로 연결
    return urls[id] || `https://www.google.com/search?q=${encodeURIComponent(movie?.title + " 보러가기")}`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id || !API_KEY || !BASE_URL) return;
      try {
        setLoading(true);
        const [detailRes, creditsRes, watchRes] = await Promise.all([
          fetch(`${BASE_URL}/movie/${id}?api_key=${API_KEY}&language=ko-KR`),
          fetch(`${BASE_URL}/movie/${id}/credits?api_key=${API_KEY}&language=ko-KR`),
          fetch(`${BASE_URL}/movie/${id}/watch/providers?api_key=${API_KEY}`)
        ]);

        const detailData = await detailRes.json();
        const creditsData = await creditsRes.json();
        const watchData = await watchRes.json();

        // [핵심] 한국(KR) 지역의 모든 제공 방식(스트리밍, 대여, 구매)을 통합
        const krData = watchData.results?.KR;
        const allProviders: WatchProvider[] = [
          ...(krData?.flatrate || []),
          ...(krData?.rent || []),
          ...(krData?.buy || [])
        ];

        // 중복된 provider_id 제거
        const uniqueProviders = allProviders.filter((v, i, a) => 
          a.findIndex(t => t.provider_id === v.provider_id) === i
        );

        setMovie({
          id: detailData.id,
          title: detailData.title,
          overview: detailData.overview,
          posterPath: detailData.poster_path,
          backdropPath: detailData.backdrop_path,
          genres: detailData.genres.map((g: any) => g.name),
          runtime: detailData.runtime,
          ageRating: detailData.adult ? "19+" : "ALL",
          castList: creditsData.cast.slice(0, 6).map((c: any) => ({
            name: c.name,
            character: c.character,
            profile_path: c.profile_path
          })),
          topKeywords: ["몰입감", "연기력", "재미"],
          expertReviews: [],
          userReviews: [],
          providers: uniqueProviders
        });

        const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        setIsWishlisted(savedWishlist.some((item: any) => item.contentId === Number(id)));

      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovieData();
  }, [id, API_KEY, BASE_URL]);

  const handleWishlistToggle = () => { 
    if (!isLoggedIn) { alert("로그인이 필요합니다."); return; }
    const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const isAlreadyWished = savedWishlist.some((item: any) => item.contentId === Number(id));
    let newWishlist = isAlreadyWished 
      ? savedWishlist.filter((item: any) => item.contentId !== Number(id))
      : [...savedWishlist, { contentId: Number(id) }];
    
    setIsWishlisted(!isAlreadyWished);
    localStorage.setItem('wishlist', JSON.stringify(newWishlist));
  };

  const handleReviewSubmit = () => {
    if (!isLoggedIn) { alert("로그인이 필요합니다."); return; }
    if (hasReviewed) { alert("이미 리뷰를 작성하셨습니다."); return; }
    if (!newComment.trim()) { alert("내용을 입력해주세요."); return; }
    if (newRating === 0) { alert("별점을 선택해주세요."); return; }

    const myNewReview: ReviewData = {
      id: Date.now(),
      nickname: userNickname || "익명사용자",
      rating: newRating.toString(),
      comment: newComment
    };

    if (movie) {
      setMovie({ ...movie, userReviews: [myNewReview, ...movie.userReviews] });
    }

    alert("리뷰가 등록되었습니다!");
    setHasReviewed(true);
    setNewComment("");
    setNewRating(0);
  };

  const renderStars = (rating: string | number) => {
    const num = Number(rating) / 2;
    return (
      <div className="star-wrapper compact">
        {[...Array(5)].map((_, i) => {
          const isFull = num >= i + 1;
          const isHalf = num >= i + 0.5 && num < i + 1;
          const starClass = (isFull || isHalf) ? "star-icon filled" : "star-icon";
          return isFull ? (
            <FaStar key={i} className={starClass} />
          ) : isHalf ? (
            <FaStarHalfAlt key={i} className={starClass} />
          ) : (
            <FaRegStar key={i} className={starClass} />
          );
        })}
        <span className="rating-num">{rating}점</span>
      </div>
    );
  };

  if (loading || !movie) return <div className="loading-container">로딩 중...</div>;

  return (
    <div className="detail-container">
      <main className="main-content">
        <section className="banner-section">
          <div className="banner-background-wrapper">
            <div className="banner-bg-image" style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdropPath})` }}></div>
            <div className="banner-overlay"></div>
          </div>
          <div className="banner-content">
            <div className="poster-area">
              <img src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} alt={movie.title} className="main-poster" />
            </div>
            <div className="info-area">
              <div className="meta-info-row">
                <span className={`age-badge ${movie.ageRating === '19+' ? 'age-19' : 'age-all'}`}>{movie.ageRating}</span>
                <span className="runtime-label">{movie.runtime}분</span>
              </div>
              <h1 className="movie-title">{movie.title}</h1>
              
              <div className="platform-buttons-container">
                <span className="platform-label">시청 가능한 플랫폼</span>
                <div className="platform-logos-row">
                  {movie.providers.length > 0 ? (
                    movie.providers.map((p) => (
                      <a key={p.provider_id} href={getProviderUrl(p.provider_id)} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={`https://image.tmdb.org/t/p/original${p.logo_path}`} 
                          alt={p.provider_name} 
                          className="ott-logo-simple" 
                          title={p.provider_name}
                          onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        />
                      </a>
                    ))
                  ) : (
                    <span className="no-provider">현재 제공 중인 OTT가 없습니다.</span>
                  )}
                </div>
                
                <button className={`wishlist-btn ${isWishlisted ? 'active' : ''}`} onClick={handleWishlistToggle}>
                  {isWishlisted ? <FaBookmark /> : <FaRegBookmark />}
                  <span>{isWishlisted ? '찜한 영화' : '찜하기'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <div className="left-column">
            <section className="detail-section">
              <h2 className="section-title">주요 출연진</h2>
              <div className="cast-grid">
                {movie.castList.map((p, i) => (
                  <div key={i} className="cast-card">
                    <img src={p.profile_path ? `https://image.tmdb.org/t/p/w200${p.profile_path}` : ''} alt="" className="cast-photo" />
                    <p className="name">{p.name}</p>
                    <p className="character">{p.character}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="detail-section">
              <h2 className="section-title">줄거리</h2>
              <p className="synopsis-text">{movie.overview}</p>
            </section>
          </div>

          <div className="right-column">
            <section className="detail-section">
              <h2 className="section-title">관람평 ({movie.userReviews.length})</h2>
              <div className="compact-card-container">
                {movie.userReviews.length > 0 ? movie.userReviews.map((r) => (
                  <div key={r.id} className="compact-review-row">
                    <div className="compact-reviewer-meta">
                      <span className="compact-reviewer-name">{r.nickname}</span>
                      {renderStars(r.rating)}
                    </div>
                    <p className="compact-comment-text">{r.comment}</p>
                  </div>
                )) : <p className="placeholder-text" style={{padding: '20px', color: '#999'}}>첫 번째 리뷰를 남겨보세요!</p>}
              </div>
            </section>

            <section className="review-write-section">
              <h2 className="section-title">리뷰 작성</h2>
              {!isLoggedIn ? (
                <div className="already-reviewed-msg">로그인이 필요합니다.</div>
              ) : hasReviewed ? (
                <div className="already-reviewed-msg">이미 리뷰를 작성하셨습니다.</div>
              ) : (
                <div className="write-form-container">
                  <div className="interactive-rating-stars-wrapper" onMouseLeave={() => setHoverRating(null)}>
                    {[...Array(5)].map((_, i) => {
                      const displayRating = hoverRating !== null ? hoverRating : newRating;
                      const isFull = displayRating >= (i + 1) * 2;
                      const isHalf = displayRating === (i * 2) + 1;
                      const starClass = (isFull || isHalf) ? "visible-star filled" : "visible-star";
                      return (
                        <div key={i} className="interactive-star-area">
                          {isFull ? <FaStar className={starClass} /> : isHalf ? <FaStarHalfAlt className={starClass} /> : <FaRegStar className={starClass} />}
                          <div className="click-zones-wrapper">
                            <div className="click-zone left-half" onMouseEnter={() => setHoverRating(i * 2 + 1)} onClick={() => setNewRating(i * 2 + 1)} />
                            <div className="click-zone right-half" onMouseEnter={() => setHoverRating(i * 2 + 2)} onClick={() => setNewRating(i * 2 + 2)} />
                          </div>
                        </div>
                      );
                    })}
                    <span className="rating-num-display">{hoverRating !== null ? hoverRating : newRating}점</span>
                  </div>
                  <textarea className="write-textarea" placeholder="감상을 남겨주세요." value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                  <button className="btn-submit-review" onClick={handleReviewSubmit}>리뷰 등록</button>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MovieDetail;