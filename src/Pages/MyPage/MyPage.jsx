import React, { useState, useEffect } from 'react';
import { getMyPage } from '../../Api/user';
import { Link, useNavigate } from 'react-router-dom';

import '../../Css/MyPage.css'; 
import logoImage from '../../Images/navigation2.png';

function MyPage() {
  // 1. 상태(State) 관리
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [borrowCount, setBorrowCount] = useState('-');
  const [overdueCount, setOverdueCount] = useState('-');
  const [reserveCount, setReserveCount] = useState('-');
  
  // 2. 페이지 이동을 위한 useNavigate 훅
  const navigate = useNavigate();
  useEffect(() => {
    let abort = false;
    (async () => {
      try{
        const me = await getMyPage();
        if(!abort) setUser(me);
      }catch(e){
        if(!abort) {
           console.error("마이페이지 정보 로드 중 오류 발생:", e);
           if (e.response && e.response.status !== 401 && !abort) {
                     setError('정보를 불러오지 못했습니다.');
           }
        }
      }finally{
        if(!abort) setLoading(false);
      }
    })();
    return () => { abort = true; };
  }, []);

  useEffect(() => {
        // localStorage에서 값을 읽어와 숫자로 변환합니다. 없으면 '-'로 유지됩니다.
        const storedBorrow = localStorage.getItem('borrowCount');
        const storedOverdue = localStorage.getItem('overdueCount');
        const storedReserve = localStorage.getItem('reserveCount');

        setBorrowCount(storedBorrow ? parseInt(storedBorrow, 10) : '-');
        setOverdueCount(storedOverdue ? parseInt(storedOverdue, 10) : '-');
        setReserveCount(storedReserve ? parseInt(storedReserve, 10) : '-');
    }, []);

   if (loading) return <div className="container">불러오는 중…</div>;
    // 일반적인 API 오류가 발생했고, 로그인 유무와 관계없이 페이지 표시 불가일 경우
    if (error) return <div className="container" role="alert">{error}</div>;

    // ** 로그인 되지 않은 상태일 경우 **
    if (!user) {
        return (
            <div>
                <div className="top-bar">
                    <Link to="/" className="back-btn" aria-label="뒤로가기">←</Link>
                    <span className="top-tittle">마이페이지</span>
                </div>
                <Link to="/"><img src={logoImage} alt="로고" className="logo" /></Link>

                <div className="container" style={{ padding: '20px', textAlign: 'center' }}>
                    <p style={{ fontSize: '1.2em', fontWeight: 'bold', marginBottom: '15px' }}>
                        로그인이 필요한 서비스입니다.
                    </p>
                    <p style={{ marginBottom: '15px', color: '#666' }}>
                        내 정보 확인 및 대출/예약 서비스를 이용하려면 로그인 해주세요.
                    </p>
                    <button 
                        onClick={() => navigate('/LoginPage')} 
                        style={{ 
                            padding: '10px 20px', 
                            backgroundColor: '#0095ff', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '5px', 
                            cursor: 'pointer' 
                        }}
                    >
                        로그인 하러 가기
                    </button>
                </div>
            </div>
        );
    }
    
    // ** 로그인 된 상태일 경우 **
  return (
    <div>
      <div className="top-bar">
        <Link to="/" className="back-btn" aria-label="뒤로가기">←</Link>
        <span className="top-tittle">마이페이지</span>
      </div>

      <div className="user-info">
        <div className="name-row">
          <div style={{ fontSize: '19px', fontWeight: 'bold' }}>
            {user?.name} <span style={{ fontSize: '14px', fontWeight: 'normal' }}>{user?.type}</span>
          </div>
          <div className="settings-btn" onClick={() => navigate('/EditProfilePage')}>⚙️</div>
        </div>
        <div>아이디: {user?.username}</div>
        <div>전화번호: {user?.phone}</div>
      </div>
      
      <div className="nav-block">
        {/*
        <div className="nav-link" onClick={() => navigate('/Interest')}>
          관심 도서 <span>›</span>
        </div>
        */}
        <a
            href="https://forms.gle/bM5gdDtrqMD6v3kj9" 
            className="nav-link"
            target="_blank" 
            rel="noopener noreferrer"
        >
          희망도서신청 <span>›</span>
        </a>
        <div className="nav-link" onClick={() => navigate('/MyReviewsPage')}>
          내가 쓴 리뷰 <span>›</span>
        </div>
         <a
            href="http://pf.kakao.com/_pHxbDn"  
            className="nav-link"
            target="_blank" 
            rel="noopener noreferrer"
        >
          오류 문의 <span>›</span>
        </a>
        <div className="nav-link" onClick={() => navigate('/CurrentBorrow')}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            대출도서
            <span className="count-badge" style={{ marginLeft: 0 }}>
              {borrowCount}
            </span>
          </span>
          <span>›</span>
        </div>
        <div className="nav-link" onClick={() => navigate('/CurrentReserve')}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            예약도서
            <span className="count-badge" style={{ marginLeft: 0 }}>
              {reserveCount}
            </span>
          </span>
          <span>›</span>
        </div>
        <div className="nav-link" onClick={() => navigate('/CurrentOverrdue')}>
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            연체도서
            <span className="count-badge" style={{ marginLeft: 0 }}>
              {overdueCount}
            </span>
          </span>
          <span>›</span>
        </div>
      </div>
      <hr />
    </div>
  );
}

export default MyPage;