import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FiHeart, FiShoppingCart } from "react-icons/fi"
import { useCart } from "../Context/CartContext"

function ProductCard({ product }) {
  const { addToCart } = useCart()

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
        <FiHeart size={16}/>
      </button>

      {/* IMAGE */}
      <Link to={`/product/${productId}`}>
        <div className="h-52 overflow-hidden bg-gray-50">
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
          <p className={`text-xs font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}>
            {product.stock > 0 ? (product.stock < 10 ? `Only ${product.stock} left!` : "In Stock") : "Out of Stock"}
          </p>
        )}

        {/* Add to Cart */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => addToCart(product)}
          disabled={product.stock === 0}
          className={`mt-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition ${
            product.stock === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-slate-900 text-white hover:bg-red-500"
          }`}
        >
          <FiShoppingCart size={15}/>
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </motion.button>
      </div>
    </motion.div>
  )
}

export default ProductCard
