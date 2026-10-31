const MEDIA_ORIGIN = 'https://ecom.thefarstack.online';
// Prefer SVG placeholder (readable "No image"); PNG kept as extra fallback
export const NO_IMAGE = '/no-image.svg';

/**
 * Live API investigation (2026-10-31):
 * GET /api/v1/products → every product has thumbnail: null, thumbnail_url: null.
 * Docs show example paths like "products/abc.jpg", but seeded live data has NO uploads.
 * Trying /storage/{path} → 403; bare /{path} → 404.
 * Conclusion: images do NOT exist in backend for current catalogue.
 */
export function buildImageCandidates(productOrUrl) {
  const raw =
    typeof productOrUrl === 'string'
      ? productOrUrl
      : productOrUrl?.thumbnail_url ||
        productOrUrl?.thumbnail ||
        productOrUrl?.image ||
        '';

  if (!raw) return [];

  if (/^https?:\/\//i.test(raw)) {
    return [raw];
  }

  const path = String(raw).replace(/^\//, '');
  return [`${MEDIA_ORIGIN}/storage/${path}`, `${MEDIA_ORIGIN}/${path}`];
}

/** Final display URL, or empty string when API has no image */
export function resolveProductImage(productOrUrl) {
  return buildImageCandidates(productOrUrl)[0] || '';
}

export function getProductImageSrc(productOrUrl) {
  return resolveProductImage(productOrUrl) || NO_IMAGE;
}
