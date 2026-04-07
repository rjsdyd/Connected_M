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
import OAuth2RedirectHandler from './pages/Auth/OAuth2RedirectHandler';
import ExtraInfo from './pages/Auth/ExtraInfo';

const AppContent = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // ✨ 여기서 훅을 실행하면 모든 로직이 돌아갑니다!
  useAuthCheck();

  return (
    <div className="app-container">
      <Header onOpenLogin={() => setIsLoginModalOpen(true)} />
      
      <main className="main-content" style={{ minHeight: '80vh' }}> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/extra-info" element={<ExtraInfo />} />
        </Routes>
      </main>
      
      <Footer />
      <Chatbot />
      
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