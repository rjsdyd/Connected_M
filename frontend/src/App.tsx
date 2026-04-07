import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// 컴포넌트 & 페이지 임포트
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Chatbot from './components/chatbot/Chatbot';
import LoginModal from './components/common/LoginModal';
import { useAuthCheck } from './hooks/useAuthCheck'; // ✨ 커스텀 훅 가져오기

// 페이지들
import Home from './pages/Home/Home';
import MyPage from './pages/MyPage/MyPage';
import Register from './pages/Register/Register';
import MovieDetail from './pages/MovieDetail/Moviedetail';
import Terms from './pages/Terms/Terms';
import Privacy from './pages/Privacy/Privacy';


const AppContent = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // ✨ 여기서 훅을 실행하면 모든 로직이 돌아갑니다!
  useAuthCheck();

  return (
    <BrowserRouter>
      <div className="app-container">
        {/* 1. 상단 헤더 */}
        <Header onOpenLogin={() => setIsLoginModalOpen(true)} />
        
        {/* 2. 메인 콘텐츠 영역 (모든 Route는 이 안으로 모아야 합니다) */}
        <div className="main-content" style={{ minHeight: '80vh' }}> 
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/mypage" element={<MyPage />} />
            {/* 상세페이지 경로 - 반드시 여기에 위치해야 합니다 */}
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/terms" element={<Terms />} /> 
            <Route path="/privacy" element={<Privacy />} />



          </Routes>
        </div>
        
        {/* 3. 하단 푸터 */}
        <Footer />
        
        {/* 4. 챗봇 */}
        <Chatbot />
        
        {/* 5. 로그인 모달 */}
        {isLoginModalOpen && (
          <LoginModal onClose={() => setIsLoginModalOpen(false)} />
        )}
      </div>

    </BrowserRouter>
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;