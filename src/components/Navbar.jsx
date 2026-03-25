import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi"
import { useCart } from "../Context/CartContext"

const categories = [
  "HouseHold", "HandTools", "Fashion", "Home & Kitchen",
  "Seasonable", "Stationary", "Organiser", "Toys", "Decoration", "Gift", "Puja"
]

function Navbar() {
  const [openMenu, setOpenMenu] = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchFocused, setSearchFocused] = useState(false)

  // ✅ FIX: Use cartCount directly from context instead of recalculating
  const { cartCount } = useCart()
  const navigate = useNavigate()

  // ✅ FIX: Search is now wired up
  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/category/all?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setOpenMenu(false)
    }
  }

  return (
    <nav className="sticky top-4 z-50 px-4">

      <div className="container-main glass rounded-2xl shadow-lg border border-white/40 px-6 py-4 flex items-center gap-6">

        {/* LOGO — ✅ FIX: typo "Strore" → "Store" */}
        <Link to="/" className="text-xl font-bold tracking-wide text-slate-900">
          PoojaStore4u
        </Link>

        {/* CATEGORY DROPDOWN */}
        <div
          className="relative hidden md:block"
          onMouseEnter={() => setShowCategories(true)}
          onMouseLeave={() => setShowCategories(false)}
        >
          <button className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition">
            All Categories ▼
          </button>

          <AnimatePresence>
            {showCategories && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="absolute left-0 mt-3 w-56 bg-white rounded-xl shadow-soft p-3 grid gap-2"
              >
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/category/${cat}`}
                    onClick={() => setShowCategories(false)}
                    className="text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    {cat}
                  </Link>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* SEARCH BAR — ✅ FIX: now wired to handleSearch */}
        <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 ml-4 flex-1 max-w-xl">
          <FiSearch className="text-gray-500 cursor-pointer" onClick={handleSearch} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="bg-transparent outline-none px-3 text-sm w-full"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </form>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-6 ml-auto">

          <Link
            to="/account"
            className="hidden md:flex items-center gap-2 text-sm hover:text-blue-600 transition"
          >
            <FiUser size={20} />
            Account
          </Link>

          {/* CART — ✅ FIX: uses cartCount from context */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 hover:text-blue-600 transition"
          >
            <FiShoppingCart size={22} />
            <span className="hidden md:block text-sm">Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 text-xs bg-blue-600 text-white w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>

          {/* MOBILE MENU BUTTON */}
          <button className="md:hidden" onClick={() => setOpenMenu(!openMenu)}>
            {openMenu ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {openMenu && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="md:hidden overflow-hidden bg-white border-t rounded-b-2xl shadow-lg"
          >
            <div className="p-4 flex flex-col gap-4">

              {/* SEARCH MOBILE */}
              <form onSubmit={handleSearch} className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                <FiSearch />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="bg-transparent outline-none px-3 text-sm w-full"
                />
              </form>

              {/* CATEGORIES */}
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat}
                    to={`/category/${cat}`}
                    className="py-2 text-sm border-b"
                    onClick={() => setOpenMenu(false)}
                  >
                    {cat}
                  </Link>
                ))}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  )
}

export default Navbar
