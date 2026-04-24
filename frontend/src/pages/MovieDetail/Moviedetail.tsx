import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt, FaBookmark, FaRegBookmark, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './MovieDetail.css';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

interface ExpertReviewData {
  id: number;
  criticName: string;
  rating: string;
  comment: string;
  source: string;
}

interface UserReviewData {
  id: number;
  nickname: string;
  rating: string;
  comment: string;
}

interface CastMember {
  name: string;
  character: string;
  profile_path: string;
}

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
  expertReviews: ExpertReviewData[];
  userReviews: UserReviewData[];
  providers: WatchProvider[]; 
  ottLogos?: string;
}

const MovieDetail: React.FC = () => {
  // 이름을 '홍*동' 형태로 만들어주는 도구예요.
  const maskName = (name: string) => {
    if (!name) return "";
    if (name.length <= 1) return name; // 한 글자면 그대로 둬요.
    if (name.length === 2) return name[0] + "*"; // 두 글자면 '홍*' 처럼 보여요.
    
    // 세 글자 이상일 때: 첫 글자 + 별 + 마지막 글자
    return name[0] + "*".repeat(name.length - 2) + name.slice(-1);
  };

  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const { isLoggedIn, userNickname } = useAuth();
  const [hasReviewed, setHasReviewed] = useState<boolean>(false);
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false); 

  // ✨ 최근 본 목록 API가 여러 번 쏘아지는 걸 막는 자물쇠 상태 추가
  const [hasLoggedRecentView, setHasLoggedRecentView] = useState<boolean>(false);

  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(0); 
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const [expertPage, setExpertPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const itemsPerPage = 3;

  const [expandedReviews, setExpandedReviews] = useState<number[]>([]);

  const toggleReview = (reviewId: number) => {
    setExpandedReviews(prev => 
      prev.includes(reviewId) 
        ? prev.filter(id => id !== reviewId) 
        : [...prev, reviewId]
    );
  };

  // 🔴 명준님의 기존 코드 100% 원상복구! 🔴
  const getOttLink = (logoPath: string, movieTitle: string) => {
    if (!logoPath) return `https://www.google.com/search?q=${encodeURIComponent(movieTitle)}+시청하기`;
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchMovieData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const token = localStorage.getItem('token'); 

        const response = await fetch(`http://localhost:8080/api/contents/${id}`);
        const result = await response.json();

        if (result && result.data) {
          const data = result.data;
          setMovie({
            ...data,
            posterPath: data.posterPath ? data.posterPath.replace('https://image.tmdb.org/t/p/w500', '') : "",
            backdropPath: data.backdropPath ? data.backdropPath.replace('https://image.tmdb.org/t/p/original', '') : "",
          });

          // ✨ 1. 리뷰 중복 체크 및 찜 상태 확인 (null 에러 방지 처리)
          if (isLoggedIn && userNickname) {
            setHasReviewed(data.userReviews?.some((r: any) => r.nickname === userNickname) ?? false);
            
            if (token) {
              const wishRes = await axios.get('http://localhost:8080/api/members/wishlist', {
                headers: { Authorization: `Bearer ${token}` }
              });
              const isWished = wishRes.data?.some((w: any) => w.contentId === Number(id)) ?? false;
              setIsWishlisted(isWished);
            }
          }

          // ✨ 2. 최근 본 목록 저장 (hasLoggedRecentView가 false일 때 딱 한 번만 쏨)
          if (isLoggedIn && token && !hasLoggedRecentView) {
            setHasLoggedRecentView(true); // 요청 전에 자물쇠 먼저 잠금
            axios.post(`http://localhost:8080/api/users/recent/${id}`, {}, {
              headers: { Authorization: `Bearer ${token}` }
            })
            .then(() => console.log("최근 본 목록 저장 성공"))
            .catch(err => {
              if (err.response?.status === 401) {
                console.error("인증 실패: 토큰이 만료되었거나 서버 키와 일치하지 않습니다.");
              }
              setHasLoggedRecentView(false); // 실패 시에만 다시 풀기
            });
            // 🚨 여기에 있던 에러 유발 코드(중복된 wishRes 확인 로직) 삭제 완료
          }
        }
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieData();
  // ✨ 3. 의존성 배열 복구: userNickname과 hasLoggedRecentView를 넣어서 에러 없이 돌아가게 함
  }, [id, isLoggedIn, userNickname, hasLoggedRecentView]); 

  const handleWishlistToggle = async () => { 
    if (!isLoggedIn) { alert("로그인이 필요합니다."); return; }
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/members/wishlist/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsWishlisted(!isWishlisted);
      const savedWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const isAlreadyWished = savedWishlist.some((item: any) => item.contentId === Number(id));
      let newWishlist = isAlreadyWished 
        ? savedWishlist.filter((item: any) => item.contentId !== Number(id))
        : [...savedWishlist, { contentId: Number(id) }];
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    } catch (error) {
      alert("찜하기 처리 중 오류가 발생했습니다.");
    }
  };

  const handleReviewSubmit = async () => {
    if (!isLoggedIn) { alert("로그인이 필요합니다."); return; }
    if (hasReviewed) { alert("이미 리뷰를 작성하셨습니다."); return; }
    if (!newComment.trim() || newRating === 0) { alert("내용과 별점을 입력해주세요."); return; }

    try {
      const token = localStorage.getItem('token'); 
      const response = await axios.post(`http://localhost:8080/api/contents/user-reviews?contentId=${id}`, 
        { rating: newRating.toString(), comment: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        alert("리뷰가 등록되었습니다!");
        setHasReviewed(true);
        window.location.reload();
      }
    } catch (error) { alert("리뷰 등록 실패!"); }
  };

  const renderStars = (rating: string | number) => {
    const num = Number(rating) / 2;
    return (
      <div className="star-wrapper compact">
        {[...Array(5)].map((_, i) => {
          const isFull = num >= i + 1;
          const isHalf = num >= i + 0.5 && num < i + 1;
          const starClass = (isFull || isHalf) ? "star-icon filled" : "star-icon";
          return isFull ? <FaStar key={i} className={starClass} /> : isHalf ? <FaStarHalfAlt key={i} className={starClass} /> : <FaRegStar key={i} className={starClass} />;
        })}
        <span className="rating-num">{rating}점</span>
      </div>
    );
  };

  if (loading || !movie) return <div className="loading-container">로딩 중...</div>;

  // ✨ 안전하게 데이터 가져오기 (null 방지 처리 추가) ✨
  const safeGenres = movie.genres || [];
  const safeCastList = movie.castList || [];
  const safeProviders = movie.providers || [];
  const safeExpertReviews = movie.expertReviews || [];
  const safeUserReviews = movie.userReviews || [];

  const runtime = movie.runtime || 0;
  const hours = Math.floor(runtime / 60);
  const minutes = runtime % 60;
  const runtimeText = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;

  const expertReviewsSlice = safeExpertReviews.slice((expertPage - 1) * itemsPerPage, expertPage * itemsPerPage);
  const userReviewsSlice = safeUserReviews.slice((userPage - 1) * itemsPerPage, userPage * itemsPerPage);
  const totalExpertPages = Math.ceil(safeExpertReviews.length / itemsPerPage);
  const totalUserPages = Math.ceil(safeUserReviews.length / itemsPerPage);

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
                <span className={`age-badge ${
                  movie.ageRating === '19' ? 'age-19' : 
                  movie.ageRating === '15' ? 'age-15' : 
                  movie.ageRating === '12' ? 'age-12' : 'age-all'
                }`}>
                  {movie.ageRating}
                </span>
                <span className="runtime-label">{runtimeText}</span>
              </div>
              <h1 className="movie-title">{movie.title}</h1>
              <div className="movie-genres-row">
                {safeGenres.join(' · ')}
              </div>
              <div className="platform-buttons-container">
                <span className="platform-label">시청 가능한 플랫폼</span>
                <div className="platform-logos-row">
                  {safeProviders.length > 0 ? (
                    safeProviders.map((p) => (
                      <a key={p.provider_id} href={getOttLink(p.logo_path, movie.title)} target="_blank" rel="noopener noreferrer">
                        <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="ott-logo-simple" title={p.provider_name} />
                      </a>
                    ))
                  ) : movie.ottLogos ? (
                    movie.ottLogos.split(',').map((logo, idx) => {
                      const cleanLogo = logo.trim();
                      const fullUrl = cleanLogo.startsWith('http') ? cleanLogo : `https://image.tmdb.org/t/p/original${cleanLogo}`;
                      return (
                        <a key={idx} href={getOttLink(cleanLogo, movie.title)} target="_blank" rel="noopener noreferrer">
                           <img src={fullUrl} alt="OTT" className="ott-logo-simple" />
                        </a>
                      );
                    })
                  ) : <span className="no-provider">현재 제공 중인 OTT가 없습니다.</span>}
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
                {safeCastList.map((p, i) => (
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
              <h2 className="section-title">전문가 평점 {safeExpertReviews.length}건</h2>
              <div className="compact-card-container">
                {expertReviewsSlice.length > 0 ? expertReviewsSlice.map((r) => (
                  <div key={r.id} className="compact-review-row">
                    <div className="compact-reviewer-meta">
                      <span className="compact-reviewer-name">{maskName(r.criticName)} <small>| {r.source}</small></span>
                      {renderStars(r.rating)}
                    </div>
                    <p className="compact-comment-text">"{r.comment}"</p>
                  </div>
                )) : <p className="placeholder-text">전문가 리뷰가 없습니다.</p>}
                
                {totalExpertPages > 1 && (
                  <div className="pagination-controls">
                    <button disabled={expertPage === 1} onClick={() => setExpertPage(p => p - 1)}><FaChevronLeft /></button>
                    <span>{expertPage} / {totalExpertPages}</span>
                    <button disabled={expertPage === totalExpertPages} onClick={() => setExpertPage(p => p + 1)}><FaChevronRight /></button>
                  </div>
                )}
              </div>
            </section>

            <section className="detail-section">
              <h2 className="section-title">관람평 {safeUserReviews.length}건</h2>
              <div className="compact-card-container">
                {userReviewsSlice.length > 0 ? userReviewsSlice.map((r) => {
                  const isExpanded = expandedReviews.includes(r.id);
                  const isLongText = (r.comment || "").length > 80;

                  return (
                    <div key={r.id} className="compact-review-row">
                      <div className="compact-reviewer-meta">
                        <span className="compact-reviewer-name">{r.nickname}</span>
                        {renderStars(r.rating)}
                      </div>
                      <p className={`compact-comment-text ${isExpanded ? 'expanded' : 'clamped'}`}>
                        {r.comment}
                      </p>
                      {isLongText && (
                        <button className="btn-more-detail" onClick={() => toggleReview(r.id)}>
                          {isExpanded ? '접기' : '자세히 보기'}
                        </button>
                      )}
                    </div>
                  );
                }) : <p className="placeholder-text">첫 번째 리뷰를 남겨보세요!</p>}

                {totalUserPages > 1 && (
                  <div className="pagination-controls">
                    <button disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)}><FaChevronLeft /></button>
                    <span>{userPage} / {totalUserPages}</span>
                    <button disabled={userPage === totalUserPages} onClick={() => setUserPage(p => p + 1)}><FaChevronRight /></button>
                  </div>
                )}
              </div>
            </section>

            <section className="review-write-section">
              <h2 className="section-title">리뷰 작성</h2>
              {!isLoggedIn ? <div className="already-reviewed-msg">로그인이 필요합니다.</div> : hasReviewed ? (
                <div className="already-reviewed-msg" style={{color: '#4b0082', fontWeight: 'bold'}}>이미 소중한 리뷰를 작성하셨습니다. ✨</div>
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
                  <textarea 
                    className="write-textarea" 
                    placeholder="감상을 남겨주세요. (최대 200자)" 
                    value={newComment} 
                    onChange={(e) => setNewComment(e.target.value)} 
                    maxLength={200}
                  />
                  <div className="char-count">{newComment.length} / 200</div>
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