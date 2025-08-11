// Header.jsx
import React from "react";

/**
 * 재사용 가능한 상단바
 * @param {string} title - 가운데 제목 텍스트
 * @param {string} [backHref] - 뒤로가기 링크(지정하면 <a> 사용, 없으면 history.back())
 * @param {React.ReactNode} [right] - 오른쪽 영역(아이콘/버튼 등)
 * @param {string} [className] - 추가 클래스
 */
export default function Header({ title = "마이페이지", backHref, right, className = "" }) {
  return (
    <header className={`top-bar ${className}`} role="banner">
      {backHref ? (
        <a href={backHref} className="back-btn" aria-label="뒤로가기">←</a>
      ) : (
        <button
          type="button"
          className="back-btn"
          aria-label="뒤로가기"
          onClick={() => window.history.back()}
        >
          ←
        </button>
      )}

      {/* 오타 있었던 .top-tittle → .top-title 로 정정 */}
      <span className="top-title">{title}</span>

      {right ? <div className="right-slot">{right}</div> : null}
    </header>
  );
}
