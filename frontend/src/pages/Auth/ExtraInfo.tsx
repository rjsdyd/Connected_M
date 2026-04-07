import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ExtraInfo.css';

const ExtraInfo = () => {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const storedUserStr = localStorage.getItem('user');
      
      if (!storedUserStr) {
        alert("로그인 정보가 없습니다. 다시 로그인해주세요.");
        window.location.href = "/";
        return;
      }
      
      const storedUser = JSON.parse(storedUserStr);

      const requestData = {
        id: storedUser.id,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      };

      const response = await axios.put('http://localhost:8080/api/auth/update-extra-info', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // ✨ [중요] 성공 조건문 수정
      // 백엔드의 ApiResponse가 status: 200 이거나 status: "SUCCESS"인 경우 모두 허용
      if (response.data.status === "SUCCESS" || response.data.status === 200 || response.status === 200) {
        
        // 1. 로컬 스토리지의 유저 정보를 실제 입력한 이메일로 갱신
        // 이게 안 되면 App.tsx가 계속 kakao_ 인 줄 알고 일로 보냅니다.
        const updatedUser = { 
          ...storedUser, 
          email: formData.email // 임시(kakao_...)를 진짜 이메일로 교체
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        alert("정보 수정이 완료되었습니다! 이제 서비스를 정상적으로 이용할 수 있습니다.");
        
        // 2. 홈으로 강제 이동 (완전 새로고침을 위해 href 사용)
        window.location.href = "/";
      } else {
        // 백엔드에서 보낸 에러 메시지 출력
        alert("알림: " + (response.data.message || "정보를 저장할 수 없습니다."));
      }
      
    } catch (error) {
      console.error("에러 발생:", error);
      alert("정보 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="extra-info-container">
      <form onSubmit={handleSubmit} className="extra-info-form">
        <h2 className="extra-info-title">추가 정보 입력</h2>
        <p className="extra-info-description">서비스 이용을 위해 실제 정보를 입력해주세요.</p>
        <input className="extra-info-input" type="email" placeholder="실제 이메일 주소" required 
               onChange={(e) => setFormData({...formData, email: e.target.value})} />
        <input className="extra-info-input" type="text" placeholder="전화번호 (010-0000-0000)" required
               onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} />
        <input className="extra-info-input" type="password" placeholder="새 비밀번호 설정" required
               onChange={(e) => setFormData({...formData, password: e.target.value})} />
        <input className="extra-info-input" type="password" placeholder="비밀번호 확인" required
               onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} />
        <button className="extra-info-button" type="submit">저장하고 시작하기</button>
      </form>
    </div>
  );
};

export default ExtraInfo;