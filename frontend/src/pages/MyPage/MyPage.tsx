import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './MyPage.css';

// 1. 인터페이스에 role이 없으면 user.role을 쓸 때 오류가 납니다.
interface UserInfo {
  id: number;
  email: string;
  nickname: string;
  realName: string;
  phoneNumber: string;
  role: string; 
}

const MyPage: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // 관리자 여부를 따로 관리 (안전장치)
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

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

        // 로컬 스토리지 데이터로 먼저 관리자 권한 확인
        if (parsedUser.role === 'ROLE_ADMIN') {
          setIsAdmin(true);
        }
        
        const response = await axios.get(`http://localhost:8080/api/user/${userId}`);
        const serverUserData = response.data.data;
        setUser(serverUserData);

        // 서버 데이터로 다시 한번 권한 확인
        if (serverUserData.role === 'ROLE_ADMIN') {
          setIsAdmin(true);
        }

      } catch (error) {
        console.error("유저 정보 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  if (loading) return <div className="loading-mypage">로딩 중...</div>;
  if (!user) return null;

  return (
    <div className="mypage-layout-mypage">
      <div className="mypage-container-mypage">
        {/* 상단 프로필 */}
        <section className="profile-summary-card-mypage">
          <div className="us-pro-mypage">
            <div className="profile-avatar-mypage">{user.nickname.charAt(0)}</div>
            <div className="profile-info-text-mypage">
              <h1 className="user-nickname-mypage">{user.nickname}님, 안녕하세요!</h1>
              <p className="user-welcome-msg-mypage">오늘도 Connected M과 함께 즐거운 시간 보내세요.</p>
            </div>
          </div>
          {/* 관리자 버튼: isAdmin이 true일 때만 노출 (빨간 원 위치) */}
                {isAdmin && (
                  <button 
                    className="btn-admin-action-mypage" 
                    onClick={() => navigate('/admin')}
                  >
                    관리자페이지
                  </button>
                )}
        </section>

        <div className="mypage-content-grid-mypage">
          {/* 왼쪽 사이드바 (빨간 원 위치) */}
          <aside className="content-side-left-mypage">
            <section className="info-card-fixed-mypage">
              <div className="info-header-fixed-mypage">
                <h2 className="info-title-fixed-mypage">내 정보</h2>
              </div>
              <div className="info-body-fixed-mypage">
                <div className="info-row-fixed-mypage">
                  <span className="info-label-fixed-mypage">이메일</span>
                  <span className="info-value-fixed-mypage">{user.email}</span>
                </div>
                <div className="info-row-fixed-mypage">
                  <span className="info-label-fixed-mypage">이름</span>
                  <span className="info-value-fixed-mypage">{user.realName}</span>
                </div>
                <div className="info-row-fixed-mypage">
                  <span className="info-label-fixed-mypage">전화번호</span>
                  <span className="info-value-fixed-mypage">{user.phoneNumber || '010-0000-0000'}</span>
                </div>
                
                {/* 정보 수정 버튼 */}
                <button className="btn-edit-action-mypage" onClick={() => navigate('/edit-profile')}>
                  정보 수정
                </button>

                
              </div>
            </section>
          </aside>

          {/* 우측 메뉴 영역 */}
          <div className="content-side-right-mypage">
            <section className="simple-link-card-mypage" onClick={() => navigate('/recent')}>
              <span className="link-title-mypage">최근에 본 목록</span>
              <span className="link-arrow-mypage">❯</span>
            </section>
            <section className="simple-link-card-mypage" onClick={() => navigate('/wishlist')}>
              <span className="link-title-mypage">찜 목록</span>
              <span className="link-arrow-mypage">❯</span>
            </section>
            <section className="simple-link-card-mypage" onClick={() => navigate('/my-reviews')}>
              <span className="link-title-mypage">내가 작성한 리뷰</span>
              <span className="link-arrow-mypage">❯</span>
            </section>
          </div>
        </div>

        <div className="mypage-footer-mypage">
          <button className="logout-link-mypage" onClick={handleLogout}>로그아웃</button>
        </div>
      </div>
    </div>
  );
};

export default MyPage;