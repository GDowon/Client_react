import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import '../../Css/MyPage.css'; 

// 가상의 현재 사용자 데이터 (원래는 API를 통해 받아옵니다)
const CURRENT_USER_DATA = {
  phone: "010-1234-5678",
  email: "example@domain.com",
};

function EditProfilePage() {
  // 1. 폼 입력을 관리하기 위한 state
  const [formData, setFormData] = useState({
    password: '', // 비밀번호는 보안상 비워둡니다.
    phone: '',
    email: ''
  });

  const navigate = useNavigate();

  // 2. 컴포넌트가 처음 렌더링될 때 기존 사용자 정보를 불러옵니다.
  useEffect(() => {
    // API 호출을 시뮬레이션합니다.
    setFormData(prevData => ({
      ...prevData, // 이전 password 상태 유지
      phone: CURRENT_USER_DATA.phone,
      email: CURRENT_USER_DATA.email,
    }));
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시 한 번만 실행

  // 3. 입력 값이 변경될 때마다 state를 업데이트하는 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // 4. 폼 제출 시 실행될 이벤트 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("저장할 정보:", formData);
    alert('성공적으로 저장되었습니다!');
    navigate('/mypage'); // 저장 후 마이페이지로 이동
  };

  return (
    <div>
      <div className="top-bar">
        <Link to="/mypage" className="back-btn" aria-label="뒤로가기">←</Link>
        <span className="top-tittle">회원정보수정</span>
      </div>

      <form onSubmit={handleSubmit}>
        <label htmlFor="password">비밀번호</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="새 비밀번호 입력"
          value={formData.password}
          onChange={handleChange}
        />

        <label htmlFor="phone">전화번호</label>
        <input
          type="text"
          id="phone"
          name="phone"
          placeholder="010-1234-5678"
          value={formData.phone}
          onChange={handleChange}
        />

        <label htmlFor="email">이메일</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="example@domain.com"
          value={formData.email}
          onChange={handleChange}
        />

        <button type="submit">저장하기</button>
      </form>
    </div>
  );
}

export default EditProfilePage;