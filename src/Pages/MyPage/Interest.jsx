import { useEffect, useState } from 'react';

function loadMyBooksLocal() {
  try { return JSON.parse(localStorage.getItem('myBooks') || '[]'); } catch { return []; }
}
function saveMyBooksLocal(list) {
  localStorage.setItem('myBooks', JSON.stringify(list));
}

export default function Interest() {
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(loadMyBooksLocal());
  }, []);

  const onRemove = (id) => {
    const cur = loadMyBooksLocal().filter(b => b.id !== id);
    saveMyBooksLocal(cur);
    setList(cur);
  };

  const loggedIn = !!localStorage.getItem('accessToken');

  return (
    <div className="container" style={{ padding:16 }}>
      <h2>내책이에요 (게스트 목록)</h2>
      {loggedIn ? (
        <p style={{ color:'#666' }}>※ 로그인 상태입니다. 이 페이지는 게스트용 로컬 목록입니다.</p>
      ) : (
        <p style={{ color:'#666' }}>※ 로그인 없이 사용하는 중입니다. 이 목록은 이 브라우저에만 저장됩니다.</p>
      )}

      {list.length === 0 ? (
        <p>담긴 책이 없습니다. 검색 화면에서 하트를 눌러 담아보세요.</p>
      ) : (
        <ul style={{ paddingLeft:16 }}>
          {list.map(b => (
            <li key={b.id} style={{ margin:'8px 0' }}>
              {b.cover && <img src={b.cover} alt={b.title} width={40} style={{ verticalAlign:'middle', marginRight:8 }} />}
              <strong>{b.title}</strong>{b.author ? <span> · {b.author}</span> : null}
              <button onClick={() => onRemove(b.id)} style={{ marginLeft:8 }}>제거</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
