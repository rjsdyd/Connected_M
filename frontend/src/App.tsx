import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import 'pretendard/dist/web/static/pretendard.css';


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
import OAuth2RedirectHandler from './pages/Auth/OAuth2RedirectHandler';
import ExtraInfo from './pages/Auth/ExtraInfo';

const AppContent = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  // ✨ 이제 부모인 <App>이 BrowserRouter를 감싸고 있어서 이 훅이 정상 작동합니다!
  useAuthCheck();

  return (
    <div className="app-container">
      <Header onOpenLogin={() => setIsLoginModalOpen(true)} />
      
      <div className="main-content" style={{ minHeight: '80vh' }}> 
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/extra-info" element={<ExtraInfo />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/terms" element={<Terms />} /> 
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </div>
      
      <Footer />
      <Chatbot />
      
      {isLoginModalOpen && (
        <LoginModal onClose={() => setIsLoginModalOpen(false)} />
      )}
    </div>
  );
};

// 최상단에서 한 번만 감싸줍니다.
const App = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;