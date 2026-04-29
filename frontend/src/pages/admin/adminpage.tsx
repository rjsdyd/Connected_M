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

  // 데이터 로드 및 ID 오름차순 정렬 (API 수정 반영)
 useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token'); 
        const response = await axios.get('http://localhost:8080/api/admin/users', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // 👈 [수정 포인트] response.data.content를 가져와야 합니다!! ㅋㅋㅋㅋ
        const userData = response.data.content; 
        
        // 데이터가 배열인지 확인하고 정렬 후 세팅!! ㅋㅋㅋㅋ
        if (Array.isArray(userData)) {
          const sortedData = [...userData].sort((a: any, b: any) => a.userId - b.userId);
          setUsers(sortedData); 
        } else {
          console.error("데이터 구조가 Page 형식이 아닙니다 ㅠ", response.data);
        }

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

  // 필터링 로직
  const filteredUsers = users.filter(user => {
    // 1. 날짜 범위 필터
    if (startDate && user.createdAt && new Date(user.createdAt) < new Date(startDate)) return false;
    if (endDate && user.createdAt && new Date(user.createdAt) > new Date(endDate)) return false;

    // 2. 상태 필터
    if (statusFilter !== 'ALL' && user.status !== statusFilter) return false;

    // 3. 통합 검색 (ID, 이메일, 전화번호, 이름, 닉네임)
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      String(user.userId).includes(term) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      (user.phoneNumber && user.phoneNumber.includes(term)) ||
      (user.realName && user.realName.toLowerCase().includes(term)) ||
      (user.nickname && user.nickname.toLowerCase().includes(term));
    
    return matchesSearch;
  });

  const handleSuspend = (months: string) => {
    if (!selectedUser) return;
    setUsers(users.map(u => 
      u.userId === selectedUser.userId ? { ...u, status: 'SUSPENDED' } : u
    ));
    alert(`${selectedUser.nickname}님 계정이 ${months} 동안 정지 처리되었습니다.`);
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleExit = (user: any) => {
    const confirmExit = window.confirm(`${user.nickname}(ID: ${user.userId}) 계정을 정말 삭제하시겠습니까?`);
    if (confirmExit) {
      setUsers(users.filter(u => u.userId !== user.userId));
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
        <button className={mainTab === 'stats' ? 'active' : ''} onClick={() => {setMainTab('stats'); setSubTab('movie');}}>통계</button>
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
            <button className={subTab === 'choice' ? 'active' : ''} onClick={() => setSubTab('choice')}>유저의 선택</button>
            <button className={subTab === 'newuser' ? 'active' : ''} onClick={() => setSubTab('newuser')}>신규 가입자 추이</button>
          </>
        )}
      </div>

      <main className="admin-content">
        {/* 필터 탭 전용 컨트롤 바 */}
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

        {/* 유저 테이블 (전체 유저 및 필터 공용) */}
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
                  <tr key={user.userId}>
                    <td className="txt-id">{user.userId}</td>
                    <td>{user.createdAt || '-'}</td>
                    <td className="txt-email">{user.email}</td>
                    <td>{user.nickname}</td>
                    <td>{user.phoneNumber || '-'}</td>
                    <td>{user.realName || '-'}</td>
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
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedUser?.nickname}님 정지 기간 설정</h3>
            <div className="modal-btns">
              {['1개월', '2개월', '3개월', '4개월', '5개월', '6개월'].map(period => (
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