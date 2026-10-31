# Farstack E-Commerce (Client → Live Laravel API)

React storefront in `client/` talking **directly** to the live Management API.

## API base

```
VITE_API_URL=https://ecom.thefarstack.online/api/v1
```

`https://ecom.thefarstack.online/api` returns **404**. Postman `base_url` is `/api/v1`.

Docs: `API.docx`, `postman_collection.json`

## Run (restart after .env changes)

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

Demo login: `staff@example.com` / `password` or `admin@example.com` / `password`

## Functional flows

| Flow | API |
|------|-----|
| Login | `POST /auth/login` → token in `localStorage` (`farstack_token`) |
| Register | `POST /auth/register` (not in Postman — live 404) |
| Products | `GET /products` → existing `ProductCard` |
| Add to cart | Tries `POST /cart` (404) → localStorage; checkout uses orders |
| Checkout | `POST /orders` |
| My Orders | `GET /orders`, `GET /orders/{id}` |

Axios client: `client/src/services/apiClient.js` (Bearer interceptor).

Images: relative paths like `products/abc.jpg` resolve to  
`https://ecom.thefarstack.online/storage/...` then without `/storage/`.

No local Express `server/` — removed; use the live Laravel backend only.
