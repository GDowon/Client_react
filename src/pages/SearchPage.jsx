import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import '../Css/SearchPage.css';

import Footer from "../Components/Footer";
import SearchBar from "../Components/SearchBar";

import blank_hearts from '../Images/blank_hearts.png';
import red_hearts from '../Images/red_hearts.png';
import book1 from '../Images/book1.jpg';

const INITIAL_BOOKS = [
  {
    id: 1,
    title: "문헌정보학의 이해",
    author: "한국문헌정보학회",
    publisher: "한국도서관회",
    code: "020",
    location: "문헌정보학과 과방",
    cover: book1,
    popularity: 60,
    liked: false,
    status: "available", // available | reserved | unavailable
    href: "../BookPage",
  },
  {
    id: 2,
    title: "정보자료분류론",
    author: "윤희윤",
    publisher: "태일사",
    code: "025.42",
    cover: "/Images/book1.jpg",
    popularity: 75,
    liked: false,
    status: "available",
    href: "../BookPage",
  },
  {
    id: 3,
    title: "정보서비스론",
    author: "박준식",
    publisher: "계명대학교출판부",
    code: "025.52",
    cover: "/Images/book2.jpg",
    popularity: 40,
    liked: false,
    status: "reserved",
    href: "../BookPage",
  },
  {
    id: 4,
    title: "정보자원의 기술과 메타데이터",
    author: "남태우, 이승민",
    publisher: "한국도서관협회",
    code: "025.3",
    cover: "/Images/book4.jpg",
    popularity: 95,
    liked: true,
    status: "available",
    href: "../BookPage",
  },
];

export default function SearchResult() {
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [query, setQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState("오름차순");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    function onDocClick(e) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return books;
    const q = query.trim();
    return books.filter(
      (b) =>
        b.title.includes(q) ||
        b.author.includes(q) ||
        b.publisher.includes(q) ||
        b.code.includes(q)
    );
  }, [books, query]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    if (sortMode === "오름차순") {
      list.sort((a, b) => a.title.localeCompare(b.title, "ko"));
    } else {
      list.sort((a, b) => b.popularity - a.popularity);
    }
    return list;
  }, [filtered, sortMode]);

  const toggleHeart = (id) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, liked: !b.liked } : b))
    );
  };

  const requestLoan = (id) => {
    const book = books.find((b) => b.id === id);
    if (!book) return;

    if (book.status === "available") {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status: "reserved" } : b
        )
      );
      setModalMsg("예약이 등록되었습니다.");
      setModalOpen(true);
    } else {
      setModalMsg("대출/예약이 불가능한 도서입니다.");
      setModalOpen(true);
    }
  };

  /*
  const clearSearch = () => {
    setQuery("");
    searchRef.current?.focus();
  };
  */

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div>
      <div className="top-bar">
        <a href="/" className="back-btn" aria-label="뒤로가기">
          ←
        </a>
        {/* 오타 호환: top-tittle + 수정본 top-title 둘 다 부여 */}
        <span className="top-tittle top-title">검색 결과</span>
      </div>

      <SearchBar/>
        {
          /*
          <header className="search-header">
            <div className="search-box">
              <input
                id="search-input"
                ref={searchRef}
                type="text"
                placeholder="도서 검색..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                id="clear-btn"
                className="clear-btn"
                type="button"
                onClick={clearSearch}
                aria-label="검색어 지우기"
              >
                ✕
              </button>*/
        }

      {/* 정렬 영역 */}
      <section className="sort-section">
        <span>검색 결과 {sorted.length}개</span>

        <div className="sort-dropdown" ref={dropdownRef}>
          <button
            id="sort-toggle"
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={sortOpen}
          >
            {sortMode} ▼
          </button>

          <ul
            id="sort-options"
            className={sortOpen ? "" : "hidden"}
            role="listbox"
            aria-label="정렬 옵션"
          >
            {["오름차순", "내림차순"].map((opt) => (
              <li
                key={opt}
                role="option"
                aria-selected={sortMode === opt}
                onClick={() => {
                  setSortMode(opt);
                  setSortOpen(false);
                }}
              >
                {opt}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 도서 목록 */}
        <section className="book-list" id="book-list">
        {sorted.map((b) => (
          <div className="book-card" key={b.id}>
            
            {/* 1. 클릭 가능한 새로운 컨테이너 */}
            <div
              className="book-clickable-area"
              onClick={() => navigate(b.href)} // 클릭 시 상세 페이지로 이동
              role="link"
              tabIndex="0"
              aria-label={`${b.title} 상세 정보 보기`}
            >
              <div className="book-cover">
                <img className="cover-img" src={b.cover} alt={`${b.title} 책 표지`} />
              </div>
              <div className="book-info">
                <h2 className="book-title">{b.title}</h2>
                <h3 className="author">{b.author}</h3>
                <h3 className="publisher">{b.publisher}</h3>
                <p className="code">{b.code}</p>
                <p className="location">{b.location}</p>
              </div>
            </div>

            {/* 2. 상호작용 요소들은 클릭 컨테이너 밖으로 분리 */}
            <div
              className="heart-icon-wrapper"
              onClick={() => toggleHeart(b.id)}
              role="button"
              aria-label={b.liked ? "좋아요 취소" : "좋아요"}
              title={b.liked ? "좋아요 취소" : "좋아요"}
            >
              <img
                className="heart-icon"
                src={b.liked ? red_hearts : blank_hearts}
                alt="좋아요 아이콘"
              />
            </div>

            <button
              className={`loan-btn ${b.status}`}
              type="button"
              onClick={() => requestLoan(b.id)}
              disabled={b.status === "unavailable"}
            >
              {b.status === "available" ? "대출신청" : b.status === "reserved" ? "예약중" : "불가"}
            </button>
            
          </div>
        ))}
      </section>

      <Footer/>

      {/* 모달 */}
      {modalOpen && (
        <div id="loan-modal">
          <div className="modal-content" role="dialog" aria-modal="true" aria-labelledby="loan-modal-title">
            <h3 id="loan-modal-title">알림</h3>
            <p>{modalMsg}</p>
            <button id="modal-close-btn" onClick={closeModal}>확인</button>
          </div>
        </div>
      )}
    </div>
  );
}

