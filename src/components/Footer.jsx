import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bottom-nav">
      <Link className="nav-item" to="/loan">
        <img src="../Images/navigation1.png" alt="대출반납 아이콘" />
        <span>대출·반납</span>
      </Link>
      
      <div className="nav-center">
        <Link to="/">
          <img src="../Images/navigation2.png" alt="문중문고 아이콘" className="nav-center-icon" />
        </Link>
      </div>

      <Link className="nav-item" to="/mypage">
        <img src="../Images/navigation3.png" alt="마이페이지 아이콘" />
        <span>마이페이지</span>
      </Link>
    </footer>
  );
}

export default Footer;