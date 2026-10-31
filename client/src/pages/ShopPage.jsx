import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';
import { getErrorMessage } from '../utils/errors';

export default function ShopPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = params.get('search') || '';
  const categoryId = params.get('category_id') || '';
  const sort = params.get('sort') || '-created_at';
  const page = Number(params.get('page') || 1);
  const status = params.get('status') || 'active';

  const queryKey = useMemo(
    () => ({ search, category_id: categoryId, sort, page, status }),
    [search, categoryId, sort, page, status]
  );

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, catRes] = await Promise.all([
          productService.listProducts({
            search: search || undefined,
            category_id: categoryId || undefined,
            sort,
            status: status || undefined,
            page,
            per_page: 12,
          }),
          categoryService.listCategories({ per_page: 100, sort: 'name' }),
        ]);
        if (cancelled) return;
        setProducts(Array.isArray(prodRes?.data) ? prodRes.data : []);
        setMeta(prodRes?.meta || null);
        setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err));
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading, queryKey, search, categoryId, sort, page, status]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <EmptyState
          title="Login required"
          description="Product listing requires a Sanctum bearer token. Sign in with admin or staff credentials to shop."
          action={
            <Link to="/login" className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white">
              Log in
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-6">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-[0.16em] text-moss uppercase">Catalogue</p>
        <h1 className="font-display text-4xl text-ink">Shop</h1>
      </div>

      <div className="mb-8 grid gap-3 rounded-2xl border border-ink/8 bg-white/70 p-4 md:grid-cols-4">
        <input
          defaultValue={search}
          key={search}
          placeholder="Search name or SKU"
          className="rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm outline-none ring-sea/30 focus:ring-2 md:col-span-2"
          onKeyDown={(e) => {
            if (e.key === 'Enter') updateParam('search', e.currentTarget.value.trim());
          }}
        />
        <select
          value={categoryId}
          onChange={(e) => updateParam('category_id', e.target.value)}
          className="rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm outline-none"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm outline-none"
        >
          <option value="-created_at">Newest</option>
          <option value="created_at">Oldest</option>
          <option value="name">Name A–Z</option>
          <option value="-name">Name Z–A</option>
          <option value="price">Price low–high</option>
          <option value="-price">Price high–low</option>
        </select>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-danger/20 bg-white px-4 py-4 text-sm text-danger">
          {error}
        </div>
      ) : null}

      {loading ? (
        <ProductSkeleton count={12} />
      ) : products.length ? (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
          {meta ? (
            <div className="mt-10 flex items-center justify-between gap-4">
              <p className="text-sm text-ink/55">
                Page {meta.current_page} of {meta.last_page} · {meta.total} products
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={meta.current_page <= 1}
                  onClick={() => updateParam('page', String(meta.current_page - 1))}
                  className="rounded-full border border-ink/10 px-4 py-2 text-sm disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={meta.current_page >= meta.last_page}
                  onClick={() => updateParam('page', String(meta.current_page + 1))}
                  className="rounded-full border border-ink/10 px-4 py-2 text-sm disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : (
        <EmptyState
          title="No products found"
          description="Try a different search, category, or sort option."
        />
      )}
    </div>
  );
}
