import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 페이지 이동을 위해 Link를 사용합니다.

// CSS와 이미지를 직접 import 합니다.
import '../../Css/font.css';
import '../../Css/loginstyle.css';
import logoImage from '../../Images/navigation2.png';

function FindId() {
  // 입력 필드의 값을 관리하기 위한 state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  // '아이디 찾기' 버튼 클릭 시 실행될 함수
  const handleFindId = (event) => {
    // form 태그의 기본 동작(페이지 새로고침)을 방지합니다.
    event.preventDefault();

    // state에 저장된 값을 직접 사용해 유효성을 검사합니다.
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!phone.trim()) {
      alert("전화번호를 입력해주세요.");
      return;
    }

    // 실제 아이디 찾기 로직 처리 후 결과 표시 (현재는 가상으로 처리)
    alert(`[${name}]님의 아이디는 ○○○ 입니다.`);
    // 예: navigate('/find-id-result');
  };

  return (
    <div className="login-container">
      <img src={logoImage} alt="로고" className="logo" />
      <h2>아이디 찾기</h2>
      <form onSubmit={handleFindId}>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="이름"
          required
        />
        <div id="phoneInput" className="contact-input">
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="전화번호"
          />
        </div>
        <button type="submit">아이디 찾기</button>
      </form>
      <p>
       <Link to="/LoginPage">로그인으로 돌아가기</Link>
      </p>
    </div>
  );
}

export default FindId;