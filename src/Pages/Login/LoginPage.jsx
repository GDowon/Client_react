import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import '../../Css/loginstyle.css';
import logoImage from '../../Images/navigation2.png';

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

        if (data.access && data.refresh) {
          console.log('로그인 성공:', data);
          alert("성공적으로 로그인 되었습니다.");
          
          localStorage.setItem('accessToken', data.access);
          localStorage.setItem('refreshToken', data.refresh);
          console.log('토큰이 localStorage에 저장되었습니다.');

          navigate('/'); // 로그인 성공 시 기본 URL (홈페이지)로 이동

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
        <h2>로그인</h2>
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
        <p>
          <Link to="/FindId">아이디 찾기</Link> | <a href="http://pf.kakao.com/_pHxbDn" target="_blank" rel="noopener noreferrer">비밀번호 찾기</a>
        </p>
        <p>
          아직 계정이 없으신가요? <Link to="/SignUp">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;