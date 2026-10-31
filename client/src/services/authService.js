import apiClient, { setToken, clearToken } from './apiClient';

/** API: POST /auth/login — returns Sanctum token (Postman: Auth → Login) */
export async function login({ email, password, device_name = 'farstack-web' }) {
  const { data } = await apiClient.post('/auth/login', {
    email,
    password,
    device_name,
  });
  // Save bearer token for interceptor
  if (data?.success && data?.data?.token) {
    setToken(data.data.token);
  }
  return data;
}

/** API: POST /auth/logout — revokes current token (Postman: Cleanup → Logout) */
export async function logout() {
  try {
    const { data } = await apiClient.post('/auth/logout');
    return data;
  } finally {
    clearToken();
  }
}

/** API: GET /auth/me — current user (Postman: Auth → Me) */
export async function me() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

/**
 * API: POST /auth/register — NOT in Postman / live API (returns 404).
 * Kept so the Register flow can demonstrate the attempt and surface the API error.
 */
export async function register(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  if (data?.success && data?.data?.token) {
    setToken(data.data.token);
  }
  return data;
}
