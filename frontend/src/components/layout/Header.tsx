import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/img/Project_M_Logo_Dark.png';
import { FaPlus } from "react-icons/fa";

interface HeaderProps {
  onOpenLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  const [nickname, setNickname] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
  const token = localStorage.getItem('token');
  const savedNickname = localStorage.getItem('nickname');
  
  // 토큰이 존재하고, 단순히 빈 문자열이 아닐 때만 로그인 처리
  if (token && token.trim() !== "") {
    setIsLoggedIn(true);
    setNickname(savedNickname || "사용자"); 
  } else {
    // 🚨 토큰이 없으면 확실하게 로그아웃 상태로 밀어버려야 합니다.
    setIsLoggedIn(false);
    setNickname(null);
  }
}, []);

  const handleLogout = () => {
    localStorage.removeItem('user'); 
    localStorage.removeItem('nickname');
    localStorage.removeItem('token');
    
    setIsLoggedIn(false); // 상태 업데이트
    setNickname(null);
    alert("로그아웃 되었습니다.");
    
    navigate('/');
    window.location.reload();
  };

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="header">
      <div className="header-inner">
        
        <div className="header-left">
          <a href="/" onClick={handleLogoClick} className="logo">
            <img src={logo} alt="Project_M_Logo" className="logo-img" />
          </a>
          <nav className="nav-menu">
            <div className="category-parent">
              <span className="category-title">카테고리 <FaPlus /></span>
              
              <div className="category-dropdown">
                
                <div className="dropdown-column">
                  <h4>장르</h4>
                  {/* ✨ 기존 구조 그대로 유지하고 onClick 이동 기능만 추가했습니다 ✨ */}
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/액션')}>액션</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/코미디')}>코미디</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/범죄')}>범죄</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/스릴러')}>스릴러</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/드라마')}>드라마</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/가족')}>가족</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/애니메이션')}>애니메이션</p>
                </div>
                <div className="dropdown-column no-header">
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/모험')}>모험</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/판타지')}>판타지</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/미스터리')}>미스터리</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/공포')}>공포</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/SF')}>SF</p>
                </div>
                <div className="dropdown-column no-header">
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/로맨스')}>로맨스</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/다큐멘터리')}>다큐멘터리</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/역사')}>역사</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/전쟁')}>전쟁</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/음악')}>음악</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/TV영화')}>TV영화</p>
                  <p style={{ cursor: 'pointer' }} onClick={() => navigate('/genre/서부')}>서부</p>
                </div>
                </div>
                </div>
            
            <a href="#ranking" className="nav-link">랭킹</a>
            <a href="#keyword" className="nav-link">키워드</a>
          </nav>
        </div>

        <div className="header-right">
          <input type="text" placeholder="검색어를 입력하세요" className="search-input" />
          
          {/* ✨ 기준을 nickname에서 isLoggedIn으로 변경했습니다. */}
          {isLoggedIn ? (
            <div className="user-info">
              <span className="user-nickname">
                {/* 닉네임이 로컬스토리지에 없으면 '사용자'라고 표시해주는 센스! */}
                <strong>{nickname || "사용자"}</strong>님
              </span>
              <button className="text-btn" onClick={handleLogout}>로그아웃</button>
            </div>
          ) : (
            <button className="text-btn" onClick={onOpenLogin}>로그인</button>
          )}
          
          <button 
            className="btn-brand" 
            onClick={() => isLoggedIn ? navigate('/mypage') : onOpenLogin()}
          >
            마이페이지
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;