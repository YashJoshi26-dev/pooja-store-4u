import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiTrash2, FiShoppingBag, FiArrowLeft } from "react-icons/fi"
import { useCart } from "../Context/CartContext"

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, subtotal, shipping, total } = useCart()

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-4 bg-gray-50">
        <div className="text-7xl">🛒</div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-400 text-sm">Looks like you haven't added anything yet</p>
        </div>
        <Link to="/"
          className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition">
          <FiArrowLeft size={16}/> Continue Shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-sm text-gray-400 hover:text-slate-700 flex items-center gap-1 transition">
            <FiArrowLeft size={14}/> Continue Shopping
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            Shopping Cart
            <span className="ml-2 text-base font-semibold text-gray-400">({cart.length} item{cart.length > 1 ? "s" : ""})</span>
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map(item => {
                const id = item._id || item.id
                return (
                  <motion.div
                    key={id}
                    layout
                    initial={{ opacity:0, y:10 }}
                    animate={{ opacity:1, y:0 }}
                    exit={{ opacity:0, x:-40, height:0, marginBottom:0 }}
                    transition={{ duration:0.2 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link to={`/product/${id}`} className="flex-shrink-0">
                        <img
                          src={item.image || item.images?.[0]}
                          alt={item.title}
                          className="w-20 h-20 rounded-xl object-cover border border-gray-100"
                          onError={e => e.target.src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}
                        />
                      </Link>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${id}`}>
                          <p className="font-semibold text-sm text-slate-800 line-clamp-2 hover:text-red-500 transition mb-1">
                            {item.title}
                          </p>
                        </Link>
                        {item.category && (
                          <p className="text-xs text-gray-400 mb-2">{item.category}</p>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="text-base font-bold text-slate-900">₹{item.price?.toLocaleString()}</span>
                          {item.oldPrice && (
                            <span className="text-xs text-gray-400 line-through">₹{item.oldPrice?.toLocaleString()}</span>
                          )}
                          {item.oldPrice && item.price < item.oldPrice && (
                            <span className="text-xs font-bold text-green-600">
                              {Math.round((1 - item.price/item.oldPrice)*100)}% off
                            </span>
                          )}
                        </div>

                        {/* Quantity + Remove */}
                        <div className="flex items-center justify-between">
                          {/* ✅ Quantity controls */}
                          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                            <button
                              onClick={() => updateQuantity(id, item.quantity - 1)}
                              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 font-bold text-base hover:bg-red-50 hover:text-red-500 transition"
                            >
                              −
                            </button>
                            <span className="w-8 text-center font-bold text-sm text-slate-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(id, item.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-700 font-bold text-base hover:bg-green-50 hover:text-green-600 transition"
                            >
                              +
                            </button>
                          </div>

                          {/* Item total + Remove */}
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-900">
                              ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                            {/* ✅ Remove button */}
                            <button
                              onClick={() => removeFromCart(id)}
                              className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                              title="Remove item"
                            >
                              <FiTrash2 size={15}/>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="self-start sticky top-24">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="font-bold text-base mb-4">Order Summary</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal ({cart.reduce((s,i)=>s+i.quantity,0)} items)</span>
                  <span className="font-semibold text-slate-900">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="font-bold text-green-600">Free 🎉</span>
                  ) : (
                    <span className="font-semibold text-slate-900">₹{shipping}</span>
                  )}
                </div>
                {shipping === 0 && (
                  <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-lg font-medium">
                    🎉 You qualify for free shipping!
                  </p>
                )}
                {shipping > 0 && (
                  <p className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                    Add ₹{(499 - subtotal).toLocaleString()} more for free shipping
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-5">
                <div className="flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>₹{total.toLocaleString()}</span>
                </div>
              </div>

              <Link to="/checkout"
                className="flex items-center justify-center gap-2 w-full bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition text-sm">
                <FiShoppingBag size={16}/>
                Proceed to Checkout
              </Link>

              <Link to="/"
                className="flex items-center justify-center gap-1 w-full mt-3 text-sm text-gray-400 hover:text-slate-700 transition">
                <FiArrowLeft size={13}/> Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
