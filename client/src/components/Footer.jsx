import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/10 bg-ink text-bone">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4 lg:px-6">
        <div className="md:col-span-2">
          <p className="font-display text-3xl">Farstack</p>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-bone/70">
            A modern storefront powered by the E-commerce Management API — live catalogue,
            variant stock, and order placement through authenticated staff sessions.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-mist uppercase">Shop</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-bone/75">
            <Link to="/shop" className="hover:text-white">All products</Link>
            <Link to="/categories" className="hover:text-white">Categories</Link>
            <Link to="/cart" className="hover:text-white">Cart</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.14em] text-mist uppercase">Account</p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-bone/75">
            <Link to="/login" className="hover:text-white">Log in</Link>
            <Link to="/orders" className="hover:text-white">Orders</Link>
            <Link to="/account" className="hover:text-white">Profile</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-bone/50">
        © {new Date().getFullYear()} Farstack. Cart is browser-local; orders sync via API.
      </div>
    </footer>
  );
}
