import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/members/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWishlist();
  }, []);

  const handleRemove = async (e: React.MouseEvent, contentId: number) => {
    e.stopPropagation();
    if (!window.confirm("찜 목록에서 삭제하시겠습니까?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/members/wishlist/${contentId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(prev => prev.filter(item => item.contentId !== contentId));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="wishlist-loading">로딩 중...</div>;

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
                key={item.wishlistId} 
                className="wish-movie-item"
                onClick={() => navigate(`/movie/${item.contentId}`)} 
              >
                <div className="wish-poster-frame">
                  <img 
                    src={`https://image.tmdb.org/t/p/w300${item.posterPath}`} 
                    alt={item.title} 
                  />
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