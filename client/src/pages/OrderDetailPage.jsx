import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import * as orderService from '../services/orderService';
import { formatDate, formatMoney } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

export default function OrderDetailPage() {
  const { id } = useParams();
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [orderRes, histRes] = await Promise.all([
        orderService.getOrder(id),
        orderService.getOrderHistory(id).catch(() => null),
      ]);
      if (!orderRes?.success) throw new Error(orderRes?.message || 'Order not found.');
      setOrder(orderRes.data);
      setHistory(Array.isArray(histRes?.data) ? histRes.data : orderRes.data.status_history || []);
    } catch (err) {
      setError(getErrorMessage(err, 'Order not found.'));
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const runAction = async (fn, successMsg) => {
    setBusy(true);
    try {
      const res = await fn();
      if (!res?.success) throw new Error(res?.message || 'Action failed');
      toast.success(successMsg || res.message);
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="skeleton h-40 rounded-3xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <EmptyState title="Order unavailable" description={error || 'Not found.'} />
      </div>
    );
  }

  const transitions = order.allowed_status_transitions || [];
  const payments = order.allowed_payment_transitions || [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
      <Link to="/orders" className="text-sm text-sea hover:underline">
        ← Back to orders
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl text-ink">{order.order_number}</h1>
          <p className="mt-1 text-sm text-ink/55">{formatDate(order.created_at)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold">{order.order_status_label}</p>
          <p className="text-xs text-ink/55">{order.payment_status_label}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 rounded-2xl border border-ink/8 bg-white/80 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold tracking-wide text-ink/45 uppercase">Customer</p>
          <p className="mt-1 font-medium">{order.customer_name}</p>
          <p className="text-sm text-ink/60">{order.customer_email}</p>
          {order.customer_phone ? (
            <p className="text-sm text-ink/60">{order.customer_phone}</p>
          ) : null}
        </div>
        <div className="text-sm">
          <div className="flex justify-between py-1">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotal)}</span>
          </div>
          <div className="flex justify-between py-1 text-ink/60">
            <span>Discount</span>
            <span>−{formatMoney(order.discount)}</span>
          </div>
          <div className="flex justify-between py-1 text-ink/60">
            <span>Shipping</span>
            <span>{formatMoney(order.shipping_cost)}</span>
          </div>
          <div className="flex justify-between border-t border-ink/10 py-2 font-semibold">
            <span>Total</span>
            <span>{formatMoney(order.total_amount)}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/8 bg-white/80">
        <div className="border-b border-ink/8 px-4 py-3 font-display text-lg">Items</div>
        {(order.items || []).map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/5 px-4 py-3 text-sm"
          >
            <div>
              <p className="font-medium">{item.product_name}</p>
              <p className="text-xs text-ink/50">
                {item.sku}
                {item.variant_attributes
                  ? ` · ${Object.values(item.variant_attributes).join(' / ')}`
                  : ''}
              </p>
            </div>
            <p>
              {item.quantity} × {formatMoney(item.unit_price)} = {formatMoney(item.subtotal)}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {transitions.includes('confirmed') || order.order_status === 'pending' ? (
          <button
            type="button"
            disabled={busy || !transitions.includes('confirmed')}
            className="rounded-full bg-forest px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            onClick={() =>
              runAction(
                () => orderService.confirmOrder(order.id, { note: 'Confirmed from storefront' }),
                'Order confirmed'
              )
            }
          >
            Confirm (deduct stock)
          </button>
        ) : null}
        {transitions.map((status) =>
          status === 'confirmed' || status === 'cancelled' ? null : (
            <button
              key={status}
              type="button"
              disabled={busy}
              className="rounded-full border border-ink/10 px-4 py-2 text-sm capitalize"
              onClick={() =>
                runAction(
                  () => orderService.updateOrderStatus(order.id, { status }),
                  `Status → ${status}`
                )
              }
            >
              Mark {status}
            </button>
          )
        )}
        {transitions.includes('cancelled') ? (
          <button
            type="button"
            disabled={busy}
            className="rounded-full border border-danger/30 px-4 py-2 text-sm text-danger"
            onClick={() => {
              if (!window.confirm('Cancel this order?')) return;
              runAction(
                () => orderService.cancelOrder(order.id, { reason: 'Cancelled from storefront' }),
                'Order cancelled'
              );
            }}
          >
            Cancel
          </button>
        ) : null}
        {payments.includes('paid') ? (
          <button
            type="button"
            disabled={busy}
            className="rounded-full border border-ok/30 px-4 py-2 text-sm text-ok"
            onClick={() =>
              runAction(
                () =>
                  orderService.updatePaymentStatus(order.id, {
                    payment_status: 'paid',
                    note: 'Marked paid manually (no payment gateway)',
                  }),
                'Marked paid'
              )
            }
          >
            Mark paid
          </button>
        ) : null}
        {isAdmin && payments.includes('refunded') ? (
          <button
            type="button"
            disabled={busy}
            className="rounded-full border border-ink/10 px-4 py-2 text-sm"
            onClick={() =>
              runAction(
                () =>
                  orderService.updatePaymentStatus(order.id, {
                    payment_status: 'refunded',
                    note: 'Full refund',
                  }),
                'Refunded'
              )
            }
          >
            Full refund (admin)
          </button>
        ) : null}
      </div>

      {history.length ? (
        <div className="mt-8">
          <h2 className="font-display text-2xl">History</h2>
          <ul className="mt-4 space-y-3">
            {history.map((entry) => (
              <li key={entry.id} className="rounded-xl border border-ink/8 bg-white/70 px-4 py-3 text-sm">
                <p className="font-medium capitalize">
                  {entry.type}: {entry.from_status || '—'} → {entry.to_status}
                </p>
                <p className="text-xs text-ink/50">
                  {formatDate(entry.created_at)}
                  {entry.changed_by ? ` · ${entry.changed_by.name}` : ''}
                </p>
                {entry.note ? <p className="mt-1 text-ink/70">{entry.note}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
