// src/Components/RegisterInputForm.jsx

import React, { useState } from 'react';

const PREFIX = 'MJ';

function LoanForm({ onSubmit, buttonText, caption }) {
  const [registerNumber, setRegisterNumber] = useState(PREFIX);

  const handleInputChange = (e) => {
    let value = e.target.value;
    if (!value.startsWith(PREFIX)) value = PREFIX;
    let suffix = value.slice(PREFIX.length).replace(/\D/g, '');
    if (suffix.length > 6) suffix = suffix.slice(0, 6);
    setRegisterNumber(PREFIX + suffix);
  };

  const handleKeyDown = (e) => {
    if (e.target.selectionStart <= PREFIX.length && e.key === 'Backspace') {
      e.preventDefault();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const suffix = registerNumber.slice(PREFIX.length);
    if (/^\d{6}$/.test(suffix)) {
      onSubmit(registerNumber); // 부모로부터 받은 onSubmit 함수를 호출
    } else {
      alert('등록번호 숫자 6자리를 정확히 입력해주세요.');
    }
  };

  return (
    <>
      <form id="loan-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            id="registerNumber"
            className="number-input"
            value={registerNumber}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            required
          />
          <p className="input-guide">예시: MJ123456 (숫자 6자리만 입력)</p>
        </div>
        <button type="submit" className="submit-btn">{buttonText}</button>
      </form>
      <div className="caption">{caption}</div>
    </>
  );
}

export default LoanForm;