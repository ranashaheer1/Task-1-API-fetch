import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const linkClass = ({ isActive }) =>
  `text-sm font-medium transition ${isActive ? 'text-sea' : 'text-ink/70 hover:text-ink'}`;

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const onSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/shop?search=${encodeURIComponent(q)}` : '/shop');
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 bg-[#f7f4ee]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 lg:px-6">
        <button
          type="button"
          className="rounded-lg p-2 text-ink md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="font-display text-2xl font-extrabold tracking-tight text-forest">
          Farstack
        </Link>

        <nav className="ml-6 hidden items-center gap-5 md:flex">
          <NavLink to="/" className={linkClass} end>
            Home
          </NavLink>
          <NavLink to="/shop" className={linkClass}>
            Shop
          </NavLink>
          <NavLink to="/categories" className={linkClass}>
            Categories
          </NavLink>
          {isAuthenticated ? (
            <NavLink to="/orders" className={linkClass}>
              Orders
            </NavLink>
          ) : null}
          {user?.role === 'admin' || user?.role === 'staff' ? (
            <NavLink to="/account" className={linkClass}>
              Account
            </NavLink>
          ) : null}
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-sm flex-1 md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink/40" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or SKU"
              className="w-full rounded-full border border-ink/10 bg-white/80 py-2 pr-4 pl-9 text-sm outline-none ring-sea/30 focus:ring-2"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Link
            to={isAuthenticated ? '/account' : '/login'}
            className="rounded-full p-2 text-ink/80 transition hover:bg-ink/5 hover:text-ink"
            aria-label="Account"
          >
            <User size={20} />
          </Link>
          <Link
            to="/cart"
            className="relative rounded-full p-2 text-ink/80 transition hover:bg-ink/5 hover:text-ink"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {count > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-clay px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            ) : null}
          </Link>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => logout()}
              className="ml-1 hidden rounded-full border border-ink/10 px-3 py-1.5 text-xs font-semibold text-ink/70 hover:bg-white md:inline"
            >
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="ml-1 hidden rounded-full bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink md:inline"
            >
              Log in
            </Link>
          )}
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-0 left-0 flex h-full w-[82%] max-w-xs flex-col bg-bone p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <span className="font-display text-xl text-forest">Farstack</span>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={onSearch} className="mb-5">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className="w-full rounded-xl border border-ink/10 bg-white px-3 py-2 text-sm outline-none"
              />
            </form>
            <div className="flex flex-col gap-3 text-base">
              <Link to="/" onClick={() => setOpen(false)}>Home</Link>
              <Link to="/shop" onClick={() => setOpen(false)}>Shop</Link>
              <Link to="/categories" onClick={() => setOpen(false)}>Categories</Link>
              <Link to="/cart" onClick={() => setOpen(false)}>Cart</Link>
              <Link to="/orders" onClick={() => setOpen(false)}>Orders</Link>
              <Link to="/account" onClick={() => setOpen(false)}>Account</Link>
              {isAuthenticated ? (
                <button
                  type="button"
                  className="mt-2 text-left text-danger"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                >
                  Log out
                </button>
              ) : (
                <Link to="/login" onClick={() => setOpen(false)} className="mt-2 text-sea">
                  Log in
                </Link>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
