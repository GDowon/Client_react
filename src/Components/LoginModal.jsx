const LoginRequiredModal = ({ isOpen, onClose, onLoginNavigate }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="modal-backdrop" 
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 1500 // 가장 높은 z-index
            }}
        >
            <div 
                className="modal-content"
                style={{
                    backgroundColor: 'white', padding: '20px', borderRadius: '8px', 
                    textAlign: 'center', maxWidth: '300px' 
                }}
                onClick={e => e.stopPropagation()}
            >
                <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                    로그인이 필요한 서비스입니다.
                </p>
                <p style={{ marginBottom: '20px' }}>
                    대출 및 예약은 로그인 후 이용해 주세요.
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '10px' }}>
                    <button 
                        onClick={onClose} 
                        style={{ padding: '8px 15px', cursor: 'pointer', border: '1px solid #ccc', color:'black',backgroundColor: 'white' }}
                    >
                        닫기
                    </button>
                    <button 
                        onClick={onLoginNavigate} 
                        style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        로그인
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginRequiredModal; 

