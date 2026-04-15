import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
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
  criticName: string;
  rating: string;
  comment: string;
  sourceName: string;
}

interface MovieDetailData {
  id: number;
  title: string;
  overview: string;
  posterPath: string;    
  ottLogos: string;      
  genres: string[];      
  castList: CastMember[]; 
  aiSummary: string;     
  positiveRatio: number; 
  topKeywords: string[]; 
  expertReviews: ReviewData[];
  userReviews: ReviewData[];
  backdropPath: string;
  runtime?: number;
}

const MovieDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { isLoggedIn, userNickname } = useAuth();
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false); 
  const [expertPage, setExpertPage] = useState(0);
  const [userPage, setUserPage] = useState(0);
  const itemsPerPage = 3;

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/contents/${id}`);
        const data: MovieDetailData = response.data.data || response.data;

        if (isLoggedIn && userNickname) {
          const alreadyHasReview = data.userReviews.some(review => review.criticName === userNickname);
          setHasReviewed(alreadyHasReview);
        }
        
        setMovie(data);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchMovieData();
  }, [id, isLoggedIn, userNickname]);

  const handleWishlistToggle = () => {
    if (!isLoggedIn) {
      alert("로그인이 필요한 기능입니다.");
      return;
    }
    setIsWishlisted(!isWishlisted);
  };

  const renderYellowStars = (rating: string | number) => {
    const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
    const ratingOutOfFive = numRating / 2;
    const fullStars = Math.floor(ratingOutOfFive);
    const hasHalfStar = ratingOutOfFive % 1 >= 0.5;

    return (
      <div className="star-wrapper compact icon-based">
        {[...Array(5)].map((_, i) => {
          if (i < fullStars) return <FaStar key={i} className="star-icon compact filled" />;
          if (i === fullStars && hasHalfStar) return <FaStarHalfAlt key={i} className="star-icon compact half" />;
          return <FaRegStar key={i} className="star-icon compact empty" />;
        })}
        <span className="rating-num compact"> {numRating} 점</span>
      </div>
    );
  };

const handleReviewSubmit = async () => {
    if (!isLoggedIn) { alert("로그인이 필요합니다."); return; }
    if (hasReviewed) { alert("리뷰는 한 번만 작성 가능합니다."); return; }
    if (!newComment.trim()) { alert("내용을 입력해주세요."); return; }
    if (newRating === 0) { alert("별점을 선택해주세요."); return; }

    try {
      const reviewRequest = {
        contentId: movie?.id,
        criticName: userNickname,
        rating: newRating.toString(),
        comment: newComment
      };

      // 1. 서버에 데이터 전송
      const response = await axios.post(`http://localhost:8080/api/reviews`, reviewRequest);

      // 2. 서버 응답이 성공(200~201)인 경우에만 로직 수행
      if (response.status === 200 || response.status === 201) {
        alert("리뷰가 성공적으로 등록되었습니다!");

        // 3. UI 즉시 업데이트 (중복 작성 방지)
        setHasReviewed(true);

        // 4. 관람평 목록에 내가 쓴 리뷰 즉시 끼워넣기 (화면 갱신)
        if (movie) {
          const myNewReview: ReviewData = {
            id: Date.now(), // 임시 ID (서버에서 받은 ID가 있다면 response.data.id 사용 권장)
            criticName: userNickname || "나",
            rating: newRating.toString(),
            comment: newComment,
            sourceName: "내 리뷰"
          };

          setMovie({
            ...movie,
            userReviews: [myNewReview, ...movie.userReviews] // 새 리뷰를 목록 맨 앞으로
          });
        }

        // 5. 입력창 비우기
        setNewComment("");
        setNewRating(0);
      }
    } catch (error) {
      console.error("리뷰 등록 실패 상세:", error);
      // 만약 서버에서 "이미 작성한 유저입니다"라는 에러를 보낸다면 여기서 처리
      if (axios.isAxiosError(error) && error.response?.status === 400) {
        alert("이미 리뷰를 작성하셨습니다.");
        setHasReviewed(true);
      } else {
        alert("리뷰 등록 중 오류가 발생했습니다. 서버 연결을 확인해 주세요.");
      }
    }
  };

  const getPagedData = (data: any[], page: number) => data.slice(page * itemsPerPage, (page + 1) * itemsPerPage);
  const totalPagesCount = (len: number) => Math.ceil(len / itemsPerPage);

  const renderNav = (cur: number, total: number, set: any) => (
    <div className="compact-controller">
      <button className="nav-btn" onClick={() => set((prev: number) => Math.max(0, prev - 1))} disabled={cur === 0}>‹</button>
      <span className="page-indicator">{cur + 1}/{total > 0 ? total : 1}</span>
      <button className="nav-btn" onClick={() => set((prev: number) => Math.min(total - 1, prev + 1))} disabled={cur >= total - 1}>›</button>
    </div>
  );

  const handleInteractiveStarClick = (starIndex: number, isHalf: boolean) => {
    if (hasReviewed || !isLoggedIn) return; 
    setNewRating((starIndex * 2) + (isHalf ? 1 : 2));
  };

  const getOttLink = (logoPath: string, movieTitle: string) => {
    const path = logoPath.trim();
    if (path.includes("pbpMk2JmcoNnQwx5JGpXngfoWtp")) return "https://www.netflix.com";
    if (path.includes("dpR8r13zWDeUR0QkzWidrdMxa56")) return "https://www.netflix.com";
    if (path.includes("97yvRBw1GzX7fXprcF80er19ot")) return "https://www.disneyplus.com";
    if (path.includes("5gmEivxOGPdqQ0A09uXp9Gf1vSj")) return "https://www.coupangplay.com";
    if (path.includes("hPcjSaWfMwEqXaCMu7Fkb529Dkc")) return "https://www.wavve.com";
    if (path.includes("5gmEivxOGPdq4Afpq1f8ktLtEW1")) return "https://watcha.com";
    if (path.includes("qHThQdkJuROK0k5QTCrknaNukWe")) return "https://www.tving.com";
    return `https://www.google.com/search?q=${encodeURIComponent(movieTitle)}+시청하기`;
  };

  if (loading || !movie) return <div className="loading-container">데이터를 불러오는 중...</div>;

  const ottLogos = movie.ottLogos 
    ? movie.ottLogos.split(',')
        .map(s => s.trim())
        .filter(s => s && s.length > 10) 
    : [];

  return (
    <div className="detail-container">
      <main className="main-content">
        <section className="banner-section">
          <div className="banner-background-wrapper">
            <div 
              className="banner-bg-image" 
              style={{ backgroundImage: `url(https://image.tmdb.org/t/p/original${movie.backdropPath})` }}
            ></div>
            <div className="banner-overlay"></div>
          </div>

          <div className="banner-content">
            <div className="poster-area">
              <img 
                src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`} 
                alt={movie.title} 
                className="main-poster" 
              />
            </div>
            
            <div className="info-area">
              <div className="title-row">
                <h1 className="movie-title">{movie.title}</h1>
                <span className="runtime-label">{movie.runtime || '120'} min</span>
              </div>
              
              <div className="genre-row">
                {movie.genres.map((g, i) => <span key={i} className="genre-tag">{g}</span>)}
              </div>

              <div className="platform-buttons-container">
                <span className="platform-label">현재 상영중인 플랫폼</span>
                <div className="platform-logos-row">
                  {ottLogos.map((logo, i) => {
                    const targetUrl = getOttLink(logo, movie.title);
                    const fullLogoUrl = `https://image.tmdb.org/t/p/original${logo.startsWith('/') ? logo : '/' + logo}`;
                    return (
                      <a key={i} href={targetUrl} target="_blank" rel="noopener noreferrer" className="ott-logo-link">
                        <img src={fullLogoUrl} alt="OTT 로고" className="ott-logo-simple" />
                      </a>
                    );
                  })}
                </div>
                
                <button className={`wishlist-btn ${isWishlisted ? 'active' : ''}`} onClick={handleWishlistToggle}>
                  {isWishlisted ? <FaBookmark className="wish-icon" /> : <FaRegBookmark className="wish-icon" />}
                  <span>{isWishlisted ? '찜한 영화' : '찜하기'}</span>
                </button>
              </div>
            </div>

            <div className="ai-keyword-side-card">
              <div className="card-header">AI 분석 키워드</div>
              <div className="card-body placeholder-body">
                <p className="placeholder-text">추후 구현 예정</p>
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
                    {p.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w200${p.profile_path}`} alt={p.name} className="cast-photo" />
                    ) : (
                      <div className="photo-placeholder" />
                    )}
                    <p className="name">{p.name}</p>
                    <p className="work">{p.character}</p>
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
              <h2 className="section-title">전문가 평점</h2>
              <div className="compact-card-container">
                <div className="compact-card-content">
                  {movie.expertReviews.length > 0 ? (
                    getPagedData(movie.expertReviews, expertPage).map((r, i) => (
                      <div key={i} className="compact-review-row">
                        <div className="compact-reviewer-meta">
                          <span className="compact-reviewer-name">{r.criticName}</span>
                          {renderYellowStars(r.rating)}
                        </div>
                        <p className="compact-comment-text">{r.comment}</p>
                      </div>
                    ))
                  ) : <p className="empty-msg">등록된 평점이 없습니다.</p>}
                </div>
                {renderNav(expertPage, totalPagesCount(movie.expertReviews.length), setExpertPage)}
              </div>
            </section>

            <section className="detail-section">
              <h2 className="section-title">관람평 리뷰 ({movie.userReviews.length}건)</h2>
              <div className="compact-card-container">
                <div className="compact-card-content">
                  {movie.userReviews.length > 0 ? (
                    getPagedData(movie.userReviews, userPage).map((r, i) => (
                      <div key={i} className="compact-review-row">
                        <div className="compact-reviewer-meta">
                          <span className="compact-reviewer-name">{r.criticName}</span>
                          {renderYellowStars(r.rating)}
                        </div>
                        <p className="compact-comment-text">{r.comment}</p>
                      </div>
                    ))
                  ) : <p className="empty-msg">첫 리뷰를 작성해보세요!</p>}
                </div>
                {renderNav(userPage, totalPagesCount(movie.userReviews.length), setUserPage)}
              </div>
            </section>

            <section className="review-write-section">
              <h2 className="write-title">리뷰 작성</h2>
              {!isLoggedIn ? (
                <div className="already-reviewed-msg">로그인이 필요한 서비스입니다.</div>
              ) : hasReviewed ? (
                <div className="already-reviewed-msg">이미 리뷰를 작성하셨습니다.</div>
              ) : (
                <div className="write-form-container">
                  <div className="interactive-rating-stars-wrapper" onMouseLeave={() => setHoverRating(null)}>
                    {[...Array(5)].map((_, i) => {
                      const displayRating = hoverRating !== null ? hoverRating : newRating;
                      let StarIcon = FaRegStar;
                      if (displayRating >= i * 2 + 2) StarIcon = FaStar;
                      else if (displayRating >= i * 2 + 1) StarIcon = FaStarHalfAlt;

                      return (
                        <div key={i} className="interactive-star-area">
                          <StarIcon className="interactive-star-icon visible-star" />
                          <div className="click-zones-wrapper">
                            <div className="click-zone left-half" onMouseEnter={() => setHoverRating(i * 2 + 1)} onClick={() => handleInteractiveStarClick(i, true)} />
                            <div className="click-zone right-half" onMouseEnter={() => setHoverRating(i * 2 + 2)} onClick={() => handleInteractiveStarClick(i, false)} />
                          </div>
                        </div>
                      );
                    })}
                    <span className="rating-num-display">{hoverRating !== null ? hoverRating : newRating}점</span>
                  </div>
                  <div className="textarea-wrapper">
                    <textarea 
                      className="write-textarea" 
                      placeholder={`${userNickname}님, 솔직한 감상을 남겨주세요.`}
                      value={newComment} 
                      maxLength={200}
                      onChange={(e) => setNewComment(e.target.value)} 
                    />
                    <span className="char-count">{newComment.length} / 200</span>
                  </div>
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