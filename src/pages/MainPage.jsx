// MainPage.jsx (리팩토링된 코드)

import { Link, useNavigate } from 'react-router-dom';
import '../Css/MainPage.css'; 

import Footer from '../Components/Footer';
import SearchBar from '../Components/SearchBar';
import PostList from '../Components/PostList'; // PostList 컴포넌트를 활용

function MainPage() {
  const navigate = useNavigate();

  const handleSearch = () => {
    navigate('/search');
  };

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
      {/* 상단 바 */}
      <header className="header">
        <Link className="title" to="/">문중문고</Link>
        <Link className="login-btn" to="/login">로그인 / 회원가입</Link>
      </header>

      {/* 검색창 */}
      <SearchBar />

      {/* 상태 버튼 */}
      <div className="status-buttons">
        <Link to="/current_borrow" className="notification">
          <span>대출 중 📖</span>
          <span className="badge">3</span>
          <span className="line">━━</span>
          <span className="unit">권</span>
        </Link>
        <Link to="/current_reserve" className="notification">
          <span>예약 중 ⏰</span>
          <span className="badge">3</span>
          <span className="line">━━</span>
          <span className="unit">권</span>
        </Link>
        <Link to="/current_overdue" className="notification">
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
            <img src="../Images/banner.jpg" alt="공지사항배너이미지" className="banner-image" />
          </Link>
        </div>
      </div>
      
      {/* 아래쪽 영역 */}
      <div className="bottom-sections">
        {/* 큐레이션 */}
        <div className="note">
          <PostList 
            title="큐레이션" 
            icon="👩‍🏫" 
            linkTo="/curation" 
            posts={curationPosts} 
          />
        </div>

        <div className="right-column">
          {/* 문중문고 소개 */}
          <PostList 
            title="문중문고 소개" 
            icon="📚" 
            linkTo="/guide" 
            posts={introPosts} 
          />
          {/* 이용안내 */}
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