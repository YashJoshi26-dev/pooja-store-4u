// ─── Central API Service ──────────────────────────────────────────────────────
// All API calls go through here — handles base URL, auth headers, errors

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ─── Get token from localStorage ─────────────────────────────────────────────
export function getAdminToken() {
  return localStorage.getItem("adminToken");
}

export function getUserToken() {
  return localStorage.getItem("userToken");
}

// ─── Save / clear admin session ───────────────────────────────────────────────
export function saveAdminSession(token, admin) {
  localStorage.setItem("adminToken", token);
  localStorage.setItem("adminInfo",  JSON.stringify(admin));
}

export function clearAdminSession() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminInfo");
}

// ─── Save / clear user session ────────────────────────────────────────────────
export function saveUserSession(token, user) {
  localStorage.setItem("userToken", token);
  localStorage.setItem("userInfo",  JSON.stringify(user));
}

export function clearUserSession() {
  localStorage.removeItem("userToken");
  localStorage.removeItem("userInfo");
}

// ─── Get stored admin info ────────────────────────────────────────────────────
export function getAdminInfo() {
  try {
    const info = localStorage.getItem("adminInfo");
    return info ? JSON.parse(info) : null;
  } catch {
    return null;
  }
}

// ─── Core fetch wrapper ───────────────────────────────────────────────────────
async function request(endpoint, options = {}) {
  const adminToken = getAdminToken();
  const userToken  = getUserToken();
  const token      = adminToken || userToken;

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data     = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}

// ─── HTTP methods ─────────────────────────────────────────────────────────────
export const api = {
  get:    (endpoint)              => request(endpoint, { method: "GET" }),
  post:   (endpoint, body)        => request(endpoint, { method: "POST",   body: JSON.stringify(body) }),
  put:    (endpoint, body)        => request(endpoint, { method: "PUT",    body: JSON.stringify(body) }),
  delete: (endpoint)              => request(endpoint, { method: "DELETE" }),

  // For file uploads (multipart/form-data — no Content-Type header)
  upload: (endpoint, formData, method = "POST") => {
    const token = getAdminToken() || getUserToken();
    return fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");
      return data;
    });
  },
};

export default api;
