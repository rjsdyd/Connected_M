import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OttPage.css';

interface ContentSummaryDto {
  id: number;
  title: string;
  posterPath: string;
}

const OttPage: React.FC = () => {
  // 주소창에서 /ott/netflix -> 'netflix'를 꺼내옵니다.
  const { providerName } = useParams<{ providerName: string }>();
  const [movies, setMovies] = useState<ContentSummaryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // ✨ OTT별 정보 사전에 'logo' 주소를 추가했습니다! (헤더와 동일한 고화질 로고)
  const getProviderInfo = (name: string) => {
    switch (name?.toLowerCase()) {
      case 'netflix': return { title: 'NETFLIX', color: '#E50914', logo: 'https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg' };
      case 'disney': return { title: 'Disney+', color: '#00D6FE', logo: 'https://image.tmdb.org/t/p/original/97yvRBw1GzX7fXprcF80er19ot.jpg' };
      case 'tving': return { title: 'TVING', color: '#FF153C', logo: 'https://image.tmdb.org/t/p/original/qHThQdkJuROK0k5QTCrknaNukWe.jpg' };
      case 'wavve': return { title: 'Wavve', color: '#1B1464', logo: 'https://image.tmdb.org/t/p/original/hPcjSaWfMwEqXaCMu7Fkb529Dkc.jpg' };
      case 'watcha': return { title: 'WATCHA', color: '#FF0558', logo: 'https://image.tmdb.org/t/p/original/5gmEivxOGPdq4Afpq1f8ktLtEW1.jpg' };
      case 'coupang': return { title: 'Coupang Play', color: '#00A3FF', logo: 'https://image.tmdb.org/t/p/original/5gmEivxOGPdqQ0A09uXp9Gf1vSj.jpg' };
      default: return { title: 'OTT', color: '#ffffff', logo: '' };
    }
  };

  const info = getProviderInfo(providerName || '');

  useEffect(() => {
    const fetchMovies = async () => {
      if (!providerName) return;
      try {
        setLoading(true);
        // 백엔드 API 호출!
        const response = await axios.get(`http://localhost:8080/api/contents/ott/${providerName}`);
        
        if (response.data && response.data.data) {
          setMovies(response.data.data);
        } else {
          setMovies(response.data); 
        }
      } catch (error) {
        console.error("OTT별 영화 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
    window.scrollTo(0, 0); 
  }, [providerName]);

  if (loading) return <div className="ott-loading">콘텐츠를 불러오는 중입니다...</div>;

  return (
    <div className="ott-page-container">
      {/* ✨ 헤더 포인트 컬러 유지하면서, 글자 대신 로고 이미지를 렌더링합니다 */}
      <div className="ott-header" style={{ borderLeft: `5px solid ${info.color}` }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: 0 }}>
          {info.logo ? (
            <img src={info.logo} alt={info.title} className="ott-title-logo" title={info.title} />
          ) : (
            <span style={{ color: info.color }}>{info.title}</span>
          )}
          <span style={{ color: '#fff', fontSize: '26px' }}>영화</span>
        </h2>
        <span className="ott-count">총 {movies.length}개의 작품</span>
      </div>

      {movies.length > 0 ? (
        <div className="ott-movie-grid">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="ott-movie-card"
              onClick={() => navigate(`/movie/${movie.id}`)} 
            >
              <img 
                src={movie.posterPath?.startsWith('http') ? movie.posterPath : `https://image.tmdb.org/t/p/w500${movie.posterPath}`} 
                alt={movie.title} 
                className="ott-movie-poster"
              />
              <div className="ott-movie-info">
                <p className="ott-movie-title">{movie.title}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ott-empty">
          해당 플랫폼에 등록된 영화가 아직 없습니다.
        </div>
      )}
    </div>
  );
};

export default OttPage;