import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import '../Css/GuidePage.css';

import Footer from '../Components/Footer';


// 각 탭에 해당하는 콘텐츠를 작은 컴포넌트로 분리하면 코드가 깔끔해집니다.
const UseContent = () => (
  <div>
    <h2>문중문고 이용안내</h2>
    <p>여기에 이용안내 내용이 들어갑니다.</p>
  </div>
);

const NoticeContent = () => (
  <div>
    <h2>공지사항</h2>
    <p>공지사항 내용</p>
  </div>
);

const SitemapContent = () => (
  <div>
    <h2>사이트맵</h2>
    <p>사이트맵 내용</p>
  </div>
);

const TermsContent = () => (
  <div>
    <h2>이용약관 및 개인정보처리방침</h2>
    <p>약관 내용</p>
  </div>
);


function GuidePage() {
  // 1. 현재 활성화된 탭을 상태로 관리 ('use'를 기본값으로 설정)
  const [activeTab, setActiveTab] = useState('use');
  const navigate = useNavigate();

  // 2. 탭 이름과 콘텐츠 컴포넌트를 짝지어 맵으로 관리
  const contentMap = {
    use: <UseContent />,
    notice: <NoticeContent />,
    sitemap: <SitemapContent />,
    terms: <TermsContent />,
  };

  return (
    <div>
      <div className="top-bar">
        <div className="back-btn" onClick={() => navigate(-1)}>←</div>
        <h1>이용안내</h1>
      </div>

      <div className="guide-buttons">
        {/* 버튼 클릭 시 activeTab 상태를 변경 */}
        {/* activeTab 상태에 따라 'active' 클래스를 동적으로 부여 */}
        <button 
          className={activeTab === 'use' ? 'active' : ''} 
          onClick={() => setActiveTab('use')}
        >
          문중문고<br />이용안내
        </button>
        <button 
          className={activeTab === 'notice' ? 'active' : ''} 
          onClick={() => setActiveTab('notice')}
        >
          공지사항
        </button>
        <button 
          className={activeTab === 'sitemap' ? 'active' : ''} 
          onClick={() => setActiveTab('sitemap')}
        >
          사이트맵
        </button>
        <button 
          className={activeTab === 'terms' ? 'active' : ''} 
          onClick={() => setActiveTab('terms')}
        >
          이용약관 및 개인정보처리방침
        </button>
      </div>

      <div className="guide-content">
        {/* 3. 현재 activeTab 상태에 맞는 콘텐츠를 렌더링 */}
        {contentMap[activeTab]}
      </div>

      <Footer/>
    </div>
  );
}

export default GuidePage;