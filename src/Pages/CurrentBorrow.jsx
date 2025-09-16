import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Css/SearchPage.css';

// API 통신을 위한 헬퍼 함수
const fetchCurrentRentals = async () => {
  const token = localStorage.getItem('access_token');
  if (!token) return [];

  try {
    const response = await fetch('/rentals/current/', {
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
    console.error('현재 대출 도서 정보 불러오기 실패:', error);
    return [];
  }
};

function CurrentBorrow() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getRentals = async () => {
      try {
        const data = await fetchCurrentRentals();
        setRentals(data);
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
        <div className="back-btn" onClick={() => navigate('/')}>
          ←
        </div>
        <h1 className="sun-title">현재 대출 도서</h1>
      </div>
      <div className="content">
        {loading && <p>로딩 중...</p>}
        {error && <p className="error-message">오류: {error}</p>}

        {!loading && rentals.length === 0 && (
          <div style={{ padding: "12px 15px", textAlign: "center", color: "#555" }}>
            대출 중인 도서가 없습니다.
          </div>
        )}

        {rentals.length > 0 && (
          <ul className="rental-list">
            {rentals.map((item) => (
              <li key={item.id} className="rental-item">
                <div className="book-info">
                  <h2 className="book-title">{item.book_title}</h2>
                  <span className="rental-date">대출일: {item.rental_date}</span>
                  <span className="due-date">반납 예정일: {item.due_date}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default CurrentBorrow;