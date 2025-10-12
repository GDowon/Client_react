import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../Css/toolkit.css'; 

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    // 1. 검색어 없이 검색 버튼을 눌렀을 때 알림 띄우기
    if (!searchTerm.trim()) {
      alert('검색어를 입력해 주세요');
      return; // 함수 실행을 여기서 중단
    }

    // 검색어가 있으면 쿼리 파라미터와 함께 SearchPage로 이동합니다.
    navigate(`/search?query=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleKeyPress = (e) => {
    // 엔터 키를 눌렀을 때 검색 함수를 호출합니다.
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
      />
      <button onClick={handleSearch}>검색</button>
    </div>
  );
}

export default SearchBar;