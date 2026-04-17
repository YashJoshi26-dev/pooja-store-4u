import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCart } from "../Context/CartContext"
import { motion, AnimatePresence } from "framer-motion"
import api from "../api/api"

const STEPS = ["Cart Review", "Delivery", "Payment", "Confirm"]

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, subtotal, shipping, total, clearCart, updateQuantity, removeFromCart } = useCart()

  const [step,    setStep]    = useState(0)
  const [placing, setPlacing] = useState(false)
  const [placed,  setPlaced]  = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [error,   setError]   = useState("")
  const [orderSnapshot, setOrderSnapshot] = useState(null)

  const [delivery, setDelivery] = useState({
    name:"", email:"", phone:"", address:"", city:"", state:"", pincode:"",
  })
  const [payment, setPayment] = useState({
    method:"upi", upiId:"", cardNo:"", expiry:"", cvv:"",
  })

  const handleDeliveryChange = (e) => setDelivery({ ...delivery, [e.target.name]: e.target.value })
  const handlePaymentChange  = (e) => setPayment({  ...payment,  [e.target.name]: e.target.value })

  const deliveryValid =
    delivery.name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(delivery.email) &&
    /^\d{10,}$/.test(delivery.phone.replace(/\D/g, "")) &&
    delivery.address.trim().length > 0 &&
    delivery.city.trim().length > 0 &&
    delivery.state.trim().length > 0 &&
    /^\d{6}$/.test(delivery.pincode.trim())

  // ── Load Razorpay script dynamically ─────────────────────────────────────
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script    = document.createElement("script")
      script.src      = "https://checkout.razorpay.com/v1/checkout.js"
      script.onload   = () => resolve(true)
      script.onerror  = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  // ── COD flow (unchanged) ──────────────────────────────────────────────────
  const handleCODOrder = async () => {
    setPlacing(true)
    setError("")
    try {
      const order = await api.post("/orders", {
        customerInfo:    { name: delivery.name, email: delivery.email, phone: delivery.phone },
        deliveryAddress: { address: delivery.address, city: delivery.city, state: delivery.state, pincode: delivery.pincode },
        items: cart.map(item => ({
          product:  item._id || item.id,
          title:    item.title,
          image:    item.image,
          price:    item.price,
          quantity: item.quantity,
        })),
        subtotal,
        shipping,
        total,
        paymentMethod: "cod",
      })
      setOrderId(order.orderId)
      setOrderSnapshot({ subtotal, shipping, total })
      clearCart()
      setPlaced(true)
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.")
    } finally {
      setPlacing(false)
    }
  }

  // ── Razorpay UPI/Card flow ────────────────────────────────────────────────
  const handleRazorpayPayment = async () => {
    setPlacing(true)
    setError("")
    try {
      // Step 1: Load Razorpay SDK
      const loaded = await loadRazorpayScript()
      if (!loaded) throw new Error("Failed to load Razorpay. Check your internet connection.")

      // Step 2: Create order in your DB first
      const dbOrder = await api.post("/orders", {
        customerInfo:    { name: delivery.name, email: delivery.email, phone: delivery.phone },
        deliveryAddress: { address: delivery.address, city: delivery.city, state: delivery.state, pincode: delivery.pincode },
        items: cart.map(item => ({
          product:  item._id || item.id,
          title:    item.title,
          image:    item.image,
          price:    item.price,
          quantity: item.quantity,
        })),
        subtotal,
        shipping,
        total,
        paymentMethod: payment.method,
      })

      // Step 3: Create Razorpay order from backend
      const rzpOrder = await api.post("/payment/create-order", {
        amount:  total,
        orderId: dbOrder._id,
      })

      // Step 4: Open Razorpay checkout
      const options = {
        key:         rzpOrder.keyId,
        amount:      rzpOrder.amount,
        currency:    rzpOrder.currency,
        name:        "PoojaStore4u",
        description: "Order Payment",
        order_id:    rzpOrder.razorpayOrderId,
        prefill: {
          name:    delivery.name,
          email:   delivery.email,
          contact: delivery.phone,
          // UPI prefill — opens Google Pay automatically if available
          ...(payment.method === "upi" && payment.upiId && { vpa: payment.upiId }),
        },
        config: {
          display: {
            // Show UPI first in payment options
            preferences: { show_default_blocks: true },
            blocks: {
              utib: { name: "Pay via UPI", instruments: [{ method: "upi" }] },
            },
            sequence: ["block.utib"],
          },
        },
        theme: { color: "#2874F0" },

        // ── Success handler ──────────────────────────────────────────────────
        handler: async (response) => {
          try {
            const verified = await api.post("/payment/verify", {
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
              orderId:             dbOrder._id,
            })

            if (verified.success) {
              setOrderId(verified.orderId)
              setOrderSnapshot({ subtotal, shipping, total })
              clearCart()
              setPlaced(true)
            } else {
              setError("Payment verification failed. Contact support.")
              navigate("/payment-failure?orderId=" + dbOrder._id)
            }
          } catch (err) {
            setError("Payment verification error: " + err.message)
            navigate("/payment-failure?orderId=" + dbOrder._id)
          }
        },

        // ── Failure / dismiss handler ────────────────────────────────────────
        modal: {
          ondismiss: () => {
            setPlacing(false)
            setError("Payment was cancelled. Please try again.")
          },
        },
      }

      const rzp = new window.Razorpay(options)

      rzp.on("payment.failed", (response) => {
        setError("Payment failed: " + response.error.description)
        setPlacing(false)
        navigate("/payment-failure?orderId=" + dbOrder._id)
      })

      rzp.open()

    } catch (err) {
      setError(err.message || "Payment failed. Please try again.")
      setPlacing(false)
    }
  }

  // ── Main place order handler ──────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (payment.method === "cod") {
      await handleCODOrder()
    } else {
      await handleRazorpayPayment()
    }
  }

  // ── Success screen ────────────────────────────────────────────────────────
  if (placed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <motion.div
          initial={{ opacity:0, scale:0.9 }}
          animate={{ opacity:1, scale:1 }}
          className="bg-white rounded-3xl shadow-xl p-10 max-w-md w-full text-center"
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 mb-1">Thank you, {delivery.name}!</p>
          {orderId && (
            <p className="text-sm font-mono font-bold mb-4" style={{color:"#ff3f6c"}}>{orderId}</p>
          )}
          <p className="text-gray-400 text-sm mb-6">
            Confirmation sent to <span className="font-semibold text-slate-700">{delivery.email}</span>
          </p>
          <div className="bg-gray-50 rounded-xl p-4 text-left mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold">₹{(orderSnapshot?.subtotal ?? subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className={(orderSnapshot?.shipping ?? shipping) === 0 ? "font-bold text-green-600" : "font-semibold"}>
                {(orderSnapshot?.shipping ?? shipping) === 0 ? "Free 🎉" : `₹${orderSnapshot?.shipping ?? shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-sm font-bold border-t pt-2">
              <span>Total Paid</span>
              <span>₹{(orderSnapshot?.total ?? total).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Delivery To</span>
              <span className="font-semibold text-right max-w-[60%]">{delivery.address}, {delivery.city}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Est. Delivery</span>
              <span className="font-semibold text-green-600">5–8 Business Days</span>
            </div>
          </div>
          <Link to="/" className="block w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition text-center">
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    )
  }

  // ── Empty cart guard ──────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="text-5xl">🛒</div>
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
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

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-shrink-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= step ? "bg-slate-900 text-white" : "bg-gray-200 text-gray-400"}`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-semibold ${i === step ? "text-slate-900" : "text-gray-400"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-200 mx-1"/>}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* STEP 0 — Cart Review */}
              {step === 0 && (
                <motion.div key="cart" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold mb-4">Review Cart ({cart.length} items)</h2>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item._id || item.id} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                        <img src={item.image} alt={item.title}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                          onError={e => e.target.src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}/>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 line-clamp-2">{item.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">₹{item.price?.toLocaleString()}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 text-xs font-bold flex items-center justify-center hover:bg-gray-300 transition">−</button>
                            <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 text-xs font-bold flex items-center justify-center hover:bg-gray-300 transition">+</button>
                            <button onClick={() => removeFromCart(item._id || item.id)}
                              className="ml-auto text-xs text-red-400 hover:text-red-600 font-semibold transition">Remove</button>
                          </div>
                        </div>
                        <p className="text-sm font-bold flex-shrink-0 self-start">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setStep(1)}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition text-sm">
                    Continue to Delivery →
                  </button>
                </motion.div>
              )}

              {/* STEP 1 — Delivery */}
              {step === 1 && (
                <motion.div key="delivery" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold mb-4">Delivery Details</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {name:"name",    label:"Full Name",    placeholder:"Enter your full name",       type:"text"},
                      {name:"email",   label:"Email",        placeholder:"Enter your email",    type:"email"},
                      {name:"phone",   label:"Phone",        placeholder:"Enter your phone number",         type:"tel"},
                      {name:"address", label:"Address",      placeholder:"Enter your address",   type:"text"},
                      {name:"city",    label:"City",         placeholder:"Enter your city",             type:"text"},
                      {name:"state",   label:"State",        placeholder:"Enter your state",     type:"text"},
                      {name:"pincode", label:"Pincode",      placeholder:"Enter your pincode",             type:"text"},
                    ].map(f => (
                      <div key={f.name} className={f.name === "address" ? "sm:col-span-2" : ""}>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">{f.label}</label>
                        <input name={f.name} value={delivery[f.name]} onChange={handleDeliveryChange}
                          placeholder={f.placeholder} type={f.type}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition"/>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={() => setStep(0)} className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">← Back</button>
                    <button onClick={() => { if (!deliveryValid) { alert("Please fill all required fields correctly."); return; } setStep(2); }} disabled={!deliveryValid}
                      className={`flex-1 py-3 rounded-xl font-semibold transition text-sm ${deliveryValid ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                      Continue to Payment →
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2 — Payment */}
              {step === 2 && (
                <motion.div key="payment" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold mb-4">Payment Method</h2>
                  <div className="flex gap-3 mb-6">
                    {[
                      {id:"upi",  label:"UPI / GPay", icon:"📱"},
                      {id:"card", label:"Card",        icon:"💳"},
                      {id:"cod",  label:"Cash on Delivery", icon:"💵"},
                    ].map(m => (
                      <button key={m.id} onClick={() => setPayment({...payment, method:m.id})}
                        className={`flex-1 py-3 rounded-xl border-2 text-sm font-semibold transition flex flex-col items-center gap-1 ${payment.method === m.id ? "border-slate-900 bg-slate-50" : "border-gray-200 hover:border-gray-300"}`}>
                        <span className="text-lg">{m.icon}</span>{m.label}
                      </button>
                    ))}
                  </div>

                  {payment.method === "upi" && (
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-sm text-blue-700 font-medium">
                        📱 Google Pay, PhonePe, Paytm and all UPI apps are supported
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">UPI ID (optional)</label>
                        <input name="upiId" value={payment.upiId} onChange={handlePaymentChange} placeholder="rahul@okaxis"
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition"/>
                        <p className="text-xs text-gray-400 mt-1">Leave blank to choose UPI app in next step</p>
                      </div>
                    </div>
                  )}

                  {payment.method === "card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Card Number</label>
                        <input name="cardNo" value={payment.cardNo} onChange={handlePaymentChange} placeholder="1234 5678 9012 3456" maxLength={19}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">Expiry</label>
                          <input name="expiry" value={payment.expiry} onChange={handlePaymentChange} placeholder="MM/YY" maxLength={5}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition"/>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wide">CVV</label>
                          <input name="cvv" value={payment.cvv} onChange={handlePaymentChange} placeholder="•••" maxLength={4} type="password"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-slate-400 transition"/>
                        </div>
                      </div>
                    </div>
                  )}

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
                <motion.div key="confirm" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold mb-4">Confirm Order</h2>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                      <p className="text-sm text-red-600 font-medium">⚠️ {error}</p>
                    </div>
                  )}

                  <div className="space-y-3 mb-6">
                    {[
                      ["Deliver To", `${delivery.name}, ${delivery.address}, ${delivery.city} - ${delivery.pincode}`],
                      ["Phone",      delivery.phone],
                      ["Email",      delivery.email],
                      ["Payment",    payment.method === "upi" ? `UPI / Google Pay` : payment.method === "card" ? `Card ending ${payment.cardNo?.slice(-4) || "N/A"}` : "Cash on Delivery"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex gap-4 p-3 bg-gray-50 rounded-xl">
                        <span className="text-xs font-bold text-gray-400 uppercase w-20 flex-shrink-0 pt-0.5">{k}</span>
                        <span className="text-sm font-semibold text-slate-700">{v}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(2)} className="flex-1 border border-gray-200 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition text-sm">← Back</button>
                    <button onClick={handlePlaceOrder} disabled={placing}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-bold hover:bg-red-600 transition text-sm disabled:bg-red-300">
                      {placing ? "Processing..." : payment.method === "cod" ? `Place Order · ₹${total.toLocaleString()}` : `Pay ₹${total.toLocaleString()} →`}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 self-start sticky top-24">
            <h3 className="font-bold text-base mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
              {cart.map(item => (
                <div key={item._id || item.id} className="flex gap-3">
                  <img src={item.image} alt={item.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    onError={e => e.target.src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"}/>
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
                <span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                {shipping === 0
                  ? <span className="text-green-600 font-bold">Free 🎉</span>
                  : <span className="text-gray-700 font-semibold">₹{shipping}</span>}
              </div>
              {shipping === 0 && (
                <p className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-lg">🎉 You qualify for free shipping!</p>
              )}
              {shipping > 0 && subtotal < 499 && (
                <p className="text-xs text-gray-400">Add ₹{(499 - subtotal).toLocaleString()} more for free shipping</p>
              )}
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2 mt-2">
                <span>Total</span><span>₹{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}