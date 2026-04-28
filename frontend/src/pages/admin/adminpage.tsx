import React, { useState, useEffect } from 'react'; // useEffect 추가
import axios from 'axios'; // axios 임포트 필수
import './adminpage.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 통계용 더미 데이터 (컴포넌트 외부에 있어도 무관)
const chartData = [
  { name: '04-21', users: 4 },
  { name: '04-22', users: 7 },
  { name: '04-23', users: 5 },
  { name: '04-24', users: 12 },
  { name: '04-25', users: 8 },
];

const AdminPage = () => {
  // 1. 상태 선언 (컴포넌트 내부로 이동)
  const [mainTab, setMainTab] = useState('user'); 
  const [subTab, setSubTab] = useState('all'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  
  // 호출할 유저 ID 리스트
  const userId = [11, 12, 13];

  // 2. useEffect (컴포넌트 내부로 이동)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const requests = userId.map(id => 
          axios.get(`http://localhost:8080/api/user/${id}`)
        );
        
        const responses = await Promise.all(requests);
        setUsers(responses.map(res => res.data)); 
      } catch (error) {
        console.error("유저 정보 로딩 실패", error);
      }
    };

    // '전체 유저' 탭일 때만 호출하도록 설정하면 효율적입니다.
    if (mainTab === 'user' && subTab === 'all') {
      fetchUsers();
    }
  }, [mainTab, subTab]); // 탭이 바뀔 때마다 갱신

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>관리자 세션으로 접속되었습니다. 공용 PC라면 사용 후 반드시 로그아웃해 주시길 바랍니다.</h1>
      </header>

      {/* 메인 탭 메뉴 */}
      <div className="tab-group main-tabs">
        <button className={mainTab === 'user' ? 'active' : ''} onClick={() => {setMainTab('user'); setSubTab('all');}}>유저관리</button>
        <button className={mainTab === 'log' ? 'active' : ''} onClick={() => {setMainTab('log'); setSubTab('history');}}>로그확인</button>
        <button className={mainTab === 'stats' ? 'active' : ''} onClick={() => {setMainTab('stats'); setSubTab('movie');}}>통계</button>
      </div>

      {/* 서브 탭 메뉴 */}
      <div className="tab-group sub-tabs">
        {mainTab === 'user' && (
          <>
            <button className={subTab === 'all' ? 'active' : ''} onClick={() => setSubTab('all')}>전체 유저</button>
            <button className={subTab === 'summary' ? 'active' : ''} onClick={() => setSubTab('summary')}>활동 요약</button>
            <button className={subTab === 'filter' ? 'active' : ''} onClick={() => setSubTab('filter')}>필터</button>
          </>
        )}
        {mainTab === 'log' && (
          <>
            <button className={subTab === 'history' ? 'active' : ''} onClick={() => setSubTab('history')}>로그인 히스토리</button>
            <button className={subTab === 'reviews' ? 'active' : ''} onClick={() => setSubTab('reviews')}>작성 이력</button>
          </>
        )}
        {mainTab === 'stats' && (
          <>
            <button className={subTab === 'movie' ? 'active' : ''} onClick={() => setSubTab('movie')}>영화 집계</button>
            <button className={subTab === 'join' ? 'active' : ''} onClick={() => setSubTab('join')}>신규 가입자</button>
          </>
        )}
      </div>

      <main className="admin-content">
        {/* 1. 유저관리 - 전체 유저 */}
        {mainTab === 'user' && subTab === 'all' && (
          <div className="list-container">
            {users.map((user) => (
              <div key={user.id} className="list-item">
                <span className="user-info">
                  {user.id}, {user.createdAt}, {user.email}, {user.nickname}, {user.phoneNumber}, {user.realName}
                </span>
                <div className="action-buttons">
                  <button className="btn-active">활성</button>
                  <button className="btn-stop" onClick={() => setIsModalOpen(true)}>정지</button>
                  <button className="btn-exit">탈퇴</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 나머지 요약, 필터, 통계 섹션 (기존과 동일) */}
        {mainTab === 'stats' && subTab === 'join' && (
          <div className="chart-container">
            <div className="chart-filter">
              <button>일일</button><button>주일</button><button>월일</button>
            </div>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </main>

      {/* 정지 기간 설정 모달 */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>정지 기간 설정</h3>
            <div className="modal-btns">
              <button onClick={() => setIsModalOpen(false)}>1일</button>
              <button onClick={() => setIsModalOpen(false)}>3일</button>
              <button onClick={() => setIsModalOpen(false)}>7일</button>
              <button onClick={() => setIsModalOpen(false)}>1달</button>
              <button onClick={() => setIsModalOpen(false)}>3달</button>
              <button onClick={() => setIsModalOpen(false)}>6개월</button>
            </div>
            <button className="btn-close" onClick={() => setIsModalOpen(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;