export function normalizeId(value) {
  if (value == null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed && trimmed !== 'undefined' ? trimmed : null;
  }
  if (typeof value === 'object' && value._id != null) {
    return normalizeId(value._id);
  }
  const asString = String(value);
  return asString && asString !== 'undefined' ? asString : null;
}
