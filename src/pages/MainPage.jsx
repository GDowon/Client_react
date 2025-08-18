import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Css/MainPage.css';

import Footer from '../Components/Footer';
import SearchBar from '../Components/SearchBar';
import PostList from '../Components/PostList';

import noticebanner from '../Images/banner.jpg';

const fetchBorrowData = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve([
      { title: '도서1', info: '대출일: 24-08-11' },
      { title: '도서2', info: '대출일: 24-07-29' }
    ]), 500);
  });
};

const fetchOverdueData = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve([
      { title: '도서B', info: '반납 예정일: 24-08-01' }
    ]), 500);
  });
};

const fetchReserveData = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve([
      { title: '도서A', info: '예약 순위: 1' }
    ]), 500);
  });
};

function MainPage() {
  const navigate = useNavigate();

  // 각 뱃지 숫자를 관리할 상태
  const [borrowCount, setBorrowCount] = useState(0);
  const [overdueCount, setOverdueCount] = useState(0);
  const [reserveCount, setReserveCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트가 처음 렌더링될 때 데이터 호출
  useEffect(() => {
    const loadCounts = async () => {
      setIsLoading(true);
      try {
        const borrowData = await fetchBorrowData();
        const overdueData = await fetchOverdueData();
        const reserveData = await fetchReserveData();
        
        setBorrowCount(borrowData.length);
        setOverdueCount(overdueData.length);
        setReserveCount(reserveData.length);
      } catch (error) {
        console.error("데이터를 불러오는 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCounts();
  }, []);

  // 공지, 큐레이션, 소개, 이용안내에 들어갈 더미 데이터 (임시로 생성)
  const noticePosts = [
    { title: '배너 이미지 공지사항입니다.', date: '24-01-20' },
  ];
  const curationPosts = [
    { title: '제목입니다.', date: '24-01-20' },
    { title: '제목입니다.', date: '24-01-19' },
    { title: '제목입니다.', date: '24-01-18' },
  ];
  const introPosts = [
    { title: '제목입니다.', date: '24-01-20' },
  ];
  const guidePosts = [
    { title: '제목입니다.', date: '24-01-19' },
  ];

  return (
    <div className="main-container">
      <header className="header">
        <Link className="title" to="/">문중문고</Link>
        <Link className="login-btn" to="/LoginPage">로그인 / 회원가입</Link>
      </header>

      <SearchBar />

      {/* 상태 버튼 */}
      <div className="status-buttons">
        <Link to="/current_borrow" className="notification">
          <span>대출 중 📖</span>
          {isLoading ? (
            <span className="badge">...</span>
          ) : (
            <span className="badge">{borrowCount}</span>
          )}
          <span className="line">━━</span>
          <span className="unit">권</span>
        </Link>
        <Link to="/current_reserve" className="notification">
          <span>예약 중 ⏰</span>
          {isLoading ? (
            <span className="badge">...</span>
          ) : (
            <span className="badge">{reserveCount}</span>
          )}
          <span className="line">━━</span>
          <span className="unit">권</span>
        </Link>
        <Link to="/current_overdue" className="notification">
          <span>연체 중 ⚠️</span>
          {isLoading ? (
            <span className="badge">...</span>
          ) : (
            <span className="badge">{overdueCount}</span>
          )}
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
          <PostList 
            title="큐레이션" 
            icon="👩‍🏫" 
            linkTo="/curation" 
            posts={curationPosts} 
          />
        </div>

        <div className="right-column">
          <PostList 
            title="문중문고 소개" 
            icon="📚" 
            linkTo="/guide" 
            posts={introPosts} 
          />
          <PostList 
            title="이용안내" 
            icon="ℹ️" 
            linkTo="/guide" 
            posts={guidePosts} 
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default MainPage;