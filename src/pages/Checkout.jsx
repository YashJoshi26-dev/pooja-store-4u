import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../Context/CartContext"
import { motion, AnimatePresence } from "framer-motion"

const STEPS = ["Cart Review", "Delivery", "Payment", "Confirm"]

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, subtotal, shipping, total, clearCart } = useCart()

  const [step, setStep]       = useState(0)
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced]   = useState(false)

  const [delivery, setDelivery] = useState({
    name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "",
  })

  const [payment, setPayment] = useState({ method: "upi", upiId: "", cardNo: "", expiry: "", cvv: "" })

  const handleDeliveryChange = (e) => setDelivery({ ...delivery, [e.target.name]: e.target.value })
  const handlePaymentChange  = (e) => setPayment({ ...payment,  [e.target.name]: e.target.value })

  const deliveryValid = delivery.name && delivery.email && delivery.phone && delivery.address && delivery.city && delivery.pincode

  const handlePlaceOrder = async () => {
    setPlacing(true)
    await new Promise((r) => setTimeout(r, 1800))
    clearCart()
    setPlaced(true)
    setPlacing(false)
  }

  // Order placed success screen
  if (placed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-2">Thank you, {delivery.name}!</p>
          <p className="text-gray-400 text-sm mb-6">
            Your order confirmation has been sent to <span className="font-semibold text-slate-700">{delivery.email}</span>
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Order Total</span>
              <span className="font-bold">₹{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery To</span>
              <span className="font-semibold text-right max-w-[60%]">{delivery.address}, {delivery.city}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Est. Delivery</span>
              <span className="font-semibold text-green-600">3–5 Business Days</span>
            </div>
          </div>
          <Link to="/" className="block w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition text-center">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    )
  }

  // Empty cart guard
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-5xl">🛒</div>
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <p className="text-gray-400 text-sm">Add some products before checking out</p>
        <Link to="/" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 transition">
          Shop Now
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link to="/cart" className="text-sm text-gray-400 hover:text-slate-700 transition">← Back to Cart</Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-2">Checkout</h1>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => i < step && setStep(i)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  i < step ? "bg-green-500 text-white" :
                  i === step ? "bg-slate-900 text-white" :
                  "bg-gray-200 text-gray-400"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-sm font-semibold hidden md:block ${i === step ? "text-slate-900" : "text-gray-400"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-3 rounded ${i < step ? "bg-green-500" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main Area */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* STEP 0 — Cart Review */}
              {step === 0 && (
                <motion.div key="cart" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <h2 className="text-lg font-bold mb-4">Review Your Cart ({cart.length} items)</h2>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                        <img src={item.image} alt={item.title} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm line-clamp-2">{item.title}</p>
                          <p className="text-xs text-gray-400 mt-1">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-bold text-slate-900 flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep(1)} className="mt-6 w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition">
                    Proceed to Delivery →
                  </button>
                </motion.div>
              )}

              {/* STEP 1 — Delivery */}
              {step === 1 && (
                <motion.div key="delivery" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <h2 className="text-lg font-bold mb-4">Delivery Details</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: "name",    label: "Full Name *",    placeholder: "Rahul Sharma",        col: 2 },
                      { name: "email",   label: "Email *",         placeholder: "rahul@email.com",    col: 1 },
                      { name: "phone",   label: "Phone *",         placeholder: "+91 98765 43210",    col: 1 },
                      { name: "address", label: "Address *",       placeholder: "House No, Street",   col: 2 },
                      { name: "city",    label: "City *",          placeholder: "Mumbai",             col: 1 },
                      { name: "state",   label: "State",           placeholder: "Maharashtra",        col: 1 },
                      { name: "pincode", label: "Pincode *",       placeholder: "400001",             col: 1 },
                    ].map((f) => (
                      <div key={f.name} className={f.col === 2 ? "col-span-2" : ""}>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{f.label}</label>
                        <input
                          name={f.name}
                          value={delivery[f.name]}
                          onChange={handleDeliveryChange}
                          placeholder={f.placeholder}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(0)} className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">
                      ← Back
                    </button>
                    <button
                      onClick={() => deliveryValid && setStep(2)}
                      disabled={!deliveryValid}
                      className={`flex-1 py-3 rounded-xl font-semibold transition text-sm ${deliveryValid ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <h2 className="text-lg font-bold mb-4">Payment Method</h2>

                  {/* Method Tabs */}
                  <div className="flex gap-3 mb-6">
                    {[
                      { id: "upi",  label: "UPI",         icon: "📱" },
                      { id: "card", label: "Card",        icon: "💳" },
                      { id: "cod",  label: "Cash on Delivery", icon: "💵" },
                    ].map((m) => (
                      <button key={m.id}
                        onClick={() => setPayment({ ...payment, method: m.id })}
                        className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition flex flex-col items-center gap-1 ${payment.method === m.id ? "border-slate-900 bg-slate-50" : "border-gray-200 hover:border-gray-300"}`}
                      >
                        <span className="text-lg">{m.icon}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* UPI */}
                  {payment.method === "upi" && (
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">UPI ID</label>
                      <input
                        name="upiId"
                        value={payment.upiId}
                        onChange={handlePaymentChange}
                        placeholder="rahul@upi"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition"
                      />
                    </div>
                  )}

                  {/* Card */}
                  {payment.method === "card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Card Number</label>
                        <input name="cardNo" value={payment.cardNo} onChange={handlePaymentChange} placeholder="1234 5678 9012 3456" maxLength={19}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Expiry</label>
                          <input name="expiry" value={payment.expiry} onChange={handlePaymentChange} placeholder="MM/YY" maxLength={5}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">CVV</label>
                          <input name="cvv" value={payment.cvv} onChange={handlePaymentChange} placeholder="•••" maxLength={4} type="password"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COD */}
                  {payment.method === "cod" && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 font-medium">
                      💵 You'll pay ₹{total.toLocaleString()} in cash when your order is delivered.
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(1)} className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">← Back</button>
                    <button onClick={() => setStep(3)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition text-sm">Review Order →</button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3 — Confirm */}
              {step === 3 && (
                <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <h2 className="text-lg font-bold mb-4">Confirm Order</h2>

                  <div className="space-y-3 mb-6">
                    {[
                      ["Deliver To",   `${delivery.name}, ${delivery.address}, ${delivery.city} - ${delivery.pincode}`],
                      ["Phone",        delivery.phone],
                      ["Email",        delivery.email],
                      ["Payment",      payment.method === "upi" ? `UPI: ${payment.upiId || "N/A"}` : payment.method === "card" ? `Card ending ${payment.cardNo?.slice(-4) || "N/A"}` : "Cash on Delivery"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                        <span className="text-xs font-bold text-gray-400 uppercase w-20 flex-shrink-0 pt-0.5">{k}</span>
                        <span className="text-sm font-semibold text-slate-700">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">← Back</button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={placing}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition text-sm disabled:bg-blue-400"
                    >
                      {placing ? "Placing Order..." : `Place Order · ₹${total.toLocaleString()}`}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 self-start sticky top-24">
            <h3 className="font-bold text-base mb-4">Order Summary</h3>

            <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold line-clamp-2 text-slate-700">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-bold flex-shrink-0">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600 font-medium">🎉 You qualify for free shipping!</p>
              )}
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2 mt-2">
                <span>Total</span>
                <span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
