import { Link } from "react-router-dom"
import { CATEGORIES } from "../data/categories"
import puja from "../assets/puja.jpeg"
import Holi from "../assets/5480.jpg"

const categoryImages = {
  "Fashion": "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80",
  "Hardware & Tools": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&q=80",
  "Electronics": "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
  "Home & Kitchen Care": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80",
  "Stationary": "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600&q=80",
  "Organisers": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "Toys": "https://images.unsplash.com/photo-1558877385-81a1c7e67d72?w=600&q=80",
  "Decoration": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80",
  "Gifting Products": "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
  "Jewellery": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80",
  "Gardening": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=80",
  "KIDS Accessories": "https://images.unsplash.com/photo-1545558014-8692077e9b5c?w=600&q=80",
  "Women Accessories": "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80",
  "Beauty & Body Care": "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80",
    "Pujan Samagri": puja,
     "Holi": Holi,
  "Raksha Bandhan": "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&q=80",
  "Summer": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
  "Winter": "https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=600&q=80",
  "Rainy": "https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=600&q=80",
}

const categoryEmoji = {
  "Fashion": "👗", "Hardware & Tools": "🔧", "Electronics": "📱",
  "Home & Kitchen Care": "🏠", "Stationary": "✏️", "Organisers": "📦",
  "Toys": "🧸", "Decoration": "🎨", "Gifting Products": "🎁",
  "Jewellery": "💍", "Gardening": "🌱", "KIDS Accessories": "👶",
  "Women Accessories": "👜", "Beauty & Body Care": "💄",
  "Pujan Samagri": "🪔", "Holi": "🎨", "Raksha Bandhan": "🪢",
  "Summer": "☀️", "Winter": "❄️", "Rainy": "🌧️",
}

export default function AllCategoriesPage() {
  const parentCats = CATEGORIES

  return (
    <div style={{ background: "#f0f3f7", minHeight: "100vh" }}>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e8e8e8", padding: "16px 0" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#878787", marginBottom: 8 }}>
            <Link to="/" style={{ color: "#878787", textDecoration: "none" }}>Home</Link>
            <span>›</span>
            <span style={{ color: "#212121", fontWeight: 600 }}>All Categories</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#212121", margin: 0 }}>
            Shop by Category
          </h1>
          <p style={{ fontSize: 13, color: "#878787", marginTop: 4 }}>
            {parentCats.length} categories available
          </p>
        </div>
      </div>

      {/* ── Grid ───────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px 16px 40px" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}>
          {parentCats.map(cat => (
            <Link
              key={cat.id}
              to={`/category/${encodeURIComponent(cat.label)}`}
              style={{ textDecoration: "none" }}
            >
              <div style={{
                background: "#fff",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                border: "1px solid #f0f0f0",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
                onMouseOver={e => {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.14)"
                  e.currentTarget.style.transform = "translateY(-3px)"
                }}
                onMouseOut={e => {
                  e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)"
                  e.currentTarget.style.transform = "translateY(0)"
                }}
              >
                {/* Image */}
                <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "#f8f8f8" }}>
                  <img
                    src={categoryImages[cat.label] || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80"}
                    alt={cat.label}
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                    onMouseOver={e => e.target.style.transform = "scale(1.06)"}
                    onMouseOut={e => e.target.style.transform = "scale(1)"}
                    onError={e => {
                      e.target.style.display = "none"
                      e.target.parentNode.style.background = "#f0f3f7"
                    }}
                  />
                  {/* Gradient overlay */}
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 60%)",
                  }} />
                  {/* Category name on image */}
                  <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "12px 10px 10px",
                  }}>
                    <p style={{
                      fontSize: 13, fontWeight: 700, color: "#fff",
                      margin: 0, lineHeight: 1.3,
                      textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                    }}>
                      {categoryEmoji[cat.label] || "🛍️"} {cat.label}
                    </p>
                    {cat.sub?.length > 0 && (
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", margin: "2px 0 0", fontWeight: 500 }}>
                        {cat.sub.length} subcategories
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom bar */}
                <div style={{
                  padding: "8px 10px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  borderTop: "1px solid #f5f5f5",
                }}>
                  <span style={{ fontSize: 11, color: "#2874F0", fontWeight: 700 }}>
                    Shop Now
                  </span>
                  <span style={{ fontSize: 12, color: "#2874F0" }}>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}