import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import '../../Css/loginstyle.css';
import logoImage from '../../Images/navigation2.png';

function Signup() {
  // 모든 입력 필드를 각각의 state로 관리합니다.
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    id: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    agreePrivacy: false,
  });

  const navigate = useNavigate();

  // 입력 필드 값이 변경될 때마다 state를 업데이트하는 함수
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  // 회원가입 form 제출 시 실행될 함수
  const handleSignup = (event) => {
    event.preventDefault();

    // state 값들을 구조 분해 할당으로 가져옵니다.
    const { name, role, id, password, passwordConfirm, phone, agreePrivacy } = formData;

    // 유효성 검사
    if (!name || !role || !id || !password || !phone) {
      alert("모든 필수 정보를 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!agreePrivacy) {
      alert("개인정보 수집에 동의하셔야 합니다.");
      return;
    }

    // 모든 검사를 통과하면 회원가입 처리
    alert("회원가입이 완료되었습니다!");
    navigate('/LoginPage'); // 로그인 페이지로 이동
  };

  return (
    <div className="login-container">
      <div className="blue-top-bar">
          <a href="LoginPage" className="back-btn" aria-label="뒤로가기">
            ←
          </a>
        </div>
      <Link to="/">
          <img src={logoImage} alt="로고" className="logo" />
        </Link>
      <h2>회원가입</h2>
      <form onSubmit={handleSignup}>
        <input type="text" id="name" placeholder="이름" value={formData.name} onChange={handleChange} required />
        
        <div className="rolech">
            <select id="role" value={formData.role} onChange={handleChange} required>
            <option value="">회원구분 선택</option>
            <option value="user1">재학생</option>
            <option value="user2">재적생</option>
            <option value="user3">타과생</option>
            </select>
        </div>

        <input type="text" id="id" placeholder="아이디" value={formData.id} onChange={handleChange} required />
        <input type="password" id="password" placeholder="비밀번호" value={formData.password} onChange={handleChange} required />
        <input type="password" id="passwordConfirm" placeholder="비밀번호 확인" value={formData.passwordConfirm} onChange={handleChange} required />

        <div className="contact-input">
          <input type="tel" id="phone" placeholder="전화번호(숫자만입력)" value={formData.phone} onChange={handleChange} required />
        </div>

        <div className="agreement">
          <label>
            <input type="checkbox" id="agreePrivacy" checked={formData.agreePrivacy} onChange={handleChange} required /> 개인정보 수집에 동의합니다.
          </label>
        </div>

        <button type="submit">회원가입</button>
      </form>
      <p>
        <Link to="/LoginPage">로그인으로 돌아가기</Link>
      </p>
    </div>
  );
}

export default Signup;