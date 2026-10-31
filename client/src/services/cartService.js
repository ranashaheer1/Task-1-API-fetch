import apiClient from './apiClient';

/**
 * CART NOTE (Postman + live API verified):
 * There is NO /cart endpoint on https://ecom.thefarstack.online/api/v1
 * (GET/POST /cart, /carts, /cart/items all return 404).
 *
 * Functional Add-to-Cart therefore:
 * 1) Tries POST /cart (in case Sir's API is extended later)
 * 2) Falls back to localStorage cart used by CartContext
 * Checkout still places a real order via POST /orders (orderService.createOrder).
 */

const LOCAL_CART_KEY = 'farstack_local_cart_v1';

export function readLocalCart() {
  try {
    const raw = localStorage.getItem(LOCAL_CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeLocalCart(items) {
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

/** Attempt live cart API; returns { ok, source, data?, error? } */
export async function addToCartApi(item) {
  // API: POST /cart — not present in postman_collection.json (expected 404)
  try {
    const { data, status } = await apiClient.post('/cart', {
      variant_id: item.variant_id,
      quantity: item.quantity,
      product_id: item.product_id,
    });
    return { ok: true, source: 'api', status, data };
  } catch (error) {
    return {
      ok: false,
      source: 'api',
      status: error.response?.status,
      error,
    };
  }
}

/** Functional add-to-cart used by Product Detail */
export async function addToCart(item) {
  const apiResult = await addToCartApi(item);

  // Always mirror into local cart so Checkout → POST /orders works
  const prev = readLocalCart();
  const existing = prev.find((i) => i.variant_id === item.variant_id);
  let next;
  if (existing) {
    const max = item.stock_quantity ?? existing.stock_quantity ?? 99;
    next = prev.map((i) =>
      i.variant_id === item.variant_id
        ? {
            ...i,
            ...item,
            quantity: Math.min(existing.quantity + item.quantity, max),
          }
        : i
    );
  } else {
    next = [...prev, item];
  }
  writeLocalCart(next);

  return {
    items: next,
    apiAvailable: apiResult.ok,
    apiStatus: apiResult.status,
    message: apiResult.ok
      ? 'Added via POST /cart'
      : 'No cart API in Postman — saved locally; checkout uses POST /orders',
  };
}
