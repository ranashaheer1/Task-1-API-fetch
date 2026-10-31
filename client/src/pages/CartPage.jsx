import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2 } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { useCart } from '../context/CartContext';
import { formatMoney } from '../utils/format';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, count } = useCart();

  if (!items.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <EmptyState
          title="Your cart is empty"
          description="Cart items are stored locally in this browser until checkout creates an API order."
          action={
            <Link to="/shop" className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white">
              Continue shopping
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
      <div className="mb-2 inline-flex rounded-full bg-sand px-3 py-1 text-[11px] font-semibold tracking-wide text-ink/60 uppercase">
        Local cart · not server-synced
      </div>
      <h1 className="font-display text-4xl text-ink">Cart ({count})</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.variant_id}
              className="flex flex-col gap-4 rounded-2xl border border-ink/8 bg-white/70 p-4 sm:flex-row sm:items-center"
            >
              <div className="h-24 w-24 overflow-hidden rounded-xl bg-sand">
                {item.thumbnail_url ? (
                  <img src={item.thumbnail_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center font-display text-forest/30">FS</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/products/${item.product_id}`} className="font-semibold hover:text-sea">
                  {item.product_name}
                </Link>
                <p className="text-xs text-ink/55">
                  {item.variant_name} · {item.sku}
                </p>
                <p className="mt-1 text-sm font-medium">{formatMoney(item.unit_price)}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center rounded-full border border-ink/10 bg-white">
                  <button
                    type="button"
                    className="p-2"
                    onClick={() => updateQuantity(item.variant_id, item.quantity - 1)}
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <button
                    type="button"
                    className="p-2"
                    onClick={() => updateQuantity(item.variant_id, item.quantity + 1)}
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <p className="w-20 text-right text-sm font-semibold">
                  {formatMoney(Number(item.unit_price) * item.quantity)}
                </p>
                <button
                  type="button"
                  className="rounded-full p-2 text-danger hover:bg-danger/10"
                  aria-label="Remove"
                  onClick={() => removeItem(item.variant_id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-2xl border border-ink/8 bg-white/80 p-5">
          <h2 className="font-display text-xl">Summary</h2>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-ink/60">Subtotal</span>
            <span className="font-semibold">{formatMoney(subtotal)}</span>
          </div>
          <p className="mt-2 text-xs text-ink/50">
            Shipping and discounts are applied when the order is created via the API.
          </p>
          <Link
            to="/checkout"
            className="mt-6 flex w-full items-center justify-center rounded-full bg-forest py-3 text-sm font-semibold text-white hover:bg-ink"
          >
            Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
