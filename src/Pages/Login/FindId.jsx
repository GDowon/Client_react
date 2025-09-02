import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // 페이지 이동을 위해 Link를 사용합니다.

import '../../Css/font.css';
import '../../Css/loginstyle.css';
import logoImage from '../../Images/navigation2.png';

function FindId() {
  // 입력 필드의 값을 관리하기 위한 state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  // 찾은 아이디를 저장하고 보여줄 상태
  const [foundId, setFoundId] = useState(''); 

  // '아이디 찾기' 버튼 클릭 시 실행될 함수
  const handleFindId = async (event) => { // ADD: async 키워드 추가
    // form 태그의 기본 동작(페이지 새로고침)을 방지합니다.
    event.preventDefault();

    // state에 저장된 값을 직접 사용해 유효성을 검사합니다.
    if (!name.trim()) {
      alert("이름을 입력해주세요.");
      return;
    }

    if (!phone.trim()) {
      alert("전화번호를 입력해주세요."); // 필요하다면 전화번호 형식에 대한 더 자세한 유효성 검사 추가
      return;
    }

    const apiUrl = 'https://mungo.p-e.kr/users/find-username/';
    console.log('아이디 찾기 API URL:', apiUrl);

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // JSON 형식으로 데이터를 보낸다고 알림
        },
        body: JSON.stringify({ // name과 phone 값을 JSON 형태로 서버에 전송
          name: name,
          phone: phone,
        }),
      });

      if (response.ok) { // HTTP 상태 코드가 200번대(성공)이면
        const data = await response.json();
        if (data.username) { // 서버가 찾은 아이디를 'username' 필드로 보내주는 경우
          setFoundId(data.username); // 찾은 아이디를 상태에 저장
          alert(`[${name}]님의 아이디는 '${data.username}' 입니다.`);
        } else if (data.id) { // 서버가 'id' 필드로 보내주는 경우
            setFoundId(data.id);
            alert(`[${name}]님의 아이디는 '${data.id}' 입니다.`);
        }
        else {
          // 서버에서 성공 응답을 보냈지만 예상치 못한 데이터 형태일 때
          alert(data.message || "아이디를 찾았으나 표시할 수 없습니다. 콘솔을 확인해주세요.");
          console.log('아이디 찾기 성공 (예상치 못한 응답):', data);
        }
      } else { // HTTP 상태 코드가 200번대가 아니면 (예: 400 Bad Request, 404 Not Found 등)
        const errorData = await response.json();
        // 서버에서 보내주는 오류 메시지가 있다면 그걸 보여주고, 없으면 기본 메시지 표시
        const errorMessage = errorData.detail || errorData.message || "일치하는 회원 정보가 없습니다. 이름과 전화번호를 다시 확인해주세요.";
        alert(errorMessage);
        console.error('아이디 찾기 요청 실패:', response.status, response.statusText, errorData);
      }
    } catch (error) { // 네트워크 오류 등 API 통신 자체에 문제 발생 시
      console.error('API 통신 중 오류 발생:', error);
      alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    }
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
            type="tel" // 전화번호 입력 시 tel 타입을 사용하는 것이 좋습니다.
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="전화번호 (숫자만 입력)" // placeholder 텍스트를 좀 더 명확하게 변경
          />
        </div>
        <button type="submit">아이디 찾기</button>
      </form>
      {/* 아이디를 찾았을 때만 보여주는 부분 */}
      {foundId && (
        <p className="found-id-display">
          찾으신 아이디는: <strong>{foundId}</strong> 입니다.
        </p>
      )}
      {/* 로그인 페이지로 돌아가는 Link 추가 (기존 로그인 페이지의 패턴) */}
      <p>
        <Link to="/LoginPage">로그인으로 돌아가기</Link>
      </p>
    </div>
  );
}

export default FindId;