import { useState} from 'react';
import { Link, useNavigate } from 'react-router-dom';

import navigation1 from '../Images/navigation1.png';
import navigation2 from '../Images/navigation2.png';
import navigation3 from '../Images/navigation3.png';

const isLoggedIn = () => {
    const token = localStorage.getItem('accessToken');
    return !!token;
};

const LoginRequiredModal = ({ isOpen, onClose, onLoginNavigate }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="modal-backdrop" 
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 1200 // 다른 모달보다 높은 z-index
            }}
        >
            <div 
                className="modal-content"
                style={{
                    backgroundColor: 'white', padding: '20px', borderRadius: '8px', 
                    textAlign: 'center', maxWidth: '300px' 
                }}
                onClick={e => e.stopPropagation()}
            >
                <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                    로그인이 필요한 서비스입니다.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                    <button 
                        onClick={onClose} 
                        style={{ padding: '5px 10px', cursor: 'pointer', border: '1px solid #ccc', backgroundColor: 'white',color:'black' }}
                    >
                        닫기
                    </button>
                    <button 
                        onClick={onLoginNavigate} 
                        style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none' }}
                    >
                        로그인 페이지로 이동
                    </button>
                </div>
            </div>
        </div>
    );
};


function Footer() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleLoanReturnClick = (e) => {
        // Link 컴포넌트의 기본 동작(페이지 이동)을 막습니다.
        e.preventDefault(); 
        
        if (isLoggedIn()) {
            // 로그인 상태이면 페이지 이동
            navigate('/LoanChoice');
        } else {
            // 로그인 상태가 아니면 모달 열기
            setIsModalOpen(true);
        }
    };

    const handleLoginNavigate = () => {
        setIsModalOpen(false);
        // 실제 로그인 페이지 경로로 변경하세요.
        navigate('/LoginPage'); 
    };

    return (
        <>
            <footer className="bottom-nav">
                {/* 대출/반납 버튼에 onClick 핸들러 적용 */}
                <a className="nav-item" href="/LoanChoice" onClick={handleLoanReturnClick}>
                    <img src={navigation1} alt="대출반납 아이콘" />
                    <span>대출·반납</span>
                </a>
                
                <div className="nav-center">
                    <Link to="/">
                        <img src={navigation2} alt="문중문고 아이콘" className="nav-center-icon" />
                    </Link>
                </div>

                {/* 마이페이지는 로그인 확인이 이미 MyPage 컴포넌트 내부에서 처리되므로 Link 유지 */}
                <Link className="nav-item" to="/MyPage">
                    <img src={navigation3} alt="마이페이지 아이콘" />
                    <span>마이페이지</span>
                </Link>
            </footer>
            
            <LoginRequiredModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onLoginNavigate={handleLoginNavigate}
            />
        </>
    );
}

export default Footer;