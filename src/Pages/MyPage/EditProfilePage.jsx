import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../Css/MyPage.css';
import { getMyPage, updateMyPage } from '../../Api/user';

export default function EditProfilePage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');           // 예: 010-1234-5678
  const [userType, setUserType] = useState('');     // 예: 재학생
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const me = await getMyPage();
        setName(me.name ?? '');
        setPhone(me.phone ?? '');
        setUserType(me.userType ?? me.user_type ?? '');
      } catch (e) {
        console.warn(e);
        alert('정보를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const phoneOk = (v) => /^\d{11}$/.test(v);

  const onSave = async (e) => {
    e?.preventDefault?.();

    if (!name?.trim() || !phone?.trim() || !userType?.trim()) {
      return alert('이름, 전화번호, 회원 구분을 모두 입력해주세요.');
    }
    if (!phoneOk(phone.trim())) {
      return alert('전화번호 형식이 올바르지 않습니다. 예) 01012345678');
    }
    if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return alert('비밀번호 변경은 현재/새 비밀번호를 모두 입력해야 합니다.');
    }

    try {
      setSaving(true);
      const res = await updateMyPage({
        name: name.trim(),
        phone: phone.trim(),
        user_type: userType.trim(),
        current_password: currentPassword || undefined,
        password: newPassword || undefined,
      });
      // 성공: 스펙상 { message, data } 가 올 수 있음
      alert(res?.message || '회원정보가 수정되었습니다.');
      setCurrentPassword('');
      setNewPassword('');
      // 필요하면 마이페이지로 이동
      // nav('/MyPage', { replace: true });
    } catch (e) {
      console.error(e);
      alert(e.message || '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mypage-container">불러오는 중…</div>;

  return (
    <div className="mypage-container">
      <div className="top-bar">
              <Link to="/MyPage" className="back-btn" aria-label="뒤로가기">←</Link>
              <span className="top-tittle">회원정보수정</span>
            </div>

      <form className="edit-form" onSubmit={onSave}>
        <label htmlFor="name">이름</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
        />

        <label htmlFor="phone">전화번호</label>
        <input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01012345678"
        />
        <small>형식 예: 01012345678</small>

        <label htmlFor="userType">회원 구분</label>
        <select id="userType" value={userType} onChange={(e) => setUserType(e.target.value)}>
          <option value="">선택</option>
          <option value="재학생">재학생</option>
          <option value="졸업생">졸업생</option>
          <option value="교직원">교직원</option>
        </select>

        <hr />

        <label htmlFor="currPw">현재 비밀번호(변경 시)</label>
        <input
          id="currPw"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <label htmlFor="newPw">새 비밀번호(변경 시, 최소 8자)</label>
        <input
          id="newPw"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button type="submit" disabled={saving}>
          {saving ? '저장 중…' : '저장하기'}
        </button>
      </form>
    </div>
  );
}