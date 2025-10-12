import React, { useState, useEffect } from 'react';
import '../Css/StatusPage.css';

function StatusPage({ title, fetchData }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchData().then(fetchedData => {
      setData(fetchedData);
      setLoading(false);
    });
  }, [fetchData]);

  return (
    <div className="status-container">
      <div className="section">
        <h1>{title}</h1>
        
        {loading ? (
          <p>데이터를 불러오는 중...</p>
        ) : (
          data.length > 0 ? (
            data.map((item, index) => (
              <React.Fragment key={index}>
                <h2>{item.title}</h2>
                <p>{item.info}</p>
              </React.Fragment>
            ))
          ) : (
            <p>해당 내역이 없습니다.</p>
          )
        )}
      </div>
    </div>
  );
}

export default StatusPage;