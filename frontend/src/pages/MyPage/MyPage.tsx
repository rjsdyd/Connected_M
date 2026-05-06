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

  /* ──────────────────────────────────────────────────────────
     1. 회원탈퇴 모달 상태 관리 (열렸는지 닫혔는지)
  ────────────────────────────────────────────────────────── */
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  /* ──────────────────────────────────────────────────────────
     2. 실제 회원탈퇴 처리 함수 (모달 내 '확인' 버튼 클릭 시)
  ────────────────────────────────────────────────────────── */
    const confirmDeleteAccount = async (): Promise<void> => {
    try {
     const token = localStorage.getItem('token'); // 👈 로컬 스토리지에서 토큰 가져오기

    await axios.patch(`http://localhost:8080/api/user/me/withdraw`, {}, {
      headers: {
        'Authorization': `Bearer ${token}` // 👈 서버 Security가 인식할 수 있게 토큰 전달
      }
    });

      // 내 브라우저의 로그인 정보 삭제
      localStorage.removeItem('user');
      localStorage.removeItem('nickname');
      localStorage.removeItem('token');
      
      alert("회원탈퇴가 완료되었습니다. 이용해 주셔서 감사합니다.");
      
      // 메인 페이지로 이동 및 새로고침
      navigate('/');
      window.location.reload();
    } catch (error) {
      console.error("탈퇴 실패:", error);
      alert("처리 중 오류가 발생했습니다.");
    }
  };

  /* ──────────────────────────────────────────────────────────
     3. 기존 handleDeleteAccount는 모달을 여는 역할만 수행
  ────────────────────────────────────────────────────────── */
  const handleDeleteAccount = () => {
    setIsModalOpen(true); // 모달창 열기
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
        {/* 상단 프로필 영역 */}
        <section className="profile-summary-card-mypage">
          <div className="us-pro-mypage">
            <div className="profile-avatar-mypage">{user.nickname.charAt(0)}</div>
            <div className="profile-info-text-mypage">
              <h1 className="user-nickname-mypage">{user.nickname}님, 안녕하세요!</h1>
              <p className="user-welcome-msg-mypage">오늘도 Connected M과 함께 즐거운 시간 보내세요.</p>
            </div>
          </div>
          {isAdmin && (
            <button className="btn-admin-action-mypage" onClick={() => navigate('/admin')}>
              관리자페이지
            </button>
          )}
        </section>

        <div className="mypage-content-grid-mypage">
          {/* 왼쪽 정보 카드 */}
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

          {/* 오른쪽 메뉴 링크 */}
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

      {/* ──────────────────────────────────────────────────────────
          4. 회원탈퇴 확인 모달 창 UI
      ────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="modal-overlay-mypage">
          <div className="modal-content-mypage">
            <div className="modal-header-mypage">
              <span className="modal-warning-icon-mypage">⚠️</span>
              정말 탈퇴하시겠습니까?
            </div>
            <p className="modal-body-mypage">
              탈퇴 시 모든 데이터 및 개인정보가 <strong>영구 삭제</strong>되며 복구되지 않습니다.
            </p>
            <div className="modal-footer-mypage">
              <button className="btn-confirm-mypage" onClick={confirmDeleteAccount}>확인</button>
              <button className="btn-cancel-mypage" onClick={() => setIsModalOpen(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;