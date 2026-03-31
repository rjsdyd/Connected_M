import React, { useState } from 'react';
import './App.css';

const App = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // 로고 클릭 시 홈으로 이동 (새로고침)
  const goHome = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="app-container">
      
      {/* ================= 1. 헤더 (Header) ================= */}
      <header className="header">
        <div className="header-content">
          <div className="logo-nav">
            {/* 로고 클릭 시 최상단 이동 */}
            <h1 className="logo" onClick={goHome}>Connected M</h1>
            
            {/* 네비게이션 리스트 */}
            <nav className="nav-links">
              <a href="#" className="nav-item"><span>☰</span> 카테고리</a>
              <a href="#" className="nav-item">랭킹</a>
              <a href="#" className="nav-item">키워드</a>
              <a href="#" className="nav-item">공지사항</a>
            </nav>
          </div>
          <div className="header-actions">
            {/* 왓챠 스타일: 포커스 시 늘어나는 검색창 */}
            <div className="expand-search-wrapper">
              <input type="text" placeholder="🔍 작품, 제목, 배우 검색" className="expand-search" />
            </div>
            <button className="login-btn" onClick={() => setIsLoginModalOpen(true)}>로그인</button>
            <button className="mypage-btn">마이페이지</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        
        {/* ================= 2. 콘텐츠 1 (메인 배너 & 검색창) ================= */}
        <section className="hero-section">
          <div className="hero-overlay"></div>
          <div className="hero-content">
            <h2 className="hero-title">환영합니다.<br/>인생작품을 찾아드립니다.</h2>
            <div className="hero-search-box">
              <input type="text" placeholder="어떤 작품을 찾으시나요?" className="hero-search-input" />
              <button className="hero-search-btn">검색</button>
            </div>
          </div>
        </section>

        {/* ================= 3. 콘텐츠 2 (#키워드픽) ================= */}
        <section className="section">
          <h2 className="section-title">#키워드픽 (추후 회의)</h2>
          <div className="keyword-dashboard">
            <div className="keyword-left">
              <div className="keyword-poster">더 킬러</div>
              <button className="play-btn">▶ 보러가기</button>
            </div>
            <div className="keyword-right">
              <div className="keyword-summary">
                <h3>✨ Gemini AI의 믿을 수 있는 3줄 요약</h3>
                <ul>
                  <li>이 영화는 역대급 액션 시퀀스로 호평받았지만, 결말부 개연성에 호불호가 갈립니다.</li>
                  <li>배우들의 소름 돋는 연기력이 돋보이며, 특히 영상미와 연출적 무게감이 압권입니다.</li>
                  <li>가벼운 마음으로 즐기기 좋으나, 깊은 여운을 기대하긴 어렵습니다.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4. 콘텐츠 3 (오늘의 추천작 - 슬라이더) ================= */}
        <section className="section slider-section">
          <h2 className="section-title">오늘의 추천작</h2>
          <div className="slider-container">
            <button className="slider-btn left-btn">❮</button>
            {/* 커서 올리면 애니메이션 일시정지 (CSS 속성 적용) */}
            <div className="slider-track">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="movie-card slider-item">
                  <span className="card-text">영화 {item}</span>
                  {/* 포스터 우측 하단 평점 */}
                  <div className="rating-badge">★ 4.5</div>
                </div>
              ))}
            </div>
            <button className="slider-btn right-btn">❯</button>
          </div>
        </section>

        {/* ================= 5. 콘텐츠 4 (카테고리별 영화 - 3줄 리스트) ================= */}
        <section className="section">
          <div className="category-header">
            <h2 className="section-title">카테고리별 영화</h2>
            {/* 장르 5개 */}
            <div className="category-buttons">
              <button className="cat-btn active">액션</button>
              <button className="cat-btn">로맨스</button>
              <button className="cat-btn">공포</button>
              <button className="cat-btn">SF</button>
              <button className="cat-btn">스릴러</button>
            </div>
          </div>
          {/* 5열 3줄 (총 15개) 영화 리스트 */}
          <div className="movie-grid-5cols">
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} className="movie-card">
                <span className="card-text">영화 이미지</span>
                <div className="rating-badge">★ 4.{i % 5}</div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="footer">
        <h2>FOOTER</h2>
        <p>© 2024 Connected M. All rights reserved.</p>
      </footer>

      {/* ================= 노션 AI 스타일 Gemini 챗봇 버튼 ================= */}
      <button className="floating-chatbot">
        <span className="chatbot-icon">✨</span> Gemini AI에게 물어보기
      </button>

      {/* ================= 로그인 모달 (고정 & 소셜 버튼 가로 배치) ================= */}
      {isLoginModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setIsLoginModalOpen(false)}>✕</button>
            <div className="modal-header">
              <h2>Connected M</h2>
              <p>반갑습니다! 로그인을 해주세요.</p>
            </div>
            <form className="login-form">
              <div className="input-group">
                <label>이메일</label>
                <input type="email" placeholder="example@email.com" />
              </div>
              <div className="input-group">
                <label>비밀번호</label>
                <input type="password" placeholder="••••••••" />
              </div>
              <button type="submit" className="submit-btn">로그인하기</button>
            </form>

            <div className="modal-links">
              <a href="#">비밀번호 찾기</a>
              <span className="divider">•</span>
              <a href="#">회원가입</a>
            </div>

            {/* 🚨 수정됨: 소셜 로그인 버튼 가로(Row) 배치 */}
            <div className="social-login-section">
              <button className="social-btn btn-kakao">카카오</button>
              <button className="social-btn btn-naver">네이버</button>
              <button className="social-btn btn-google">구글</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;