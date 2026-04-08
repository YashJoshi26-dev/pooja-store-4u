import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { CATEGORIES } from "../data/categories"

// ✅ Category images mapped to your real categories
const categoryImages = {
  "Fashion":             "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600",
  "Hardware & Tools":    "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600",
  "Electronics":         "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
  "Home & Kitchen Care": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600",
  "Stationary":          "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600",
  "Organisers":          "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600",
  "Toys":                "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600",
  "Decoration":          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600",
  "Gifting Products":    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600",
  "Jewellery":           "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600",
  "Gardening":           "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600",
  "KIDS Accessories":    "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600",
  "Women Accessories":   "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600",
  "Beauty & Body Care":  "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
  "Pujan Samagri":       "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600",
  "Holi":                "https://images.unsplash.com/photo-1615461065624-a7723efd0ce0?w=600",
  "Raksha Bandhan":      "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600",
  "Summer":              "https://images.unsplash.com/photo-1473496169904-658ba7574b0d?w=600",
  "Winter":              "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600",
  "Rainy":               "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600",
}

// Show only main categories in grid (not all 25)
const FEATURED_CATS = [
  "Pujan Samagri",
  "Fashion",
  "Electronics",
  "Home & Kitchen Care",
  "Jewellery",
  "Gifting Products",
  "Beauty & Body Care",
  "Toys",
  "KIDS Accessories",
  "Decoration",
]

function CategoryGrid() {
  const displayCats = CATEGORIES.filter(c => FEATURED_CATS.includes(c.label))

  return (
    <section className="container-main py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
        <Link to="/products" className="text-sm font-semibold text-red-500 hover:underline">
          View All →
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayCats.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <Link
              to={`/category/${encodeURIComponent(cat.label)}`}
              className="group block bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* IMAGE */}
              <div className="h-36 overflow-hidden relative">
                <img
                  src={categoryImages[cat.label] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"}
                  alt={cat.label}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                  onError={(e) => e.target.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600"}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition duration-300"/>
                {/* Pujan Samagri badge */}
                {cat.sub.length > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    {cat.sub.length} types
                  </span>
                )}
              </div>

              {/* TITLE */}
              <div className="p-3 text-center">
                <h3 className="font-semibold text-sm text-gray-800 group-hover:text-red-500 transition leading-tight">
                  {cat.label}
                </h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

export default CategoryGrid
