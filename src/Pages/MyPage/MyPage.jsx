import React, { useState, useEffect } from 'react';
import { getMyPage } from '../../api/user';
import { Link, useNavigate } from 'react-router-dom';

import '../../Css/MyPage.css'; 

const HISTORY_BOOKS = [
  { id: 1, text: "Hist1" }, { id: 2, text: "Hist2" }, { id: 3, text: "Hist3" }
];

const ALL_LOAN_BOOKS = [
  [{ id: 1, text: "Loan1" }, { id: 2, text: "Loan2" }],
  [{ id: 3, text: "Loan3" }, { id: 4, text: "Loan4" }],
];

const ALL_RESERVE_BOOKS = [
  [{ id: 1, text: "Reserve1" }, { id: 2, text: "Reserve2" }],
  [{ id: 3, text: "Reserve3" }, { id: 4, text: "Reserve4" }],
];


function MyPage() {
  // 1. 상태(State) 관리
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loanPage, setLoanPage] = useState(0);
  const [reservePage, setReservePage] = useState(0);
  
  // 2. 페이지 이동을 위한 useNavigate 훅
  const navigate = useNavigate();
  useEffect(() => {
    let abort = false;
    (async () => {
      try{
        const me = await getMyPage();
        if(!abort) setUser(me);
      }catch(e){
        if(!abort) setError('정보를 불러오지 못했습니다.');
        console.error(e);
      }finally{
        if(!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, []);

  if (loading) return <div className="container">불러오는 중…</div>;
  if (error) return <div className="container" role="alert">{error}</div>;


  // 3. 이벤트 핸들러 함수들
  const handleNextLoanBooks = () => {
    setLoanPage((currentPage) => (currentPage + 1) % ALL_LOAN_BOOKS.length);
  };

  const handleNextReserveBooks = () => {
    setReservePage((currentPage) => (currentPage + 1) % ALL_RESERVE_BOOKS.length);
  };

  // 현재 페이지에 해당하는 대출/예약 도서 목록
  const currentLoanBooks = ALL_LOAN_BOOKS[loanPage];
  const currentReserveBooks = ALL_RESERVE_BOOKS[reservePage];

  return (
    <div>
      <div className="top-bar">
        <Link to="/" className="back-btn" aria-label="뒤로가기">←</Link>
        <span className="top-tittle">마이페이지</span>
      </div>

      <div className="user-info">
        <div className="name-row">
          <div style={{ fontSize: '19px', fontWeight: 'bold' }}>
            {user?.name} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>{user?.type}</span>
          </div>
          <div className="settings-btn" onClick={() => navigate('/EditProfilePage')}>⚙️</div>
        </div>
        <div>아이디: {user?.id}</div>
        <div>전화번호: {user?.phone}</div>
      </div>

      <hr />

      <div className="section-box">
        <div className="section-title">나의 히스토리 (최근 3건)</div>
        <div className="book-list">
          {HISTORY_BOOKS.map(book => (
            <img key={book.id} src={`https://via.placeholder.com/80x120?text=${book.text}`} alt={book.text} />
          ))}
        </div>
      </div>

      <div className="loan-reserve-row">
        <div className="loan">
          <div className="section-title" onClick={() => navigate('/Current')}>대출장서</div>
          <div className="book-list" id="loanBooks">
            {currentLoanBooks.map(book => (
              <img key={book.id} src={`https://via.placeholder.com/80x120?text=${book.text}`} alt={book.text} />
            ))}
          </div>
          <div className="arrow" onClick={handleNextLoanBooks}>›</div>
        </div>
        <div className="reserve">
          <div className="section-title" onClick={() => navigate('/reserve-detail')}>예약장서</div>
          <div className="book-list" id="reserveBooks">
            {currentReserveBooks.map(book => (
              <img key={book.id} src={`https://via.placeholder.com/80x120?text=${book.text}`} alt={book.text} />
            ))}
          </div>
          <div className="arrow" onClick={handleNextReserveBooks}>›</div>
        </div>
      </div>
      
      <div className="nav-block">
        <div className="nav-link" onClick={() => navigate('/interest')}>
          관심 도서 <span>›</span>
        </div>
        <a
            href="https://forms.gle/bM5gdDtrqMD6v3kj9" 
            className="nav-link"
            target="_blank" 
            rel="noopener noreferrer"
        >
          희망도서신청 <span>›</span>
        </a>
        <div className="nav-link" onClick={() => navigate('/MyReviewsPage')}>
          도서리뷰 <span>›</span>
        </div>
      </div>
      <hr />
    </div>
  );
}

export default MyPage;