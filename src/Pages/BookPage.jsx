import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom'; 

import '../Css/font.css';
import '../Css/BookPage.css';

// 가상의 도서 데이터 (원래는 서버나 상위 컴포넌트에서 받아옵니다)
const MOCK_BOOK_DATA = {
  author: "남태우, 이승민",
  edition: "제3판",
  publisher: "한국도서관협회",
  format: "280p.",
  callNumber: "025.3 남22도3",
  status: "available", // available | reserved | unavailable
  series: "세상 모든 시리즈",
  details: "정보 자원의 기술과 메타데이터에 대한 심도 있는 분석",
  notes: "특별한 주기 없음",
};

const MOCK_REVIEWS = [
    { id: 1, author: "익명1", date: "2024/12/3", content: "감명 깊게 읽었습니다. 책의 내용이 매우 인상적이네요." },
    { id: 2, author: "익명2", date: "2022/5/13", content: "너무 재밌었다. 다음에 또 읽고 싶어요~!" }
];

function BookPage() {
  // useParams를 사용해 URL의 id 값을 가져올 수 있습니다 (예: /book/4)
  const { bookId } = useParams();

  // 1. 상태(State) 관리
  const [bookData, setBookData] = useState(MOCK_BOOK_DATA);
  const [isLiked, setIsLiked] = useState(false);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReviewBoxOpen, setIsReviewBoxOpen] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");

  // 실제 앱에서는 bookId를 이용해 서버에서 데이터를 가져옵니다.
  // useEffect(() => {
  //   // fetch(`/api/book/${bookId}`).then(res => res.json()).then(data => setBookData(data));
  // }, [bookId]);

  // 2. 이벤트 핸들러 함수들
  const handleLikeToggle = () => {
    setIsLiked(prev => !prev);
  };

  const handleSubmitReview = () => {
    if (!newReviewText.trim()) return;

    const today = new Date();
    const newReview = {
      id: Date.now(), // 고유한 key를 위한 id
      author: `익명${reviews.length + 1}`,
      date: `${today.getFullYear()}/${today.getMonth() + 1}/${today.getDate()}`,
      content: newReviewText.trim()
    };

    setReviews(prevReviews => [newReview, ...prevReviews]); // 새 리뷰를 맨 앞에 추가
    setNewReviewText(""); // 입력창 초기화
    setIsReviewBoxOpen(false); // 리뷰 입력창 닫기
  };

  return (
    <div>
      <div className="top-bar">
        <Link to="/SearchPage" className="back-btn" aria-label="뒤로가기">←</Link>
        <span className="top-tittle top-title">상세 페이지</span>
      </div>
      
      <div className="container">
        <div className="upsection">
            <div className="cover-section">
                <div className="cover">표지</div>
            </div>
            <div className="info">
                <p><strong>저자:</strong> <span>{bookData.author}</span></p>
                <p><strong>판사항:</strong> <span>{bookData.edition}</span></p>
                <p><strong>발행사항:</strong> <span>{bookData.publisher}</span></p>
                <p><strong>형태사항:</strong> <span>{bookData.format}</span></p>
                <p><strong>청구기호:</strong> <span>{bookData.callNumber}</span></p>
                <p><strong>장서상태:</strong> <span className={`status-${bookData.status}`}>{bookData.status}</span></p>
                <p><strong>총서정보:</strong> <span>{bookData.series}</span></p>
                <p><strong>상세정보:</strong> <span>{bookData.details}</span></p>
                <p><strong>주기:</strong> <span>{bookData.notes}</span></p>
            </div>
        </div>
            <div className="buttons-row">
                <div className="button" onClick={() => setIsModalOpen(true)}>대출</div>
                <div className="button" onClick={() => setIsModalOpen(true)}>예약</div>
            <div className="button" id="likeButton" onClick={handleLikeToggle}>
                <span className="heart-icon">{isLiked ? '❤️' : '🤍'}</span> 관심
            </div>
            </div>
        
        
      </div>

      <div className="subject-tags">
        <h3>상세 장서 정보</h3>
        <p>소설 / 시 / 희곡 &gt; 영어소설</p>
        <p>고전 &gt; ~~~ &gt; ~~~ </p>
      </div>

      <div className="review">
        <div className="review-header">
          <h3>리뷰</h3>
          <button className="register-button" onClick={() => setIsReviewBoxOpen(true)}>등록</button>
        </div>

        <div id="reviewList">
          {reviews.map(review => (
            <div className="review-item" key={review.id}>
              <div className="review-meta">
                <strong>{review.author}</strong>
                <span className="review-date">{review.date}</span>
              </div>
              <p>{review.content}</p>
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
            ></textarea>
            <br />
            <button className="submit-button" onClick={handleSubmitReview}>리뷰 등록</button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal" id="popupModal">
          <div className="modal-content">
            <p>팝업이 열렸습니다</p>
            <button className="close-btn" onClick={() => setIsModalOpen(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookPage;