import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';
import * as categoryService from '../services/categoryService';
import { getErrorMessage } from '../utils/errors';

export default function CategoriesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await categoryService.listCategories({
          per_page: 100,
          sort: 'name',
          search: search || undefined,
        });
        if (!cancelled) setCategories(Array.isArray(res?.data) ? res.data : []);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading, search]);

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 lg:px-6">
        <EmptyState
          title="Login required"
          description="Categories require an authenticated session."
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
      <h1 className="font-display text-4xl text-ink">Categories</h1>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search categories"
        className="mt-6 w-full max-w-md rounded-xl border border-ink/10 bg-white px-3 py-2.5 text-sm outline-none ring-sea/30 focus:ring-2"
      />
      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      {loading ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton h-28 rounded-2xl" />
          ))}
        </div>
      ) : categories.length ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category_id=${cat.id}`}
              className="rounded-2xl border border-ink/8 bg-white/70 p-6 transition hover:-translate-y-0.5 hover:border-sea/30"
            >
              <h2 className="font-display text-2xl">{cat.name}</h2>
              {cat.description ? (
                <p className="mt-2 line-clamp-2 text-sm text-ink/60">{cat.description}</p>
              ) : null}
              <p className="mt-4 text-xs font-semibold tracking-wide text-moss uppercase">
                {cat.products_count != null ? `${cat.products_count} products` : 'View products'}
              </p>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState title="No categories" description="Nothing matched your search." />
        </div>
      )}
    </div>
  );
}
