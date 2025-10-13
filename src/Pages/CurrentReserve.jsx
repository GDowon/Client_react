import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Css/SearchPage.css';
import '../Css/Curation.css';
import { CancelSuccessModal } from '../Components/CancelModal';
import { ConfirmModal } from '../Components/ConfirmModal';

import printnull from '../Images/printnull.png'; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const authHeaders = () => {
    const a = localStorage.getItem("accessToken");
    return {
        "Content-Type": "application/json",
        ...(a ? { Authorization: `Bearer ${a}` } : {}),
    };
};

// API 통신을 위한 헬퍼 함수
const fetchReservations = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) return [];

  try {
    const response = await fetch(`${API_BASE_URL}/reservations/`, {
      headers: authHeaders(), // 🌟 authHeaders 사용하도록 수정 🌟
    });

    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('현재 예약 도서 정보 불러오기 실패:', error);
    return [];
  }
};

const cancelReservationAPI = async (reservationId) => {
    const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}/cancel/`, {
        method: 'POST',
        headers: authHeaders(),
    });

    const result = await response.json();

    if (!response.ok) {
        // 오류 메시지 처리 (API 명세 참고)
        const errorMessage = Array.isArray(result.message) 
            ? result.message.join(' ') 
            : result.message || `예약 취소 실패: ${response.status}`;
        throw new Error(errorMessage);
    }
    return result.message; // "예약이 취소되었습니다."
};

const getStatusInfo = (status) => {
    switch (status) {
        case 'ACTIVE':
            return { message: '예약 중', color: '#007bff' }; // 파란색
        case 'CANCELED':
            return { message: '예약 취소', color: '#6c757d' }; // 회색
        case 'EXPIRED':
            return { message: '예약 만료', color: '#ffc107' }; // 주황색/노란색
        default:
            return { message: status, color: '#343a40' }; // 기본값 (검은색)
    }
};

function CurrentReserve() { 
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalMessage, setModalMessage] = useState(null); 
  const [confirmModalState, setConfirmModalState] = useState({
    isOpen: false,
    reservationId: null, // 취소할 예약 ID 저장
  });

 const refreshReservationData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchReservations();
            setReservations(data); 

            // 로컬 스토리지 업데이트
            const activeCount = data.filter(item => item.status === 'ACTIVE').length;
            if (activeCount >= 0) {
                localStorage.setItem('reserveCount', activeCount.toString());
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []); 

    useEffect(() => {
        refreshReservationData();
    }, [refreshReservationData]);

const executeCancellation = async () => {
    const reservationId = confirmModalState.reservationId;
    
    // 모달 닫고 상태 초기화
    setConfirmModalState({ isOpen: false, reservationId: null });

    if (!reservationId) return;

    try {
        const successMessage = await cancelReservationAPI(reservationId);
        setModalMessage(successMessage);
        
        refreshReservationData();

    } catch (err) {
        setModalMessage(err.message || '예약 취소 중 알 수 없는 오류가 발생했습니다.');
    }
};

const handleCancelReservation = async (reservationId) => {
    setConfirmModalState({
        isOpen: true,
        reservationId: reservationId,
    }); 
};



// 🌟🌟🌟 5. 확인 모달 닫기 핸들러 (아니요 버튼용) 🌟🌟🌟
const closeConfirmModal = () => {
    setConfirmModalState({ isOpen: false, reservationId: null });
};


// 모달 닫기 핸들러 (실제로는 alert이나 단순 팝업이므로, 상태만 초기화)
const closeModal = () => {
    setModalMessage(null);
};


return (
    <>
      <div className="top-bar">
        <div className="back-btn" onClick={() => navigate(-1)}>
          ←
        </div>
        <h1 className="sun-title">현재 예약 도서</h1>
      </div>
      <div className="content">
        {loading && <p>로딩 중...</p>}
        {error && <p className="error-message">오류: {error}</p>}

        {!loading && reservations.length === 0 && (
          <div style={{ padding: "12px 15px", textAlign: "center", color: "#555" }}>
            현재 예약 중인 도서가 없습니다.
          </div>
        )}
 
        {reservations.length > 0 && (
          <section className="book-list" id="book-list">
            {reservations.map((item) => {
              const imageUrl = item.book?.image_url 
                ? item.book.image_url 
                : printnull;
              const bookCode = item.book?.book_code || item.id;
              const statusInfo = getStatusInfo(item.status);

              
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
        <h3 className="rental-detail">예약일: {item.reservation_date ? item.reservation_date.substring(0, 10) : '-'}</h3>
        <h3 className="rental-detail">예약만료일: {item.due_date ? item.reservation_date.substring(0, 10) : '-'}</h3>
        <h3 className="rental-detail">예약취소일: {item.cancel_date ? item.reservation_date.substring(0, 10) : '-'}</h3>
        <h3 
            className="reservation-status-message" 
            style={{ fontWeight: 'bold', color: statusInfo.color }}
        >
            상태: {statusInfo.message}
        </h3>
      </div>
       {item.status === 'ACTIVE' && (
            <button
                className="loan-btn cancel-btn"
                type="button"
                // Link 이동 방지 및 취소 함수 호출
                onClick={(e) => { 
                    e.preventDefault(); 
                    e.stopPropagation(); 
                    handleCancelReservation(item.id); 
                }}
            >
                예약취소
            </button>
        )}
    </Link>
              );
          })}
        </section>
        )}
      </div>
      <ConfirmModal
          isOpen={confirmModalState.isOpen}
          message="예약을 취소하시겠습니까?"
          onConfirm={executeCancellation} // 예: 취소 API 실행
          onCancel={closeConfirmModal}   // 아니요: 모달 닫기
      />
       {modalMessage && (
          <CancelSuccessModal
            isOpen={!!modalMessage}
            message={modalMessage}
            onClose={closeModal}
            onConfirm={() => navigate('/')}
          />
       )}
    </>
  );
}

export default CurrentReserve;
