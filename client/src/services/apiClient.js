import axios from 'axios';

// Live Laravel API (Postman base_url → https://ecom.thefarstack.online/api/v1)
// Note: https://ecom.thefarstack.online/api returns 404 — /api/v1 is required.
const baseURL =
  import.meta.env.VITE_API_URL || 'https://ecom.thefarstack.online/api/v1';

const TOKEN_KEY = 'farstack_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

const apiClient = axios.create({
  baseURL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// Attach Sanctum Bearer token from localStorage on every request
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.dispatchEvent(new CustomEvent('farstack:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
