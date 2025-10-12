// src/Pages/NoticePage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Css/NoticePage.css'; 
import info1 from '../Images/info1.png';
import info2 from '../Images/info2.png';
import info3 from '../Images/info3.png';
import info4 from '../Images/info4.png';
import info5 from '../Images/info5.png';

const initialPosts = [
  {
    id: 1,
    title: "문중문고 개관안내 (클릭)",
    content: [info1, info2, info3, info4, info5],
    date: "2025-10-13",
    isPinned: 'True'
  }
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
                {Array.isArray(post.content) ? (
                  post.content.map((imageSrc, index) => (
                    <img 
                      key={index} 
                      src={imageSrc} 
                      alt={`정보 이미지 ${index + 1}`} 
                      style={{ maxWidth: '100%', height: 'auto', marginBottom: '10px' }} // 이미지 스타일
                    />
                  ))
                ) : (
                  <p>{post.content}</p>
                )}
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