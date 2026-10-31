import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productPriceLabel } from '../utils/format';
import { buildImageCandidates, NO_IMAGE } from '../utils/media';

export default function ProductCard({ product }) {
  // API returns thumbnail/thumbnail_url as null on live data — no backend images uploaded.
  const candidates = buildImageCandidates(product);
  const [srcIndex, setSrcIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrcIndex(0);
    setFailed(false);
  }, [product?.id, product?.thumbnail, product?.thumbnail_url]);

  const finalImage = failed || !candidates.length ? NO_IMAGE : candidates[srcIndex] || NO_IMAGE;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink/8 bg-white/70 shadow-[0_10px_30px_-18px_rgba(20,24,22,0.45)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-20px_rgba(20,24,22,0.55)]"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <img
          src={finalImage || '/no-image.png'}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
          onError={(e) => {
            // Try /storage/ then bare origin; then /no-image.svg then /no-image.png
            if (!failed && srcIndex < candidates.length - 1) {
              setSrcIndex((i) => i + 1);
              return;
            }
            if (e.currentTarget.src.includes('no-image.svg')) {
              e.currentTarget.src = '/no-image.png';
              return;
            }
            setFailed(true);
            e.currentTarget.src = '/no-image.png';
          }}
        />
        {product.status && product.status !== 'active' ? (
          <span className="absolute top-3 left-3 rounded-md bg-ink/80 px-2 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
            {product.status_label || product.status}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-medium tracking-wide text-moss uppercase">
          {product.category?.name || 'Collection'}
        </p>
        <h3 className="font-display text-lg leading-snug text-ink">{product.name}</h3>
        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <p className="text-sm font-semibold text-forest">{productPriceLabel(product)}</p>
          <p className="text-xs text-ink/55">
            {product.total_stock != null ? `${product.total_stock} in stock` : ''}
          </p>
        </div>
      </div>
    </Link>
  );
}
