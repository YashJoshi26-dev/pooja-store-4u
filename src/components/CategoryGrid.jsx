import { useRef } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { CATEGORIES } from "../data/categories"

const categoryImages = {
  "Fashion":             "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400",
  "Hardware & Tools":    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400",
  "Electronics":         "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400",
  "Home & Kitchen Care": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400",
  "Stationary":          "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=400",
  "Organisers":          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
  "Toys":                "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=400",
  "Decoration":          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400",
  "Gifting Products":    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400",
  "Jewellery":           "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400",
  "Gardening":           "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400",
  "KIDS Accessories":    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=400",
  "Women Accessories":   "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
  "Beauty & Body Care":  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
  "Pujan Samagri":       "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
  "Holi":                "https://images.unsplash.com/photo-1615461065624-a7723efd0ce0?w=400",
  "Raksha Bandhan":      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400",
  "Summer":              "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=400",
  "Winter":              "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=400",
  "Rainy":               "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400",
}

const FEATURED_CATS = [
  "Pujan Samagri","Fashion","Electronics","Home & Kitchen Care",
  "Jewellery","Gifting Products","Beauty & Body Care","Toys",
  "KIDS Accessories","Decoration","Stationary","Gardening",
]

export default function CategoryGrid() {
  const scrollRef = useRef(null)
  const displayCats = CATEGORIES.filter(c => FEATURED_CATS.includes(c.label))

  const scroll = (dir) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 200, behavior: "smooth" })
    }
  }

  return (
    <section className="bg-white py-4 md:py-5 border-b border-gray-100">
      <div className="container-main">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base md:text-lg font-black text-gray-900">
            Shop by <span style={{ color: "var(--primary)" }}>Category</span>
          </h2>
          <Link to="/products"
            style={{ color: "var(--primary)" }}
            className="text-xs font-bold hover:underline">
            View All →
          </Link>
        </div>

        {/* Scroll wrapper */}
        <div className="relative">
          {/* Left arrow */}
          <button
            onClick={() => scroll(-1)}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 items-center justify-center hover:shadow-lg transition"
          >
            <FiChevronLeft size={16} className="text-gray-600"/>
          </button>

          {/* Scrollable row */}
          <div ref={scrollRef} className="scroll-x pb-1">
            {displayCats.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03, duration: 0.25 }}
                viewport={{ once: true }}
                className="flex-shrink-0"
              >
                <Link
                  to={`/category/${encodeURIComponent(cat.label)}`}
                  className="flex flex-col items-center gap-2 w-20 sm:w-24 group"
                >
                  {/* Circle image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-blue-400 transition-all duration-200 shadow-sm group-hover:shadow-md">
                    <motion.img
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.25 }}
                      src={categoryImages[cat.label] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                      alt={cat.label}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={e => e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400"}
                    />
                  </div>
                  {/* Label */}
                  <span className="text-[10px] sm:text-xs font-bold text-center text-gray-700 group-hover:text-blue-600 transition leading-tight line-clamp-2">
                    {cat.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right arrow */}
          <button
            onClick={() => scroll(1)}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 bg-white rounded-full shadow-md border border-gray-200 items-center justify-center hover:shadow-lg transition"
          >
            <FiChevronRight size={16} className="text-gray-600"/>
          </button>
        </div>

      </div>
    </section>
  )
}