export function formatMoney(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value ?? '—');
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
}

export function formatDate(value) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return String(value);
  }
}

export function productPriceLabel(product) {
  if (!product) return '—';
  const min = product.min_variant_price ?? product.base_price;
  const max = product.max_variant_price ?? product.base_price;
  if (min && max && min !== max) {
    return `${formatMoney(min)} – ${formatMoney(max)}`;
  }
  return formatMoney(min ?? product.base_price ?? 0);
}

export function variantLabel(variant) {
  if (!variant) return '';
  if (variant.name) return variant.name;
  const attrs = variant.attributes || {};
  const parts = Object.values(attrs).filter(Boolean);
  return parts.length ? parts.join(' / ') : variant.sku || 'Variant';
}

export function stockTone(status) {
  if (status === 'in_stock') return 'text-ok bg-ok/10';
  if (status === 'low_stock') return 'text-clay bg-clay/10';
  return 'text-danger bg-danger/10';
}
