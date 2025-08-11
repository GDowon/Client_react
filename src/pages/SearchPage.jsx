import React, { useMemo, useRef, useState, useEffect } from "react";


const INITIAL_BOOKS = [
  {
    id: 1,
    title: "문헌정보학의 이해",
    author: "한국문헌정보학회",
    publisher: "한국도서관회",
    code: "020",
    cover: "/Images/book1.jpg",
    popularity: 60,
    liked: false,
    status: "available", // available | reserved | unavailable
    href: "/Pages/searchresult.html",
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
    href: "/Pages/searchresult.html",
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
    href: "/Pages/searchresult.html",
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
    href: "/Pages/searchresult.html",
  },
];

export default function SearchResult() {
  const [books, setBooks] = useState(INITIAL_BOOKS);
  const [query, setQuery] = useState("");
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState("자모순"); // '자모순' | '인기도순'
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);

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
    if (sortMode === "자모순") {
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

  const clearSearch = () => {
    setQuery("");
    searchRef.current?.focus();
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div>
      {/* 상단바 (원래 마크업 유지) */}
      <div className="top-bar">
        <a href="/Pages/MainPage.html" className="back-btn" aria-label="뒤로가기">
          ←
        </a>
        {/* 오타 호환: top-tittle + 수정본 top-title 둘 다 부여 */}
        <span className="top-tittle top-title">검색 결과</span>
      </div>

      {/* 검색창 */}
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
          </button>
        </div>
      </header>

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
            {["자모순", "인기도순"].map((opt) => (
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
          <div className="book-card" key={b.id} data-popularity={b.popularity}>
            <div className="book-cover">
              <img className="cover-img" src={b.cover} alt={`${b.title} 책 표지`} />
              <div
                className="heart-icon-wrapper"
                onClick={() => toggleHeart(b.id)}
                role="button"
                aria-label={b.liked ? "좋아요 취소" : "좋아요"}
                title={b.liked ? "좋아요 취소" : "좋아요"}
              >
                <img
                  className="heart-icon"
                  src={b.liked ? "/Images/red_hearts.png" : "/Images/blank_hearts.png"}
                  alt="좋아요 아이콘"
                />
              </div>
            </div>

            <div className="book-info">
              {/* 라우터 쓰면 <Link to={b.href}>로 교체 */}
              <a className="book-title" href={b.href}>
                {b.title}
              </a>
              <p className="author">{b.author}</p>
              <p className="publisher">{b.publisher}</p>
              <p className="code">{b.code}</p>
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

      {/* 하단 내비 */}
      <footer className="bottom-nav">
        <a className="nav-item" href="/Pages/loan.html">
          <img src="/Images/navigation1.png" alt="대출반납 아이콘" />
          <span>대출·반납</span>
        </a>

        <div className="nav-center">
          <a href="/Pages/MainPage.html">
            <img src="/Images/navigation2.png" alt="문중문고 아이콘" className="nav-center-icon" />
          </a>
        </div>

        <a className="nav-item" href="/Pages/MyPage.Pgs/mypage.html">
          <img src="/Images/navigation3.png" alt="마이페이지 아이콘" />
          <span>마이페이지</span>
        </a>
      </footer>

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

