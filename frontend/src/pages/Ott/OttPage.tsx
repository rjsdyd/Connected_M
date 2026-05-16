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
  const { providerName } = useParams<{ providerName: string }>();
  const [movies, setMovies] = useState<ContentSummaryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const getProviderInfo = (name: string) => {
  switch (name?.toLowerCase()) {
    case 'netflix': return { title: 'NETFLIX', color: '#E50914', logo: 'https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwx5JGpXngfoWtp.jpg' };
    case 'disney': return { title: 'DISNEY+', color: '#00D6FE', logo: 'https://image.tmdb.org/t/p/original/97yvRBw1GzX7fXprcF80er19ot.jpg' };
    case 'tving': return { title: 'TVING', color: '#FF153C', logo: 'https://image.tmdb.org/t/p/original/qHThQdkJuROK0k5QTCrknaNukWe.jpg' };
    case 'wavve': return { title: 'WAVVE', color: '#1B1464', logo: 'https://image.tmdb.org/t/p/original/hPcjSaWfMwEqXaCMu7Fkb529Dkc.jpg' };
    
    case 'watcha': return { 
  title: 'WATCHA', 
  color: '#FF0558', 
  logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiByeD0iMTIiIGZpbGw9IiMwMDAiLz48cGF0aCBmaWxsPSIjRkYwNTU4IiBkPSJNMTAgMTYuNUgxNi41TDE5LjUgMzBMMjMuNSAxNC41SDI5TDMyLjUgMzBMNDAgNkg0NkwzNyAzNkgyOUwyNiAyMkwyMiAzNkgxM1oiLz48L3N2Zz4='
};
    default: return { title: 'OTT', color: '#ffffff', logo: '' };
  }
};

  const info = getProviderInfo(providerName || '');

  useEffect(() => {
    const fetchMovies = async () => {
      if (!providerName) return;
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/contents/ott/${providerName}`);
        if (response.data && response.data.data) {
          setMovies(response.data.data);
        } else {
          setMovies(response.data); 
        }
      } catch (error) {
        console.error("OTT 로딩 실패:", error);
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
      <div className="ott-header" style={{ borderLeft: `5px solid ${info.color}` }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: 0 }}>
          {info.logo && (
            <img 
              src={info.logo} 
              alt="" 
              className="ott-title-logo" 
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          )}
          <span style={{ color: '#000000', fontSize: '28px', fontWeight: 'bold' }}>
            {info.title}
          </span>
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
        <div className="ott-empty">해당 플랫폼에 등록된 영화가 없습니다.</div>
      )}
    </div>
  );
};

export default OttPage;