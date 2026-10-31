import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const mobileMenu =
    open &&
    createPortal(
      <div
        className="mobile-menu-root md:hidden"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
        }}
      >
        {/* Overlay — black 50% */}
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
          }}
        />

        {/* Drawer — solid white, 280px, full height */}
        <aside
          className="mobile-nav-drawer"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 280,
            height: '100%',
            backgroundColor: '#ffffff',
            color: '#111111',
            boxShadow: '4px 0 24px rgba(0, 0, 0, 0.18)',
            display: 'flex',
            flexDirection: 'column',
            padding: 24,
            zIndex: 1,
            overflowY: 'auto',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 24,
            }}
          >
            <span
              className="font-display"
              style={{ fontSize: 20, fontWeight: 700, color: '#111111' }}
            >
              Farstack
            </span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: 8,
                border: '1px solid #e5e5e5',
                backgroundColor: '#ffffff',
                color: '#111111',
                cursor: 'pointer',
                zIndex: 2,
              }}
            >
              <X size={22} color="#111111" strokeWidth={2.5} />
            </button>
          </div>

          <form onSubmit={onSearch} style={{ marginBottom: 20 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              style={{
                width: '100%',
                borderRadius: 12,
                border: '1px solid rgba(17,17,17,0.15)',
                backgroundColor: '#ffffff',
                color: '#111111',
                padding: '10px 12px',
                fontSize: 14,
                outline: 'none',
              }}
            />
          </form>

          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            {[
              ['/', 'Home'],
              ['/shop', 'Shop'],
              ['/categories', 'Categories'],
              ['/cart', 'Cart'],
              ['/orders', 'Orders'],
              ['/account', 'Account'],
            ].map(([to, label]) => (
              <Link
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                style={{
                  color: '#111111',
                  textDecoration: 'none',
                  padding: '10px 8px',
                  borderRadius: 8,
                }}
              >
                {label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                style={{
                  marginTop: 8,
                  textAlign: 'left',
                  padding: '10px 8px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'transparent',
                  color: '#b42318',
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Log out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                style={{
                  marginTop: 8,
                  color: '#0f766e',
                  textDecoration: 'none',
                  padding: '10px 8px',
                  borderRadius: 8,
                }}
              >
                Log in
              </Link>
            )}
          </nav>
        </aside>
      </div>,
      document.body
    );

  return (
    <header className="sticky top-0 z-50 border-b border-ink/8 bg-[#f7f4ee]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 lg:px-6">
        <button
          type="button"
          className="hamburger-btn md:hidden"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
          style={{
            position: 'relative',
            zIndex: 50,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            flexShrink: 0,
            borderRadius: 8,
            border: 'none',
            backgroundColor: 'transparent',
            color: '#111111',
            cursor: 'pointer',
          }}
        >
          {/* Light header → black icon; size 24px */}
          <Menu size={24} color="#111111" strokeWidth={2.25} />
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

      {mobileMenu}
    </header>
  );
}
