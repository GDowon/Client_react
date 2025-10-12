import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {submitLoanRequest} from '../../Api/loan.js';
import '../../Css/Loan.css';
import logoImage from '../../Images/navigation2.png';
import LoanForm from '../../Components/LoanForm';


const CustomModal = ({ isOpen, message, onClose, onConfirm }) => {
    if (!isOpen) return null;
    const isSuccess = message.startsWith('✅'); 
    // 성공 시 반납일 계산 (오늘 날짜 + 7일)
    const getReturnDate = () => {
        const today = new Date();
        today.setDate(today.getDate() + 7);
        return today.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };
  const displayMessage = isSuccess
        ? (
            <>
                <p style={{ fontWeight: 'bold' }}>대출되었습니다.</p>
                <p style={{ marginTop: '10px' }}>반납일: {getReturnDate()}</p>
            </>
        )
        : <p>{message.replace('❌', '')}</p>; // 에러 메시지에서 ❌ 기호 제거

    return (
        <div className={`loan-modal ${isOpen ? 'open' : ''}`} id="loan-modal">
            <div className="modal-content">
                {displayMessage}
                <div className="popup-buttons">
                    {isSuccess ? (
                        <>
                            <button className="popup-btn" onClick={onClose}>더 대출하기</button>
                            <button className="popup-btn primary" onClick={onConfirm}>메인페이지 가기</button>
                        </>
                    ) : (
                        <button className="popup-btn" onClick={onClose}>확인</button>
                    )}
                </div>
            </div>
            <div className="modal-overlay" onClick={onClose}></div>
        </div>
    );
};


function LoanLoan() {
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [modalMessage, setModalMessage] = useState('');
  const navigate = useNavigate();
  const openModal = (msg) => {
    setModalMessage(msg);
    setIsModalOpen(true);
  };


  // "대출"에 특화된 제출 로직 (백엔드 요청 포함)
    const handleLoanSubmit = async (bookId) => {
    try {
      await submitLoanRequest(bookId);

        openModal('대출되었습니다');
    } catch (err) {
        openModal(err.message); 
        console.error('[LoanLoan] Error caught in UI:', err.message);
    }
  };

  const loanCaption = (
    <>
      ※ 대출기간은 7일이며, 대출 연장은 1회에 한해 7일까지 가능합니다(최종 14일).<br />
      ※ 대출 예약을 한 경우, 대기 제한이 없을 시 3일 내 대출해야 합니다.<br />
      ※ 연속 대출은 예약자가 있는 경우에는 불가능하며, 없는 경우에도 3일이 지나야 가능합니다.<br />
      ※ 연체 시 연체일 만큼 대출이 금지됩니다.
    </>
  );

  return (
    <div className="loan-container">
      <div className="top-bar">
        <div className="back-btn" onClick={() => navigate('/LoanChoice')}>←</div>
        <h1 className="sun-title">대출</h1>
      </div>
      <Link to="/"><img src={logoImage} alt="로고" className="logo" /></Link>

      <LoanForm 
        onSubmit={handleLoanSubmit} 
        buttonText="대출하기"
        caption={loanCaption}
      />
      
       <CustomModal
        isOpen={isModalOpen}
        message={modalMessage}
        onClose={() => {setIsModalOpen(false);}}
        onConfirm={() => navigate('/')} // 확인 버튼: 마이페이지로 이동
        />
        </div>
  );
}

export default LoanLoan;