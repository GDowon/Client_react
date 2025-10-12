import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import '../../Css/Loan.css';
import logoImage from '../../Images/navigation2.png';

import LoanForm from '../../Components/LoanForm';

// ********************************************
// API Helper 함수와 CustomModal은 LoanLoan.jsx에서 가져와야 합니다.
// (생략된 fetchJSON, CustomModal, getAuthHeaders 등은 상단에 있다고 가정)
// ********************************************
const BASE_URL = 'https://mungo.p-e.kr';
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

const CustomModal = ({ isOpen, message, onClose, onConfirm }) => {
    if (!isOpen) return null;
    const isSuccess = message.startsWith('✅'); 

    // 성공 메시지 내에서 반납일 및 연체일 정보를 파싱
    const returnDateMatch = isSuccess && message.match(/반납일:\s*([\d-]+)/);
    const overdueDaysMatch = isSuccess && message.match(/연체:\s*(\d+)\s*일/);

    const returnDate = returnDateMatch ? returnDateMatch[1] : null;
    const overdueDays = overdueDaysMatch ? parseInt(overdueDaysMatch[1], 10) : 0;

    const displayMessage = isSuccess
        ? (
            <>
                <p style={{ fontWeight: 'bold' }}>반납되었습니다.</p>
                {/* 연체된 경우 경고 메시지 표시 */}
                {overdueDays > 0 && (
                    <p style={{ color: 'red', marginTop: '10px', fontWeight: 'bold' }}>
                        ⚠️ {overdueDays}일 연체되었습니다.
                    </p>
                )}
                {/* 반납일 표시 */}
                {returnDate && <p style={{ marginTop: '10px' }}>반납일: {returnDate}</p>}
                {!returnDate && <p style={{ marginTop: '10px' }}>반납 처리되었습니다.</p>}
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
                            <button className="popup-btn" onClick={onClose}>반납 더 하기</button>
                            <button className="popup-btn primary" onClick={onConfirm}>메인페이지 가기</button>
                        </>
                    ) : (
                        <button className="popup-btn" onClick={onClose}>확인</button>
                    )}
                </div>
            </div>
        </div>
    );
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
// ********************************************

function LoanReturn() {
    // 팝업 상태는 LoanLoan과 동일하게 관리
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    const navigate = useNavigate();
    
    // 모달을 열고 메시지를 설정하는 함수
    const openModal = (msg) => {
        setModalMessage(msg);
        setIsModalOpen(true);
    };
  
    // 🌟🌟🌟 수정된 반납 제출 로직: 2단계 처리 🌟🌟🌟
    const handleReturnSubmit = async (bookCode) => { 
        console.log("반납 요청 도서 코드:", bookCode);
        
        const normalizedCode = (bookCode || '').trim();

        if (!normalizedCode) {
            openModal('❌ 도서 코드를 입력해주세요.');
            return;
        }

        try {
            // 1. 대출 목록 조회하여 rental_id 찾기
            const rentalsData = await fetchJSON('/rentals/current/', { auth: true });
            
            // 아직 반납되지 않은 (is_returned: false) 항목 중 북 코드가 일치하는 항목을 찾음
            const rentalItem = rentalsData.find(item => 
                !item.is_returned && item.book?.book_code === normalizedCode
            );
            
            if (!rentalItem) {
                openModal('❌ 대출 중인 도서가 아닙니다.');
                return;
            }

            const rentalId = rentalItem.id;

            // 2. rental_id로 반납 (PATCH) 요청
            console.log(`[RETURN] 대출 ID ${rentalId}로 반납 요청 시작`);
            const response = await fetchJSON(`/rentals/${rentalId}/`, { 
                method: 'PATCH', 
                auth: true, 
                body: { is_returned: true } // API 명세에 따른 요청 본문
            });

            console.log('[RETURN] 성공:', response);

            // 🌟 성공 메시지 구성 🌟
            const returnMsg = response.message || '반납되었습니다.';
            const returnDate = response.data?.return_date || new Date().toISOString().substring(0, 10);
            let finalMessage = `✅ ${returnMsg} 반납일: ${returnDate}`;
            if (response.data?.is_overdue && response.data?.overdue_days > 0) {
                finalMessage += ` 연체: ${response.data.overdue_days}일`;
            }
            openModal(finalMessage);
        } catch (err) {
            console.error('[RETURN] fail:', err);

            let errorMessage = '❌ 반납 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            
            // API 에러 메시지 파싱
            if (err.payload && Array.isArray(err.payload.message)) {
                errorMessage = '❌ ' + err.payload.message[0];
            } else if (err.status) {
                const detail = err.payload?.detail || err.payload?.message || `HTTP ${err.status} 오류`;
                errorMessage = '❌ ' + detail;
            }

            openModal(errorMessage);
        }
    };
  
    const returnCaption = ( 
        <>
            ※ 연속 대출은 예약자가 있는 경우에는 불가능하며, 후순위 예약자가 없는 경우에도 3일이 지나야 가능합니다.<br />
            ※ 연체된 도서는 자동으로 반납 처리되며, 연체 기간만큼 대출이 금지됩니다.
        </>
    );

    return (
        <div className="loan-container">
            <div className="top-bar">
                <div className="back-btn" onClick={() => navigate('/LoanChoice')}>←</div>
                <h1 className="sun-title">반납</h1>
            </div>
            <Link to="/">
                <img src={logoImage} alt="로고" className="logo" />
            </Link>

            <LoanForm 
                onSubmit={handleReturnSubmit} 
                buttonText="반납하기"
                caption={returnCaption} 
            />

            {/* CustomModal 사용 */}
            <CustomModal
                isOpen={isModalOpen}
                message={modalMessage}
                onClose={() => {setIsModalOpen(false);}}
                onConfirm={() => navigate('/')} // 확인 버튼: 마이페이지로 이동
            />
        </div>
    );
}

export default LoanReturn;