import React, { useState } from 'react';
import './App.css'; // 순수 CSS 파일 연결

const App = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="app-container">
      
      {/* ================= 네비게이션 ================= */}
      <header className="header">
        <div className="header-content">
          <div className="logo-nav">
            <h1 className="logo">Connected M</h1>
            <nav className="nav-links">
              <a href="#">홈</a>
              <a href="#">랭킹</a>
              <a href="#">키워드</a>
            </nav>
          </div>
          <div className="header-actions">
            <button className="login-btn" onClick={() => setIsLoginModalOpen(true)}>
              로그인
            </button>
            <input type="text" placeholder="검색" className="search-input" />
          </div>
        </div>
      </header>

      {/* ================= 메인 컨텐츠 ================= */}
      <main className="main-content">
        
        {/* 오늘의 추천작 */}
        <section className="section">
          <h2 className="section-title">오늘의 추천작</h2>
          <div className="movie-grid">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="movie-card">
                <span className="card-text">영화 이미지</span>
              </div>
            ))}
          </div>
        </section>

        {/* 리뷰 한줄평 */}
        <section className="section">
          <h2 className="section-title">리뷰 한줄평</h2>
          <div className="review-grid">
            <div className="review-card">"정말 시간 가는 줄 모르고 봤습니다. 강추!"</div>
            <div className="review-card">"배우들의 연기력이 소름 돋을 정도로 압권이네요."</div>
            <div className="review-card">"연출과 음악의 조화가 완벽한 영화입니다."</div>
          </div>
        </section>

        {/* 카테고리별 영화 */}
        <section className="section">
          <div className="category-header">
            <h2 className="section-title">카테고리별 영화</h2>
            <div className="category-buttons">
              <button className="cat-btn active">액션</button>
              <button className="cat-btn">로맨스</button>
              <button className="cat-btn">공포</button>
              <button className="cat-btn">SF</button>
            </div>
          </div>
          <div className="movie-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <div key={item} className="movie-card">
                <span className="card-text">영화 이미지</span>
              </div>
            ))}
          </div>
        </section>

        {/* 키워드픽 (다크 섹션) */}
        <section className="section">
          <h2 className="section-title">#키워드픽</h2>
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
              <div className="sentiment-box">
                <div className="sentiment-labels">
                  <span className="positive">긍정 85%</span>
                  <span className="neutral">감정 분석 지수</span>
                  <span className="negative">부정 15%</span>
                </div>
                <div className="progress-bar-bg">
                  <div className="progress-positive" style={{ width: '85%' }}></div>
                  <div className="progress-negative" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ================= 푸터 ================= */}
      <footer className="footer">
        <h2>FOOTER</h2>
        <p>© 2024 Connected M. All rights reserved.</p>
      </footer>

      {/* ================= 로그인 모달 ================= */}
      {isLoginModalOpen && (
        <div className="modal-overlay" onClick={() => setIsLoginModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* 닫기 버튼 (X) */}
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

            {/* 비밀번호 찾기 & 회원가입 */}
            <div className="modal-links">
              <a href="#">비밀번호 찾기</a>
              <span className="divider">•</span>
              <a href="#">회원가입</a>
            </div>

            {/* 소셜 로그인 3대장 버튼 */}
            <div className="social-login-section">
              <button className="social-btn btn-kakao">카카오 로그인</button>
              <button className="social-btn btn-naver">네이버 로그인</button>
              <button className="social-btn btn-google">구글 로그인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;