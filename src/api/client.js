const BASE = process.env.REACT_APP_API_BASE_URL || (window.ENV && window.ENV.API_BASE_URL) || "https://mungo.p-e.kr";
const REFRESH_ENDPOINT = (window.REFRESH_ENDPOINT) || "/users/token/refresh/";

async function request(path, { method="GET", body, headers={}, retry=true } = {}){
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if(res.status === 401 && retry){
    const rt = localStorage.getItem("refresh_token");
    if(rt){
      try{
        const rf = await fetch(`${BASE}${REFRESH_ENDPOINT}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: rt })
        });
        if(rf.ok){
          const data = await rf.json();
          const newToken = data.access || data.accessToken || data.token;
          if(newToken) localStorage.setItem("access_token", newToken);
          return request(path, { method, body, headers, retry:false });
        }
      }catch(e){}
    }
    throw new Error("Unauthorized");
  }
  if(!res.ok){
    let msg = await res.text();
    throw new Error(msg || `HTTP ${res.status}`);
  }
  const text = await res.text();
  try{ return JSON.parse(text); }catch{ return text; }
}

export const api = { request, BASE };