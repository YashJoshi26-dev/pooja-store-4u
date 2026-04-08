import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

// ✅ Shipping logic — matches AddProduct rules exactly
// - Subtotal >= ₹499 → Free
// - Cart has any item with weight >= 1kg → ₹180
// - All items light (<1kg) → ₹79
// - No weight info → ₹79 (safe default)
function calcShipping(items, subtotal) {
  if (subtotal >= 499) return 0; // free shipping
  const hasHeavy = items.some(item => Number(item.weight || 0) >= 1);
  return hasHeavy ? 180 : 79;
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  // ── Cart actions ────────────────────────────────────────────────────────────
  const addToCart = (product, qty = 1) => {
    setCart(prev => {
      const id = product._id || product.id;
      const existing = prev.find(i => (i._id || i.id) === id);
      if (existing) {
        return prev.map(i =>
          (i._id || i.id) === id
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(i => (i._id || i.id) !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) { removeFromCart(id); return; }
    setCart(prev =>
      prev.map(i => (i._id || i.id) === id ? { ...i, quantity: qty } : i)
    );
  };

  const clearCart = () => setCart([]);

  // ── Computed values ─────────────────────────────────────────────────────────
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal  = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping  = calcShipping(cart, subtotal); // ✅ real shipping logic
  const total     = subtotal + shipping;

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity, clearCart,
      cartCount, subtotal, shipping, total,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
