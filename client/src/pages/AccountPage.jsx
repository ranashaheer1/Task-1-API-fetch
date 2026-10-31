import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/format';

export default function AccountPage() {
  const { user, logout, isAdmin } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 lg:px-6">
      <h1 className="font-display text-4xl text-ink">My account</h1>
      <p className="mt-2 text-sm text-ink/60">
        Profile from <code className="rounded bg-sand px-1">GET /auth/me</code>. Edit-profile and
        change-password endpoints are not documented.
      </p>

      <div className="mt-8 rounded-3xl border border-ink/8 bg-white/80 p-6">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs tracking-wide text-ink/45 uppercase">Name</dt>
            <dd className="mt-1 font-semibold">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-ink/45 uppercase">Email</dt>
            <dd className="mt-1 font-semibold">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-ink/45 uppercase">Role</dt>
            <dd className="mt-1 font-semibold">{user.role_label || user.role}</dd>
          </div>
          <div>
            <dt className="text-xs tracking-wide text-ink/45 uppercase">Member since</dt>
            <dd className="mt-1 font-semibold">{formatDate(user.created_at)}</dd>
          </div>
        </dl>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/orders"
            className="rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white"
          >
            View orders
          </Link>
          <Link
            to="/shop"
            className="rounded-full border border-ink/10 px-5 py-2.5 text-sm font-semibold"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-full border border-danger/30 px-5 py-2.5 text-sm font-semibold text-danger"
          >
            Log out
          </button>
        </div>

        {isAdmin ? (
          <p className="mt-6 rounded-xl bg-mist/50 px-4 py-3 text-xs text-ink/65">
            Admin capabilities (create/update products, adjust stock, refunds) are available through
            the API. This storefront focuses on catalogue browsing and order placement.
          </p>
        ) : null}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-ink/15 bg-white/50 p-5 text-sm text-ink/65">
        <p className="font-semibold text-ink">Not available in this API</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Wishlist</li>
          <li>Saved addresses</li>
          <li>Customer self-registration</li>
          <li>Password change / reset</li>
        </ul>
      </div>
    </div>
  );
}
