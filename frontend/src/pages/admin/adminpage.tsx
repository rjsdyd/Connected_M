import React, { useState } from 'react';
import './adminpage.css';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 통계용 더미 데이터
const chartData = [
  { name: '04-21', users: 4 },
  { name: '04-22', users: 7 },
  { name: '04-23', users: 5 },
  { name: '04-24', users: 12 },
  { name: '04-25', users: 8 },
];

const AdminPage = () => {
  const [mainTab, setMainTab] = useState('user'); // user, log, stats
  const [subTab, setSubTab] = useState('all'); // all, summary, filter, history, reviews, movie, join
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      {/* 컨텐츠 영역 */}
      <main className="admin-content">
        {/* 1. 유저관리 - 전체 유저 */}
        {mainTab === 'user' && subTab === 'all' && (
          <div className="list-container">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="list-item">
                <span className="user-info">id, created_at, email, nickname, phone_number, real_name</span>
                <div className="action-buttons">
                  <button className="btn-active">활성</button>
                  <button className="btn-stop" onClick={() => setIsModalOpen(true)}>정지</button>
                  <button className="btn-exit">탈퇴</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. 유저관리 - 활동 요약 */}
        {mainTab === 'user' && subTab === 'summary' && (
          <div className="list-container">
            <div className="list-item summary-header">
              <span>닉네임</span><span>리뷰 개수</span><span>찜 영화 개수</span>
            </div>
            <div className="list-item">
              <span>무비매니아</span><span>15개</span><span>42개</span>
            </div>
          </div>
        )}

        {/* 3. 유저관리 - 필터 */}
        {mainTab === 'user' && subTab === 'filter' && (
          <div className="filter-section">
            <div className="search-bar">
              <input type="text" placeholder="이메일, 닉네임, 실제 이름 검색" />
              <input type="date" /> ~ <input type="date" />
              <button className="btn-search">검색</button>
            </div>
            {/* 리스트 출력 부분 (전체 유저와 동일 구조) */}
          </div>
        )}

        {/* 4. 통계 - 신규 가입자 (그래프) */}
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
              <button>1일</button><button>3일</button><button>7일</button>
              <button>1달</button><button>3달</button><button>6개월</button>
            </div>
            <button className="btn-close" onClick={() => setIsModalOpen(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;