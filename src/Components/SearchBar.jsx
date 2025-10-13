import { useState } from 'react';
import { useNavigate,useSearchParams } from 'react-router-dom';

import '../Css/toolkit.css'; 

 function SearchBar() {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const [searchTerm, setSearchTerm] = useState(initialQuery); 
  const navigate = useNavigate();

  const handleFormSubmit = (e) => {
    e.preventDefault(); // ⬅️ 폼 제출의 기본 동작(페이지 새로고침) 방지

    const trimmedQuery = searchTerm.trim();
    if (!trimmedQuery) {
      alert('검색어를 입력해 주세요');
      return; 
    }
    // 🌟 navigate로 라우터 이동
    navigate(`/search?query=${encodeURIComponent(trimmedQuery)}`);
  };

   return (
    // 🌟 div를 form으로 변경하고 onSubmit 핸들러 연결
    <form className="search-bar" onSubmit={handleFormSubmit}>
      <input
        type="text"
        placeholder="검색어를 입력하세요"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        // 🚨 onKeyPress 이벤트는 제거
      />
      {/* 🌟 button에 type="submit"을 명시해도 되고, 기본값이 submit이므로 생략 가능 */}
      <button type="submit">검색</button> 
    </form>
  );
}

export default SearchBar;