import React from 'react';
import { useNavigate,Link } from 'react-router-dom';

import '../../Css/Loan.css';

function LoanChoice() {
  // 페이지 이동을 위한 useNavigate 훅
  const navigate = useNavigate();

  return (
    <>
      <div ClassName="loan-container">
        <div className="top-bar">
            <Link to="/" className="back-btn" aria-label="뒤로가기">←</Link>
            <span className="top-tittle">대출·반납</span>
        </div>
        <div className="section" onClick={() => navigate('/LoanLoan')}>
          <h1>대출하기</h1>
        </div>
        <div className="section" onClick={() => navigate('/LoanReturn')}>
          <h1>반납하기</h1>
        </div>
      </div>
    </>
  );
}

export default LoanChoice;