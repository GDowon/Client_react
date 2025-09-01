import { Link } from 'react-router-dom';

import navigation1 from '../Images/navigation1.png';
import navigation2 from '../Images/navigation2.png';
import navigation3 from '../Images/navigation3.png';


function Footer() {
  return (
    <footer className="bottom-nav">
      <Link className="nav-item" to="/LoanChoice">
        <img src={navigation1} alt="대출반납 아이콘" />
        <span>대출·반납</span>
      </Link>
      
      <div className="nav-center">
        <Link to="/">
          <img src={navigation2} alt="문중문고 아이콘" className="nav-center-icon" />
        </Link>
      </div>

      <Link className="nav-item" to="/MyPage">
        <img src={navigation3} alt="마이페이지 아이콘" />
        <span>마이페이지</span>
      </Link>
    </footer>
  );
}

export default Footer;