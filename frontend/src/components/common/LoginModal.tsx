import React from 'react';
import logo from '../../assets/img/Project_M_Logo.svg';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      {/* e.stopPropagation()은 모달창 내부(하얀 박스)를 눌렀을 때는 창이 안 닫히게 막아주는 역할입니다 */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
          <img src={logo} alt="Project M Logo" className="login_modal_logo-img" />
        <div className="modal-header">
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

        <div className="social-login-section">
          <button className="social-btn btn-kakao">카카오</button>
          <button className="social-btn btn-google">구글</button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;