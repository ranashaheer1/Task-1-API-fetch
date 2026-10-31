import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const STORAGE_KEY = 'farstack_local_cart_v1';
const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Cart state (localStorage).
 * Postman/live API has no POST /cart (404). cartService tries the API then
 * mirrors here. Checkout places the order via POST /orders.
 */
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((entry) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variant_id === entry.variant_id);
      if (existing) {
        const nextQty = Math.min(
          existing.quantity + entry.quantity,
          entry.stock_quantity ?? existing.stock_quantity ?? 99
        );
        return prev.map((i) =>
          i.variant_id === entry.variant_id
            ? { ...i, ...entry, quantity: nextQty }
            : i
        );
      }
      return [...prev, entry];
    });
  }, []);

  const updateQuantity = useCallback((variantId, quantity) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.variant_id !== variantId) return i;
          const max = i.stock_quantity ?? 99;
          const qty = Math.max(1, Math.min(Number(quantity) || 1, max));
          return { ...i, quantity: qty };
        })
        .filter((i) => i.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((variantId) => {
    setItems((prev) => prev.filter((i) => i.variant_id !== variantId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.quantity || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, i) => sum + Number(i.unit_price || 0) * Number(i.quantity || 0),
        0
      ),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      count,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clear,
      isLocalOnly: true,
    }),
    [items, count, subtotal, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
