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
    
    if (token) {
      setIsLoggedIn(true);
      // 소셜 로그인 시 닉네임이 없을 수 있으므로 기본값 설정
      setNickname(savedNickname || "사용자"); 
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
                  <h4>영화</h4>
                  <p>최신 영화</p><p>개봉 예정</p><p>박스오피스</p>
                </div>
                <div className="dropdown-column">
                  <h4>장르</h4>
                  <p>드라마</p><p>범죄/스릴러</p><p>애니메이션</p><p>액션</p><p>코미디</p>
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