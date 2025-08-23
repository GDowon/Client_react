import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import '../../Css/MyPage.css';

// 가상의 리뷰 데이터 (원래는 API를 통해 받아옵니다)
const MOCK_REVIEWS = [
  {
    id: 1,
    bookTitle: "[책 제목 1]",
    content: "이 책은 정말 유익했어요. 추천합니다!",
  },
  {
    id: 2,
    bookTitle: "[책 제목 2]",
    content: "조금 어려웠지만 읽을 가치가 있어요.",
  },
  {
    id: 3,
    bookTitle: "[또 다른 책 제목]",
    content: "시간 가는 줄 모르고 읽었습니다.",
  }
];

function MyReviewsPage() {
  // 1. 리뷰 목록을 state로 관리
  const [reviews] = useState(MOCK_REVIEWS);

  return (
    <div>
      <div className="top-bar">
        <Link to="/mypage" className="back-btn" aria-label="뒤로가기">←</Link>
        <span className="top-tittle">내 도서리뷰</span>
      </div>

      {/* 2. state에 저장된 reviews 배열을 map 함수로 순회하며 렌더링 */}
      {reviews.map(review => (
        <div className="review" key={review.id}>
          <div className="book-title">{review.bookTitle}</div>
          <div className="content">{review.content}</div>
        </div>
      ))}
    </div>
  );
}

export default MyReviewsPage;