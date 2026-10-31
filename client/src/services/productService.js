import apiClient from './apiClient';

/** API: GET /products — list with search/sort/pagination (Postman: Products → List) */
export async function listProducts(params = {}) {
  const { data } = await apiClient.get('/products', { params });
  return data;
}

/** API: GET /products/{id} — product + variants (Postman: Products → Get product) */
export async function getProduct(id) {
  const { data } = await apiClient.get(`/products/${id}`);
  return data;
}

/** API: GET /products/{id}/variants (Postman: Variants → List) */
export async function listProductVariants(productId, params = {}) {
  const { data } = await apiClient.get(`/products/${productId}/variants`, {
    params,
  });
  return data;
}
