import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-7xl text-forest">404</p>
      <h1 className="mt-2 font-display text-3xl">Page not found</h1>
      <p className="mt-3 text-sm text-ink/60">That route does not exist in the Farstack storefront.</p>
      <Link
        to="/"
        className="mt-8 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white"
      >
        Back home
      </Link>
    </div>
  );
}
