// src/Pages/BookPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../Css/font.css';
import '../Css/BookPage.css';

const BASE = 'https://mungo.n-e.kr';

/** ✅ access token 추출 함수 (여러 키명 대응) */
const getAuthHeaders = () => {
  const token =
    localStorage.getItem('accessToken');

  if (!token) {
    console.warn('[getAuthHeaders] access token을 찾을 수 없습니다.');
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/** ✅ fetchJSON - preflight 최소화 + timeout + 헤더 병합 순서 수정 */
async function fetchJSON(
  path,
  { method = 'GET', body, auth = false, headers = {}, timeoutMs = 8000 } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);

  // ✅ 헤더 병합 순서 (Authorization 덮어쓰기 방지)
  const baseHeaders = {
    Accept: 'application/json',
    ...headers, // 사용자 헤더 먼저
    ...(auth ? getAuthHeaders() : {}), // 인증 헤더 나중에 추가
  };

  if (method !== 'GET' && !('Content-Type' in baseHeaders)) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  let res;
  try {
    console.log(`[fetchJSON] ${method} ${BASE}${path}`, {
      headers: baseHeaders,
      body,
    });
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: baseHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const ct = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!ct.includes('application/json')) {
    throw new Error(
      `Expected JSON but got ${ct} ${res.status} at ${res.url}. Body: ${text.slice(0, 120)}`
    );
  }

  const json = text ? JSON.parse(text) : null;
  console.log('[fetchJSON Response]', res.status, json);

  if (!res.ok) {
    const msg = json?.detail || json?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = json;
    throw err;
  }

  return json;
}

/** ✅ 폴백 도서 정보 */
const FALLBACK_BOOK = {
  title: '-',
  author: '-',
  edition: '-',
  publisher: '-',
  format: '-',
  callNumber: '-',
  status: 'available',
  series: '-',
  details: '-',
  notes: '-',
  coverUrl: '',
  MJcode:'-',
};

const toText = (v) =>
  Array.isArray(v) ? v.filter(Boolean).join(' ; ') : v ?? '-';

export default function BookPage() {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const [pk, setPk] = useState(null);
  const [resolving, setResolving] = useState(true);
  const [bookData, setBookData] = useState(FALLBACK_BOOK);
  const [isLiked, setIsLiked] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [isReviewBoxOpen, setIsReviewBoxOpen] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');

  const openModal = (msg) => {
    setModalMsg(msg);
    setIsModalOpen(true);
  };

  /** ✅ URL bookId → pk 해석 */
  useEffect(() => {
    const ac = new AbortController();

    async function resolvePk() {
      setResolving(true);
      setPk(null);
      try {
        const raw = String(bookId ?? '').trim();
        if (!raw) return;

        if (/^\d+$/.test(raw)) {
          setPk(Number(raw));
          return;
        }

        if (/^MJ\d{6}$/i.test(raw)) {
          const code = raw.toUpperCase();
          const data = await fetchJSON(`/books/?book_code=${encodeURIComponent(code)}`, {
            auth: false,
            timeoutMs: 8000,
          });

          const list = Array.isArray(data) ? data : data?.results ?? [];
          const exact = list.find((b) => (b?.book_code ?? b?.bookCode) === code);

          if (exact?.id) {
            setPk(exact.id);
            return;
          }
        }
        setPk(null);
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error('[resolvePk] error:', e);
          setPk(null);
        }
      } finally {
        setResolving(false);
      }
    }

    resolvePk();
    return () => ac.abort();
  }, [bookId]);

  const invalidId = !Number.isFinite(pk) || pk <= 0;

  /** ✅ 도서 상세 및 리뷰 로드 */
  useEffect(() => {
    if (resolving || invalidId) return;
    const ac = new AbortController();

    async function load() {
      try {
        // 📍 BookPage.jsx 내 도서 상세 fetch 부분
          const d = await fetchJSON(`/books/${pk}/`, { auth: true, timeoutMs: 8000 });

          setBookData({
            title: toText(d?.title),
            author: toText(d?.author),
            edition: toText(d?.edition),
            publisher: toText(d?.publisher),
            format: toText(d?.physical ?? d?.format),
            callNumber: toText(d?.call_number ?? d?.callNumber ?? d?.callnumber),
            status: d?.status ?? 'available',
            series: toText(d?.series),
            details: toText(d?.details),
            notes: toText(d?.notes),
            coverUrl: d?.image_url || '',
            code: d?.book_code || d?.code || '', 
            MJcode: toText(d?.book_code),
          });


        if (typeof d?.liked === 'boolean') setIsLiked(d.liked);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[BOOK DETAIL] fail:', err);
          openModal('도서 상세 정보를 불러오지 못했습니다.');
        }
      }

      try {
        const data = await fetchJSON(`/reviews/?bookId=${pk}`, {
          auth: false,
          timeoutMs: 8000,
        });
        if (ac.signal.aborted) return;

        const list = (Array.isArray(data) ? data : data?.results ?? []).map(
          (r, idx) => ({
            id: r.id ?? idx,
            author: r.user_username ?? r.author ?? r.username ?? '익명', 
            date: r.date
              ? r.date.replaceAll('-', '/')
              : (r.created_at || '').slice(0, 10).replaceAll('-', '/'),
            content: r.content ?? '',
          })
        );
        setReviews(list);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('[REVIEWS LIST] fail:', err);
        }
      }
    }

    load();
    return () => ac.abort();
  }, [pk, invalidId, resolving]);

  /** ✅ 좋아요 */
  const handleLikeToggle = async () => {
    if (invalidId) return;
    const prev = isLiked;
    setIsLiked(!prev);
    try {
      await fetchJSON(`/books/${pk}/like/`, { method: 'POST', auth: true, body: {} });
    } catch (err) {
      console.error('[LIKE] fail:', err);
      setIsLiked(prev);
      openModal('좋아요 처리 중 오류가 발생했습니다.');
    }
  };

  /** ✅ 리뷰 등록 */
  const handleSubmitReview = async () => {
    if (invalidId) return;
    const content = newReviewText.trim();
    if (!content) return;

    const today = new Date();
    const optimistic = {
      id: `temp-${Date.now()}`,
      author: '나',
      date: `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`,
      content,
    };
    setReviews((prev) => [optimistic, ...prev]);
    setNewReviewText('');
    setIsReviewBoxOpen(false);

    try {
      await fetchJSON(`/reviews/`, { method: 'POST', auth: true, body: { book: pk, content } });
      const listData = await fetchJSON(`/reviews/?bookId=${pk}`, { auth: false });
      const normalized = (Array.isArray(listData)
        ? listData
        : listData?.results || []
      ).map((r, idx) => ({
        id: r.id ?? idx,
        author: r.user_username ?? r.author ?? r.username ?? '익명', 
        date: r.date
          ? r.date.replaceAll('-', '/')
          : (r.created_at || '').slice(0, 10).replaceAll('-', '/'),
        content: r.content ?? '',
      }));
      setReviews(normalized);
    } catch (err) {
      console.error('[REVIEW CREATE] fail:', err);
      setReviews((prev) => prev.filter((r) => r.id !== optimistic.id));
      openModal('리뷰 등록에 실패했습니다. 로그인/권한을 확인해 주세요.');
    }
  };

