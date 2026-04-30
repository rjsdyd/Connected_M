import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  const [mainTab, setMainTab] = useState('user'); 
  const [subTab, setSubTab] = useState('all'); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);

  // 필터 관련 상태
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // [권한 체크] 페이지 진입 시 관리자 여부 확인
  useEffect(() => {
    const userData = localStorage.getItem('user'); 
    if (!userData) {
      window.location.href = "/login";
      return;
    }
    try {
      const user = JSON.parse(userData);
      if (user.role !== 'ROLE_ADMIN') {
        alert("관리자 권한이 없습니다.");
        window.location.href = "/"; 
      }
    } catch (error) {
      console.error("데이터 파싱 에러:", error);
      window.location.href = "/login";
    }
  }, []);

  // 데이터 로드 (에러 수정 버전)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get('http://localhost:8080/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log("서버 응답 데이터:", response.data);
        
        // 1. 객체 내의 content 배열을 가져와야 함 (정렬 에러 해결)
        const userData = response.data.content || []; 
        
        // 2. ID 필드명(id 또는 userId)에 맞춰 오름차순 정렬
        const sortedData = [...userData].sort((a: any, b: any) => (a.id || a.userId) - (b.id || b.userId));
        
        setUsers(sortedData); 
      } catch (error: any) {
        if (error.response && (error.response.status === 403 || error.response.status === 401)) {
          alert("관리자 권한이 없거나 인증이 만료되었습니다.");
          window.location.href = "/";
        } else {
          console.error("유저 정보 로딩 실패", error);
        }
      }
    };

    if (mainTab === 'user') {
      fetchUsers();
    }
  }, [mainTab]);

  // 필터링 로직 (DB 컬럼명 호환성 추가)
  const filteredUsers = users.filter(user => {
    const userCreatedAt = user.createdAt || user.created_at;
    
    // 1. 날짜 범위 필터
    if (startDate && userCreatedAt && new Date(userCreatedAt) < new Date(startDate)) return false;
    if (endDate && userCreatedAt && new Date(userCreatedAt) > new Date(endDate)) return false;

    // 2. 상태 필터
    if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;

    // 3. 통합 검색 (id, 이메일, 전화번호, 이름, 닉네임)
    const term = searchTerm.toLowerCase();
    const userId = String(user.id || user.userId);
    const email = (user.email || "").toLowerCase();
    const phone = (user.phoneNumber || user.phone_number || "");
    const name = (user.realName || user.real_name || "").toLowerCase();
    const nick = (user.nickname || "").toLowerCase();

    return userId.includes(term) || email.includes(term) || phone.includes(term) || name.includes(term) || nick.includes(term);
  });

  const handleSuspend = (months: string) => {
    if (!selectedUser) return;
    const targetId = selectedUser.id || selectedUser.userId;
    setUsers(users.map(u => 
      (u.id || u.userId) === targetId ? { ...u, status: 'SUSPENDED' } : u
    ));
    alert(`${selectedUser.nickname}님 계정이 ${months} 동안 정지 처리되었습니다.`);
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleExit = (user: any) => {
    const targetId = user.id || user.userId;
    const confirmExit = window.confirm(`${user.nickname}(ID: ${targetId}) 계정을 정말 삭제하시겠습니까?`);
    if (confirmExit) {
      setUsers(users.filter(u => (u.id || u.userId) !== targetId));
      alert("계정이 삭제되었습니다.");
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>관리자 세션으로 접속되었습니다. 공용 PC라면 사용 후 반드시 로그아웃해 주시길 바랍니다.</h1>
      </header>

      <div className="tab-group main-tabs">
        <button className={mainTab === 'user' ? 'active' : ''} onClick={() => {setMainTab('user'); setSubTab('all');}}>유저관리</button>
        <button className={mainTab === 'stats' ? 'active' : ''} onClick={() => {setMainTab('stats'); setSubTab('newuser');}}>통계</button>
      </div>

      <div className="tab-group sub-tabs">
        {mainTab === 'user' && (
          <>
            <button className={subTab === 'all' ? 'active' : ''} onClick={() => setSubTab('all')}>전체 유저</button>
            <button className={subTab === 'filter' ? 'active' : ''} onClick={() => setSubTab('filter')}>필터</button>
            <button className={subTab === 'summary' ? 'active' : ''} onClick={() => setSubTab('summary')}>활동 요약</button>
            <button className={subTab === 'reviews' ? 'active' : ''} onClick={() => setSubTab('reviews')}>작성 이력</button>
          </>
        )}
        {mainTab === 'stats' && (
          <>
            <button className={subTab === 'newuser' ? 'active' : ''} onClick={() => setSubTab('newuser')}>신규 가입자 추이</button>
          </>
        )}
      </div>

      <main className="admin-content">
        {mainTab === 'user' && subTab === 'filter' && (
          <div className="filter-control-bar">
            <div className="filter-group">
              <label>가입일자</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span>~</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            
            <div className="filter-group">
              <label>상태</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">전체</option>
                <option value="ACTIVE">정상</option>
                <option value="SUSPENDED">정지됨</option>
              </select>
            </div>

            <div className="filter-group search-group">
              <input 
                type="text" 
                placeholder="ID, 이메일, 이름, 닉네임 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        )}

        {mainTab === 'user' && (subTab === 'all' || subTab === 'filter') && (
          <div className="user-table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>가입일</th>
                  <th>이메일</th>
                  <th>닉네임</th>
                  <th>전화번호</th>
                  <th>이름</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {(subTab === 'all' ? users : filteredUsers).map((user) => (
                  <tr key={user.id || user.userId}>
                    <td className="txt-id">{user.id || user.userId}</td>
                    <td>{user.createdAt || user.created_at || '-'}</td>
                    <td className="txt-email">{user.email}</td>
                    <td>{user.nickname}</td>
                    <td>{user.phoneNumber || user.phone_number || '-'}</td>
                    <td>{user.realName || user.real_name || '-'}</td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {user.status === 'ACTIVE' ? '정상' : '정지됨'}
                      </span>
                    </td>
                    <td className="action-td">
                      <button className="btn-table active">활성</button>
                      <button className="btn-table stop" onClick={() => { setSelectedUser(user); setIsModalOpen(true); }}>정지</button>
                      <button className="btn-table exit" onClick={() => handleExit(user)}>탈퇴</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {mainTab === 'stats' && (
          <div style={{ width: '100%', height: 400, marginTop: '20px' }}>
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
        )}
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedUser?.nickname}님 정지 기간 설정</h3>
            <div className="modal-btns">
              {['1개월', '2개월', '3개월', '4개월', '5개월', '6개월', '1년', '3년'].map(period => (
                <button key={period} onClick={() => handleSuspend(period)}>{period}</button>
              ))}
            </div>
            <button className="btn-close" onClick={() => { setIsModalOpen(false); setSelectedUser(null); }}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;