import { useState } from "react"
import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { FiHeart, FiShoppingCart } from "react-icons/fi"
import { useCart } from "../Context/CartContext"

function ProductCard({ product }) {
  const { addToCart, buyNow } = useCart()
  const navigate = useNavigate()
  const [wishlisted, setWishlisted] = useState(false)
  const [added,      setAdded]      = useState(false)

  const productId = product._id || product.id
  const discount  = product.oldPrice && product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0

  const handleAdd = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (product.stock === 0) return
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      viewport={{ once: true }}
      className="bg-white flex flex-col relative overflow-hidden"
      style={{
        borderRadius: 4,
        border: "1px solid #e8e8e8",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
      }}
    >
      {/* DISCOUNT BADGE */}
      {discount >= 5 && (
        <div className="absolute top-0 left-0 z-10">
          <span className="bg-[#388E3C] text-white font-black text-[9px] px-1.5 py-0.5 block">
            {discount}% off
          </span>
        </div>
      )}

      {/* WISHLIST */}
      <button
        onClick={(e) => { e.preventDefault(); setWishlisted(w => !w) }}
        className="absolute top-1.5 right-1.5 z-10 w-6 h-6 rounded-full bg-white/95 shadow-sm flex items-center justify-center"
      >
        <FiHeart
          size={11}
          className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-300"}
        />
      </button>

      {/* IMAGE — square, like Flipkart */}
      <Link to={`/product/${productId}`} className="block bg-white">
        <div className="aspect-square overflow-hidden flex items-center justify-center p-2 bg-gray-50">
          <img
            src={product.image || product.images?.[0]}
            alt={product.title}
            loading="lazy"
            onError={e => e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
            className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
      </Link>

      {/* INFO */}
      <div className="px-2 pt-1.5 pb-2 flex flex-col gap-1 flex-1">

        {/* Title */}
        <Link
          to={`/product/${productId}`}
          className="text-[11px] sm:text-xs font-medium text-gray-800 line-clamp-2 hover:text-[#2874F0] transition leading-tight"
        >
          {product.title}
        </Link>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1">
            <span
              className="text-white text-[9px] font-bold px-1 py-0.5 rounded-sm flex items-center gap-0.5"
              style={{ background: "#388E3C" }}
            >
              {product.rating} ★
            </span>
            {product.reviews > 0 && (
              <span className="text-[9px] text-gray-400">({product.reviews})</span>
            )}
          </div>
        )}

        {/* Price row */}
        <div className="flex items-baseline gap-1 flex-wrap">
          <span className="text-sm font-black text-gray-900">
            ₹{product.price?.toLocaleString()}
          </span>
          {product.oldPrice && (
            <span className="text-[10px] text-gray-400 line-through">
              ₹{product.oldPrice?.toLocaleString()}
            </span>
          )}
        </div>

        {/* Free delivery */}
        {product.stock > 0 ? (
          <p className="text-[9px] font-semibold" style={{ color: "#388E3C" }}>
            Free delivery
          </p>
        ) : (
          <p className="text-[9px] font-semibold text-red-500">Out of Stock</p>
        )}

        {/* ADD TO CART button — full width like Flipkart */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="w-full flex items-center justify-center gap-1 py-1.5 mt-1 font-bold text-[10px] sm:text-[11px] transition-all rounded-sm"
          style={{
            background: product.stock === 0
              ? "#f5f5f5"
              : added
              ? "#388E3C"
              : "#FF9F00",
            color: product.stock === 0 ? "#aaa" : "white",
          }}
        >
          <FiShoppingCart size={10}/>
          {product.stock === 0 ? "Out of Stock" : added ? "Added ✓" : "Add to Cart"}
        </motion.button>

        {/* BUY NOW — only on larger screens */}
        {product.stock > 0 && (
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => { buyNow(product, 1); navigate("/checkout") }}
            className="w-full flex items-center justify-center py-1.5 font-bold text-[10px] sm:text-[11px] text-white rounded-sm transition hover:opacity-90"
            style={{ background: "#2874F0" }}
          >
            Buy Now
          </motion.button>
        )}

        {/* Out of stock notify */}
        {product.stock === 0 && (
          <button
            onClick={() => {
              const c = window.prompt("Enter email or phone:")
              if (c?.trim()) alert("We will notify you at " + c.trim() + " when back in stock!")
            }}
            className="text-[9px] font-bold text-[#2874F0] hover:underline text-center"
          >
            🔔 Notify Me
          </button>
        )}
      </div>
    </motion.div>
  )
}

export default ProductCard