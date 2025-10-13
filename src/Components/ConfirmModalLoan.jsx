const ConfirmModalLoan = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="modal-backdrop"
            style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: 'rgba(0,0,0,0.5)', 
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                zIndex: 1100 
            }}
        >
            <div 
                className="modal-content"
                style={{
                    backgroundColor: 'white', padding: '25px', borderRadius: '8px', 
                    textAlign: 'center', maxWidth: '350px'
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* 제목 (도서 제목)과 메시지 */}
                <p style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: '15px' }}>{message}</p>
                <p>대출을 진행하시겠습니까?</p>

                <div className="popup-buttons" style={{ display: 'flex', justifyContent: 'space-around', gap: '10px', marginTop: '25px' }}>
                    <button 
                        onClick={onCancel} 
                        style={{ flex: 1, padding: '8px 15px', cursor: 'pointer',color:'black', backgroundColor: 'white', border: '1px solid #ccc' }}
                    >
                        아니요 (취소)
                    </button>
                    <button 
                        onClick={onConfirm} 
                        style={{ flex: 1, padding: '8px 15px', cursor: 'pointer', backgroundColor: '#0095ff', color: 'white', border: 'none' }}
                    >
                        예 (확인)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModalLoan;