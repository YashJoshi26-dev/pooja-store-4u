import { createContext, useContext, useEffect, useState } from "react"

const CartContext = createContext()

export function CartProvider({ children }) {

  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem("cart")
      return stored ? JSON.parse(stored) : []
    } catch {
      return []  // ✅ FIX: handle corrupted localStorage
    }
  })

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            // ✅ FIX: respect quantity passed in (from Product page)
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        )
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return
    setCart((prev) =>
      prev.map((item) => item.id === id ? { ...item, quantity } : item)
    )
  }

  const clearCart = () => setCart([])

  const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 99
  const total = subtotal + shipping

  // ✅ cartCount available directly in context (used by Navbar)
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
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
    throw new Error("useCart must be used inside a CartProvider")  // ✅ FIX: helpful error
  }
  return context
}
