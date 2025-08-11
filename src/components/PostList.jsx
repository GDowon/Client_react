import React from 'react';
import { Link } from 'react-router-dom';
import PostItem from './PostItem'; // 👈 PostItem 컴포넌트 import

function PostList({ title, icon, linkTo, posts }) {
  return (
    <div className="note">
      <div className="section-header">
        <span>{icon} {title}</span>
        <Link className="plus-button" to={linkTo}>＋</Link>
      </div>
      <div className="card small-card">
        <table className="board-table">
          <tbody>
            {posts.map((post, index) => (
              <PostItem key={index} post={post} /> 
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PostList;