import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import '../../Css/loginstyle.css';
import logoImage from '../../Images/navigation2.png';

function LoginPage() {
  // input 값을 관리하기 위한 state
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  // 페이지 이동을 위한 navigate 함수
  const navigate = useNavigate();

  // 로그인 form 제출 시 실행될 함수
  const handleLogin = (e) => {
    e.preventDefault(); // form의 기본 새로고침 동작을 막습니다.

    // state에 저장된 id와 password 값을 사용합니다.
    if (loginId === "testuser" && password === "1234") {
      navigate('/home'); // 로그인 성공 시 '/home' 경로로 이동
    } else {
      alert("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div calssName="page-center">
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
          <Link to="/FindId">아이디 찾기</Link> | <Link to="/ResetPassword">비밀번호 찾기</Link>
        </p>
        <p>
          아직 계정이 없으신가요? <Link to="/SignUp">회원가입</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;