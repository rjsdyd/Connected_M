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
  role: string; 
}

const MyPage: React.FC = () => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // 회원탈퇴 핸들러 (프론트엔드 임시 작업)
  const handleDeleteAccount = () => {
    if (window.confirm("정말로 탈퇴하시겠습니까? 그동안의 활동 내역이 모두 삭제됩니다.")) {
      // 로컬 스토리지 데이터 삭제
      localStorage.removeItem('user');
      localStorage.removeItem('nickname');
      localStorage.removeItem('token');
      
      alert("회원탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.");
      
      // 메인 페이지로 이동 및 새로고침
      navigate('/');
      window.location.reload();
    }
  };

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

        if (parsedUser.role === 'ROLE_ADMIN') {
          setIsAdmin(true);
        }
        
        const response = await axios.get(`http://localhost:8080/api/user/${userId}`);
        const serverUserData = response.data.data;
        setUser(serverUserData);

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
          {/* 왼쪽 사이드바 */}
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
                
                <button className="btn-edit-action-mypage" onClick={() => navigate('/edit-profile')}>
                  정보 수정
                </button>
                <button className="delete-account-link-mypage" onClick={handleDeleteAccount}>
                  회원탈퇴
                </button>
              
              </div>
            </section>
          </aside>

          {/* 우측 메뉴 영역 */}
          <div className="content-side-right-mypage">
            <section className="simple-link-card-mypage recent-item" onClick={() => navigate('/recent')}>
              <span className="link-title-mypage">최근에 본 목록</span>
              <span className="link-arrow-mypage">❯</span>
            </section>
            <section className="simple-link-card-mypage wish-item" onClick={() => navigate('/wishlist')}>
              <span className="link-title-mypage">찜 목록</span>
              <span className="link-arrow-mypage">❯</span>
            </section>
            <section className="simple-link-card-mypage review-item" onClick={() => navigate('/my-reviews')}>
              <span className="link-title-mypage">내가 작성한 리뷰</span>
              <span className="link-arrow-mypage">❯</span>
            </section>
            
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default MyPage;