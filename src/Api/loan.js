import { fetchJSON } from './fetch.js'; 

/**
 * 도서 대출을 요청하는 함수
 * @param {string | number} bookId - 대출할 도서의 등록번호 (API에서 'code'로 사용됨)
 * @returns {Promise<any>} 성공 시 API 응답 JSON, 실패 시 Error 발생 (오류 메시지 포함)
 */
export async function submitLoanRequest(bookId) {
  try {
    // 대출 요청 API 호출 (POST /rentals/)
    const response = await fetchJSON(`/rentals/`, { 
      method: 'POST', 
      auth: true, // 인증 헤더 사용
      body: { code: bookId } 
    });

    // 성공적으로 처리되었을 경우
    return response; 

  } catch (err) {
    // 1. 콘솔에 자세한 오류 로그를 남깁니다.
    console.error('[RENT] API fail:', err);
    
    let errorMessage = '대출 중 알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    
    // 2. 모달에 표시할 사용자 친화적인 메시지를 만듭니다.
    // 이전 LoanLoan.jsx 코드의 오류 처리 로직을 따릅니다.
    if (err.payload) {
        if (Array.isArray(err.payload.message)) {
            // 예: "대출 한도를 초과했습니다."
            errorMessage = '❌ ' + err.payload.message[0];
        } else if (err.payload.detail) {
            // 예: "인증 실패" (fetchJSON 내부에서 detail 필드를 throw 했을 경우)
            errorMessage = '❌ ' + err.payload.detail; 
        } else if (err.payload.message) {
            errorMessage = '❌ ' + err.payload.message;
        }
    } else if (err.message) {
        // fetchJSON에서 발생시킨 timeout 등의 기본 에러 메시지
        errorMessage = '❌ ' + err.message; 
    } else if (err.status) {
        // 기타 HTTP 에러 처리
        errorMessage = '❌ ' + `HTTP ${err.status} 오류가 발생했습니다.`;
    }

    // 3. 통일된 에러 메시지를 담아 새로운 Error를 throw 합니다.
    const finalError = new Error(errorMessage);
    finalError.status = err.status;
    throw finalError; 
  }
}