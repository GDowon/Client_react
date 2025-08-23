import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import '../Css/Curation.css';

import Footer from '../Components/Footer';

// 데이터를 컴포넌트 밖이나 별도의 파일로 분리
const CURATION_DATA = {
  guide: {
    basic: {
      title: "문헌정보학원론 수강자",
      books: [
        { id: 1, title: "Foundations of Library and Information Science", author: "by Rechard E. Rubin", img: "/Images/basic_1.jpg", className: "" },
        { id: 2, title: "文獻情報學原論", author: "정필모 지음", img: "/Images/basic_2.jpg", className: "hanja" },
        { id: 3, title: "책 제목", author: "작가ㅣ출판사", img: "/Images/basic_3.jpg", className: "" },
      ],
    },
    required: { title: "전공필수", books: [] }, // 필요에 따라 도서 데이터 추가
    major: { title: "전공", books: [] },
    liberal: { title: "교양", books: [] },
    related: { title: "타전공", books: [] },
  },
  notice: {
    title: "추천도서 주제",
    books: [
      { id: 1, title: "추천도서 1", author: "작가ㅣ출판사", img: "/Images/파일 이름.jpg", className: "" },
      { id: 2, title: "추천도서 2", author: "작가ㅣ출판사", img: "/Images/파일 이름.jpg", className: "hanja" },
      { id: 3, title: "추천도서 3", author: "작가ㅣ출판사", img: "/Images/파일 이름.jpg", className: "" },
    ],
  },
};

function CurationPage() {
  const navigate = useNavigate();

  // 1. 현재 선택된 탭을 상태(State)로 관리
  const [activeTab, setActiveTab] = useState('guide');
  const [activeSubTab, setActiveSubTab] = useState('basic');

  // 2. 탭 클릭 이벤트 핸들러
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // '강의 교재/자료' 탭을 누르면 항상 '전공기초'를 기본으로 보여줌
    if (tab === 'guide') {
      setActiveSubTab('basic');
    }
  };

  // 3. 렌더링할 콘텐츠 결정
  const renderContent = () => {
    if (activeTab === 'notice') {
      const noticeData = CURATION_DATA.notice;
      return (
        <div>
          <h2>{noticeData.title}</h2>
          <div className="book-list">
            {noticeData.books.map(book => (
              <div className="book-item" key={book.id}>
                <img src={book.img} alt={`${book.title} 표지`} width="110" height="160" />
                <div className="book-info">
                  <p className={`book-title ${book.className}`}>{book.title}</p>
                  <p className="book-author">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'guide' && CURATION_DATA.guide[activeSubTab]) {
      const guideData = CURATION_DATA.guide[activeSubTab];
      if (guideData.books.length === 0) {
        return <p>{guideData.title} 도서 목록이 비어있습니다.</p>;
      }
      return (
        <div>
          <h2>{guideData.title}</h2>
          <div className="book-list">
            {guideData.books.map(book => (
              <div className="book-item" key={book.id}>
                <img src={book.img} alt={`${book.title} 표지`} width="110" height="160" />
                <div className="book-info">
                  <p className={`book-title ${book.className}`}>{book.title}</p>
                  <p className="book-author">{book.author}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null; // 해당하는 탭이 없을 경우
  };
  
  return (
    <div>
      <div className="top-bar">
        <div className="back-btn" onClick={() => navigate(-1)}>←</div>
        <h1>북큐레이션</h1>
      </div>

      <div className="guide-buttons">
        <button 
          className={activeTab === 'guide' ? 'active' : ''} 
          onClick={() => handleTabClick('guide')}
        >
          강의 교재/자료
        </button>
        <button 
          className={activeTab === 'notice' ? 'active' : ''} 
          onClick={() => handleTabClick('notice')}
        >
          추천도서
        </button>
      </div>

      {/* 조건부 렌더링: activeTab이 'guide'일 때만 서브 버튼들을 보여줌 */}
      {activeTab === 'guide' && (
        <div className="sub-buttons">
          <button className={activeSubTab === 'basic' ? 'active' : ''} onClick={() => setActiveSubTab('basic')}>전공기초</button>
          <button className={activeSubTab === 'required' ? 'active' : ''} onClick={() => setActiveSubTab('required')}>전공필수</button>
          <button className={activeSubTab === 'major' ? 'active' : ''} onClick={() => setActiveSubTab('major')}>전공</button>
          <button className={activeSubTab === 'liberal' ? 'active' : ''} onClick={() => setActiveSubTab('liberal')}>교양</button>
          <button className={activeSubTab === 'related' ? 'active' : ''} onClick={() => setActiveSubTab('related')}>타전공</button>
        </div>
      )}

      <div className="tab-content">
        {renderContent()}
      </div>

      <Footer/>
    </div>
  );
}

export default CurationPage;