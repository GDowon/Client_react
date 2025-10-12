import '../Css/SearchPage.css';
export const CancelSuccessModal = ({ isOpen, message, onClose, onConfirm }) => {
    if (!isOpen) return null;

    // 성공 메시지인지 판단 (API가 "예약이 취소되었습니다." 메시지만 반환한다고 가정)
    const isSuccess = message === '예약이 취소되었습니다.' || '반납되었습니다.'; 

    const displayMessage = (
        <>
            <p style={{ fontWeight: 'bold' }}>{isSuccess ? message : '❌ 오류 발생'}</p>
            {!isSuccess && <p style={{ marginTop: '10px', color: 'red' }}>{message}</p>}
        </>
    );

    return (
        <div 
            className="modal-backdrop" 
            onClick={onClose}
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 1000 
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
                {displayMessage}
                <div className="popup-buttons" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '20px' }}>
                    <button 
                        onClick={onClose} 
                        style={{ padding: '5px 10px', cursor: 'pointer' }}
                    >
                        확인
                    </button>
                    {isSuccess && (
                        <button 
                            onClick={onConfirm} 
                            style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none' }}
                        >
                            메인페이지 가기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};