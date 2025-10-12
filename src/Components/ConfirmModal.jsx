import '../Css/SearchPage.css';
import '../Css/toolkit.css';

export const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="modal-backdrop"
            // 모달 배경 클릭 시 취소되도록 onCancel을 추가했습니다.
            onClick={onCancel}
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
                    // CancelSuccessModal과 유사한 기본 스타일을 적용
                    backgroundColor: 'white', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    textAlign: 'center', 
                    maxWidth: '300px', // CancelSuccessModal과 유사하게 조정
                }}
                // 모달 내용 클릭 시 배경 클릭 이벤트가 전파되지 않도록 설정
                onClick={e => e.stopPropagation()}
            >
                {/* 메시지 내용 */}
                <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                    {message}
                </p> 

                {/* 버튼 그룹 */}
                <div 
                    className="popup-buttons" 
                    style={{ 
                        display: 'flex', 
                        justifyContent: 'center', // 중앙 정렬로 변경 (CancelSuccessModal 참고)
                        gap: '10px', 
                        marginTop: '20px',
                    }}
                > 
                    {/* 취소 버튼 (왼쪽) */}
                    <button 
                        onClick={onCancel} 
                        style={{ 
                            padding: '5px 10px', 
                            cursor: 'pointer',
                            backgroundColor: 'white', // 기본 흰색 배경
                            color:'black', 
                            border: '1px solid #ccc',
                            // flex 스타일 제거 (justifyContent: center로 대체)
                        }}
                    >
                        취소
                    </button>
                    
                    {/* 확인 버튼 (오른쪽) */}
                    <button 
                        onClick={onConfirm} 
                        style={{ 
                            padding: '5px 10px', 
                            cursor: 'pointer', 
                            backgroundColor: '#007bff', // CancelSuccessModal 확인 버튼 색상 참고
                            color: 'white', 
                            border: 'none', 
                            // flex 스타일 제거
                        }}
                    >
                        확인
                    </button>
                </div>
            </div>
        </div>
    );
};