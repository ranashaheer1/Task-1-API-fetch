import apiClient from './apiClient';

/** API: GET /dashboard/overview */
export async function getOverview(params = {}) {
  const { data } = await apiClient.get('/dashboard/overview', { params });
  return data;
}

/** API: GET /dashboard/top-products */
export async function getTopProducts(params = {}) {
  const { data } = await apiClient.get('/dashboard/top-products', { params });
  return data;
}
