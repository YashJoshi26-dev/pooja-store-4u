import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FiHeart, FiShoppingCart } from "react-icons/fi"
import { useCart } from "../Context/CartContext"

function ProductCard({ product }) {
  const { addToCart } = useCart()

  const discount =
    product.oldPrice &&
    Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      viewport={{ once: true }}
      className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden relative"
    >
      {/* DISCOUNT BADGE */}

      {discount && (
        <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-md z-10">
          -{discount}%
        </span>
      )}

      {/* WISHLIST ICON */}

      <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow hover:bg-gray-100 transition z-10">
        <FiHeart size={16} />
      </button>

      {/* PRODUCT IMAGE */}

      <Link to={`/product/${product.id}`}>

        <div className="h-52 overflow-hidden">

          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />

        </div>

      </Link>

      {/* PRODUCT INFO */}

      <div className="p-4 flex flex-col gap-2">

        {/* TITLE */}

        <Link
          to={`/product/${product.id}`}
          className="font-medium text-sm line-clamp-2 hover:text-blue-600 transition"
        >
          {product.title}
        </Link>

        {/* RATING */}

        <div className="flex items-center gap-1 text-yellow-500 text-sm">

          {"★".repeat(Math.floor(product.rating))}

          {"☆".repeat(5 - Math.floor(product.rating))}

          <span className="text-gray-500 text-xs ml-1">
            ({product.rating})
          </span>

        </div>

        {/* PRICE */}

        <div className="flex items-center gap-2">

          <span className="text-lg font-semibold">
            ₹{product.price}
          </span>

          {product.oldPrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.oldPrice}
            </span>
          )}

        </div>

        {/* ADD TO CART */}

        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => addToCart(product)}
          className="mt-2 flex items-center justify-center gap-2 bg-slate-900 text-white py-2 rounded-lg text-sm hover:bg-slate-800 transition"
        >
          <FiShoppingCart size={16} />
          Add to Cart
        </motion.button>

      </div>

    </motion.div>
  )
}

export default ProductCard