/** ✅ 최종 확정 버전 */
const handleRent = async () => {
  if (invalidId) return;

  try {
    // bookData 안에 book_code 또는 code 필드가 있다면 그것을 사용
    const bookCode =
      bookData?.code || bookData?.book_code || bookData?.bookCode;

    if (!bookCode) {
      openModal('이 도서의 코드 정보를 찾을 수 없습니다.');
      console.warn('[RENT] 도서 코드 누락:', bookData);
      return;
    }

    console.log('[RENT] 요청 시작:', { code: bookCode });
    const res = await fetchJSON(`/rentals/`, {
      method: 'POST',
      auth: true,
      body: { code: bookCode },
    });
    console.log('[RENT] 성공:', res);
    openModal('✅ 대출이 완료되었습니다.');
  } catch (err) {
    console.error('[RENT] fail:', err);
    console.log('[RENT] 서버 응답 payload:', err.payload);
    openModal(
      `❌ 대출 중 오류 발생 (${err.status || '???'}): ${
        err.payload?.detail || JSON.stringify(err.payload)
      }`
    );
  }
};



  /** ✅ 예약 */
  const handleReserve = async () => {
    if (invalidId) return;
    try {
      await fetchJSON(`/books/${pk}/reserve/`, {
        method: 'POST',
        auth: true,
      });
      openModal('예약이 완료되었습니다.');
    } catch (err) {
      console.error('[RESERVE] fail:', err);
      openModal('예약 중 오류가 발생했습니다.');
    }
  };

  /** ✅ 렌더링 */
  return (
    <div>
      <div className="top-bar">
        <button onClick={() => navigate(-1)} className="back-btn" aria-label="뒤로가기">
          ←
        </button>
        <span className="top-title">상세 페이지</span>
      </div>

      {resolving ? (
        <div className="container">
          <div className="info" style={{ marginTop: 16 }}>불러오는 중...</div>
        </div>
      ) : invalidId ? (
        <div className="container">
          <div className="info" style={{ marginTop: 16 }}>
            잘못된 도서 링크입니다. 목록에서 다시 시도해 주세요.
          </div>
        </div>
      ) : (
        <>
          <div className="container">
            <div className="upsection">
              <div className="cover-section">
                {bookData.coverUrl ? (
                  <img
                    className="cover"
                    src={bookData.coverUrl}
                    alt={`${bookData.title || '도서'} 표지`}
                    onError={(e) => {
                      e.currentTarget.src = '/img/cover-placeholder.png';
                    }}
                  />
                ) : (
                  <div className="cover">표지</div>
                )}
              </div>

              <div className="info">
                <p><strong>제목:</strong> <span>{bookData.title}</span></p>
                <p><strong>저자:</strong> <span>{bookData.author}</span></p>
                <p><strong>판사항:</strong> <span>{bookData.edition}</span></p>
                <p><strong>청구기호:</strong> <span>{bookData.callNumber}</span></p>
                <p><strong>등록번호:</strong> <span>{bookData.MJcode}</span></p>
                <p><strong>장서상태:</strong> <span className={`status-${bookData.status}`}>{bookData.status}</span></p>
              </div>
            </div>

            <div className="bbuttons-row">
              <div className="bbutton" onClick={handleRent}>대출</div>
              <div className="bbutton" onClick={handleReserve}>예약</div>
              <div className="heartspqce">
              <div className="bbutton" id="likeButton" onClick={handleLikeToggle}>
                <span className="heart-icon">{isLiked ? '❤️' : '🤍'}</span>관심
              </div>
              </div>
            </div>
          </div>

          <div className="subject-tags">
            <h3>상세 장서 정보</h3>
            <p><strong>발행사항:</strong> <span>{bookData.publisher}</span></p>
            <p><strong>형태사항:</strong> <span>{bookData.format}</span></p>
            <p><strong>총서정보:</strong> <span>{bookData.series}</span></p>
            <p><strong>상세정보:</strong> <span>{bookData.details}</span></p>
            <p><strong>주기:</strong> <span>{bookData.notes}</span></p>
          </div>

          <div className="review">
            <div className="review-header">
              <h3>리뷰</h3>
              <button
                className="register-button"
                type="button"
                onClick={() => setIsReviewBoxOpen((p) => !p)}
              >
                {isReviewBoxOpen ? '닫기' : '등록'}
              </button>
            </div>

            <div id="reviewList">
              {reviews.map((r) => (
                <div className="review-item" key={r.id}>
                  <div className="review-meta">
                    <strong>{r.author}</strong>
                    <span className="review-date">{r.date}</span>
                  </div>
                  <p>{r.content}</p>
                </div>
              ))}
            </div>

            {isReviewBoxOpen && (
              <div className="typobox" id="typobox">
                <textarea
                  id="reviewInput"
                  rows="4"
                  placeholder="리뷰를 입력하세요..."
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  aria-label="리뷰 입력"
                  onKeyDown={(e) => {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmitReview();
                  }}
                />
                <br />
                <button
                  className="submit-button"
                  type="button"
                  onClick={handleSubmitReview}
                >
                  리뷰 등록
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {isModalOpen && (
        <div className="modal open" id="popupModal">
          <div className="modal-content">
            <p>{modalMsg || '처리가 완료되었습니다.'}</p>
            <button
              className="close-btn"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
