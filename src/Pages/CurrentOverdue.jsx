import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Css/SearchPage.css';
import printnull from '../Images/printnull.png'; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// API 통신을 위한 헬퍼 함수 (기존 코드 유지)
const fetchCurrentRentals = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/rentals/current/`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('현재 연체 도서 정보 불러오기 실패:', error);
    return [];
  }
};


function CurrentOverdue() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getRentals = async () => {
      try {
        const data = await fetchCurrentRentals();
        
        // 연체되지 않은 도서만 필터링 (현재 대출 중)
        const OverdueRentals = data.filter(item => item.is_overdue);
         
        setRentals(OverdueRentals);

        // localstorage에 대출 도서 개수를 저장
        if (OverdueRentals.length >= 0) {
          localStorage.setItem('overdueCount', OverdueRentals.length.toString());
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getRentals();
  }, []);

  return (
    <>
      <div className="top-bar">
        <div className="back-btn" onClick={() => navigate(-1)}>
          ←
        </div>
        <h1 className="sun-title">현재 대출 도서</h1>
      </div>
      <div className="content">
        {loading && <p>로딩 중...</p>}
        {error && <p className="error-message">오류: {error}</p>}

        {!loading && rentals.length === 0 && (
          <div style={{ padding: "12px 15px", textAlign: "center", color: "#555" }}>
            연체 중인 도서가 없습니다.
          </div>
        )}

        {rentals.length > 0 && (
          <section className="book-list" id="book-list">
            {rentals.map((item) => {
              const overdueMessage = item.is_overdue
                ? `⚠️ ${item.overdue_days}일 연체`
                : '';
              const reservationStatus = item.book?.book_status === 'RESERVED' 
                ? '예약된 도서입니다. 빠른 반납이 필요합니다.' 
                : '';
              const imageUrl = item.book?.image_url 
                ? item.book.image_url 
                : printnull; // nuImage 대신 printnull 사용
              const bookCode = item.book?.book_code || item.id;

  return (
    <Link 
        to={`/BookPage/${bookCode}`} 
        className="book-card" 
        key={item.id}
    >
      <div className="book-cover">
          <img 
          className="cover-img" 
          src={imageUrl} 
          alt={'도서 표지'} 
          />
        </div>
      <div className="book-info">
        <h2 className="code">코드: {bookCode}</h2>
        <h3 className="rental-detail">대출일: {item.rental_date}</h3>
        <h3 className="rental-detail">반납 예정일: {item.due_date}</h3>
        <span 
                    className="overdue-status" 
                    style={{ fontSize: '14px', fontWeight: 'bold', color: item.is_overdue ? 'red' : 'green' }}
                  >
                    {overdueMessage}
                  </span>
        <p style={{ fontSize: '14px', fontWeight: 'normal', color: '#007bff' }}>{reservationStatus}</p>
      </div>
    </Link>
              );
          })}
        </section>
        )}
      </div>
    </>
  );
}

export default CurrentOverdue;
