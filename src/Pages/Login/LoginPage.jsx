import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../Css/loginstyle.css';
import logoImage from '../../Images/navigation2.png';


const BASE_URL = 'https://mungo.p-e.kr';

const getAuthHeaders = (token) => {
    return {
        'Content-Type': 'application/json',
        // 토큰이 있을 경우에만 Authorization 헤더 포함
        ...(token ? { Authorization: `Bearer ${token}` } : {}), 
    };
};

// 범용 fetch 함수 (인증 토큰을 사용하여 API 호출)
const fetchApi = async (path, token) => {
    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            headers: getAuthHeaders(token),
        });

        if (response.ok) {
            return await response.json();
        }
        // 오류 응답일 경우 null 반환 (fetchAndSaveCounts에서 처리)
        return null; 
    } catch (error) {
        console.error(`[API 통신 오류] ${path}:`, error);
        return null;
    }
};

// 🌟🌟🌟 카운트 정보를 가져와 저장하는 핵심 함수 🌟🌟🌟
const fetchAndSaveCounts = async (token) => {
    if (!token) return;

    // 1. 대출 및 연체 목록 가져오기
    const rentals = await fetchApi('/rentals/current/', token);
    
    if (rentals && Array.isArray(rentals)) {
        const nonOverdueCount = rentals.filter(item => !item.is_overdue).length;
        const overdueCount = rentals.filter(item => item.is_overdue).length;

        localStorage.setItem('borrowCount', nonOverdueCount.toString());
        localStorage.setItem('overdueCount', overdueCount.toString());
    } else {
        localStorage.setItem('borrowCount', '0');
        localStorage.setItem('overdueCount', '0');
    }

    // 2. 예약 목록 가져오기
    const reservations = await fetchApi('/reservations/', token);
    
    if (reservations && Array.isArray(reservations)) {
        const activeReserveCount = reservations.filter(item => item.status === 'ACTIVE').length;
        
        localStorage.setItem('reserveCount', activeReserveCount.toString());
    } else {
        localStorage.setItem('reserveCount', '0');
    }
    
    console.log('✅ 대출/연체/예약 카운트가 localStorage에 저장되었습니다.');
};

function LoginPage() {

  const [loginId, setLoginId] = useState('');

  const [password, setPassword] = useState('');



  const navigate = useNavigate();



  const handleLogin = async (e) => {

    e.preventDefault();



    const apiUrl = 'https://mungo.p-e.kr/users/login/';

    console.log('로그인 API URL:', apiUrl);



    try {

      const response = await fetch(apiUrl, {

        method: 'POST',

        headers: {

          'Content-Type': 'application/json',

        },

        body: JSON.stringify({

          username: loginId,

          password: password,

        }),

      });



      if (response.ok) { // HTTP 상태 코드가 200번대(성공)이면

        const data = await response.json();

        const loggedInUsername = data.name || loginId;
        const accessToken = data.access; 



        if (data.access && data.refresh) {

          console.log('로그인 성공:', data);

          alert("성공적으로 로그인 되었습니다.");

         localStorage.setItem('accessToken', accessToken); 
         localStorage.setItem('refreshToken', data.refresh); 
         localStorage.setItem('userID', loggedInUsername); 
         console.log('토큰 및 사용자 이름이 localStorage에 저장되었습니다.'); 
            

          navigate('/'); // 🌟 순서 5: 카운트 저장 완료 후 메인 페이지로 이동 🌟



        } else {

          // 200번대 응답이지만 access/refresh 토큰이 없거나 예상치 못한 응답인 경우

          alert(data.message || "로그인 처리 중 예기치 않은 응답이 발생했습니다.");

          console.error('로그인 실패 - 예상치 못한 응답:', data);

        }

      } else { // HTTP 상태 코드가 200번대가 아니면

        const errorData = await response.json();

        const errorMessage = errorData.detail || errorData.message || "아이디 또는 비밀번호가 올바르지 않습니다.";

        alert(errorMessage);

        console.error('로그인 요청 실패:', response.status, response.statusText, errorData);

      }



    } catch (error) { // 네트워크 오류 등 API 통신 자체에 문제 발생 시

      console.error('API 통신 중 오류 발생:', error);

      alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");

    }

  };


  return (
    <div className="page-center">
      <div className="login-container">
        <div className="blue-top-bar">
          <a href="/" className="back-btn" aria-label="뒤로가기">
            ←
          </a>
        </div>
        <Link to="/">
          <img src={logoImage} alt="로고" className="logo" />
        </Link>
        <div className="login-h2">로그인</div>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder="아이디"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            required
          />
          <button type="submit">로그인</button>
        </form>
        <div className='login-p'>
          <Link to="/FindId">아이디 찾기</Link> | <a href="http://pf.kakao.com/_pHxbDn" target="_blank" rel="noopener noreferrer">비밀번호 문의</a>
        </div>
        <p>
          아직 계정이 없으신가요? <Link to="/SignUp">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;