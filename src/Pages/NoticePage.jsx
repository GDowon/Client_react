// src/Pages/NoticePage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Css/NoticePage.css'; 

// 가상의 게시글 데이터입니다. 실제로는 서버 API를 통해 가져와야 합니다.
const initialPosts = [
  {
    id: 1,
    title: "<필독> 문중문고 FAQ",
    content: "이것은 FAQ 내용입니다. 여기에 더 많은 정보가 들어갑니다.",
    date: "2025-05-01",
    isPinned: true
  },
  {
    id: 2,
    title: "문중문고 5월 이용 관련 공지",
    content: "5월 이용 관련 공지 내용입니다. 변경된 이용 시간이 포함됩니다.",
    date: "2025-05-03"
  },
  {
    id: 3,
    title: "문중문고 신설",
    content: "문중문고 신설 관련 내용입니다. 새로운 도서관 시설에 대한 설명입니다.",
    date: "2025-04-25"
  },
];

function NoticePage() {
  // 게시글 데이터를 상태로 관리합니다.
  const [posts] = useState(initialPosts);
  
  // 현재 펼쳐진 게시글의 ID를 상태로 관리하며, 초기값은 null입니다.
  const [openPostId, setOpenPostId] = useState(null);

  // 게시글 제목을 클릭하면 호출되는 함수입니다.
  const togglePost = (id) => {
    // 현재 열려있는 게시글의 ID와 클릭한 게시글의 ID가 같으면 닫고, 다르면 새로운 게시글을 엽니다.
    setOpenPostId(openPostId === id ? null : id);
  };

  return (
    <div>
      <div className="top-bar">
        {/* React Router의 Link를 사용하여 메인 페이지로 이동합니다. */}
        <Link to="/" className="back-btn" aria-label="뒤로가기">
          ←
        </Link>
        <span className="top-tittle">공지사항</span>
      </div>

      <div id="postContainer">
        {/* 게시글이 없는 경우 조건부로 메시지를 렌더링합니다. */}
        {posts.length === 0 ? (
          <div className="no-posts">게시글이 없습니다.</div>
        ) : (
          // 게시글 배열을 순회하며 각 게시글을 동적으로 렌더링합니다.
          posts.map(post => (
            <div key={post.id} className="post">
              <div 
                className="post-title" 
                onClick={() => togglePost(post.id)}
              >
                {post.title}
              </div>
              <div 
                className="post-content" 
                // openPostId 상태에 따라 내용이 보이거나 숨겨집니다.
                style={{ display: openPostId === post.id ? 'block' : 'none' }}
              >
                <p>{post.content}</p>
                <p><strong>작성일:</strong> {post.date}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NoticePage;