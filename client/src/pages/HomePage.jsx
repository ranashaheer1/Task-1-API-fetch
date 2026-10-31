import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PackageCheck, ShieldCheck, Truck } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import { useAuth } from '../context/AuthContext';
import * as productService from '../services/productService';
import * as categoryService from '../services/categoryService';
import * as dashboardService from '../services/dashboardService';
import { getErrorMessage } from '../utils/errors';

export default function HomePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [prodRes, catRes, topRes] = await Promise.all([
          productService.listProducts({
            status: 'active',
            sort: '-created_at',
            per_page: 8,
            page: 1,
          }),
          categoryService.listCategories({ per_page: 50, sort: 'name' }),
          dashboardService.getTopProducts({ range: 'last_30_days', limit: 4 }).catch(() => null),
        ]);
        if (cancelled) return;
        setProducts(Array.isArray(prodRes?.data) ? prodRes.data : []);
        setCategories(Array.isArray(catRes?.data) ? catRes.data : []);
        setTopProducts(Array.isArray(topRes?.data) ? topRes.data : []);
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, authLoading]);

  return (
    <div>
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'linear-gradient(105deg, rgba(20,24,22,0.82) 8%, rgba(31,61,50,0.55) 48%, rgba(20,24,22,0.25) 100%), url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80)',
          }}
        />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 lg:px-6">
          <p className="animate-fade-up font-display text-5xl text-bone sm:text-6xl md:text-7xl">
            Farstack
          </p>
          <h1 className="animate-fade-up-delay mt-4 max-w-xl font-display text-3xl leading-tight text-bone sm:text-4xl">
            Goods with live inventory, not guesswork.
          </h1>
          <p className="animate-fade-up-delay mt-4 max-w-lg text-sm leading-relaxed text-bone/80 sm:text-base">
            Browse active catalogue items, choose variants in stock, and place orders through the
            Management API.
          </p>
          <div className="animate-fade-up-delay mt-8 flex flex-wrap gap-3">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 rounded-full bg-bone px-5 py-3 text-sm font-semibold text-ink transition hover:bg-white"
            >
              Shop collection <ArrowRight size={16} />
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center gap-2 rounded-full border border-bone/40 px-5 py-3 text-sm font-semibold text-bone transition hover:bg-bone/10"
            >
              Browse categories
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 md:grid-cols-3 lg:px-6">
        {[
          {
            icon: PackageCheck,
            title: 'Variant-accurate stock',
            text: 'Quantities come from the inventory ledger — unavailable variants cannot be ordered.',
          },
          {
            icon: ShieldCheck,
            title: 'Sanctum sessions',
            text: 'Bearer tokens stay in HTTP-only cookies via the Express proxy.',
          },
          {
            icon: Truck,
            title: 'Order lifecycle',
            text: 'Checkout creates pending orders; staff can confirm, ship, and track status.',
          },
        ].map((item) => (
          <div key={item.title} className="rounded-2xl border border-ink/8 bg-white/60 p-5">
            <item.icon className="text-sea" size={22} />
            <h2 className="mt-3 font-display text-xl">{item.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{item.text}</p>
          </div>
        ))}
      </section>

      {!isAuthenticated && !authLoading ? (
        <section className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
          <div className="rounded-3xl border border-sea/20 bg-gradient-to-br from-white/80 to-mist/40 p-8 md:p-10">
            <h2 className="font-display text-3xl text-forest">Sign in to browse the catalogue</h2>
            <p className="mt-3 max-w-2xl text-sm text-ink/70">
              The documented API requires authentication for products, categories, and orders.
              There is no public guest catalogue or customer registration endpoint. Use the demo
              staff or admin credentials from the API docs.
            </p>
            <Link
              to="/login"
              className="mt-6 inline-flex rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-ink"
            >
              Go to login
            </Link>
          </div>
        </section>
      ) : null}

      {isAuthenticated ? (
        <>
          <section className="mx-auto max-w-6xl px-4 pb-10 lg:px-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-moss uppercase">Explore</p>
                <h2 className="font-display text-3xl text-ink">Featured categories</h2>
              </div>
              <Link to="/categories" className="text-sm font-semibold text-sea hover:underline">
                View all
              </Link>
            </div>
            {loading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="skeleton h-28 rounded-2xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {categories.slice(0, 8).map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/shop?category_id=${cat.id}`}
                    className="rounded-2xl border border-ink/8 bg-forest px-4 py-6 text-white transition hover:-translate-y-0.5 hover:bg-ink"
                  >
                    <p className="font-display text-xl">{cat.name}</p>
                    <p className="mt-2 text-xs text-white/70">
                      {cat.products_count != null ? `${cat.products_count} products` : 'Shop now'}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold tracking-[0.16em] text-moss uppercase">New</p>
                <h2 className="font-display text-3xl text-ink">Latest arrivals</h2>
              </div>
              <Link to="/shop" className="text-sm font-semibold text-sea hover:underline">
                Shop all
              </Link>
            </div>
            {error ? (
              <div className="rounded-2xl border border-danger/20 bg-white/70 px-4 py-6 text-sm text-danger">
                {error}
              </div>
            ) : loading ? (
              <ProductSkeleton count={8} />
            ) : products.length ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink/60">No active products returned by the API.</p>
            )}
          </section>

          {topProducts.length ? (
            <section className="mx-auto max-w-6xl px-4 pb-20 lg:px-6">
              <div className="mb-6">
                <p className="text-xs font-semibold tracking-[0.16em] text-moss uppercase">Trending</p>
                <h2 className="font-display text-3xl text-ink">Top sellers (30 days)</h2>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {topProducts.map((item) => (
                  <Link
                    key={item.product_id}
                    to={`/products/${item.product_id}`}
                    className="flex items-center gap-4 rounded-2xl border border-ink/8 bg-white/70 p-4 transition hover:border-sea/30"
                  >
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-sand">
                      {item.thumbnail_url ? (
                        <img src={item.thumbnail_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-display text-lg text-forest/40">FS</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{item.name}</p>
                      <p className="text-xs text-ink/55">
                        {item.category} · {item.units_sold} units · ${item.revenue}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-sea">#{item.rank}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
