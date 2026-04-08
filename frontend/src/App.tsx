import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

// 컴포넌트 & 페이지 임포트
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Chatbot from './components/chatbot/Chatbot';
import LoginModal from './components/common/LoginModal';
import { useAuthCheck } from './hooks/useAuthCheck'; // ✨ URL 파라미터를 가로채는 훅

// 페이지들
import Home from './pages/Home/Home';
import MyPage from './pages/MyPage/MyPage';
import Register from './pages/Register/Register';
import MovieDetail from './pages/MovieDetail/Moviedetail';
import Terms from './pages/Terms/Terms';
import Privacy from './pages/Privacy/Privacy';

const AppContent = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // ✨ 여기서 실행되는 useAuthCheck가 
  // 백엔드가 보낸 ?token=...&nickname=... 정보를 감시해서 localStorage에 저장합니다.
  useAuthCheck();

  return (
    <div className="app-container">
      {/* 1. 상단 헤더 */}
      <Header onOpenLogin={() => setIsLoginModalOpen(true)} />
      
      {/* 2. 메인 콘텐츠 영역 */}
      <div className="main-content" style={{ minHeight: '80vh' }}> 
        <Routes>
          {/* 메인 페이지 */}
          <Route path="/" element={<Home />} />
          
          {/* [추가] 백엔드 OAuth2SuccessHandler가 리다이렉트하는 경로 */}
          {/* 이 경로로 들어왔을 때 useAuthCheck가 작동하여 토큰을 저장합니다. */}
          <Route path="/oauth2/redirect" element={<Home />} />

          <Route path="/register" element={<Register />} />
          <Route path="/mypage" element={<MyPage />} />
          
          {/* 상세페이지 경로 */}
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
  );
};

const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;