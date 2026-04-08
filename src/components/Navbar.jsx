import { useState, useRef, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { FiSearch, FiShoppingCart, FiUser, FiMenu, FiX, FiChevronRight } from "react-icons/fi"
import { useCart } from "../Context/CartContext"
import { CATEGORIES } from "../data/categories"

function Navbar() {
  const [openMenu,       setOpenMenu]       = useState(false)
  const [showCategories, setShowCategories] = useState(false)
  const [hoveredCat,     setHoveredCat]     = useState(null)
  const [searchQuery,    setSearchQuery]    = useState("")
  const [searchFocused,  setSearchFocused]  = useState(false)

  const { cartCount } = useCart()
  const navigate      = useNavigate()
  const dropdownRef   = useRef(null)
  const closeTimer    = useRef(null)

  // ✅ Close dropdown cleanly without flicker
  const handleMouseEnterDropdown = () => {
    clearTimeout(closeTimer.current)
    setShowCategories(true)
  }
  const handleMouseLeaveDropdown = () => {
    closeTimer.current = setTimeout(() => {
      setShowCategories(false)
      setHoveredCat(null)
    }, 120)
  }

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery("")
      setOpenMenu(false)
    }
  }

  return (
    <>
      <style>{`
        .nav-dropdown-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 10px 16px; font-size: 13.5px; font-weight: 500;
          color: #444; cursor: pointer; transition: all 0.15s;
          border-bottom: 1px solid #f5f5f5;
          text-decoration: none;
        }
        .nav-dropdown-item:hover, .nav-dropdown-item.active {
          background: #fff5f5; color: #e53e3e;
        }
        .nav-dropdown-item:last-child { border-bottom: none; }
        .sub-item {
          display: flex; align-items: center; padding: 9px 16px;
          font-size: 13px; color: #555; transition: all 0.15s;
          border-bottom: 1px solid #f9f9f9; text-decoration: none;
        }
        .sub-item:hover { background: #fff5f5; color: #e53e3e; padding-left: 20px; }
        .sub-item:last-child { border-bottom: none; }
      `}</style>

      <nav className="sticky top-0 z-50">

        {/* ── MAIN BAR ── */}
        <div style={{
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
        }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", gap: 24 }}>

            {/* LOGO */}
            <Link to="/" style={{ fontSize: 20, fontWeight: 800, color: "#1a1a1a", letterSpacing: "-0.03em", whiteSpace: "nowrap", textDecoration: "none", flexShrink: 0 }}>
              <span style={{ color: "#e53e3e" }}>Pooja</span>Store4u
            </Link>

            {/* ── CATEGORIES DROPDOWN ── */}
            <div
              ref={dropdownRef}
              style={{ position: "relative", flexShrink: 0 }}
              onMouseEnter={handleMouseEnterDropdown}
              onMouseLeave={handleMouseLeaveDropdown}
            >
              <button style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 13.5, fontWeight: 600, color: "#333",
                background: showCategories ? "#fff5f5" : "#f7f7f7",
                border: `1px solid ${showCategories ? "#fca5a5" : "#e5e5e5"}`,
                borderRadius: 10, padding: "8px 14px",
                cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
              }}>
                <span>☰</span>
                All Categories
                <FiChevronRight size={13} style={{ transform: showCategories ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s", color: "#999" }}/>
              </button>

              <AnimatePresence>
                {showCategories && (
                  <motion.div
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    onMouseEnter={handleMouseEnterDropdown}
                    onMouseLeave={handleMouseLeaveDropdown}
                    style={{
                      position: "absolute", top: "calc(100% + 8px)", left: 0,
                      width: 248, background: "#fff",
                      borderRadius: 14, border: "1px solid #f0f0f0",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                      overflow: "hidden", zIndex: 500,
                    }}
                  >
                    {/* Header */}
                    <div style={{ padding: "10px 16px 8px", borderBottom: "1px solid #f5f5f5", background: "#fafafa" }}>
                      <p style={{ fontSize: 10, fontWeight: 800, color: "#aaa", letterSpacing: "0.1em" }}>BROWSE CATEGORIES</p>
                    </div>

                    <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                      {CATEGORIES.map((cat) => (
                        <div
                          key={cat.id}
                          style={{ position: "relative" }}
                          onMouseEnter={() => setHoveredCat(cat.id)}
                          onMouseLeave={() => setHoveredCat(null)}
                        >
                          {cat.sub.length > 0 ? (
                            <>
                              {/* Parent with subcategories */}
                              <div className={`nav-dropdown-item ${hoveredCat === cat.id ? "active" : ""}`}>
                                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                  <span style={{ fontSize: 16 }}>🪔</span>
                                  {cat.label}
                                </span>
                                <FiChevronRight size={13} style={{ color: hoveredCat === cat.id ? "#e53e3e" : "#bbb" }}/>
                              </div>

                              {/* Flyout */}
                              <AnimatePresence>
                                {hoveredCat === cat.id && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -4 }}
                                    transition={{ duration: 0.12 }}
                                    style={{
                                      position: "absolute", left: "100%", top: 0,
                                      width: 224, background: "#fff",
                                      borderRadius: 14, border: "1px solid #f0f0f0",
                                      boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
                                      overflow: "hidden", zIndex: 600,
                                      marginLeft: 6,
                                    }}
                                  >
                                    <div style={{ padding: "10px 16px", background: "#e53e3e" }}>
                                      <p style={{ fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>🪔 {cat.label.toUpperCase()}</p>
                                    </div>
                                    {cat.sub.map((sub) => (
                                      <Link
                                        key={sub.id}
                                        to={`/category/${encodeURIComponent(sub.label)}`}
                                        className="sub-item"
                                        onClick={() => { setShowCategories(false); setHoveredCat(null); }}
                                      >
                                        {sub.label}
                                      </Link>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          ) : (
                            <Link
                              to={`/category/${encodeURIComponent(cat.label)}`}
                              className="nav-dropdown-item"
                              onClick={() => { setShowCategories(false); setHoveredCat(null); }}
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
            </div>

            {/* ── SEARCH ── */}
            <form
              onSubmit={handleSearch}
              style={{
                display: "flex", alignItems: "center", gap: 8, flex: 1, maxWidth: 480,
                background: searchFocused ? "#fff" : "#f5f5f5",
                border: `1.5px solid ${searchFocused ? "#e53e3e" : "transparent"}`,
                borderRadius: 12, padding: "8px 16px",
                transition: "all 0.2s",
                boxShadow: searchFocused ? "0 0 0 3px rgba(229,62,62,0.08)" : "none",
              }}
              className="hidden md:flex"
            >
              <FiSearch style={{ color: searchFocused ? "#e53e3e" : "#aaa", flexShrink: 0 }} size={16}/>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search products, categories..."
                style={{ background: "transparent", border: "none", outline: "none", fontSize: 13.5, width: "100%", color: "#333" }}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#aaa", fontSize: 16, padding: 0 }}>×</button>
              )}
            </form>

            {/* ── RIGHT SIDE ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto", flexShrink: 0 }}>

              {/* Account */}
              <Link to="/account" style={{
                display: "none", alignItems: "center", gap: 6,
                fontSize: 13.5, fontWeight: 600, color: "#444",
                background: "#f7f7f7", border: "1px solid #e5e5e5",
                borderRadius: 10, padding: "8px 14px",
                textDecoration: "none", transition: "all 0.2s",
              }}
              className="hidden md:flex"
              onMouseOver={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.color = "#e53e3e"; e.currentTarget.style.borderColor = "#fca5a5"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#f7f7f7"; e.currentTarget.style.color = "#444"; e.currentTarget.style.borderColor = "#e5e5e5"; }}
              >
                <FiUser size={15}/> Account
              </Link>

              {/* Cart */}
              <Link to="/cart" style={{
                display: "flex", alignItems: "center", gap: 6,
                fontSize: 13.5, fontWeight: 600, color: "#444",
                background: cartCount > 0 ? "#fff5f5" : "#f7f7f7",
                border: `1px solid ${cartCount > 0 ? "#fca5a5" : "#e5e5e5"}`,
                borderRadius: 10, padding: "8px 14px",
                textDecoration: "none", transition: "all 0.2s",
                position: "relative",
              }}
              onMouseOver={e => { e.currentTarget.style.background = "#fff5f5"; e.currentTarget.style.color = "#e53e3e"; }}
              onMouseOut={e => { e.currentTarget.style.background = cartCount > 0 ? "#fff5f5" : "#f7f7f7"; e.currentTarget.style.color = "#444"; }}
              >
                <FiShoppingCart size={16}/>
                <span className="hidden md:block">Cart</span>
                {cartCount > 0 && (
                  <span style={{
                    background: "#e53e3e", color: "#fff",
                    fontSize: 10, fontWeight: 800,
                    width: 18, height: 18, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setOpenMenu(!openMenu)}
                style={{
                  display: "none", alignItems: "center", justifyContent: "center",
                  background: "#f7f7f7", border: "1px solid #e5e5e5",
                  borderRadius: 10, width: 40, height: 40, cursor: "pointer",
                  color: "#444",
                }}
                className="md:hidden flex"
              >
                {openMenu ? <FiX size={20}/> : <FiMenu size={20}/>}
              </button>
            </div>
          </div>
        </div>

        {/* ── MOBILE MENU ── */}
        <AnimatePresence>
          {openMenu && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", overflow: "hidden" }}
            >
              <div style={{ padding: 16, maxHeight: "75vh", overflowY: "auto" }}>

                {/* Mobile search */}
                <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f5f5", borderRadius: 12, padding: "10px 14px", marginBottom: 12 }}>
                  <FiSearch style={{ color: "#aaa" }} size={16}/>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search products..."
                    style={{ background: "transparent", border: "none", outline: "none", fontSize: 14, width: "100%" }}
                  />
                </form>

                {/* Mobile categories */}
                {CATEGORIES.map((cat) => (
                  <div key={cat.id}>
                    {cat.sub.length > 0 ? (
                      <>
                        <div style={{ padding: "8px 10px", fontSize: 11, fontWeight: 800, color: "#e53e3e", letterSpacing: "0.08em", background: "#fff5f5", borderRadius: 8, marginTop: 8, marginBottom: 4 }}>
                          🪔 {cat.label.toUpperCase()}
                        </div>
                        {cat.sub.map((sub) => (
                          <Link
                            key={sub.id}
                            to={`/category/${encodeURIComponent(sub.label)}`}
                            onClick={() => setOpenMenu(false)}
                            style={{ display: "block", padding: "9px 16px", fontSize: 13.5, color: "#555", borderBottom: "1px solid #f5f5f5", textDecoration: "none" }}
                          >
                            {sub.label}
                          </Link>
                        ))}
                      </>
                    ) : (
                      <Link
                        to={`/category/${encodeURIComponent(cat.label)}`}
                        onClick={() => setOpenMenu(false)}
                        style={{ display: "block", padding: "10px 8px", fontSize: 13.5, fontWeight: 500, color: "#444", borderBottom: "1px solid #f5f5f5", textDecoration: "none" }}
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

export default Navbar
