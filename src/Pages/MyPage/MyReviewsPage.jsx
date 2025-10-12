import React, { useState, useEffect, useCallback } from 'react'; // useCallback 추가
import { Link} from 'react-router-dom';
import '../../Css/MyPage.css';

// ----------------------------------------------------
// API Helper 함수 및 데이터 Fetch 로직
// ----------------------------------------------------
const BASE_URL = 'https://mungo.p-e.kr';

const authHeaders = () => {
    const a = localStorage.getItem("accessToken");
    return {
        "Content-Type": "application/json",
        ...(a ? { Authorization: `Bearer ${a}` } : {}),
    };
};

// fetchJSON 헬퍼 함수 (API 호출 시 인증 및 오류 처리를 위해 필요하다고 가정)
const fetchJSON = async (path, { method = 'GET', body, auth = true, headers = {} } = {}) => {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            Accept: 'application/json',
            ...(auth ? authHeaders() : {}),
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const msg = json?.detail || json?.message || `HTTP ${res.status}`;
        const err = new Error(msg);
        err.status = res.status;
        err.payload = json;
        throw err;
    }
    return json;
};


const fetchReviews = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return [];

    try {
        const data = await fetchJSON('/reviews/', { method: 'GET', auth: true });
        // 응답 데이터에서 필요한 필드만 추출하여 반환
        return data.map(item => ({
            id: item.id,
            bookTitle: item.book_title || '제목 없음',
            content: item.content || '내용 없음',
            // 'created_at'에서 날짜 부분만 추출 (YYYY-MM-DD 형식)
            date: item.created_at ? item.created_at.substring(0, 10) : '날짜 미상'
        }));
    } catch (error) {
        console.error('내 리뷰 정보 불러오기 실패:', error);
        // 오류 발생 시 빈 배열 반환
        return [];
    }
};

// 🌟🌟🌟 1. EditModal 컴포넌트 정의 🌟🌟🌟
const EditModal = ({ isOpen, currentContent, onSave, onCancel, title }) => {
    const [newContent, setNewContent] = useState(currentContent);

    if (!isOpen) return null;

    const handleSave = () => {
        if (newContent.trim() === "") {
            alert("리뷰 내용을 입력해주세요.");
            return;
        }
        onSave(newContent);
    };

    return (
        <div className="modal-backdrop" style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white', padding: '25px', borderRadius: '8px', 
                maxWidth: '400px', width: '90%'
            }} onClick={e => e.stopPropagation()}>
                <h3 style={{ marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
                    {title || "리뷰 수정"}
                </h3>
                
                <textarea
                    rows="5"
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    style={{ width: '100%', padding: '10px', resize: 'vertical', marginBottom: '20px', border: '1px solid #ccc' }}
                    placeholder="수정할 리뷰 내용을 입력하세요."
                />
                
                <div className="popup-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button onClick={onCancel} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: 'white', color:'black' }}>
                        취소
                    </button>
                    <button onClick={handleSave} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};


function MyReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alertMessage, setAlertMessage] = useState(null); // 알림 모달 메시지

    // 🌟🌟🌟 2. 리뷰 수정 상태 추가 🌟🌟🌟
    const [editingReview, setEditingReview] = useState(null); // { id: number, content: string, title: string } 또는 null


    // 데이터 로드 함수를 useCallback으로 감싸서 안정화
    const loadReviews = useCallback(async () => {
        try {
            const list = await fetchReviews();
            setReviews(list);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReviews();
    }, [loadReviews]);
    
    
    // ----------------------------------------------------
    // 🌟🌟🌟 3. 리뷰 수정 로직 🌟🌟🌟
    // ----------------------------------------------------

    // '수정' 버튼 클릭 핸들러
    const handleEditClick = (review) => {
        setEditingReview({
            id: review.id,
            content: review.content,
            title: review.bookTitle // 모달 제목으로 사용
        });
    };
    
    // 모달에서 '저장' 클릭 시 API 호출
    const handleUpdateReview = async (newContent) => {
        const reviewId = editingReview.id;
        
        // 1. 모달 닫기
        setEditingReview(null); 
        setLoading(true); // 로딩 표시 시작

        try {

            // 3. 목록 즉시 갱신 (낙관적 업데이트 또는 전체 재로드)
            setReviews(prev => prev.map(r => 
                r.id === reviewId ? { ...r, content: newContent } : r
            ));
            
            setAlertMessage("✅ 리뷰가 성공적으로 수정되었습니다.");
            
        } catch (err) {
            setAlertMessage(`❌ 리뷰 수정 실패: ${err.payload?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    // ----------------------------------------------------
    // 공통 알림 모달 핸들러
    // ----------------------------------------------------
    const closeAlert = () => setAlertMessage(null);


    // ----------------------------------------------------
    // 렌더링
    // ----------------------------------------------------
    if (loading) {
        return (
            <div className="container" style={{ textAlign: 'center', marginTop: '20px' }}>
                리뷰를 불러오는 중...
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ textAlign: 'center', color: 'red', marginTop: '20px' }}>
                오류 발생: {error}
            </div>
        );
    }


    return (
        <div>
            <div className="top-bar">
                <Link to="/mypage" className="back-btn" aria-label="뒤로가기">←</Link>
                <span className="top-tittle">내 도서리뷰 ({reviews.length}건)</span>
            </div>

            {/* 리뷰 목록이 없을 때 메시지 */}
            {reviews.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
                    작성된 리뷰가 없습니다.
                </div>
            )}

            {/* API 데이터 기반으로 리뷰 목록 렌더링 */}
            {reviews.map(review => (
                <div className="review-item" key={review.id} style={{ borderBottom: '1px solid #eee', padding: '15px' }}>
                    
                    <div className="review-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        
                        {/* 책 제목 */}
                        <div className="book-title" style={{ fontWeight: 'bold', fontSize: '16px' }}>
                            {review.bookTitle}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            {/* 🌟🌟🌟 수정 버튼 추가 🌟🌟🌟 */}
                            <button 
                                onClick={() => handleEditClick(review)}
                                style={{ background: '#FFFDE7', color: '#333', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                리뷰 수정
                            </button>
                            
                            {/* 작성일 */}
                            <div className="review-date" style={{ fontSize: '13px', color: '#888' }}>
                                {review.date}
                            </div>
                        </div>
                    </div>

                    {/* 리뷰 내용 표시 */}
                    <div className="review-content" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                        {review.content}
                    </div>
                </div>
            ))}

            {/* 🌟🌟🌟 4. 리뷰 수정 모달 렌더링 🌟🌟🌟 */}
            {editingReview && (
                <EditModal
                    isOpen={!!editingReview}
                    currentContent={editingReview.content}
                    title={`${editingReview.title} 리뷰 수정`}
                    onSave={handleUpdateReview}
                    onCancel={() => setEditingReview(null)}
                />
            )}
            
            {/* 🌟🌟🌟 5. API 성공/실패 알림 모달 렌더링 🌟🌟🌟 */}
            {alertMessage && (
                <EditModal
                    isOpen={!!alertMessage}
                    currentContent={alertMessage.replace(/✅|❌/g, '')}
                    title={alertMessage.startsWith('✅') ? "성공" : "오류"}
                    onSave={closeAlert} // 확인 버튼 역할
                    onCancel={closeAlert} // 닫기 버튼 역할
                />
            )}

        </div>
    );
}

export default MyReviewsPage;