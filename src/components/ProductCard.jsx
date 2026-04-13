import { motion } from "framer-motion"
import { Link, useNavigate } from "react-router-dom"
import { FiHeart, FiShoppingCart } from "react-icons/fi"
import { useCart } from "../Context/CartContext"

function ProductCard({ product }) {
  const { addToCart, buyNow } = useCart()
  const navigate = useNavigate()
  // ✅ Support both MongoDB _id and local id
  const productId = product._id || product.id

  const discount = product.oldPrice && product.price
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0

  // ✅ Fallback image if Cloudinary image fails to load
  const handleImgError = (e) => {
    e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden relative"
    >
      {/* DISCOUNT BADGE */}
      {discount > 0 && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-md z-10 font-semibold">
          -{discount}%
        </span>
      )}

      {/* WISHLIST */}
      <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-red-50 hover:text-red-500 transition z-10">
        <FiHeart size={16} />
      </button>

      {/* IMAGE */}
      <Link to={`/product/${productId}`}>
        <div className="h-40 sm:h-52 overflow-hidden bg-gray-50">
          <img
            src={product.image || product.images?.[0]}
            alt={product.title}
            loading="lazy"
            onError={handleImgError}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
        </div>
      </Link>

      {/* INFO */}
      <div className="p-4 flex flex-col gap-2">

        {/* Category badge */}
        {product.category && (
          <span className="text-xs text-gray-400 font-medium">{product.category}</span>
        )}

        {/* Title */}
        <Link to={`/product/${productId}`} className="font-semibold text-sm line-clamp-2 hover:text-red-500 transition text-gray-800">
          {product.title}
        </Link>

        {/* Rating */}
        {product.rating > 0 && (
          <div className="flex items-center gap-1 text-yellow-500 text-sm">
            {"★".repeat(Math.min(Math.floor(product.rating), 5))}
            {"☆".repeat(Math.max(5 - Math.floor(product.rating), 0))}
            <span className="text-gray-400 text-xs ml-1">({product.rating})</span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
          {product.oldPrice && (
            <span className="text-sm text-gray-400 line-through">₹{product.oldPrice?.toLocaleString()}</span>
          )}
        </div>

        {/* Stock */}
        {product.stock !== undefined && (
          <div>
            {product.stock > 5 ? (
              <p className="text-xs font-semibold text-green-600">✓ IN STOCK</p>
            ) : product.stock > 0 ? (
              <p className="text-xs font-semibold text-orange-500">⚠ Only {product.stock} items left</p>
            ) : (
              <div className="flex flex-col gap-1">
                <p className="text-xs font-semibold text-red-500">✕ Out of Stock</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const contact = window.prompt("Enter your email or phone to get notified:");
                    if (contact?.trim()) alert(`✅ We'll notify you at ${contact.trim()} when back in stock!`);
                  }}
                  className="text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 px-2 py-1 rounded-lg transition text-left"
                >
                  🔔 Notify Me
                </button>
              </div>
            )}
          </div>
        )}

        {/* Add to Cart */}
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs sm:text-sm font-semibold transition ${product.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-red-500"
              }`}
          >
            <FiShoppingCart size={14} />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </motion.button>

          {product.stock > 0 && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => { buyNow(product, 1); navigate("/checkout"); }}
              className="flex-1 flex items-center justify-center py-2 rounded-xl text-xs sm:text-sm font-semibold bg-red-500 text-white hover:bg-red-600 transition"    >
              Buy Now
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default ProductCard
