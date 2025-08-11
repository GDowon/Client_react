import React from 'react';

function PostItem({ post }) {
  return (
    <tr>
      <td className="title">{post.title}</td>
      <td>{post.date}</td>
    </tr>
  );
}

export default PostItem;