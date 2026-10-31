import apiClient from './apiClient';

/** API: GET /categories (Postman: Categories → List) */
export async function listCategories(params = {}) {
  const { data } = await apiClient.get('/categories', { params });
  return data;
}
