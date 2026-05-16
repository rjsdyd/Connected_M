import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './GenrePage.css';

interface ContentSummaryDto {
  id: number;
  title: string;
  posterPath: string;
  positiveRatio?: number;
}

const GenrePage: React.FC = () => {
  const { genreName } = useParams<{ genreName: string }>();
  const [movies, setMovies] = useState<ContentSummaryDto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      if (!genreName) return;
      try {
        setLoading(true);
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/contents/genre/${genreName}`);
      
        if (response.data && response.data.data) {
          setMovies(response.data.data);
        } else {
          setMovies(response.data);
        }
      } catch (error) {
        console.error("장르별 영화 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
    window.scrollTo(0, 0);
  }, [genreName]);

  if (loading) {
    return <div className="genre-loading">콘텐츠를 불러오는 중입니다...</div>;
  }

  return (
    <div className="genre-page-container">
      <div className="genre-header">
        <h2>{genreName} 영화</h2>
        <span className="genre-count">총 {movies.length}개의 작품</span>
      </div>

      {movies.length > 0 ? (
        <div className="genre-movie-grid">
          {movies.map((movie) => (
            <div 
              key={movie.id} 
              className="genre-movie-card"
              onClick={() => navigate(`/movie/${movie.id}`)} 
            >
              <img 
                src={movie.posterPath?.startsWith('http') ? movie.posterPath : `https://image.tmdb.org/t/p/w500${movie.posterPath}`} 
                alt={movie.title} 
                className="genre-movie-poster"
              />
              <div className="genre-movie-info">
                <p className="genre-movie-title">{movie.title}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="genre-empty">
          해당 장르의 영화가 아직 등록되지 않았습니다.
        </div>
      )}
    </div>
  );
};

export default GenrePage;