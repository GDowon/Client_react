import { api } from './client';

export async function getMyPage(){
  const data = await api.request('/users/mypage/');
  return {
    id: data.id,
    username: data.username,
    userType: data.user_type || data.userType,
    name: data.name,
    phone: data.phone,
  };
}

/** PUT /users/mypage/ — 전체 갱신
 * 반드시 name, phone, user_type 포함.
 * 비밀번호 변경 시 current_password + password 추가.
 */
export async function updateMyPage({ name, phone, user_type, current_password, password }){
  const body = { name, phone, user_type };
  if (current_password && password){
    body.current_password = current_password;
    body.password = password;
  }
  // client.request 는 BASE 자동 부착 + 토큰 헤더 추가 + 401 재시도 로직 포함
  return await api.request('/users/mypage/', {
    method: 'PUT',
    body,
  });
}