import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  realName: string;
  phoneNumber: string;
}

const MyPage: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('nickname');
    localStorage.removeItem('token');
    alert("로그아웃 되었습니다.");
    navigate('/');
    window.location.reload();
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          alert("로그인이 필요합니다.");
          navigate('/');
          return;
        }
        const parsedUser = JSON.parse(storedUser);
        const userId = parsedUser.id;
        // 백엔드 API 호출
        const response = await axios.get(`http://localhost:8080/api/user/${userId}`);
        setUser(response.data.data);
      } catch (error) {
        console.error("유저 정보를 불러오는데 실패했습니다.", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) return <div className="mypage-loading">데이터를 불러오는 중...</div>;
  if (!user) return <div className="mypage-error">사용자 정보를 찾을 수 없습니다.</div>;

  return (
    <div className="mypage-layout">
      <main className="mypage-container">
        {/* 상단 프로필 섹션 (image_11 상단 구조) */}
        <section className="profile-summary-card">
          <div className="profile-avatar">{user.nickname.charAt(0)}</div>
          <div className="profile-text">
            <h2 className="nickname">{user.nickname} 님</h2>
            <p className="email">{user.email}</p>
          </div>
        </section>

        {/* 하단 메인 콘텐츠: 좌측(계정정보) / 우측(메뉴 카드) */}
        <div className="mypage-main-content">
          
          {/* 좌측: 계정정보 카드 */}
          <aside className="content-side-left">
            <section className="account-card-fixed">
              <h3 className="card-title-fixed">계정정보</h3>
              <div className="info-divider"></div>
              <div className="info-body-fixed">
                <div className="info-row-fixed">
                  <span className="info-label-fixed">이름</span>
                  <span className="info-value-fixed">{user.realName}</span>
                </div>
                <div className="info-row-fixed">
                  <span className="info-label-fixed">전화번호</span>
                  <span className="info-value-fixed">{user.phoneNumber || '010-7777-7777'}</span>
                </div>
                <button className="btn-edit-action-fixed" onClick={() => navigate('/edit-profile')}>정보 수정</button>
              </div>
            </section>
          </aside>

          {/* 우측: 세로로 쌓이는 이동 메뉴 카드 (image_11 우측 구조) */}
          <div className="content-side-right">
            <section className="simple-link-card" onClick={() => navigate('/recent')}>
              <span className="link-title">최근에 본 목록</span>
              <span className="link-arrow">❯</span>
            </section>

            <section className="simple-link-card" onClick={() => navigate('/wishlist')}>
              <span className="link-title">찜 목록</span>
              <span className="link-arrow">❯</span>
            </section>

            <section className="simple-link-card" onClick={() => navigate('/my-reviews')}>
              <span className="link-title">내가 작성한 리뷰</span>
              <span className="link-arrow">❯</span>
            </section>
          </div>
        </div>

        <div className="mypage-footer">
          <button className="logout-link" onClick={handleLogout}>로그아웃</button>
        </div>
      </main>
    </div>
  );
};

export default MyPage;