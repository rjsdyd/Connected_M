import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './WishlistPage.css'; // 아래 CSS 참고

interface WishlistItem {
  wishlistId: number;
  contentId: number;
  title: string;
  posterPath: string;
}

const WishlistPage: React.FC = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        // 명준님이 만든 WishlistController 엔드포인트 호출
        // 헤더에 토큰을 실어 보내야 @AuthenticationPrincipal이 작동합니다.
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/members/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist(response.data);
      } catch (error) {
        console.error("찜 목록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  if (loading) return <div className="wishlist-loading">목록을 불러오는 중...</div>;

  return (
    <div className="wishlist-page-layout">
      <header className="wishlist-header">
        <button className="back-btn" onClick={() => navigate(-1)}>❮</button>
        <h2>나의 찜 목록 ({wishlist.length})</h2>
      </header>

      {wishlist.length > 0 ? (
        <div className="wishlist-grid">
          {wishlist.map((item) => (
            <div 
              key={item.wishlistId} 
              className="movie-card"
              onClick={() => navigate(`/contents/${item.contentId}`)}
            >
              <div className="poster-wrapper">
                <img 
                  src={`https://image.tmdb.org/t/p/w300${item.posterPath}`} 
                  alt={item.title} 
                />
              </div>
              <p className="movie-title">{item.title}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-wishlist">
          <p>아직 찜한 영화가 없습니다. 🎬</p>
          <button onClick={() => navigate('/')}>영화 구경가기</button>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;