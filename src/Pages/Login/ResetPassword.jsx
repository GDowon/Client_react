import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import '../../Css/loginstyle.css';
import logoImage from '../../Images/navigation2.png';

function ResetPassword() {
  // 폼 입력 값을 관리하기 위한 state
  const [name, setName] = useState('');
  const [userId, setUserId] = useState('');
  const [contactMethod] = useState('phone'); // 'phone' 또는 'email'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // 비밀번호 찾기 form 제출 시 실행될 함수
  const handleFindPassword = (event) => {
    event.preventDefault(); // form의 기본 새로고침 동작 방지

    // state 값으로 유효성 검사 수행
    if (!name || !userId) {
      alert("이름과 아이디를 입력해주세요.");
      return;
    }
    if (contactMethod === "phone" && !phone) {
      alert("전화번호를 입력해주세요.");
      return;
    }
    if (contactMethod === "email" && !email) {
      alert("이메일을 입력해주세요.");
      return;
    }

    alert("비밀번호 변경 절차를 시작합니다.");
    // 여기에 실제 서버와 통신하는 로직을 추가합니다.
  };

  return (
    <div className="login-container">
      <img src={logoImage} alt="로고" className="logo" />
      <h2>비밀번호 찾기</h2>
      <form onSubmit={handleFindPassword}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          required
        />
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="아이디"
          required
        />

      

        {/* 조건부 렌더링: 선택된 방법에 따라 다른 입력창을 보여줌 */}
        {contactMethod === 'phone' ? (
          <div className="contact-input">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="전화번호"
            />
          </div>
        ) : (
          <div className="contact-input">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일"
            />
          </div>
        )}

        <button type="submit">비밀번호 찾기 및 변경</button>
      </form>
      <p>
        <Link to="/LoginPage">로그인으로 돌아가기</Link>
      </p>
    </div>
  );
}

export default ResetPassword;