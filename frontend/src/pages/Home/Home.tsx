import React, { useState, useEffect } from 'react';
import './Home.css'
import { useNavigate } from 'react-router-dom';

const Home = () => {
  // ================= 1. 상태 관리 =================
  const navigate = useNavigate();
  const [activeGenre, setActiveGenre] = useState<string>('action');
  const [currentSlide, setCurrentSlide] = useState(2); // 중앙에 올 인덱스
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const minSwipeDistance = 50;

  // ================= 2. 영화 & 슬라이더 데이터 =================
  const movies: Record<string, string[]> = {
    action: ['블랙 위도우', '탑건: 매버릭', '존윅 4', '범죄도시 3', '미션 임파서블'],
    romance: ['어바웃 타임', '라라랜드', '노트북', '이프 온리', '비포 선라이즈'],
    horror: ['컨저링', '겟 아웃', '유전', '파묘', '콰이어트 플레이스'],
    comedy: ['극한직업', '행오버', '인턴', '수상한 그녀', '화이트 칙스'],
    sf: ['인터스텔라', '인셉션', '듄', '아바타', '매트릭스']
  };

  const slideItems = [
    { id: 1, title: '추천 포스터 1', imgUrl: 'https://image.tmdb.org/t/p/w500/jucHQwnRSma1O9V2bM007e4eSd7.jpg', rating: 4.8 },
    { id: 2, title: '추천 포스터 2', imgUrl: 'https://image.tmdb.org/t/p/w500/h3LsdSBzhRnBebz4BTpAhh63PD3.jpg', rating: 4.5 },
    { id: 3, title: '추천 포스터 3', imgUrl: 'https://image.tmdb.org/t/p/w500/jeqXUwNilvNqNXqAHsdwm5pEfae.jpg', rating: 4.9 },
    { id: 4, title: '추천 포스터 4', imgUrl: 'https://image.tmdb.org/t/p/w500/xmD04pnMIO0FUe0FJc8rHjfi6vY.jpg', rating: 4.2 },
    { id: 5, title: '추천 포스터 5', imgUrl: 'https://image.tmdb.org/t/p/w500/tKAlw88sEjU5bntbAfdfWcmRx6S.jpg', rating: 4.7 }






















    
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

 // 2. 3D 스타일 계산 함수 (가장 중요)
const getSlideStyle = (index: number) => {
    const diff = index - currentSlide;
    let offset = diff;
    
    // 무한 루프 계산
    if (diff > 2) offset = diff - slideItems.length;
    if (diff < -2) offset = diff + slideItems.length;

    const absOffset = Math.abs(offset);
    const isActive = offset === 0;

    return {
      // translateX(250px)로 설정하여 카드 사이 여백 확보
      transform: `translateX(${offset * 200}px) scale(${1 - absOffset * 0.15})`,
      zIndex: 10 - absOffset,
      opacity: isActive ? 1 : absOffset === 1 ? 0.8 : 0.4,
      filter: isActive ? 'none' : 'brightness(0.8)',
      transition: 'all 0.5s ease-in-out',
      position: 'absolute' as const,
      backgroundColor: slideItems[index].rating >= 4.5 ? '#4b0082' : '#d1d5db', // 평점에 따른 배경색
    };
  };
// 상세 페이지 이동 함수
const handleCardClick = (id: number) => {
  // 예: /movie/1, /movie/2 이런 식으로 주소를 생성해서 보냅니다.
  // 아까 보여주신 상세페이지 주소가 /movie/4 였으니, id를 활용합니다.
  navigate(`/movie/${id}`);
};



  const onTouchStart = (e: React.MouseEvent | React.TouchEvent) => {
  setTouchEnd(null); // 초기화
  const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
  setTouchStart(clientX);
};

  const onTouchMove = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setTouchEnd(clientX);
  };

  const onTouchEnd = () => {
  if (touchStart === null || touchEnd === null) return;
  
  const distance = touchStart - touchEnd;
  const isLeftSwipe = distance > minSwipeDistance; 
  const isRightSwipe = distance < -minSwipeDistance;

  if (isLeftSwipe) {
    moveSlider(1); 
  } else if (isRightSwipe) {
    moveSlider(-1);
  }

  setTouchStart(null);
  setTouchEnd(null);
};

  // ================= 4. 화면 렌더링 =================
  return (
    <main>
      {/* ---------------- 메인 배너 ---------------- */}
      <section className="hero-section">
        <h1 className="hero-title">환영합니다. 인생작품을 찾아드립니다.</h1>
        <div className="hero-search-wrapper">
          <input type="text" className="hero-search" placeholder="어떤 작품을 찾고 계신가요?" />
          <button className="hero-search-btn">검색</button>
        </div>
      </section>

      {/* ---------------- 오늘의 추천작 (3D 슬라이더로 변경) ---------------- */}

      <section className="slider-section">
        <div className="slider-header-wrapper">
          <h2 className="section-title">오늘의 추천작</h2>
          <div 
            className="slider-3d-wrapper"
            onMouseEnter={() => setIsSliderPaused(true)}
            onMouseLeave={() => 
              { setIsSliderPaused(false);
                setTouchStart(null);
              }
            }
            // 마우스 이벤트
            onMouseDown={onTouchStart}
            onMouseMove={(e) => touchStart && onTouchMove(e)}
            onMouseUp={onTouchEnd}
            // 터치 이벤트 (모바일 대응)
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            style={{ cursor: touchStart ? 'grabbing' : 'grab' }}
          >
            <button className="nav-btn-3d left" onClick={() => moveSlider(-1)}>◀</button>
            
           <div className="slider-3d-container">
  {slideItems.map((item, index) => (
    <div 
      key={item.id} 
      className="slide-card-3d" 
      style={getSlideStyle(index)
        
         } // 기존 배경색 코드는 여기서 빠집니다.
    onClick={() => handleCardClick(item.id)} //  클릭 이벤트 추가
    >
      {/* ⭐ 바로 이 부분에 img 태그를 넣습니다! */}
      <img 
        src={item.imgUrl} 
        alt={item.title} 
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover' // 이미지가 찌그러지지 않게 꽉 채워줍니다.
        }} 
      />
    </div>
  ))}
</div>

            <button className="nav-btn-3d right" onClick={() => moveSlider(1)}>▶</button>
          </div>
        </div>
      </section>

      {/* ---------------- 카테고리별 영화 ---------------- */}
      <section className="content-section">
        <div className="category-header">
          <h2 className="section-title">카테고리별 영화</h2>
          <div className="genre-tabs">
            {[
              { id: 'action', label: '액션' },
              { id: 'romance', label: '로맨스' },
              { id: 'horror', label: '공포' },
              { id: 'comedy', label: '코미디' },
              { id: 'sf', label: 'SF' }
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
                }}
              >
                {genre.label}
              </button>
            ))}
          </div>
        </div>

        <div className="movie-grid">
          {movies[activeGenre].map((movie, i) => (
            <div key={i} className="movie-item">
              <div className="movie-poster">
                <span>포스터 이미지 {i + 1}</span>
                <div className="movie-rating">★ 4.{9 - i}</div>
              </div>
              <p className="movie-title_main">{movie}</p>
              <p className="movie-info">2024 • 영화</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- 키워드 섹션 ---------------- */}
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