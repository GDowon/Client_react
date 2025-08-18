import { Routes, Route } from 'react-router-dom';
import './Css/font.css'; 
import './Css/toolkit.css';

import StatusPage from './Components/StatusPage';

import MainPage from './Pages/MainPage';
import NoticePage from './Pages/NoticePage';

import LoginPage from './Pages/Login/LoginPage';
import ResetPassword from './Pages/Login/ResetPassword';
import FindId from './Pages/Login/FindId';
import SignUp from './Pages/Login/SignUp';


// 메인페이지, 현재 대출중 서버에서 각기 다른 데이터를 불러오는 가상의 함수들
const fetchBorrowData = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve([
      { title: '도서1', info: '대출일: 24-08-11' },
      { title: '도서2', info: '대출일: 24-07-29' }
    ]), 500);
  });
};

const fetchOverdueData = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve([
      { title: '도서B', info: '반납 예정일: 24-08-01' }
    ]), 500);
  });
};

const fetchReserveData = () => {
  return new Promise(resolve => {
    setTimeout(() => resolve([
      { title: '도서A', info: '예약 순위: 1' }
    ]), 500);
  });
};

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<MainPage />} 
        />
        
        {/* StatusPage를 재사용하여 각기 다른 페이지를 구성 */}
        <Route 
          path="/current_borrow" 
          element={<StatusPage title="현재 대출 중인 도서" fetchData={fetchBorrowData} />} 
        />
        <Route 
          path="/current_overdue" 
          element={<StatusPage title="현재 연체 중인 도서" fetchData={fetchOverdueData} />} 
        />
        <Route 
          path="/current_reserve" 
          element={<StatusPage title="현재 예약 중인 도서" fetchData={fetchReserveData} />} 
        />

        <Route path="/NoticePage" element={<NoticePage />} 
        />

        <Route path="/LoginPage" element={<LoginPage />} 
        />
        <Route path="/ResetPassword" element={<ResetPassword/>} 
        />
        <Route path="/FindId" element={<FindId/>} 
        />
        <Route path="/SignUp" element={<SignUp/>} 
        />


      </Routes>
    </div>
  );
}

export default App;