// ─── Frontend Shipping Calculator ────────────────────────────────────────────
// ⚠️  This mirrors backend/utils/shipping.js exactly
// Backend always recalculates — this is for UI display only

/**
 * @param {number} cartTotal  - subtotal of all items (₹)
 * @param {number} weightKg   - total weight of all items (kg)
 * @returns {number} shipping cost in ₹
 */
export function calculateShipping(cartTotal, weightKg) {
  // Free shipping overrides everything
  if (cartTotal >= 499) return 0;

  // ₹79 per kg, rounded up, minimum 1kg
  const roundedKg = Math.ceil(weightKg || 0);
  return 79 * Math.max(roundedKg, 1);
}

/**
 * @param {number} shipping
 * @returns {string} human readable label
 */
export function shippingLabel(shipping, weightKg) {
  if (shipping === 0) return "🎉 Free Shipping";
  const kg = Math.ceil(weightKg || 0);
  return `₹${shipping} (${kg} kg × ₹79)`;
}
