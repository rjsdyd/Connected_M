import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ExtraInfo.css';

const ExtraInfo = () => {
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: ''
  });

  const storedUserStr = localStorage.getItem('user');
  const storedUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  const isTempEmail = storedUser?.email?.includes('@connectedm.temp');

  useEffect(() => {
    if (storedUser && !isTempEmail) {
      setFormData(prev => ({ ...prev, email: storedUser.email }));
    }
  }, [isTempEmail]);

  // ✨ [추가] 실시간 전화번호 하이픈 자동 생성 핸들러
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 남기기
    
    let formattedValue = '';
    if (value.length <= 3) {
      formattedValue = value;
    } else if (value.length <= 7) {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else {
      formattedValue = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }

    setFormData({ ...formData, phoneNumber: formattedValue });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✨ [추가] 전화번호 유효성 검사 (010-XXXX-XXXX 형식)
    const phoneRegex = /^01(?:0|1|[6-9])-(?:\d{3,4})-\d{4}$/;
    
    if (!phoneRegex.test(formData.phoneNumber)) {
      alert("올바른 전화번호 형식이 아닙니다.\n번호를 다시 확인해주세요! (예: 010-1234-5678)");
      return; // ❌ 여기서 중단! 서버에 요청을 보내지 않습니다.
    }

    try {
      const token = localStorage.getItem('token');
      const requestData = {
        id: storedUser.id,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: null 
      };

      const response = await axios.put('http://localhost:8080/api/auth/update-extra-info', requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200 || response.data.status === "SUCCESS") {
        const updatedUser = { ...storedUser, email: formData.email, phoneNumber: formData.phoneNumber };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert("모든 정보가 등록되었습니다. 환영합니다!");
        window.location.href = "/";
      }
    } catch (error) {
      alert("정보 업데이트 중 오류가 발생했습니다. 번호가 너무 길거나 형식이 틀릴 수 있습니다.");
    }
  };

  return (
    <div className="extra-info-container">
      <form onSubmit={handleSubmit} className="extra-info-form">
        <h2 className="extra-info-title">반가워요, {storedUser?.nickname}님!</h2>
        <p className="extra-info-description">마지막으로 연락처만 확인하면 가입이 완료됩니다.</p>

        {isTempEmail ? (
          <div className="input-group">
            <label className="input-label">실제 이메일 주소</label>
            <input className="extra-info-input" type="email" placeholder="example@email.com" required 
                   onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
        ) : (
          <div className="extra-info-readonly-badge">
            인증된 이메일: <strong>{storedUser?.email}</strong>
          </div>
        )}

        <div className="input-group">
          <label className="input-label">휴대폰 번호</label>
          <input 
            className="extra-info-input" 
            type="text" 
            placeholder="010-0000-0000" 
            value={formData.phoneNumber} // ✨ 상태값 연결
            onChange={handlePhoneChange} // ✨ 하이픈 생성기 연결
            maxLength={13} // ✨ 하이픈 포함 최대 13자 제한
            required 
          />
        </div>

        <button className="extra-info-button" type="submit">지금 바로 시작하기</button>
      </form>
    </div>
  );
};

export default ExtraInfo;