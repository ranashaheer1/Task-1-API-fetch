import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import * as orderService from '../services/orderService';
import { formatMoney } from '../utils/format';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

export default function CheckoutPage() {
  const { isAuthenticated, loading, user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: '',
    shipping_cost: '4.99',
    discount: '0.00',
    notes: '',
  });

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: '/checkout' }} />;
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <EmptyState
          title="Nothing to checkout"
          description="Add products to your local cart first."
          action={
            <Link to="/shop" className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white">
              Shop
            </Link>
          }
        />
      </div>
    );
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSubmitting(true);
    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim(),
        customer_phone: form.customer_phone.trim() || null,
        shipping_cost: form.shipping_cost || '0',
        discount: form.discount || '0',
        notes: form.notes.trim() || null,
        items: items.map((i) => ({
          variant_id: i.variant_id,
          quantity: i.quantity,
        })),
      };
      // API: POST /orders — Place Order (Postman: Orders → Create order)
      const res = await orderService.createOrder(payload);
      if (!res?.success) {
        throw Object.assign(new Error(res?.message || 'Order failed'), {
          response: { data: res },
        });
      }
      clear();
      toast.success(res.message || 'Order placed');
      navigate(`/orders/${res.data.id}`, { replace: true });
    } catch (err) {
      setFieldErrors(getFieldErrors(err));
      const stock = err?.response?.data?.errors?.stock;
      if (Array.isArray(stock) && stock.length) {
        setError(
          `Insufficient stock: ${stock
            .map((s) => `${s.sku} (need ${s.requested}, have ${s.available})`)
            .join('; ')}`
        );
      } else {
        setError(getErrorMessage(err, 'Could not place order.'));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const estimated =
    Number(subtotal) - Number(form.discount || 0) + Number(form.shipping_cost || 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-4xl text-ink">Checkout</h1>
      <p className="mt-2 max-w-2xl text-sm text-ink/60">
        Places a real <code className="rounded bg-sand px-1">POST /orders</code> request. Prices
        come from the catalogue. Payment gateways are not documented — orders start as unpaid /
        pending.
      </p>

      <form onSubmit={onSubmit} className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4 rounded-2xl border border-ink/8 bg-white/80 p-5">
          <h2 className="font-display text-xl">Customer details</h2>
          {[
            ['customer_name', 'Full name', 'text'],
            ['customer_email', 'Email', 'email'],
            ['customer_phone', 'Phone (optional)', 'tel'],
          ].map(([name, label, type]) => (
            <label key={name} className="block text-sm font-medium">
              {label}
              <input
                name={name}
                type={type}
                value={form[name]}
                onChange={onChange}
                required={name !== 'customer_phone'}
                className="mt-1.5 w-full rounded-xl border border-ink/10 px-3 py-2.5 outline-none ring-sea/30 focus:ring-2"
              />
              {fieldErrors[name] ? (
                <span className="mt-1 block text-xs text-danger">{fieldErrors[name][0]}</span>
              ) : null}
            </label>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium">
              Shipping cost
              <input
                name="shipping_cost"
                value={form.shipping_cost}
                onChange={onChange}
                className="mt-1.5 w-full rounded-xl border border-ink/10 px-3 py-2.5 outline-none"
              />
            </label>
            <label className="block text-sm font-medium">
              Discount
              <input
                name="discount"
                value={form.discount}
                onChange={onChange}
                className="mt-1.5 w-full rounded-xl border border-ink/10 px-3 py-2.5 outline-none"
              />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Notes
            <textarea
              name="notes"
              rows={3}
              value={form.notes}
              onChange={onChange}
              className="mt-1.5 w-full rounded-xl border border-ink/10 px-3 py-2.5 outline-none"
            />
          </label>
          {error ? <p className="text-sm text-danger">{error}</p> : null}
        </div>

        <aside className="h-fit rounded-2xl border border-ink/8 bg-white/80 p-5">
          <h2 className="font-display text-xl">Order summary</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {items.map((i) => (
              <li key={i.variant_id} className="flex justify-between gap-3">
                <span className="text-ink/70">
                  {i.product_name} × {i.quantity}
                </span>
                <span className="font-medium">
                  {formatMoney(Number(i.unit_price) * i.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-ink/10 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>Discount</span>
              <span>−{formatMoney(form.discount || 0)}</span>
            </div>
            <div className="flex justify-between text-ink/60">
              <span>Shipping</span>
              <span>{formatMoney(form.shipping_cost || 0)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Est. total</span>
              <span>{formatMoney(Math.max(estimated, 0))}</span>
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-forest py-3 text-sm font-semibold text-white hover:bg-ink disabled:opacity-50"
          >
            {submitting ? 'Placing order…' : 'Place order'}
          </button>
          <p className="mt-3 text-[11px] leading-relaxed text-ink/50">
            No card details are collected. Payment status is managed by staff through the API.
          </p>
        </aside>
      </form>
    </div>
  );
}
