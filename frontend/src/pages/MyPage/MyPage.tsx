import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // ✨ 페이지 이동을 위한 훅 추가
import './MyPage.css'; // ✨ 전용 CSS 연결

// 백엔드에서 넘겨주는 데이터 규격
interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  realName: string;
  phoneNumber: string;
}

const MyPage = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  const navigate = useNavigate(); // ✨ 페이지 이동 객체 생성

  // ✨ 로그아웃 처리 함수 생성
  const handleLogout = () => {
    // 1. 로컬 스토리지에 있는 정보 싹 지우기
    localStorage.removeItem('user');
    localStorage.removeItem('nickname');
    localStorage.removeItem('token');
    
    // 2. 알림 띄우기
    alert("로그아웃 되었습니다.");
    
    // 3. 홈 화면으로 이동
    navigate('/');
    
    // 4. 헤더(상단바) 상태 변경을 위해 새로고침
    window.location.reload();
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          alert("로그인이 필요합니다.");
          navigate('/login'); // ✨ 로그인 정보가 없으면 로그인 창으로 보내기 (선택사항)
          return;
        }
        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser.id;
        // 백엔드 API 호출
        const response = await axios.get(`http://localhost:8080/api/auth/${userId}`);
        setUser(response.data.data); // ApiResponse 형태에 맞춰 데이터 세팅
      } catch (error) {
        console.error("유저 정보를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]); // ✨ 의존성 배열에 navigate 추가

  if (loading) return <div className="mypage-loading">데이터를 불러오는 중...</div>;
  if (!user) return <div className="mypage-error">사용자 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <h2 className="mypage-title">마이페이지</h2>
        
        {/* 프로필 요약 (아바타, 닉네임, 이메일) */}
        <div className="mypage-profile-header">
          <div className="mypage-avatar">
            {user.nickname.charAt(0)}
          </div>
          <div className="mypage-profile-info">
            <h3>{user.nickname} 님</h3>
            <p>{user.email}</p>
          </div>
        </div>

        {/* 상세 정보 (이름, 전화번호) */}
        <div className="mypage-details">
          <div className="detail-row">
            <span className="detail-label">이름</span>
            <span className="detail-value">{user.realName}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">연락처</span>
            <span className="detail-value">{user.phoneNumber || '미등록'}</span>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mypage-actions">
          <button className="btn-edit">정보 수정</button>
          {/* ✨ onClick 이벤트에 handleLogout 함수 연결 */}
          <button className="btn-logout" onClick={handleLogout}>로그아웃</button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;