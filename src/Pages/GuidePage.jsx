import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import '../Css/GuidePage.css';
import info1 from '../Images/info1.png';
import info2 from '../Images/info2.png';
import info3 from '../Images/info3.png';
import info4 from '../Images/info4.png';
import info5 from '../Images/info5.png';

import Footer from '../Components/Footer';


// 각 탭에 해당하는 콘텐츠를 작은 컴포넌트로 분리하면 코드가 깔끔해집니다.
const UseContent = () => {
  const infoImages = [info1, info2, info3, info4, info5]; // 이미지 배열 생성
return (
    <div>
      {infoImages.map((imageSrc, index) => (
        <img 
          key={index} 
          src={imageSrc} 
          alt={`이용안내 이미지 ${index + 1}`} 
          style={{ 
            maxWidth: '100%', // 이미지가 부모 컨테이너를 넘지 않도록
            height: 'auto',  // 비율 유지
            display: 'block', // 블록 요소로 만들어 마진 적용 용이
            marginBottom: '15px' // 이미지 아래 여백
          }} 
        />
      ))}
    </div>
  );
};

const NoticeContent = () => (
  <div>
    <h2>공지사항</h2>
    <p>공지사항 내용</p>
  </div>
);

const SitemapContent = () => (
  <div>
    <h2>사이트맵</h2>
    <p>추후 업데이트 될 예정입니다!</p>
  </div>
);

const TermsContent = () => (
  <div>
    <h2>이용약관 및 개인정보처리방침</h2>
    <p>약관 내용은 국가법령정보센터의 표준 개인정보 보호지침을 따릅니다. 국가법령정보센터의 서버 복구 이후 개재 예정.</p>
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
          문중문고 이용안내
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