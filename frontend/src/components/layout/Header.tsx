import React from 'react';
import logo from '../../assets/img/Project_M_Logo_Dark.png';

// 외부에서 받아올 props(함수) 타입 정의
interface HeaderProps {
  onOpenLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenLogin }) => {
  const goHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="header">
      <div className="header-left">
        <a href="/" onClick={goHome} className="logo">
          <img src={logo} alt="Project M Logo" className="logo-img" />
        </a>
        <nav className="nav-menu">
          <div className="category-parent">
            <span className="category-title">카테고리+</span>
            <div className="category-dropdown">
              <div className="dropdown-column">
                <h4>영화</h4>
                <p>최신 영화</p><p>개봉 예정</p><p>박스오피스</p>
              </div>
              {/* ... 나머지 드롭다운 메뉴 생략 ... */}
            </div>
          </div>
          <a href="#ranking" className="nav-link">랭킹</a>
          <a href="#keyword" className="nav-link">키워드</a>
        </nav>
      </div>

      <div className="header-right">
        <input type="text" placeholder="검색어를 입력하세요" className="search-input" />
        <button className="text-btn" onClick={onOpenLogin}>로그인</button>
        <button className="btn-brand">마이페이지</button>
      </div>
    </header>
  );
};

export default Header;