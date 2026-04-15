import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiChevronDown } from "react-icons/fi"
import { useCart } from "../Context/CartContext"
import { CATEGORIES } from "../data/categories"

export default function Navbar() {
  const [openMenu,    setOpenMenu]    = useState(false)
  const [showCats,    setShowCats]    = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [focused,     setFocused]     = useState(false)
  const { cartCount } = useCart()
  const navigate      = useNavigate()
  const timer         = useRef(null)

  const openDrop  = () => { clearTimeout(timer.current); setShowCats(true) }
  const closeDrop = () => { timer.current = setTimeout(() => setShowCats(false), 150) }
  useEffect(() => () => clearTimeout(timer.current), [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery(""); setOpenMenu(false)
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 font-['Nunito']">

        {/* ── TOP BAR (Flipkart style blue) ── */}
        <div style={{ background: "var(--primary)" }}>
          <div className="container-main">
            <div className="flex items-center h-14 gap-3">

              {/* LOGO */}
              <Link to="/" className="flex-shrink-0 flex flex-col leading-none mr-1">
                <span className="text-white font-black text-lg tracking-tight leading-none">
                  Pooja<span className="text-yellow-300">Store</span>4u
                </span>
                
              </Link>

              {/* SEARCH — center */}
              <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
                <div className={`flex items-center w-full bg-white rounded-sm overflow-hidden shadow-md transition-all ${focused ? "ring-2 ring-yellow-300" : ""}`}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="Search for products, brands and more"
                    className="flex-1 px-4 py-2.5 text-sm text-gray-800 outline-none bg-transparent font-['Nunito']"
                  />
                  <button type="submit"
                    style={{ background: "var(--primary)" }}
                    className="px-5 py-2.5 flex items-center justify-center hover:opacity-90 transition"
                  >
                    <FiSearch className="text-white" size={18}/>
                  </button>
                </div>
              </form>

              {/* RIGHT ACTIONS */}
              <div className="flex items-center gap-1 ml-auto">

                {/* Login */}
                <Link to="/account"
                  className="hidden md:flex items-center gap-1 bg-white text-blue-600 font-bold text-sm px-5 py-1.5 rounded-sm hover:bg-blue-50 transition"
                >
                  Login
                </Link>

                {/* More */}
                <button
                  className="hidden md:flex items-center gap-1 text-white font-semibold text-sm px-3 py-1.5 hover:bg-blue-700 rounded-sm transition"
                  onMouseEnter={openDrop} onMouseLeave={closeDrop}
                >
                  WishList <FiChevronDown size={14} className={`transition-transform ${showCats ? "rotate-180" : ""}`}/>
                </button>

                {/* Cart */}
                <Link to="/cart"
                  className="flex items-center gap-2 text-white font-bold text-sm px-3 py-1.5 hover:bg-blue-700 rounded-sm transition relative"
                >
                  <div className="relative">
                    <FiShoppingCart size={20}/>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-yellow-400 text-gray-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {cartCount > 9 ? "9+" : cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden md:block">Cart</span>
                </Link>

                {/* Mobile hamburger */}
                <button
                  onClick={() => setOpenMenu(!openMenu)}
                  className="md:hidden flex items-center justify-center w-9 h-9 rounded-sm text-white hover:bg-blue-700 transition"
                >
                  {openMenu ? <FiX size={20}/> : <FiMenu size={20}/>}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── CATEGORIES BAR (white strip below blue) ── */}
        <div className="bg-white shadow-sm hidden md:block border-b border-gray-100">
          <div className="container-main">
            <div className="flex items-center gap-1 h-11 overflow-x-auto scrollbar-none">
              {CATEGORIES.slice(0, 12).map(cat => (
                <Link
                  key={cat.id}
                  to={`/category/${encodeURIComponent(cat.label)}`}
                  className="flex-shrink-0 text-xs font-semibold text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded hover:bg-blue-50 transition whitespace-nowrap"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ── MOBILE SEARCH BAR ── */}
        <div className="md:hidden bg-white px-3 py-2 border-b border-gray-100">
          <form onSubmit={handleSearch}>
            <div className={`flex items-center bg-gray-100 rounded-lg overflow-hidden transition-all ${focused ? "ring-2 ring-blue-400" : ""}`}>
              <FiSearch className="ml-3 text-gray-400 flex-shrink-0" size={15}/>
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Search products..."
                className="flex-1 px-3 py-2.5 text-sm bg-transparent outline-none font-['Nunito']"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")}
                  className="mr-2 text-gray-400 text-lg leading-none">×</button>
              )}
            </div>
          </form>
        </div>

        {/* ── MOBILE DRAWER MENU ── */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 shadow-lg overflow-hidden"
            >
              <div className="max-h-[70vh] overflow-y-auto p-3">
                <p className="text-[10px] font-black text-gray-400 tracking-widest px-2 pb-2 pt-1">CATEGORIES</p>
                {CATEGORIES.map(cat => (
                  <div key={cat.id}>
                    {cat.sub.length > 0 ? (
                      <>
                        <div className="px-3 py-1.5 text-[11px] font-black text-blue-600 bg-blue-50 rounded-lg mt-2 mb-1 tracking-wide">
                          {cat.label.toUpperCase()}
                        </div>
                        {cat.sub.map(sub => (
                          <Link key={sub.id}
                            to={`/category/${encodeURIComponent(sub.label)}`}
                            onClick={() => setOpenMenu(false)}
                            className="block px-5 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </>
                    ) : (
                      <Link
                        to={`/category/${encodeURIComponent(cat.label)}`}
                        onClick={() => setOpenMenu(false)}
                        className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      >
                        {cat.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  )
}