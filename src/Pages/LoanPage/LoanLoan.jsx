// src/Pages/LoanLoan.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../Css/Loan.css';
import logoImage from '../../Images/navigation2.png';
import LoanForm from '../../Components/LoanForm';

// 백엔드 API 통신에 필요한 함수와 URL 정의
const BASE_URL = 'https://mungo.p-e.kr';
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
async function fetchJSON(
    path,
    { method = 'GET', body, auth = false, headers = {}, timeoutMs = 8000 } = {}
) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);

    const baseHeaders = {
        Accept: 'application/json',
        ...(auth ? getAuthHeaders() : {}),
        ...headers,
    };
    if (method !== 'GET' || body != null) {
        baseHeaders['Content-Type'] = 'application/json';
    }

    let res;
    try {
        res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: baseHeaders,
            body: body ? JSON.stringify(body) : undefined,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timer);
    }

    const ct = res.headers.get('content-type') || '';
    const text = await res.text();

    if (!ct.includes('application/json')) {
        throw new Error(
            `Expected JSON but got ${ct} ${res.status} at ${res.url}. Body: ${text.slice(0, 120)}`
        );
    }

    const json = text ? JSON.parse(text) : null;
    if (!res.ok) {
        const msg = json?.detail || json?.message || `HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        err.payload = json;
        throw err;
    }
    return json;
}

function LoanLoan() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const navigate = useNavigate();

  // 모달을 열고 메시지를 설정하는 함수
  const openModal = (msg) => {
    setPopupMessage(msg);
    setIsPopupOpen(true);
  };
  
  // "대출"에 특화된 제출 로직 (백엔드 요청 포함)
  const handleLoanSubmit = async (bookId) => {
    console.log("대출할 도서 등록번호:", bookId);
    
    try {
        // 대출 요청 API 호출
        const response = await fetchJSON(`/rentals/`, { 
            method: 'POST', 
            auth: true, 
            body: { code: bookId } 
        });

        openModal('대출이 완료되었습니다.');
    } catch (err) {
        console.error('[RENT] fail:', err);
        
        let errorMessage = '대출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        
        // 백엔드 응답에 "message" 필드가 있는 경우
        if (err.payload && Array.isArray(err.payload.message)) {
            // "message" 배열의 첫 번째 항목을 사용
            errorMessage = err.payload.message[0];
        } else if (err.message === 'HTTP 400') {
            // 일반적인 HTTP 400 오류 메시지
            errorMessage = '요청이 올바르지 않습니다. 도서 정보를 확인해주세요.';
        }
        
        openModal(errorMessage);
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
      
      {/* 팝업창을 항상 렌더링하고, CSS 클래스로 표시/숨기기를 제어 */}
      <div id="loan-success-popup" className={`popup-main ${isPopupOpen ? 'is-active' : ''}`}>
        <div className="popup-content">
          <p>{popupMessage}</p>
          <div className="popup-buttons">
            <button className="popup-btn" onClick={() => window.location.reload()}>더 대출하기</button>
            <button className="popup-btn" onClick={() => navigate('/mypage')}>대출 정보 확인</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoanLoan;