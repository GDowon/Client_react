import React, { useState, useEffect,useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Css/SearchPage.css';
import { ConfirmModal } from '../Components/ConfirmModal';
import { CancelSuccessModal } from '../Components/CancelModal';
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
    console.error('현재 대출 도서 정보 불러오기 실패:', error);
    return [];
  }
};
const returnBookAPI = async (rentalId) => {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('인증 토큰이 없습니다.');

  // PATCH 요청 사용 (부분 업데이트)
  const response = await fetch(`${API_BASE_URL}/rentals/${rentalId}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ is_returned: true }),
  });

  const result = await response.json();

  if (!response.ok) {
    // 오류 메시지 처리 (API 명세 참고)
    const errorMessage = Array.isArray(result.message) 
      ? result.message.join(' ') 
      : result.message || `반납 요청 실패: ${response.status}`;
    // 이미 반납된 경우에도 API 에러를 반환할 수 있으므로 메시지를 확인합니다.
    throw new Error(errorMessage);
  }
  return result.message || '반납되었습니다.'; // 성공 메시지 반환
};


function CurrentBorrow() {
  const navigate = useNavigate();
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // **[추가]** 모달 상태 관리
  const [modalMessage, setModalMessage] = useState(null); // 성공/실패 메시지 팝업용
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    rentalId: null, // 반납할 대출 ID 저장
  });

  // **[추가]** 대출 목록 새로고침 함수 (useCallback으로 래핑하여 재사용성 및 최적화)
  const refreshRentalData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCurrentRentals();
      const nonOverdueRentals = data.filter(item => !item.is_overdue && !item.is_returned); // is_returned 조건 추가
      setRentals(nonOverdueRentals);

      if (nonOverdueRentals.length >= 0) {
        localStorage.setItem('borrowCount', nonOverdueRentals.length.toString());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshRentalData();
  }, [refreshRentalData]); // 의존성 배열에 refreshRentalData 추가

  // **[추가]** 반납 실행 함수
  const executeReturn = async () => {
    const rentalId = confirmModalState.rentalId;

    // 모달 닫고 상태 초기화
    setConfirmModalState({ isOpen: false, rentalId: null });

    if (!rentalId) return;

    try {
      // 반납 API 호출
      const successMessage = await returnBookAPI(rentalId);
      setModalMessage(successMessage); // "반납되었습니다."

      refreshRentalData(); // 목록 새로고침

    } catch (err) {
      setModalMessage(err.message || '반납 처리 중 알 수 없는 오류가 발생했습니다.');
    }
  };

  // **[추가]** 반납 버튼 클릭 핸들러
  const handleReturnBook = (rentalId) => {
    setConfirmModalState({
      isOpen: true,
      rentalId: rentalId,
    });
  };

  // **[추가]** 확인 모달 닫기 핸들러 (아니요 버튼용)
  const closeConfirmModal = () => {
    setConfirmModalState({ isOpen: false, rentalId: null });
  };

  // **[추가]** 결과 모달 닫기 핸들러
  const closeModal = () => {
    setModalMessage(null);
  };
  

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
            대출 중인 도서가 없습니다.
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
                    <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#007bff' }}>{reservationStatus}</span>
                  </div>
                    <button
                      className="loan-btn return-btn" // loan-btn 클래스를 활용하고 return-btn 추가
                      type="button"
                      // Link 이동 방지 및 반납 함수 호출
                      onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          handleReturnBook(item.id); // 대출 ID 전달
                      }}
                      style={{ 
                          position: 'absolute', 
                          bottom: '10px', 
                          right: '10px', 
                          padding: '5px 10px', 
                          backgroundColor: '#0095ff', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '5px',
                          cursor: 'pointer',
                          zIndex: 10
                      }}
                  >
                      반납하기
                  </button>
                </Link>
              );
          })}
        </section>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmModalState.isOpen}
        message="도서를 반납하시겠습니까?"
        onConfirm={executeReturn} // 예: 반납 API 실행
        onCancel={closeConfirmModal}  // 아니요: 모달 닫기
      />
      {modalMessage && (
        <CancelSuccessModal // 이름은 그대로 사용
          isOpen={!!modalMessage}
          message={modalMessage}
          onClose={closeModal}
          // 반납 후 메인페이지로 이동하는 기능은 취소와 동일하게 처리
          onConfirm={() => navigate('/')} 
        />
      )}
    </>
  );
}

export default CurrentBorrow;
