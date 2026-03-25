import { useCart } from "../Context/CartContext"
import { Link } from "react-router-dom"

function Cart() {
  const { cart, removeFromCart, updateQuantity, subtotal, shipping, total, clearCart } = useCart()

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything yet.</p>
        <Link to="/" className="bg-slate-900 text-white px-6 py-3 rounded-lg hover:bg-slate-800 transition">
          Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-8">Your Cart</h1>

      <div className="space-y-4">
        {cart.map((item) => (
          <div key={item.id} className="flex items-center gap-4 bg-white rounded-2xl shadow p-4">
            <img src={item.image} alt={item.title} className="w-20 h-20 object-cover rounded-xl" />
            <div className="flex-1">
              <p className="font-medium text-sm line-clamp-2">{item.title}</p>
              <p className="text-slate-900 font-semibold mt-1">₹{item.price}</p>
            </div>
            <div className="flex items-center border rounded-lg">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1 text-lg">-</button>
              <span className="px-3">{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 text-lg">+</button>
            </div>
            <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-sm hover:underline">
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* ORDER SUMMARY */}
      <div className="mt-8 bg-white rounded-2xl shadow p-6 space-y-3">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal</span>
          <span>₹{subtotal}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
        </div>
        <div className="flex justify-between font-bold text-base border-t pt-3">
          <span>Total</span>
          <span>₹{total}</span>
        </div>

        {/* ✅ FIXED: Link instead of button */}
        <Link
          to="/checkout"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition text-center block"
        >
          Proceed to Checkout
        </Link>

        <button onClick={clearCart} className="w-full text-sm text-red-500 hover:underline">
          Clear Cart
        </button>
      </div>
    </div>
  )
}

export default Cart