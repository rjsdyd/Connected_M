import React, { useState } from 'react'; // useState 추가
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // axios 추가
import logo from '../../assets/img/Project_M_Logo.png'
import './LoginModal.css'

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const navigate = useNavigate();
  
  // 1. ✨ 입력값 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // 비밀번호 찾기
  const [isFindMode, setIsFindMode] = useState(false); 
  const [realName, setRealName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/[^0-9]/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  // 1. ✨ 이 함수를 handleSubmit 위에 추가하세요!
  const handleSocialLogin = (provider: 'kakao' | 'google') => {
    // 8080(백엔드)의 시큐리티가 기다리고 있는 주소로 보냅니다.
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  // 2. ✨ 비밀번호 찾기(이메일 발송) 처리 함수 추가
  const handleFindPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 백엔드 컨트롤러가 @RequestParam을 사용하므로 params에 실어 보냅니다.
      await axios.post('http://localhost:8080/api/auth/password-reset/request', null, {
        params: { email, realName, phoneNumber }
      });
      alert("입력하신 이메일로 인증 링크를 발송했습니다!");
      setIsFindMode(false); // 성공 시 다시 로그인 모드로 변경
    } catch (error) {
      console.error('인증 실패:', error);
      alert('일치하는 사용자 정보를 찾을 수 없습니다.');
    }
  };

  // 2. ✨ 로그인 처리 함수
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        email,
        password
      });

      console.log("서버 응답 확인:", response.data);

      // 📦 백엔드 구조: { success: true, data: { token: "...", user: { nickname: "...", ... } } }
      const loginData = response.data.data; 
      const token = loginData.token;
      const user = loginData.user; // UserResponse 객체
      const nick = user.nickname;

      if (nick && token) {
        // 로컬 스토리지 저장
        localStorage.setItem('token', token);
        localStorage.setItem('nickname', nick);
        localStorage.setItem('user', JSON.stringify(user)); // 유저 객체 통째로 저장
        
        alert(`${nick}님, 환영합니다!`);
        onClose();
        window.location.reload(); // 새로고침해서 MovieDetail에 로그인 상태 반영
      } else {
        console.error("데이터 구조 에러: 닉네임이나 토큰이 없습니다.", loginData);
      }
    } catch (error: any) {
      console.error('로그인 실패:', error);
      
      // 서버에서 전달한 에러 메시지(ErrorCode.USER_WITHDRAWN의 메시지)가 있는지 확인[cite: 5, 6]
      const errorMessage = error.response?.data?.message;

      if (errorMessage) {
        // 서버 메시지가 있으면 그 내용을 그대로 띄움 (예: "해당 계정은 탈퇴한 계정입니다.")
        alert(errorMessage);
      } else {
        // 그 외 알 수 없는 에러일 때만 기본 메시지 출력
        alert('아이디 또는 비밀번호가 틀렸습니다.');
      }
    }
  };

  const goToRegister = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
    navigate('/register');
  };

  const handleShowFindPassword = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFindMode(true);
    setEmail('');
    setPassword('');
    setRealName('');
    setPhoneNumber('');
  };

  const handleBackToLogin = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsFindMode(false);
    setPassword('');
    setRealName('');
    setPhoneNumber('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>✕</button>
        <img src={logo} alt="Project_M_Logo" className="login_modal_logo-img" />
        <div className="modal-header">
          <p>{isFindMode ? '비밀번호 찾기' : '반갑습니다! 로그인을 해주세요.'}</p>
        </div>
        
        {isFindMode ? (
          <form className="login-form" onSubmit={handleFindPassword}>
            <div className="input-group_login">
              <label>이메일</label>
              <input 
                type="email" 
                placeholder="example@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group_login">
              <label>이름</label>
              <input 
                type="text" 
                placeholder="실명 입력" 
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                required
              />
            </div>
            <div className="input-group_login">
              <label>전화번호</label>
              <input 
                type="text" 
                placeholder="010-1234-5678" 
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
                required
              />
            </div>
            <button type="submit" className="submit-btn">비밀번호 찾기</button>
            <button type="button" className="secondary-btn" onClick={handleBackToLogin}>로그인으로 돌아가기</button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="input-group_login">
              <label>이메일</label>
              <input 
                type="email" 
                placeholder="example@email.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group_login">
              <label>비밀번호</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="submit-btn">로그인하기</button>
          </form>
        )}

        {!isFindMode && (
          <div className="modal-links">
            <a href="#" onClick={handleShowFindPassword}>비밀번호 찾기</a>
            <span className="divider">•</span>
            <a href="#" onClick={goToRegister}>회원가입</a> 
          </div>
        )}

        <div className="social-login-section">
          <button className="social-btn btn-kakao" onClick={() => handleSocialLogin('kakao')}>카카오</button>
          <button className="social-btn btn-google" onClick={() => handleSocialLogin('google')}>구글</button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;