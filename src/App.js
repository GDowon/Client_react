import { Routes, Route, Link } from 'react-router-dom';
import './Css/font.css';
import './Css/toolkit.css';

/* MainPage */
import MainPage from './Pages/MainPage';
import NoticePage from './Pages/NoticePage';
import CurationPage from './Pages/CurationPage';
import GuidePage from './Pages/GuidePage';
import StatusPage from './Components/StatusPage';
/*Current*/
import CurrentBorrow from './Pages/CurrentBorrow';

/* Login */
import LoginPage from './Pages/Login/LoginPage';
import ResetPassword from './Pages/Login/ResetPassword';
import FindId from './Pages/Login/FindId';
import SignUp from './Pages/Login/SignUp';

/* Search */
import SearchPage from './Pages/SearchPage';
import BookPage from './Pages/BookPage';

/* MyPage */
import MyPage from './Pages/MyPage/MyPage';
import MyReviewsPage from './Pages/MyPage/MyReviewsPage';
import EditProfilePage from './Pages/MyPage/EditProfilePage';

/* Loan */
import LoanChoice from './Pages/LoanPage/LoanChoice';
import LoanLoan from './Pages/LoanPage/LoanLoan';
import LoanReturn from './Pages/LoanPage/LoanReturn';

/* ===================== */
/* Fetch helpers (공통)  */
/* ===================== */
const BASE = '';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function fetchJSON(path, { method = 'GET', body, auth = false, headers = {} } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(auth ? getAuthHeaders() : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const ct = res.headers.get('content-type') || '';
  const text = await res.text();
  if (!ct.includes('application/json')) {
    throw new Error(`Expected JSON but got ${ct} ${res.status} at ${res.url}. Body: ${text.slice(0, 120)}`);
  }
  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = json?.detail || json?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}

/* ========================= */
/* StatusPage용 데이터 함수  */
/* ========================= */

// 현재 대출 (GET /rentals/current/)
const fetchBorrowData = async () => {
  try {
    const data = await fetchJSON('/rentals/current/', { auth: true });
    return (Array.isArray(data) ? data : []).map((item) => ({
      title: item.book_title ?? item.book?.title ?? item.title ?? '제목 없음',
      info: `대출일: ${item.rental_date ?? item.borrowed_at ?? item.created_at ?? '-'}`,
    }));
  } catch (e) {
    console.error('[fetchBorrowData]', e);
    return [];
  }
};

// 연체 (같은 응답에서 overdue 필터 가정)
const fetchOverdueData = async () => {
  try {
    const data = await fetchJSON('/rentals/current/', { auth: true });
    return (Array.isArray(data) ? data : [])
      .filter((x) => x.overdue === true || x.status === 'overdue')
      .map((x) => ({
        title: x.book_title ?? x.book?.title ?? x.title ?? '제목 없음',
        info: `반납 예정일: ${x.due_date ?? '-'}`,
      }));
  } catch (e) {
    console.error('[fetchOverdueData]', e);
    return [];
  }
};

// 예약 (GET /reservations/?user={id})
const fetchReserveData = async () => {
  try {
    const userId = localStorage.getItem('user_id');
    const qs = userId ? `?user=${encodeURIComponent(userId)}` : '';
    const data = await fetchJSON(`/reservations/${qs}`, { auth: true });
    return (Array.isArray(data) ? data : []).map((x) => ({
      title: x.book_title ?? x.book?.title ?? x.title ?? '제목 없음',
      info: `예약 순위: ${x.queue_position ?? x.rank ?? '-'}`,
    }));
  } catch (e) {
    console.error('[fetchReserveData]', e);
    return [];
  }
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MainPage />} />

        {/* 현재 대출/연체/예약 */}
        <Route path="/CurrentBorrow" element={<CurrentBorrow />} />
        <Route
          path="/current_overdue"
          element={
            <>
              <div className="top-bar">
                <Link to="/" className="back-btn" aria-label="뒤로가기">←</Link>
                <span className="top-tittle">현재 연체 중인 도서</span>
              </div>
              <StatusPage title="연체 내역" fetchData={fetchOverdueData} />
            </>
          }
        />
        <Route
          path="/current_reserve"
          element={
            <>
              <div className="top-bar">
                <Link to="/" className="back-btn" aria-label="뒤로가기">←</Link>
                <span className="top-tittle">현재 예약 중인 도서</span>
              </div>
              <StatusPage title="예약 내역" fetchData={fetchReserveData} />
            </>
          }
        />

        {/* 일반 페이지 */}
        <Route path="/NoticePage" element={<NoticePage />} />
        <Route path="/CurationPage" element={<CurationPage />} />
        <Route path="/GuidePage" element={<GuidePage />} />

        {/* 로그인/회원 */}
        <Route path="/LoginPage" element={<LoginPage />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/FindId" element={<FindId />} />
        <Route path="/SignUp" element={<SignUp />} />

        {/* 검색/도서 상세 */}
        <Route path="/search" element={<SearchPage />} />
        {/* ✅ bookId만 받음 */}
        <Route path="/BookPage/:bookId" element={<BookPage />} />


        {/* 마이페이지 */}
        <Route path="/MyPage" element={<MyPage />} />
        <Route path="/EditProfilePage" element={<EditProfilePage />} />
        <Route path="/MyReviewsPage" element={<MyReviewsPage />} />

        {/* 대출/반납 */}
        <Route path="/LoanChoice" element={<LoanChoice />} />
        <Route path="/LoanLoan" element={<LoanLoan />} />
        <Route path="/LoanReturn" element={<LoanReturn />} />
      </Routes>
    </div>
  );
}

export default App;
