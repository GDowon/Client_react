import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import '../../Css/loginstyle.css';
import logoImage from '../../Images/navigation2.png';

function Signup() {
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

  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSignup = async (event) => {
    event.preventDefault();

    const { name, role, id, password, passwordConfirm, phone, agreePrivacy } = formData;

    // 클라이언트 측 유효성 검사
    if (!name || !role || !id || !password || !phone) {
      alert("모든 필수 정보를 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!agreePrivacy) {
      alert("개인정보 수집 및 이용에 동의하셔야 회원가입이 가능합니다.");
      return;
    }

    const apiUrl = 'https://mungo.p-e.kr/users/signup/';
    console.log('회원가입 API URL:', apiUrl);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          user_type: role, 
          username: id,    
          password: password,
          phone: phone,
        }),
      });

      if (response.ok) { // HTTP 상태 코드가 200번대(성공)이면
        const data = await response.json();
        
        if (data.message === 'User created successfully' || Object.keys(data).length > 0) { // 예: 메시지 필드 또는 응답이 비어있지 않음
            console.log("회원가입 성공:", data);
            alert("회원가입이 완료되었습니다!");
            navigate("/LoginPage"); // 성공 시 로그인 페이지 이동
        } else {
            // 200번대 응답이지만, 우리가 예상한 성공 형태가 아닌 경우
            alert(data.message || "회원가입에 성공했으나 예상치 못한 응답입니다.");
            console.error('회원가입 성공 응답이지만 예상치 못한 데이터:', data);
        }

      } else { // HTTP 상태 코드가 200번대가 아니면 (예: 400 Bad Request, 409 Conflict 등)
        const errorData = await response.json(); // 서버 에러 응답 파싱
        // 서버에서 보내주는 오류 메시지를 우선적으로 보여줍니다.
        const errorMessage = errorData.message || (errorData.user_type && errorData.user_type[0]) || "회원가입 실패: 입력값을 확인해주세요.";
        alert(errorMessage);
        console.error('회원가입 요청 실패:', response.status, response.statusText, errorData);
      }

    } catch (error) { // 최상위 try 블록에서 발생한 오류 (네트워크 문제, JSON 파싱 오류 등) 처리
      console.error("API 통신 중 오류 발생:", error);
      alert("서버와 연결할 수 없습니다. 인터넷 연결을 확인해주세요.");
    }
  };

  return (
    <div className="login-container">
      <div className="blue-top-bar">
        <Link to="/LoginPage" className="back-btn" aria-label="뒤로가기">
        ←
        </Link>
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
            <option value="재학생">재학생</option> 
            <option value="재적생">재적생</option>
            <option value="타과생">타과생</option>
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
        <Link to="/LoginPage">로그인 하기</Link>
      </p>
    </div>
  );
}

export default Signup;