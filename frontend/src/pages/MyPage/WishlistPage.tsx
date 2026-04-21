import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WishlistPage.css';
import { FaBookmark } from 'react-icons/fa'; 

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

  // 환경 변수 로드
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
  const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        // 1. 백엔드에서 찜한 영화의 ID 리스트를 가져옴 (현재는 데모를 위해 로컬 스토리지 예시 포함)
        // const token = localStorage.getItem('token');
        // const response = await axios.get('http://localhost:8080/api/members/wishlist', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const idList = response.data; // [{contentId: 123}, ...]

        // 임시 데이터 (백엔드 연결 전까지 테스트용)
        const savedWish = JSON.parse(localStorage.getItem('wishlist') || '[]');
        
        // 2. ID 리스트를 바탕으로 TMDB에서 상세 정보를 병렬로 가져옴
        const detailPromises = savedWish.map(async (item: any) => {
          const res = await fetch(`${BASE_URL}/movie/${item.contentId}?api_key=${API_KEY}&language=ko-KR`);
          const data = await res.json();
          return {
            wishlistId: item.contentId, // 고유 키로 활용
            contentId: data.id,
            title: data.title,
            posterPath: data.poster_path
          };
        });

        const fullData = await Promise.all(detailPromises);
        setWishlist(fullData);
      } catch (error) {
        console.error("찜 목록 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    if (API_KEY && BASE_URL) {
      fetchWishlist();
    }
  }, [API_KEY, BASE_URL]);

  const handleRemove = async (e: React.MouseEvent, contentId: number) => {
    e.stopPropagation();
    if (!window.confirm("찜 목록에서 삭제하시겠습니까?")) return;

    try {
      // 1. 백엔드/로컬스토리지에서 삭제 처리
      // const token = localStorage.getItem('token');
      // await axios.post(`http://localhost:8080/api/members/wishlist/${contentId}`, ...);

      const savedWish = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const filtered = savedWish.filter((item: any) => item.contentId !== contentId);
      localStorage.setItem('wishlist', JSON.stringify(filtered));

      // 2. UI 상태 업데이트
      setWishlist(prev => prev.filter(item => item.contentId !== contentId));
    } catch (error) {
      console.error("삭제 실패:", error);
    }
  };

  if (loading) return <div className="wishlist-loading">찜 목록을 불러오는 중...</div>;

  return (
    <div className="wishlist-container-wrap">
      <div className="wishlist-card-box">
        <header className="wishlist-header-row">
          <button className="back-arrow" onClick={() => navigate(-1)}>❮</button>
          <h2 className="wishlist-main-title">찜 목록 <span>{wishlist.length}</span></h2>
        </header>

        {wishlist.length > 0 ? (
          <div className="wishlist-items-grid">
            {wishlist.map((item) => (
              <div 
                key={item.contentId} 
                className="wish-movie-item"
                onClick={() => navigate(`/movie/${item.contentId}`)} 
              >
                <div className="wish-poster-frame">
                  {item.posterPath ? (
                    <img 
                      src={`https://image.tmdb.org/t/p/w300${item.posterPath}`} 
                      alt={item.title} 
                    />
                  ) : (
                    <div className="no-image-placeholder">이미지 없음</div>
                  )}
                  <button 
                    className="wish-cancel-icon" 
                    onClick={(e) => handleRemove(e, item.contentId)}
                  >
                    <FaBookmark />
                  </button>
                </div>
                <div className="wish-movie-desc">
                  <h3 className="wish-movie-name">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="wishlist-empty-box">
            <p>찜한 영화가 없습니다.</p>
            <button className="go-home-link" onClick={() => navigate('/')}>영화 보러가기</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;