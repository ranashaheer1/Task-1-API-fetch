import { Link } from 'react-router-dom';

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 lg:px-6">
      <div className="rounded-3xl border border-ink/8 bg-white/80 p-8">
        <h1 className="font-display text-3xl text-ink">Wishlist unavailable</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink/70">
          No wishlist endpoints are documented in <code>API.docx</code> or
          <code> postman_collection.json</code>. This page exists only to state that limitation
          clearly.
        </p>
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
