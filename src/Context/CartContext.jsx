import { createContext, useContext, useEffect, useState } from "react"

const CartContext = createContext()

function calcShipping(items, subtotal) {
  if (subtotal >= 499) return 0
  const hasHeavy = items.some(item => Number(item.weight || 0) >= 1)
  return hasHeavy ? 180 : 79
}

export function CartProvider({ children }) {

  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart")
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

 const addToCart = (product, qty = 1) => {
  setCart((prev) => {
    const id = product._id || product.id

    // ── Build a unique cart key combining product id + variant selections ──
    const variantKey = product.selectedVariant
      ? `${id}_${product.selectedVariant.size || ""}_${product.selectedVariant.color || ""}_${product.selectedVariant.design || ""}`
      : id

    const existing = prev.find((item) => item.cartKey === variantKey)

    if (existing) {
      return prev.map((item) =>
        item.cartKey === variantKey
          ? { ...item, quantity: item.quantity + qty }
          : item
      )
    }
    return [...prev, { ...product, quantity: qty, cartKey: variantKey }]
  })
}

  // ✅ Buy Now — replaces cart with single product
  const buyNow = (product, qty = 1) => {
    setCart([{ ...product, quantity: qty }])
  }

 const removeFromCart = (id) => {
  setCart((prev) => prev.filter((item) => (item.cartKey || item._id || item.id) !== id))
}

const updateQuantity = (id, quantity) => {
  if (quantity < 1) { removeFromCart(id); return }
  setCart((prev) =>
    prev.map((item) =>
      (item.cartKey || item._id || item.id) === id ? { ...item, quantity } : item
    )
  )
}

  const clearCart = () => setCart([])

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)
  const subtotal  = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping  = calcShipping(cart, subtotal)
  const total     = subtotal + shipping

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        shipping,
        total,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider")
  }
  return context
}