import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import * as orderService from '../services/orderService';
import { formatDate, formatMoney } from '../utils/format';
import { getErrorMessage } from '../utils/errors';

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const search = params.get('search') || '';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // API: GET /orders — My Orders (Postman: Orders → List)
        const res = await orderService.listOrders({
          search: search || undefined,
          page,
          per_page: 15,
          sort: '-created_at',
        });
        if (cancelled) return;
        setOrders(Array.isArray(res?.data) ? res.data : []);
        setMeta(res?.meta || null);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search, page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-4xl text-ink">Orders</h1>
      <p className="mt-2 text-sm text-ink/60">
        Staff/admin order list from <code className="rounded bg-sand px-1">GET /orders</code>.
      </p>

      <input
        defaultValue={search}
        key={search}
        placeholder="Search order #, customer, email…"
        className="mt-6 w-full max-w-md rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm outline-none"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            const next = new URLSearchParams(params);
            const v = e.currentTarget.value.trim();
            if (v) next.set('search', v);
            else next.delete('search');
            next.delete('page');
            setParams(next);
          }
        }}
      />

      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      {loading ? (
        <div className="mt-8 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-20 rounded-2xl" />
          ))}
        </div>
      ) : orders.length ? (
        <div className="mt-8 overflow-hidden rounded-2xl border border-ink/8 bg-white/80">
          <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-3 border-b border-ink/8 px-4 py-3 text-xs font-semibold tracking-wide text-ink/50 uppercase md:grid">
            <span>Order</span>
            <span>Customer</span>
            <span>Status</span>
            <span>Total</span>
            <span />
          </div>
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className="grid gap-2 border-b border-ink/5 px-4 py-4 transition hover:bg-mist/30 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto] md:items-center"
            >
              <div>
                <p className="font-semibold">{order.order_number}</p>
                <p className="text-xs text-ink/50">{formatDate(order.created_at)}</p>
              </div>
              <div className="text-sm">
                <p>{order.customer_name}</p>
                <p className="text-xs text-ink/50">{order.customer_email}</p>
              </div>
              <div className="text-sm">
                <p>{order.order_status_label || order.order_status}</p>
                <p className="text-xs text-ink/50">
                  {order.payment_status_label || order.payment_status}
                </p>
              </div>
              <p className="text-sm font-semibold">{formatMoney(order.total_amount)}</p>
              <span className="text-sm text-sea">View</span>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState title="No orders" description="Create one from checkout." />
        </div>
      )}

      {meta ? (
        <div className="mt-6 flex justify-between">
          <p className="text-sm text-ink/55">
            Page {meta.current_page} / {meta.last_page}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={meta.current_page <= 1}
              className="rounded-full border border-ink/10 px-4 py-2 text-sm disabled:opacity-40"
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set('page', String(meta.current_page - 1));
                setParams(next);
              }}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={meta.current_page >= meta.last_page}
              className="rounded-full border border-ink/10 px-4 py-2 text-sm disabled:opacity-40"
              onClick={() => {
                const next = new URLSearchParams(params);
                next.set('page', String(meta.current_page + 1));
                setParams(next);
              }}
            >
              Next
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
