import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaRegStar, FaStarHalfAlt, FaTrashAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './MyReviewsPage.css';
import axios from 'axios';

interface MyReviewItem {
  reviewId: number;
  contentId: number;
  movieTitle: string;
  posterPath: string;
  rating: number;
  comment: string;
  createdAt: string;
}

const MyReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<MyReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 상태 ㅋ
  const reviewsPerPage = 3; // 한 페이지에 3개씩 ㅋ
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyReviews = async () => {
      const token = localStorage.getItem('token');
      if (!token) { navigate('/login'); return; }

      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/user-reviews/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.success) {
          setReviews(response.data.data);
        }
      } catch (error) {
        console.error("로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyReviews();
  }, [navigate]);

  // 페이지네이션 계산 로직 ㅋ
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);

  const handleDelete = async (e: React.MouseEvent, reviewId: number) => {
    e.stopPropagation();
    if (!window.confirm("리뷰를 삭제하시겠습니까?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`http://localhost:8080/api/contents/user-reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        const updatedReviews = reviews.filter(r => r.reviewId !== reviewId);
        setReviews(updatedReviews);
        // 삭제 후 현재 페이지에 리뷰가 없으면 이전 페이지로 이동 ㅋ
        if (currentReviews.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      }
    } catch (error) { alert("삭제 실패!"); }
  };

  const renderStars = (rating: number) => {
    const num = rating / 2;
    return (
      <div className="review-stars-row">
        {[...Array(5)].map((_, i) => {
          const isFull = num >= i + 1;
          const isHalf = num >= i + 0.5 && num < i + 1;
          return isFull ? <FaStar key={i} className="star-icon filled" /> : isHalf ? <FaStarHalfAlt key={i} className="star-icon filled" /> : <FaRegStar key={i} className="star-icon" />;
        })}
        <span className="rating-text">{rating}점</span>
      </div>
    );
  };

  if (loading) return <div className="loading-msg">리뷰 불러오는 중...</div>;

  return (
    <div className="my-reviews-container">
      <div className="reviews-card-box">
        <header className="reviews-header">
          <button className="back-btn" onClick={() => navigate(-1)}><FaChevronLeft /></button>
          <h2 className="title-text">내가 작성한 리뷰 <span className="count-num">{reviews.length}</span></h2>
        </header>

        {reviews.length > 0 ? (
          <>
            <div className="reviews-list-wrapper">
              {currentReviews.map((review) => (
                <div key={review.reviewId} className="review-item-card" onClick={() => navigate(`/movie/${review.contentId}`)}>
                  <div className="poster-wrapper">
                    <img 
                      src={review.posterPath && review.posterPath.startsWith('http') ? review.posterPath : `https://image.tmdb.org/t/p/w200${review.posterPath}`} 
                      alt={review.movieTitle} 
                      className="small-poster"
                    />
                  </div>
                  
                  <div className="review-main-info">
                    <div className="info-top-row">
                      <h3 className="movie-name">{review.movieTitle}</h3>
                      <button className="delete-icon-btn" onClick={(e) => handleDelete(e, review.reviewId)}><FaTrashAlt /></button>
                    </div>
                    
                    {renderStars(review.rating)}
                    
                    <p className="user-comment-text">{review.comment}</p>
                    <span className="created-date-label">{review.createdAt}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 컨트롤 ㅋ */}
            {totalPages > 1 && (
              <div className="pagination-wrapper">
                <button 
                  className="page-btn" 
                  disabled={currentPage === 1} 
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  <FaChevronLeft />
                </button>
                <span className="page-info">{currentPage} / {totalPages}</span>
                <button 
                  className="page-btn" 
                  disabled={currentPage === totalPages} 
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-reviews">
            <p>작성한 리뷰가 없습니다.</p>
            <button className="go-home-btn" onClick={() => navigate('/')}>영화 보러가기</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyReviewsPage;