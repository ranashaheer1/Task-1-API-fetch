import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Minus, Plus } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import * as productService from '../services/productService';
import * as cartService from '../services/cartService';
import { formatMoney, stockTone, variantLabel } from '../utils/format';
import { getErrorMessage } from '../utils/errors';
import { buildImageCandidates, resolveProductImage } from '../utils/media';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [variantId, setVariantId] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productService.getProduct(id);
        if (cancelled) return;
        if (!res?.success) throw new Error(res?.message || 'Product not found.');
        setProduct(res.data);
        const active =
          (res.data.variants || []).find(
            (v) => v.status === 'active' && v.stock_quantity > 0
          ) ||
          (res.data.variants || [])[0] ||
          null;
        setVariantId(active?.id ?? null);
        setQty(1);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err, 'Product not found.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, isAuthenticated, authLoading]);

  const variants = product?.variants || [];
  const selected = useMemo(
    () => variants.find((v) => v.id === variantId) || null,
    [variants, variantId]
  );
  const maxQty = selected?.stock_quantity ?? 0;
  const canAdd =
    selected &&
    selected.status === 'active' &&
    product?.status === 'active' &&
    maxQty > 0 &&
    qty >= 1 &&
    qty <= maxQty;

  const onAdd = async () => {
    if (!canAdd) return;
    const entry = {
      variant_id: selected.id,
      product_id: product.id,
      product_name: product.name,
      sku: selected.sku,
      variant_name: variantLabel(selected),
      unit_price: selected.price ?? product.base_price,
      quantity: qty,
      stock_quantity: selected.stock_quantity,
      thumbnail_url: resolveProductImage(product),
      thumbnail: product.thumbnail,
      attributes: selected.attributes || {},
    };
    // Functional add-to-cart: try POST /cart (Postman has none → 404), then local cart state
    await cartService.addToCartApi(entry);
    addItem(entry); // CartContext → localStorage; checkout uses POST /orders
    toast.success('Added to cart');
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <EmptyState
          title="Login required"
          description="Product details require authentication."
          action={
            <Link to="/login" className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white">
              Log in
            </Link>
          }
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-2 lg:px-6">
        <div className="skeleton aspect-[4/5] rounded-3xl" />
        <div className="space-y-4">
          <div className="skeleton h-8 w-2/3 rounded" />
          <div className="skeleton h-5 w-1/3 rounded" />
          <div className="skeleton h-24 w-full rounded" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <EmptyState title="Product unavailable" description={error || 'Not found.'} />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-2 lg:px-6">
      <div className="overflow-hidden rounded-3xl border border-ink/8 bg-sand">
        <img
          src={buildImageCandidates(product)[0] || '/no-image.png'}
          alt={product.name}
          className="aspect-[4/5] w-full object-cover"
          onError={(e) => {
            const candidates = buildImageCandidates(product);
            const current = e.currentTarget.getAttribute('src');
            const idx = candidates.indexOf(current);
            if (idx >= 0 && idx < candidates.length - 1) {
              e.currentTarget.src = candidates[idx + 1];
              return;
            }
            if (!current?.includes('no-image')) {
              e.currentTarget.src = '/no-image.svg';
              return;
            }
            e.currentTarget.src = '/no-image.png';
          }}
        />
      </div>

      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-moss uppercase">
          {product.category?.name || 'Product'}
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">{product.name}</h1>
        <p className="mt-3 text-2xl font-semibold text-forest">
          {formatMoney(selected?.price ?? product.base_price)}
        </p>
        <p className="mt-1 text-xs text-ink/50">SKU {selected?.sku || product.sku}</p>

        {product.description ? (
          <p className="mt-6 text-sm leading-relaxed text-ink/70">{product.description}</p>
        ) : null}

        <div className="mt-8">
          <p className="mb-3 text-sm font-semibold">Select variant</p>
          {variants.length ? (
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const disabled = v.status !== 'active' || v.stock_quantity <= 0;
                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={disabled && v.id !== variantId}
                    onClick={() => {
                      setVariantId(v.id);
                      setQty(1);
                    }}
                    className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                      variantId === v.id
                        ? 'border-sea bg-sea/10 text-ink'
                        : 'border-ink/10 bg-white hover:border-ink/25'
                    } ${disabled ? 'opacity-50' : ''}`}
                  >
                    <span className="block font-medium">{variantLabel(v)}</span>
                    <span className="text-xs text-ink/55">
                      {formatMoney(v.price)} · {v.stock_status_label || v.stock_status}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-ink/60">No variants available for this product.</p>
          )}
        </div>

        {selected ? (
          <p className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${stockTone(selected.stock_status)}`}>
            {selected.stock_status_label || selected.stock_status} · {selected.stock_quantity} available
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-4">
          <div className="inline-flex items-center rounded-full border border-ink/10 bg-white">
            <button
              type="button"
              className="p-3"
              aria-label="Decrease quantity"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min={1}
              max={Math.max(maxQty, 1)}
              value={qty}
              onChange={(e) => {
                const next = Number(e.target.value) || 1;
                setQty(Math.max(1, Math.min(next, Math.max(maxQty, 1))));
              }}
              className="w-14 border-x border-ink/10 bg-transparent py-2 text-center text-sm outline-none"
            />
            <button
              type="button"
              className="p-3"
              aria-label="Increase quantity"
              onClick={() => setQty((q) => Math.min(Math.max(maxQty, 1), q + 1))}
              disabled={qty >= maxQty}
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            type="button"
            disabled={!canAdd}
            onClick={onAdd}
            className="rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition hover:bg-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add to cart
          </button>
        </div>
        <p className="mt-3 text-xs text-ink/50">
          Cart is stored locally in your browser. Checkout creates a real API order.
        </p>
      </div>
    </div>
  );
}
