import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Css/MainPage.css';

import Footer from '../Components/Footer';
import SearchBar from '../Components/SearchBar';
import PostList from '../Components/PostList';

import noticebanner from '../Images/banner.png';

const BASE_URL = 'https://mungo.p-e.kr';

const getAuthHeaders = (token) => {
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}), 
    };
};

const fetchApi = async (path, token) => {
    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            headers: getAuthHeaders(token),
        });

        if (response.ok) {
            return await response.json();
        }
        return null; 
    } catch (error) {
        console.error(`[API 통신 오류] ${path}:`, error);
        return null;
    }
};

const fetchUserCounts = async (token, setBorrow, setOverdue, setReserve) => {
    if (!token) return;

    try {
        // 1. 대출 및 연체 목록 가져오기
        const rentals = await fetchApi('/rentals/current/', token);
        let nonOverdueCount = 0;
        let overdueCount = 0;
        
        if (rentals && Array.isArray(rentals)) {
            nonOverdueCount = rentals.filter(item => !item.is_overdue).length;
            overdueCount = rentals.filter(item => item.is_overdue).length;
        }
        setBorrow(nonOverdueCount);
        setOverdue(overdueCount);
        localStorage.setItem('borrowCount', nonOverdueCount.toString());
        localStorage.setItem('overdueCount', overdueCount.toString());

        // 2. 예약 목록 가져오기
        const reservations = await fetchApi('/reservations/', token);
        let activeReserveCount = 0;

        if (reservations && Array.isArray(reservations)) {
            // 'ACTIVE' 상태의 예약만 카운트
            activeReserveCount = reservations.filter(item => item.status === 'ACTIVE').length;
        }
        setReserve(activeReserveCount);
        localStorage.setItem('reserveCount', activeReserveCount.toString());

        console.log('✅ 메인 페이지 뱃지 정보가 갱신되었습니다.');

    } catch (e) {
        console.error('메인 페이지 카운트 정보 갱신 실패:', e);
        // API 오류 시 사용자에게 혼란을 주지 않기 위해 0으로 표시
        setBorrow(0);
        setOverdue(0);
        setReserve(0);
        localStorage.setItem('borrowCount', '0');
        localStorage.setItem('overdueCount', '0');
        localStorage.setItem('reserveCount', '0');
    }
};

function getLoggedInUser() {
    // 로컬 스토리지에서 토큰과 사용자 이름을 가져옵니다.
    const accessToken = localStorage.getItem('accessToken');
    const userID = localStorage.getItem('userID');

    // 토큰과 사용자 이름이 모두 존재하면 로그인 상태로 간주
    if (accessToken && userID) {
        return { userID, accessToken }; // accessToken도 반환하여 API 호출에 사용
    }
    return null; // 로그인 상태가 아님
}


function MainPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getLoggedInUser()); 

  // 각 뱃지 숫자를 관리할 상태
  const [borrowCount, setBorrowCount] = useState(null);
  const [overdueCount, setOverdueCount] = useState(null);
  const [reserveCount, setReserveCount] = useState(null);

  // 컴포넌트가 처음 렌더링될 때 데이터 호출
  useEffect(() => {
        // user 객체에 토큰이 있을 때만 API 호출을 시도
        if (user && user.accessToken) {
            // 로그인 상태: API 호출하여 최신 정보 갱신
            fetchUserCounts(
                user.accessToken, 
                setBorrowCount, 
                setOverdueCount, 
                setReserveCount
            );
        } else {
            // 로그아웃 상태: 뱃지 카운트를 null로 설정하여 UI에 '...' 표시
            setBorrowCount(null);
            setOverdueCount(null);
            setReserveCount(null);
        }

    // user 상태가 변경될 때마다 실행 (로그인/로그아웃 시)
    // 컴포넌트 마운트 시에도 user 상태를 확인하여 실행
    }, [user]); 

  const handleAuthClick = () => {
      if (user) {
        // 로그아웃 로직: 로컬 스토리지에서 모든 인증 정보 제거
        console.log(`${user.userID} 님 로그아웃`);
        localStorage.removeItem('access_token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userID');
        localStorage.removeItem('username');
        localStorage.removeItem('borrowCount');
        localStorage.removeItem('reserveCount');
        localStorage.removeItem('overdueCount');

        setUser(null); // 상태 업데이트
        setBorrowCount(null); // 뱃지 초기화
        setOverdueCount(null);
        setReserveCount(null);
        navigate('/'); // 로그아웃 후 메인 페이지로 이동 (상태 변화로 리렌더링)
      } else {
        // 로그인/회원가입 페이지로 이동
        navigate('/LoginPage');
      }
    };

  // 공지, 큐레이션, 소개, 이용안내에 들어갈 더미 데이터 (임시로 생성)
  const noticePosts = [
    { title: '문중문고 개관', date: '25-10-14' },
  ];
  const curationPosts = [
    { title: '25-10-31 업데이트 예정입니다.', date: '25-10-14' }
  ];
  const introPosts = [
    { title: '제목입니다.', date: '24-01-20' },
  ];
  const guidePosts = [
    { title: '문중문고 이용안내', date: '25-10-14' },
  ];

  const authLinkTo = user ? "/" : "/LoginPage"; 
  const authButtonText = user ? `${user.userID} 님 / 로그아웃` : "로그인 / 회원가입";

  return (
    <div className="main-container">
      <header className="header">
        <Link className="title" to="/">문중문고</Link>
        <Link 
          className="login-btn" 
          to={authLinkTo}
          onClick={user ? handleAuthClick : null} 
        >
          {authButtonText}
        </Link>
      </header>

      <SearchBar />

      {/* 상태 버튼 */}
      <div className="status-buttons">
        <Link to="/CurrentBorrow" className="notification">
          <span>대출 중 📖</span>
            <span className="badge">
            {borrowCount === null ? '...' : borrowCount}
          </span>
          <span className="line">━━</span>
          <span className="unit">권</span>
        </Link>
        <Link to="/CurrentReserve" className="notification">
          <span>예약 중 ⏰</span>
          <span className="badge">
            {reserveCount === null ? '...' : reserveCount}
          </span>
          <span className="line">━━</span>
          <span className="unit">권</span>
        </Link>
        <Link to="/CurrentOverdue" className="notification">
          <span>연체 중 ⚠️</span>
          <span className="badge">
            {overdueCount === null ? '...' : overdueCount}
          </span>
          <span className="line">━━</span>
          <span className="unit">권</span>
        </Link>
      </div>

      <div className="section-wrapper">
        <div className="section-header">
          <span>📢 공지</span>
          <Link className="plus-button" to="/NoticePage">＋</Link>
        </div>
        <div className="banner-card">
          <Link to="/NoticePage">
            <img src={noticebanner} alt="공지사항 배너이미지" className="banner-image" />
          </Link>
        </div>
      </div>
      
      <div className="bottom-sections">
        <div className="note">
          <Link to="/CurationPage" style={{ textDecoration: 'none', color: 'inherit' }}>
              <PostList 
                  title="큐레이션" 
                  icon="👩‍🏫" 
                  linkTo="/CurationPage"
                  posts={curationPosts} 
              />
          </Link>
    </div>

        <div className="right-column">
          {/*
          <PostList 
            title="문중문고 소개" 
            icon="📚" 
            linkTo="/GuidePage" 
            posts={introPosts} 
          />
          */}
          <Link to="/CurationPage" style={{ textDecoration: 'none', color: 'inherit' }}>
            <PostList 
              title="이용안내" 
              icon="ℹ️" 
              linkTo="/GuidePage" 
              posts={guidePosts} 
            />
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default MainPage;