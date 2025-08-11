// src/pages/MainPage.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Link와 useNavigate 훅 import
import '../Css/MainPage.css'; // MainPage 전용 CSS
import '../Css/navi.css';     // Navi 전용 CSS
import '../Css/font.css';     // Font 전용 CSS (App.js 또는 Index.js에 전역으로 넣는게 더 일반적)
import Footer from '../components/Footer';
import SearchBar from '../components/SearchBar';
import PostList from '../components/PostList';

function MainPage() {
  const navigate = useNavigate(); // useNavigate 훅 사용

  const handleSearch = () => {
    // 검색 버튼 클릭 시 SearchPage로 이동
    navigate('/search');
  };

  return (
    <div className="main-container">
      {/* 상단 바 */}
      <header className="header">
        <Link className="title" to="/">문중문고</Link>
        <Link className="login-btn" to="/login">로그인 / 회원가입</Link>
      </header>

      {/* 검색창 */}
      <SearchBar />

      {/* 상태 버튼 */}
      <div className="status-buttons">
        <Link to="/mypage" className="notification">
          <span>대출 중 📖</span>
          <span className="badge">3</span>
          <span className="line">━━</span>
          <span className="unit">권</span>
        </Link>
        <Link to="/mypage" className="notification">
          <span>예약 중 ⏰</span>
          <span className="badge">3</span>
          <span className="line">━━</span>
          <span className="unit">권</span>
        </Link>
        <Link to="/mypage" className="notification">
          <span>연체 중 ⚠️</span>
          <span className="badge">5</span>
          <span className="line">━━</span>
          <span className="unit">권</span>
        </Link>
      </div>

      {/* 공지 */}
      <div className="section-wrapper">
        <div className="section-header">
          <span>📢 공지</span>
          <Link className="plus-button" to="/notice">＋</Link>
        </div>
        <div className="banner-card">
          <Link to="/notice">
            <img src="/images/banner.jpg" alt="공지사항배너이미지" className="banner-image" />
          </Link>
        </div>
      </div>

      {/* 아래쪽 영역 */}
      <div className="bottom-sections">
        {/* 큐레이션 */}
        <div className="note">
          <div className="section-header">
            <span>👩‍🏫 큐레이션</span>
            <Link className="plus-button" to="/curation">＋</Link>
          </div>
          <div className="card small-card">
            <table className="board-table">
              <tbody>
                <tr><td className="title">제목입니다.</td><td>24-01-20</td></tr>
                <tr><td className="title">제목입니다.</td><td>24-01-19</td></tr>
                <tr><td className="title">제목입니다.</td><td>24-01-18</td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="right-column">
          {/* 문중문고 소개 */}
          <div className="note">
            <div className="section-header">
              <span>📚 문중문고 소개</span>
              <Link className="plus-button" to="/guide">＋</Link>
            </div>
            <div className="card small-card">
              <table className="board-table">
                <tbody>
                  <tr><td className="title">제목입니다.</td><td>24-01-20</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* 이용안내 */}
          <div className="note">
            <div className="section-header">
              <span>ℹ️ 이용안내</span>
              <Link className="plus-button" to="/guide">＋</Link>
            </div>
            <div className="card small-card">
              <table className="board-table">
                <tbody>
                  <tr><td className="title">제목입니다.</td><td>24-01-19</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default MainPage;