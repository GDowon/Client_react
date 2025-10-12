// src/Components/CustomModal.jsx

import React from 'react';
// CustomModal은 어디서든 사용될 수 있으므로, navigate를 사용하지 않도록 수정합니다.
// onConfirm, onClose 콜백 함수를 통해 상위 컴포넌트에 액션을 위임합니다.

const CustomModal = ({ isOpen, message, onClose, onConfirm }) => {
    if (!isOpen) return null;
    
    // '✅'로 시작하면 성공, 아니면 실패로 간주 (loan.js의 에러 형식과 일치)
    const isSuccess = message.startsWith('✅'); 
    const isReservation = message.includes('예약'); 

    const getReturnDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 7);
        return today.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/ /g, '');
    };
    
    const displayMessage = isSuccess
        ? (
            <>
                <p style={{ fontWeight: 'bold' }}>처리되었습니다.</p>
                <p style={{ marginTop: '10px' }}>만기일: {getReturnDate()}</p>
            </>
        )
        : <p>{message.replace('❌', '')}</p>; // 에러 메시지에서 ❌ 기호 제거

    return (
        // CSS 클래스가 정의되어 있다고 가정합니다.
        <div className={`loan-modal ${isOpen ? 'open' : ''}`} id="loan-modal">
            <div className="modal-content">
                {displayMessage}
                <div className="popup-buttons">
                    {isSuccess ? (
                        <>
                            {/* onClose: 모달을 닫는 역할 (예: 더 대출하기) */}
                            <button className="popup-btn" onClick={onClose}>
                                {isReservation ? '예약 더 하기' : '더 대출하기'}
                            </button>
                            {/* onConfirm: 확인 액션 (예: 메인페이지 가기) */}
                            <button className="popup-btn primary" onClick={onConfirm}>메인페이지 가기</button>
                        </>
                    ) : (
                        // 에러 시에는 확인 버튼만
                        <button className="popup-btn" onClick={onClose}>확인</button>
                    )}
                </div>
            </div>
            {/* 오버레이 추가 (모달 외부 영역) */}
            <div className="modal-overlay" onClick={onClose}></div>
        </div>
    );
};

export default CustomModal;