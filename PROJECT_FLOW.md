# Farstack project flow (from your 3 sources)

Sources of truth:

1. `postman_collection.json`
2. `API.docx`
3. Live base: `https://ecom.thefarstack.online/api/v1`

---

## How we started (steps)

1. Read Postman + API.docx — confirmed Management API (staff/admin), Sanctum Bearer auth, envelope `{ success, message, data, meta? }`.
2. Probed live host — `/api` = 404; `/api/v1/auth/login` = 200. Set `VITE_API_URL` to `/api/v1`.
3. Removed local Express `server/` — browser talks to Laravel directly (CORS allows `*`).
4. Built `apiClient.js` — axios + `Authorization: Bearer` from `localStorage.farstack_token`.
5. Wired pages: Login → Products → Cart (local) → Checkout `POST /orders` → Orders list/detail.
6. Debugged images — live API returns `thumbnail: null` for all products (backend has no uploads).

---

## Runtime flow

```
client/.env  (VITE_API_URL)
    ↓
services/apiClient.js  (axios baseURL + Bearer interceptor)
    ↓
AuthContext + authService  POST /auth/login → save token → GET /auth/me
    ↓
productService  GET /products → ProductCard / Shop / Home
    ↓
cartService + CartContext  try POST /cart (404) → localStorage cart
    ↓
orderService  POST /orders (checkout) → GET /orders (My Orders)
```

| Layer | File | Role |
|-------|------|------|
| Env | `client/.env` | Live API base URL |
| HTTP | `src/services/apiClient.js` | Axios + token |
| Auth | `authService.js` + `AuthContext.jsx` | Login/logout/me/register attempt |
| Products | `productService.js` | List + detail |
| Cart | `cartService.js` + `CartContext.jsx` | Add/update/remove (local) |
| Orders | `orderService.js` | Place + list + detail |
| Images | `utils/media.js` + `ProductCard.jsx` | Resolve URL or `/no-image.svg` |

---

## Postman features vs this project

### Implemented in frontend

| Postman | Used in |
|---------|---------|
| POST /auth/login | LoginPage, authService |
| POST /auth/logout | AuthContext logout |
| GET /auth/me | AuthContext refresh |
| GET /products | ShopPage, HomePage |
| GET /products/{id} | ProductDetailPage |
| GET /products/{id}/variants | productService (available) |
| GET /categories | CategoriesPage, HomePage, Shop filters |
| POST /orders | CheckoutPage |
| GET /orders | OrdersPage |
| GET /orders/{id} | OrderDetailPage |
| POST /orders/{id}/confirm | OrderDetailPage |
| POST /orders/{id}/cancel | OrderDetailPage |
| PATCH /orders/{id}/status | OrderDetailPage |
| PATCH /orders/{id}/payment-status | OrderDetailPage |
| GET /orders/{id}/history | OrderDetailPage |
| GET /dashboard/top-products | HomePage trending |

### Remaining / not storefront UI (API exists in Postman)

- Dashboard overview/sales/top-variants charts
- Admin: create/update/delete categories, products, variants
- Inventory list / low-stock / out-of-stock
- Adjust stock + stock history
- Bulk order status update
- Product multipart thumbnail upload

### Not in Postman / live 404

- POST /auth/register
- POST /cart (any cart routes)
- Wishlist, payment gateway, password reset
