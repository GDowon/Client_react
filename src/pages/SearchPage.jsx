// src/Pages/SearchPage.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "../Css/SearchPage.css";

import Footer from "../Components/Footer";
import SearchBar from "../Components/SearchBar";

import red_hearts from "../Images/red_hearts.png";
import blank_hearts from "../Images/blank_hearts.png";

/** =========================================================
 *  이 파일 안에서 바로 API 연동 (axios 없이 fetch 사용)
 *  - CRA 개발환경: package.json 의 "proxy": "https://mungo.p-e.kr"
 *  - 상대 경로로 호출: /books/, /likes/toggle/ 등
 *  - 401 시 한 번 refresh -> 재시도
 * ========================================================= */
const authHeaders = () => {
  const a = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(a ? { Authorization: `Bearer ${a}` } : {}),
  };
};

// 401이면 refresh 시도 후 한 번만 재시도
async function withRefreshRetry(requestFn) {
  let res = await requestFn();
  if (res.status !== 401) return res;

  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) return res;

  const r = await fetch("/users/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!r.ok) return res;

  const { access } = await r.json().catch(() => ({}));
  if (access) localStorage.setItem("access_token", access);

  return requestFn();
}

// 검색 (A안: /books/?query=, 404/405면 B안: /search/?q=)
async function searchBooksAPI(query, page = 1) {
  const callA = () =>
    fetch(`/books/?search=${encodeURIComponent(query)}&page=${page}`, {
      headers: authHeaders(),
    });

  let res = await withRefreshRetry(callA);
  if (!res.ok && (res.status === 404 || res.status === 405)) {
    const callB = () =>
      fetch(`/search/?q=${encodeURIComponent(query)}&page=${page}`, {
        headers: authHeaders(),
      });
    res = await withRefreshRetry(callB);
  }
  if (!res.ok) throw new Error(`검색 실패: ${res.status}`);

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results ?? [];

  // 응답 표준화
  return list.map((b) => ({
    id: b.id ?? b.book_id ?? b.pk,
    title: b.title ?? "",
    author: b.author ?? "",
    publisher: b.publisher ?? "",
    code: b.code ?? b.call_number ?? "",
    cover: b.cover ?? b.image_url ?? "",
    liked: !!(b.liked ?? b.is_liked),
    status: b.status ?? "available",
    popularity: b.popularity ?? 0,
    location: b.location ?? "",
  }));
}

// 좋아요 토글 (A안: POST /books/:id/like/, 실패 시 B안: POST /likes/toggle/)
async function toggleLikeAPI(bookId, like) {
  const callA = () =>
    fetch(`/books/${bookId}/like/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ like }),
    });

  let res = await withRefreshRetry(callA);
  if (!res.ok && (res.status === 404 || res.status === 405)) {
    const callB = () =>
      fetch(`/likes/toggle/`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ book_id: bookId, like }),
      });
    res = await withRefreshRetry(callB);
  }
  if (!res.ok) throw new Error(`좋아요 실패: ${res.status}`);
  return res.json().catch(() => ({}));
}

/** =========================
 *        컴포넌트
 * ========================= */
export default function SearchPage() {
  const [books, setBooks] = useState([]);
  const [queryParams] = useSearchParams();
  const q = queryParams.get("query") || "";
  const [sortOpen, setSortOpen] = useState(false);
  const [sortMode, setSortMode] = useState("오름차순"); // "오름차순" | "내림차순"
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

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

  // 서버 검색
  useEffect(() => {
    let alive = true;
    if (!q) {
      setBooks([]);
      return;
    }
    /*백엔드api로요청*/
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const list = await searchBooksAPI(q);
        if (alive) setBooks(list);
      } catch (e) {
        if (alive) setErr(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [q]);

  // 정렬
  const sorted = useMemo(() => {
    const list = [...books];
    if (sortMode === "오름차순") {
      list.sort((a, b) => (a.title || "").localeCompare(b.title || "", "ko"));
    } else {
      list.sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
    }
    return list;
  }, [books, sortMode]);

  // 좋아요 토글(낙관적 업데이트 + 실패 시 롤백)
  const onToggleHeart = async (id) => {
    setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, liked: !b.liked } : b)));
    try {
      const cur = books.find((b) => b.id === id);
      await toggleLikeAPI(id, !cur?.liked);
    } catch (e) {
      // 롤백
      setBooks((prev) => prev.map((b) => (b.id === id ? { ...b, liked: !b.liked } : b)));
      console.error("좋아요 실패:", e);
    }
  };

  return (
    <div>
      {/* 상단바 */}
      <div className="top-bar">
        <a href="/" className="back-btn" aria-label="뒤로가기">
          ←
        </a>
        <span className="top-tittle top-title">검색 결과</span>
      </div>

      {/* 검색창 (그대로 사용) */}
      <SearchBar />

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

      {/* 상태 표시 */}
      {loading && <div style={{ padding: "12px 15px" }}>검색 중…</div>}
      {err && (
        <div style={{ padding: "12px 15px", color: "#c00" }}>
          오류: {String(err.message || err)}
        </div>
      )}

      {/* 2. 검색 결과가 없을 때 메시지 표시 */}
      {!loading && !err && sorted.length === 0 && q && (
        <div style={{ padding: "12px 15px", textAlign: "center", color: "#555" }}>
          검색 결과가 없습니다.
        </div>
      )}

      {/* 도서 목록 */}
      {!loading && !err && (
        <section className="book-list" id="book-list">
          {sorted.map((b) => (
            // 기존 div를 Link 컴포넌트로 변경
            <Link to={`/BookPage/${b.id || b.book_code}`} className="book-card" key={b.id}>
              {/* 표지 + 하트 (하트는 표지 내부 고정) */}
              <div className="book-cover">
                <img className="cover-img" src={b.cover} alt={`${b.title} 책 표지`} />
                <div
                  className="heart-icon-wrapper"
                  onClick={(e) => {
                    e.stopPropagation(); // Link 이동 방지
                    onToggleHeart(b.id);
                  }}
                  role="button"
                  aria-label={b.liked ? "좋아요 취소" : "좋아요"}
                  title={b.liked ? "좋아요 취소" : "좋아요"}
                >
                  <img
                    className="heart-icon"
                    src={b.liked ? red_hearts : blank_hearts}
                    alt=""
                  />
                </div>
              </div>
              {/* 책 정보 */}
              <div className="book-info">
                <h2 className="book-title">{b.title}</h2>
                <h3 className="author">{b.author}</h3>
                <h3 className="publisher">{b.publisher}</h3>
                <p className="code">{b.code}</p>
                {b.location ? <p className="location">{b.location}</p> : null}
              </div>
              {/* 우측 버튼 (상세/대출신청 등) */}
              <button
                className={`loan-btn ${b.status}`}
                type="button"
                // Link 컴포넌트 내부에서 클릭 시 Link가 적용되지 않도록 이벤트 전파를 중단
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/LoanLoan?bookId=${b.id}`); }}
                disabled={b.status === "unavailable"}
              >
                {b.status === "available"
                  ? "대출신청"
                  : b.status === "reserved"
                  ? "예약중"
                  : "불가"}
              </button>
            </Link>
          ))}
        </section>
      )}

      <Footer />
    </div>
  );
}