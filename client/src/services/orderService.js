import apiClient from './apiClient';

/** API: GET /orders — My Orders list (Postman: Orders → List) */
export async function listOrders(params = {}) {
  const { data } = await apiClient.get('/orders', { params });
  return data;
}

/** API: GET /orders/{id} (Postman: Orders → Get order) */
export async function getOrder(id) {
  const { data } = await apiClient.get(`/orders/${id}`);
  return data;
}

/**
 * API: POST /orders — Checkout / Place Order (Postman: Orders → Create order)
 * Body: customer_name, customer_email, customer_phone?, discount?, shipping_cost?, notes?, items[{variant_id, quantity}]
 */
export async function createOrder(payload) {
  const { data } = await apiClient.post('/orders', payload);
  return data;
}

/** API: POST /orders/{id}/confirm */
export async function confirmOrder(id, payload = {}) {
  const { data } = await apiClient.post(`/orders/${id}/confirm`, payload);
  return data;
}

/** API: POST /orders/{id}/cancel */
export async function cancelOrder(id, payload = {}) {
  const { data } = await apiClient.post(`/orders/${id}/cancel`, payload);
  return data;
}

/** API: PATCH /orders/{id}/status */
export async function updateOrderStatus(id, payload) {
  const { data } = await apiClient.patch(`/orders/${id}/status`, payload);
  return data;
}

/** API: PATCH /orders/{id}/payment-status */
export async function updatePaymentStatus(id, payload) {
  const { data } = await apiClient.patch(`/orders/${id}/payment-status`, payload);
  return data;
}

/** API: GET /orders/{id}/history */
export async function getOrderHistory(id, params = {}) {
  const { data } = await apiClient.get(`/orders/${id}/history`, { params });
  return data;
}
