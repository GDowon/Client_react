// src/Pages/SearchPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import "../Css/SearchPage.css";

import Footer from "../Components/Footer";
import SearchBar from "../Components/SearchBar";
import { submitLoanRequest } from '../Api/loan'; 
import SuccessModal from '../Components/SuccessModal';
import LoginRequiredModal from '../Components/LoginModal';
import ConfirmModalLoan from '../Components/ConfirmModalLoan';


import red_hearts from "../Images/red_hearts.png";
import blank_hearts from "../Images/blank_hearts.png";
import printnull from '../Images/printnull.png'; 

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const authHeaders = () => {
  const a = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(a ? { Authorization: `Bearer ${a}` } : {}),
  };
};

const isLoggedIn = () => {
    return !!localStorage.getItem("accessToken");
};

// 401이면 refresh 시도 후 한 번만 재시도
async function withRefreshRetry(requestFn) {
  let res = await requestFn();
  if (res.status !== 401) return res;

  const refresh = localStorage.getItem("refreshToken");
  if (!refresh) return res;

  const r = await fetch(`${API_BASE_URL}/users/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!r.ok) return res;

  const { access } = await r.json().catch(() => ({}));
  if (access) localStorage.setItem("accessToken", access);

  return requestFn();
}

// 검색 (A안: /books/?query=, 404/405면 B안: /search/?q=)
async function searchBooksAPI(query, page = 1) {
  // const queryParams = `search=${encodeURIComponent(query)}&page=${page}&_t=${timestamp}`;

  const callA = () =>
    fetch(`${API_BASE_URL}/books/?search=${encodeURIComponent(query)}&page=${page}`, {
      headers: authHeaders(),
    });

  let res = await withRefreshRetry(callA);
  if (!res.ok && (res.status === 404 || res.status === 405)) {
    const callB = () =>
      fetch(`${API_BASE_URL}/search/?q=${encodeURIComponent(query)}&page=${page}`, {
        headers: authHeaders(),
      });
    res = await withRefreshRetry(callB);
  }
  if (!res.ok) throw new Error(`검색 실패: ${res.status}`);

  const data = await res.json();
  const list = Array.isArray(data) ? data : data.results ?? [];

  if (list.length > 0) {
        console.log(`✅ 새로고침 후 첫 도서의 상태: ${list[0].book_status}`);
    }

  // 응답 표준화
  return list.map((b) => ({
    id: b.id ?? b.book_id ?? b.pk,
    title: b.title ?? "",
    author: b.author ?? "",
    publisher: b.publisher ?? "",
    code: b.book_code ?? b.code ?? b.call_number ?? "",
    cover: b.cover ?? b.image_url ?? "",
    liked: !!(b.liked ?? b.is_liked),
    status: b.book_status ?? "AVAILABLE",
    popularity: b.popularity ?? 0,
    location: b.location ?? "",
  }));
}

// 좋아요 토글 (A안: POST /books/:id/like/, 실패 시 B안: POST /likes/toggle/)
async function toggleLikeAPI(bookId, like) {
  const callA = () =>
    fetch(`${API_BASE_URL}/books/${bookId}/like/`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ like }),
    });

  let res = await withRefreshRetry(callA);
  if (!res.ok && (res.status === 404 || res.status === 405)) {
    const callB = () =>
      fetch(`${API_BASE_URL}/likes/toggle/`, {
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

  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [modalMessage, setModalMessage] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [confirmLoanState, setConfirmLoanState] = useState({
        isOpen: false,
        book: null, // 대출할 도서 객체 전체를 저장
    });
  const [confirmReserveState, setConfirmReserveState] = useState({
        isOpen: false,
        book: null, // 예약할 도서 객체 전체를 저장
    });

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



  const getStatusButtonInfo = (status) => {
    switch (status) {
        case 'AVAILABLE':
            return { text: "대출하기", className: "status-available" }; 
        case 'RENTED':
            return { text: "예약하기", className: "status-rented" };
        case 'RESERVED':
            return { text: "예약중", className: "status-reserved" }; 
        case 'UNAVAILABLE':
            return { text: "대출불가", className: "status-unavailable" };
        default:
            return { text: "상태확인", className: "status-unknown" };
    }
};

const executeLoan = async () => {
        const book = confirmLoanState.book;
        
        // 확인 모달 닫기
        setConfirmLoanState({ isOpen: false, book: null });

        if (!book || !book.code) {
            setModalMessage('❌ 도서 등록 정보가 누락되어 대출할 수 없습니다.');
            setIsModalOpen(true);
            return;
        }

        try {
            await submitLoanRequest(book.code); 
            
            setModalMessage('✅ 대출되었습니다'); 
            setIsModalOpen(true);
            
            // 목록 갱신 (상태 변경 반영)
            const list = await searchBooksAPI(q); 
            setBooks(list);
            
        } catch (err) {
            setModalMessage(err.message); 
            setIsModalOpen(true);
            
            console.error('[SearchPage] Loan Error:', err.message);
        }
    };


async function submitReserveRequest(bookId) {
    try {
        const response = await fetch(`${API_BASE_URL}/books/${bookId}/reserve/`, { 
            method: 'POST', 
            headers: authHeaders(),
        });

        const result = await response.json();

        if (!response.ok) {
            let errorMessage = result.message || `예약 실패: ${response.status}`;
            const err = new Error('❌ ' + errorMessage);
            err.status = response.status;
            err.payload = result;
            throw err;
        }

        return result; // API 응답 본문 반환
    } catch (e) {
        // fetch 오류나 JSON 파싱 오류가 아닌 경우, 이미 '❌'가 붙은 메시지를 throw합니다.
        if (!e.message.startsWith('❌')) {
             e.message = '❌ ' + (e.message || '예약 요청 중 알 수 없는 오류가 발생했습니다.');
        }
        throw e;
    }
}

 const executeReserve = async () => {
        const book = confirmReserveState.book;
        
        // 확인 모달 닫기
        setConfirmReserveState({ isOpen: false, book: null });

        if (!book || !book.id) {
            setModalMessage('❌ 예약에 필요한 도서 정보가 누락되었습니다.');
            setIsModalOpen(true);
            return;
        }
        
        try {
            await submitReserveRequest(book.id); // API 명세에 따라 bookId 사용
            
            setModalMessage('✅ 예약이 완료되었습니다'); 
            setIsModalOpen(true);
            
            // 목록 갱신 (상태 변경 반영)
            const list = await searchBooksAPI(q); 
            setBooks(list);
            
        } catch (err) {
            setModalMessage(err.message); 
            setIsModalOpen(true);
            console.error('[SearchPage] Reserve Error:', err.message);
        }
    };
    
    // 🌟🌟🌟 수정 3: 대출 버튼 클릭 로직을 예약 확인 로직으로 분리 🌟🌟🌟
    const handleReserveClick = (e, book) => {
        e.preventDefault(); 
        e.stopPropagation();

        if (!isLoggedIn()) {
            setIsLoginModalOpen(true); // 비로그인 시 로그인 유도 모달 띄우기
            return;
        }
        // API가 book_id를 요구하므로 b.id가 필수입니다.
        if (!book.id) {
            setModalMessage('❌ 예약에 필요한 도서 정보가 누락되었습니다.');
            setIsModalOpen(true);
            return;
        }

        // 예약 확인 모달 띄우기
        setConfirmReserveState({
            isOpen: true,
            book: book, 
        });
    };

    // 🌟🌟🌟 수정 4: 기존 handleLoanClick 함수는 대출 가능 상태에만 초점을 맞춥니다. 🌟🌟🌟
    const handleLoanClick = async (e, book) => {
        e.preventDefault(); 
        e.stopPropagation();
        
        if (!isLoggedIn()) {
            setIsLoginModalOpen(true); // 비로그인 시 로그인 유도 모달 띄우기
            return;
        }
        const bookCode = book.code;
        
        
        if (!bookCode || bookCode.length === 0) {
            setModalMessage('❌ 대출에 필요한 도서 등록 정보(Code)가 누락되었습니다.');
            setIsModalOpen(true);
            return;
        }
        
        setConfirmLoanState({
            isOpen: true,
            book: book, // 도서 정보 저장
        });
    };

const ConfirmModalRe = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="modal-backdrop"
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 1100 
            }}
        >
            <div 
                className="modal-content"
                style={{
                    backgroundColor: 'white', padding: '25px', borderRadius: '8px', 
                    textAlign: 'center', maxWidth: '350px'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* 제목 (도서 제목)과 메시지 */}
                <p style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: '15px' }}>{message}</p>
                <p>예약을 진행하시겠습니까?</p>

                <div className="popup-buttons" style={{ display: 'flex', justifyContent: 'space-around', gap: '10px', marginTop: '25px' }}>
                    <button 
                        onClick={onCancel} 
                        style={{ flex: 1, padding: '8px 15px', cursor: 'pointer',color:'black', backgroundColor: 'white', border: '1px solid #ccc' }}
                    >
                        아니요 (취소)
                    </button>
                    <button 
                        onClick={onConfirm} 
                        style={{ flex: 1, padding: '8px 15px', cursor: 'pointer', backgroundColor: '#0095ff', color: 'white', border: 'none' }}
                    >
                        예 (확인)
                    </button>
                </div>
            </div>
        </div>
    );
};
    // 확인 모달 닫기 (아니요 버튼용)
  const closeConfirmModal = () => {
      setIsLoginModalOpen(false);
      setConfirmLoanState({ isOpen: false, book: null });
      setConfirmReserveState({ isOpen: false, book: null }); // 예약 모달도 닫기
  };

 // 모달 닫기 함수
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  const MainPageNavigate = () => {
      setIsModalOpen(false);
      navigate('/');
  };

const navigateToLogin = () => {
        setIsLoginModalOpen(false);
        navigate('/LoginPage');
    };

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
    if (!isLoggedIn()) {
            setIsLoginModalOpen(true); 
            return;
        }
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
          {sorted.map((b) => {
            const statusInfo = getStatusButtonInfo(b.status);
            const finalCoverUrl = (b.cover && b.cover !== '') ? b.cover : printnull;


            return (
            // 기존 div를 Link 컴포넌트로 변경
            <div className="book-card" key={b.id}>
              {/* 표지 + 하트 (하트는 표지 내부 고정) */}
              <div className="book-cover">
              
                <img className="cover-img" src={finalCoverUrl} alt={`${b.title} 책 표지`} />
                <div
                  className="heart-icon-wrapper"
                  onMouseDown={(e) => {
                    e.stopPropagation(); // Link 이동 방지
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); // 혹시 모를 추가 방지
                    onToggleHeart(b.id); // 좋아요 토글 실행
                  }}
                  role="button"
                  aria-label={b.liked ? "관심도서 취소" : "관심도서 설정"}
                  title={b.liked ? "관심도서 취소" : "관심도서 설정"}
                >
                  <img
                    className="heart-icon"
                    src={b.liked ? red_hearts : blank_hearts}
                    alt=""
                  />
                </div>
              </div>
              <Link to={`/BookPage/${b.id || b.book_code}`}  className="book-space">
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
                    className={`loan-btn ${statusInfo.className}`}
                    type="button"
                    key={`btn-${b.id}-${b.status}`}
                    onClick={(e) => {
                      e.preventDefault(); 
                      e.stopPropagation(); 

                        if (b.status === "AVAILABLE") {
                              handleLoanClick(e, b);
                          } else if (b.status === "RENTED" || b.status === "RESERVED") {
                              handleReserveClick(e, b);
                          }
                     }}
                    disabled={b.status === "UNAVAILABLE"} 
                    >
                        {/* 대출가능일 때만 대출신청 텍스트 사용 */}
                      {b.status === "AVAILABLE" ? "대출신청" : statusInfo.text}
                  </button>
              </Link>
            </div>
          )})}
        </section>
      )}

      <Footer />
      <ConfirmModalLoan
          isOpen={confirmLoanState.isOpen}
          message={confirmLoanState.book ? `[${confirmLoanState.book.code}] ${confirmLoanState.book.title}` : '도서 정보를 확인할 수 없습니다.'}
          onConfirm={executeLoan} 
          onCancel={closeConfirmModal}
      />
      {/* 🌟🌟🌟 수정 7: 예약 확인 모달 렌더링 (예약용) 🌟🌟🌟 */}
      <ConfirmModalRe
          isOpen={confirmReserveState.isOpen}
          message={confirmReserveState.book ? `[${confirmReserveState.book.code}] ${confirmReserveState.book.title}` : '도서 정보를 확인할 수 없습니다.'}
          onConfirm={executeReserve} // 예약 실행 로직 연결
          onCancel={closeConfirmModal}
      />
      <SuccessModal
        isOpen={isModalOpen}
        message={modalMessage}
        onClose={closeModal}
        onConfirm={MainPageNavigate}
      />
      <LoginRequiredModal
                isOpen={isLoginModalOpen}
                onClose={closeConfirmModal} // 모달 닫기
                onLoginNavigate={navigateToLogin} // 로그인 페이지로 이동
      />
      
    </div>
  );
}