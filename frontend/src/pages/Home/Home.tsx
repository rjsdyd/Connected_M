import React, { useState, useEffect } from 'react';
import './Home.css'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  // ================= 1. 상태 관리 =================
  const navigate = useNavigate();
  // DB의 genre_id와 매칭 (액션: 1, 로맨스: 2, 공포: 3, 코미디: 4, SF: 5)
  const [activeGenre, setActiveGenre] = useState<number>(1); 
  const [currentSlide, setCurrentSlide] = useState(2);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // ================= 2. 하드코딩 데이터 (이미지 기반) =================
  const moviesData: { [key: number]: any[] } = {
    1: [ // 액션
      { id: 1, title: '범죄도시4', poster_path: 'https://image.tmdb.org/t/p/w500/jucHQwnRSma1O9V2bM007e4eSd7.jpg', year: '2024' },
      { id: 2, title: '존 윅 4', poster_path: 'https://image.tmdb.org/t/p/w500/h3LsdSBzhRnBebz4BTpAhh63PD3.jpg', year: '2023' },
      { id: 3, title: '탑건: 매버릭', poster_path: 'https://image.tmdb.org/t/p/w500/jeqXUwNilvNqNXqAHsdwm5pEfae.jpg', year: '2022' },
      { id: 4, title: '아저씨', poster_path: 'https://image.tmdb.org/t/p/w500/xmD04pnMIO0FUe0FJc8rHjfi6vY.jpg', year: '2010' },
      { id: 5, title: '미션 임파서블: 폴아웃', poster_path: 'https://image.tmdb.org/t/p/w500/tKAlw88sEjU5bntbAfdfWcmRx6S.jpg', year: '2018' }
    ],
    2: [ // 드라마
      { id: 16, title: '왕과 사는 남자', poster_path: 'https://image.tmdb.org/t/p/w500/zEH1FQTEnRY05i8gQIYdR10Vp92.jpg', year: '2025' },
      { id: 17, title: '기생충', poster_path: 'https://image.tmdb.org/t/p/w500/jjHccoFjbqlfr4VGLVLT7yek0Xn.jpg', year: '2019'},
      { id: 19, title: '괴물(2023)', poster_path: 'https://image.tmdb.org/t/p/w500/cHS3uVwAyViWcVbpRwrfekgn2cr.jpg', year: '2023'},
      { id: 25, title: '올드보이', poster_path: 'https://image.tmdb.org/t/p/w500/xpa9ybm6tYGna5LseqSXvKpSSJn.jpg', year: '2003'},
    ],
    3: [ // 범죄
      { id: 18, title: '더 킹', poster_path: 'https://image.tmdb.org/t/p/w500/mNC4JtrcGxuWoU6yK5d6rCUI1an.jpg', year: '2017' },
      { id: 21, title: '추격자', poster_path: 'https://image.tmdb.org/t/p/w500/u9FtBUJoGm1jhG9QxAanwg6en5G.jpg', year: '2008'},
      { id: 22, title: '조커', poster_path: 'https://image.tmdb.org/t/p/w500/6OnFzi7nU6t4j1rmX9QI8EYDWb4.jpg', year: '2019'},
      { id: 23, title: '살인의 추억', poster_path: 'https://image.tmdb.org/t/p/w500/3I1Ng4sxDUyPOdVu3lQ20N14PGE.jpg', year: '2003'}, 
      { id: 24, title: '내부자들', poster_path: 'https://image.tmdb.org/t/p/w500/zlFp1a9HXpbyDBaNoS1euprLbLs.jpg', year: '2015'},
    ],
    4: [ // 코미디
      { id: 9, title: '스물', poster_path: 'https://image.tmdb.org/t/p/w500/hzKynyDi7NwG5Yxn3JC9eNWM9Io.jpg', year: '2015' },
      { id: 10, title: '롤러코스터', poster_path: 'https://image.tmdb.org/t/p/w500/eL3n2EnLoxMR8Ss5fQXLH7myPyh.jpg', year: '2013' },
      { id: 7, title: '극한직업', poster_path: 'https://image.tmdb.org/t/p/w500/jbHNkNydiZstlqhhBSvG19lm4NL.jpg', year: '2019' },
      { id: 6, title: '좀비딸', poster_path: 'https://image.tmdb.org/t/p/w500/aASLRiO8p9xLIvG9EHXSyZ71sPl.jpg', year: '2024' },
      { id: 8, title: '히트맨2', poster_path: 'https://image.tmdb.org/t/p/w500/cAUoVuOZONkL2GLcMc6xjjPC1mQ.jpg', year: '2024' },
    ],
    5: [ // 애니
      { id: 13, title: '겨울왕국 2', poster_path: 'https://image.tmdb.org/t/p/w500/lVcwSnzhSMWYXUQzyMilCztSE6I.jpg', year: '2019' },
      { id: 14, title: '더 퍼스트 슬램덩크', poster_path: 'https://image.tmdb.org/t/p/w500/coiJrdXAXuBkSGDvp9bZ7mkuU6E.jpg', year: '2023' },
      { id: 15, title: '인크레더블 2', poster_path: 'https://image.tmdb.org/t/p/w500/qGmgOmeN8AQX5LwrAVaatwWffDs.jpg', year: '2018' },
      { id: 11, title: '극장판 귀멸의 칼날: 무한열차편', poster_path: 'https://image.tmdb.org/t/p/w500/m6Dho6hDCcL5KI8mOQNemZAedFI.jpg', year: '2020' },
      { id: 12, title: '주토피아', poster_path: 'https://image.tmdb.org/t/p/w500/uitqZVbhvlQV5iLOdbk3itGoNNd.jpg', year: '2016' }
    ]
  };

  const currentMovies = moviesData[activeGenre] || [];

  const slideItems = [
    { id: 1, title: '범죄도시4', imgUrl: 'https://image.tmdb.org/t/p/w500/jucHQwnRSma1O9V2bM007e4eSd7.jpg', rating: 4.8 },
    { id: 2, title: '존 윅 4', imgUrl: 'https://image.tmdb.org/t/p/w500/h3LsdSBzhRnBebz4BTpAhh63PD3.jpg', rating: 4.5 },
    { id: 3, title: '탑건: 매버릭', imgUrl: 'https://image.tmdb.org/t/p/w500/jeqXUwNilvNqNXqAHsdwm5pEfae.jpg', rating: 4.9 },
    { id: 4, title: '아저씨', imgUrl: 'https://image.tmdb.org/t/p/w500/xmD04pnMIO0FUe0FJc8rHjfi6vY.jpg', rating: 4.2 },
    { id: 5, title: '미션 임파서블: 폴아웃', imgUrl: 'https://image.tmdb.org/t/p/w500/tKAlw88sEjU5bntbAfdfWcmRx6S.jpg', rating: 4.7 }
  ];

  // ================= 3. 3D 슬라이더 로직 =================
  useEffect(() => {
    if (isSliderPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slideItems.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isSliderPaused, slideItems.length]);

  const moveSlider = (direction: number) => {
    setCurrentSlide((prev) => (prev + direction + slideItems.length) % slideItems.length);
  };

  const getSlideStyle = (index: number) => {
    const diff = index - currentSlide;
    let offset = diff;
    if (diff > 2) offset = diff - slideItems.length;
    if (diff < -2) offset = diff + slideItems.length;
    const absOffset = Math.abs(offset);
    const isActive = offset === 0;

    return {
      transform: `translateX(${offset * 200}px) scale(${1 - absOffset * 0.15})`,
      zIndex: 10 - absOffset,
      opacity: isActive ? 1 : absOffset === 1 ? 0.8 : 0.4,
      filter: isActive ? 'none' : 'brightness(0.8)',
      transition: 'all 0.5s ease-in-out',
      position: 'absolute' as const,
      backgroundColor: slideItems[index].rating >= 4.5 ? '#4b0082' : '#d1d5db',
    };
  };

  // 슬라이드 클릭 핸들러 수정: 활성 상태면 이동, 비활성이면 중앙으로 소환
  const handleSlideClick = (index: number, id: number) => {
    if (index === currentSlide) {
      navigate(`/movie/${id}`);
    } else {
      setCurrentSlide(index);
    }
  };

  const onTouchStart = (e: any) => { setTouchEnd(null); const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX; setTouchStart(clientX); };
  const onTouchMove = (e: any) => { const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX; setTouchEnd(clientX); };
  const onTouchEnd = () => { if (touchStart === null || touchEnd === null) return; const distance = touchStart - touchEnd; if (distance > minSwipeDistance) moveSlider(1); else if (distance < -minSwipeDistance) moveSlider(-1); setTouchStart(null); setTouchEnd(null); };

  // ================= 4. 화면 렌더링 =================
  return (
    <main>
      <section className="hero-section">
        <h1 className="hero-title">환영합니다. 인생작품을 찾아드립니다.</h1>
        <div className="hero-search-wrapper">
          <input type="text" className="hero-search" placeholder="어떤 작품을 찾고 계신가요?" />
          <button className="hero-search-btn">검색</button>
        </div>
      </section>

      <section className="slider-section">
        <div className="slider-header-wrapper">
          <h2 className="section-title">오늘의 추천작</h2>
          <div className="slider-3d-wrapper" onMouseEnter={() => setIsSliderPaused(true)} onMouseLeave={() => {setIsSliderPaused(false); setTouchStart(null);}} onMouseDown={onTouchStart} onMouseMove={(e) => touchStart && onTouchMove(e)} onMouseUp={onTouchEnd} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd} style={{ cursor: touchStart ? 'grabbing' : 'grab' }}>
            <button className="nav-btn-3d left" onClick={(e) => { e.stopPropagation(); moveSlider(-1); }}>◀</button>
            <div className="slider-3d-container">
              {slideItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="slide-card-3d" 
                  style={getSlideStyle(index)} 
                  onClick={() => handleSlideClick(index, item.id)}
                >
                  <img src={item.imgUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
            <button className="nav-btn-3d right" onClick={(e) => { e.stopPropagation(); moveSlider(1); }}>▶</button>
          </div>
        </div>
      </section>

      {/* ---------------- 카테고리별 영화 (하드코딩 연동) ---------------- */}
      <section className="content-section">
        <div className="category-header">
          <h2 className="section-title">카테고리별 영화</h2>
          <div className="genre-tabs">
            {[
              { id: 1, label: '액션' },
              { id: 2, label: '드라마' },
              { id: 3, label: '범죄' },
              { id: 4, label: '코미디' },
              { id: 5, label: '애니' }
            ].map(genre => (
              <button 
                key={genre.id}
                onClick={() => setActiveGenre(genre.id)}
                className={`genre-btn ${activeGenre === genre.id ? 'active' : ''}`}
                style={{
                  padding: '8px 20px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px',
                  background: activeGenre === genre.id ? '#4b0082' : 'white',
                  color: activeGenre === genre.id ? 'white' : '#6b7280',
                  border: activeGenre === genre.id ? '1px solid #4b0082' : '1px solid #d1d5db',
                  marginRight: '8px'
                }}
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>

        <div className="movie-grid">
          {currentMovies.map((movie) => (
            <div key={movie.id} className="movie-item" onClick={() => navigate(`/movie/${movie.id}`)}>
              <div className="movie-poster">
                <img 
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                  alt={movie.title} 
                  style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px'}} 
                />
              </div>
              <p className="movie-title_main">{movie.title}</p>
              <p className="movie-info">{movie.year}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title"># 키워드</h2>
        <div className="keyword-grid">
          <div className="keyword-card">키워드 카드 영역</div>
          <div className="keyword-card">회의 후 확정 예정</div>
          <div className="keyword-card">카드 형식 배치</div>
          <div className="keyword-card">데이터 대기 중</div>
        </div>
      </section>
    </main>
  );
};

export default Home;