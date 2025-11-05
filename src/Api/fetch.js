export const BASE_URL = 'https://mungo.n-e.kr';

// 1. 인증 헤더 가져오기 (공통)
export const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 2. 범용 JSON fetch 함수 (공통)
export async function fetchJSON(
  path,
  { method = 'GET', body, auth = false, headers = {}, timeoutMs = 8000 } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort('timeout'), timeoutMs);

  const baseHeaders = {
    Accept: 'application/json',
    ...(auth ? getAuthHeaders() : {}),
    ...headers,
  };
  if (method !== 'GET' || body != null) {
    baseHeaders['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: baseHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }

  const ct = res.headers.get('content-type') || '';
  const text = await res.text();

  if (!ct.includes('application/json')) {
    throw new Error(
      `Expected JSON but got ${ct} ${res.status} at ${res.url}. Body: ${text.slice(0, 120)}`
    );
  }

  const json = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = json?.detail || json?.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.payload = json;
    throw err;
  }
  return json;
}