// src/Pages/LoanLoan.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../Css/Loan.css';
import logoImage from '../../Images/navigation2.png';
import LoanForm from '../../Components/LoanForm';

function LoanLoan() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  // "대출"에 특화된 제출 로직
  const handleLoanSubmit = (registerNumber) => {
    console.log("대출할 도서 등록번호:", registerNumber);
    setIsPopupOpen(true);
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
      
      {isPopupOpen && (
        <div id="loan-success-popup" className="popup-main">
          <div className="popup-content">
            <p>대출되었습니다.</p>
            <div className="popup-buttons">
              <button className="popup-btn" onClick={() => window.location.reload()}>더 대출하기</button>
              <button className="popup-btn" onClick={() => navigate('/mypage')}>대출 정보 확인</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoanLoan;