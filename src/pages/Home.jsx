import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import { Link } from "react-router-dom"

import HeroBanner from "../components/HeroBanner"
import SocialSidebar from "../components/SocialSidebar"
import CategoryGrid from "../components/CategoryGrid"
import ProductCard from "../components/ProductCard"
import { getAllProducts } from "../api/productApi"

function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg overflow-hidden animate-pulse border border-gray-100">
      <div className="h-40 bg-gray-100"/>
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 bg-gray-100 rounded w-full"/>
        <div className="h-3 bg-gray-100 rounded w-3/4"/>
        <div className="h-4 bg-gray-100 rounded w-1/2 mt-1"/>
        <div className="h-8 bg-gray-100 rounded mt-2"/>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-200">
      <div className="text-5xl mb-4">🛍️</div>
      <p className="font-semibold text-gray-600 mb-1">No products listed yet</p>
      <p className="text-sm text-gray-400">Go to admin panel and add your first product</p>
      <Link to="/admin/dashboard" className="mt-4 text-sm font-semibold text-red-500 hover:underline">Go to Admin →</Link>
    </div>
  )
}

function ProductSwiper({ products }) {
  return (
    <Swiper
      modules={[Navigation]}
      navigation
      spaceBetween={8}
      breakpoints={{
        0:    { slidesPerView: 2   },
        640:  { slidesPerView: 3   },
        768:  { slidesPerView: 3   },
        1024: { slidesPerView: 4   },
        1280: { slidesPerView: 5   },
      }}
    >
      {products.map(p => (
        <SwiperSlide key={p._id || p.id}>
          <ProductCard product={p} />
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
function SocialIcon({ name }) {
  const icons = {
    whatsapp:  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.122 1.528 5.855L0 24l6.335-1.508C8.05 23.447 9.98 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.892 0-3.668-.523-5.188-1.43l-.372-.221-3.762.895.952-3.653-.243-.376C2.553 15.612 2 13.87 2 12 2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>,
    instagram: <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>,
    facebook:  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
    linkedin:  <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
  }
  return icons[name] || null
}
export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getAllProducts()
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false))
  }, [])

  // ── Section helpers ──────────────────────────────────────────────────────────
 // ✅ NEW ARRIVALS — last 7 days only
  const newArrivals = products.filter(p => {
    const days7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return new Date(p.createdAt) >= days7
  }).sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 20)

  // ✅ FEATURED — only admin-marked products
  const featuredProducts = products.filter(p => p.featured === true)

  // ✅ BEST DEALS — 50%+ discount automatically
  const onSale = products.filter(p => {
    const has50Off = p.oldPrice && p.price &&
      Math.round((1 - p.price / p.oldPrice) * 100) >= 50
    return has50Off
  })

  // ✅ BEST SELLERS — salesCount >= 10 automatically
  const bestSellers = products
    .filter(p => (p.salesCount || 0) >= 10)
    .sort((a,b) => b.salesCount - a.salesCount)

  // ✅ Multi-category aware
  const inCat = (cats) => products.filter(p => {
    const pCats = p.categories?.length ? p.categories : (p.category ? [p.category] : [])
    return pCats.some(c => cats.includes(c))
  })

  const pujanCats = ["Pujan Samagri","Laddu Gopal Shringar","Hanuman Ji Vastra","Radha Krishna Vastra","Ganesh Ji Vastra","Mata Chunri"]
  const pujanProducts = inCat(pujanCats)

  if (error) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-red-500 font-medium">{error}</p>
      <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-6 py-2 rounded-lg">Retry</button>
    </div>
  )

  return (
    <div className="pb-14 md:pb-0" style={{background:"#F0F3F7"}}>
      <SocialSidebar />
      <HeroBanner />
      <CategoryGrid />

      {/* NEW ARRIVALS */}
      <section className="container-main py-4 md:py-8">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-base md:text-xl font-black text-gray-900">New Arrivals</h2>
            <p className="text-sm text-gray-400 mt-0.5">Latest products from our store</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-red-500 hover:underline">View All →</Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) :  newArrivals.length > 0 ? 
          <ProductSwiper products={newArrivals} /> 
         
        : (
          <EmptyState />
        )}
      </section>

      {/* FEATURED */}
      {!loading && featuredProducts.length > 0 && (
        <section className="container-main py-4 md:py-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-base md:text-xl font-black text-gray-900">Featured Products</h2>
              <p className="text-sm text-gray-400 mt-0.5">Handpicked for you</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-red-500 hover:underline">View All →</Link>
          </div>
           {featuredProducts.length > 0
            ? <ProductSwiper products={featuredProducts} />
            : <p className="text-sm text-gray-400">No featured products yet. Mark products as featured in admin.</p>
          }
        </section>
      )}

      {/* BEST DEALS */}
      {!loading && onSale.length > 0 && (
        <section className="container-main py-4 md:py-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-base md:text-xl font-black text-gray-900">🔥 Best Deals</h2>
              <p className="text-sm text-gray-400 mt-0.5">50%+ discount products</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-red-500 hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {onSale.slice(0, 8).map(p => <ProductCard key={p._id || p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* BEST SELLERS */}
      {!loading && (
        <section className="container-main py-4 md:py-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-base md:text-xl font-black text-gray-900">⭐ Best Sellers</h2>
              <p className="text-sm text-gray-400 mt-0.5">Most popular products</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-red-500 hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {bestSellers.length > 0
              ? bestSellers.slice(0,8).map(p => (
              <ProductCard key={p._id || p.id} product={p} />
            ))
             : <p className="text-sm text-gray-400">..</p>
          }
          </div>
        </section>
      )}

      {/* PUJAN SAMAGRI */}
      {!loading && pujanProducts.length > 0 && (
        <section className="container-main py-4 md:py-6">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="text-base md:text-xl font-black text-gray-900">🪔 Pujan Samagri</h2>
              <p className="text-sm text-gray-400 mt-0.5">Devotional items & accessories</p>
            </div>
            <Link to="/category/Pujan%20Samagri" className="text-sm font-semibold text-red-500 hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
            {pujanProducts.slice(0, 8).map(p => <ProductCard key={p._id || p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* EMPTY STATE */}
      {!loading && products.length === 0 && (
        <section className="container-main py-20">
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="text-7xl mb-6">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-3">No Products Listed Yet</h2>
            <p className="text-gray-400 mb-6 max-w-md">Go to admin panel and start listing your products.</p>
            <Link to="/admin/login" className="bg-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-600 transition">
              Go to Admin Panel
            </Link>
          </div>
        </section>
      )}

      {/* NEWSLETTER */}
      <section className="bg-slate-900 text-white py-16 mt-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-3">Join Our Newsletter</h2>
          <p className="text-gray-300 mb-6">Get the latest deals and product updates</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <input type="email" placeholder="Enter your email"
              className="px-4 py-3 rounded-xl text-black w-full md:w-80 outline-none" />
            <button className="bg-blue-500 px-8 py-3 rounded-xl hover:bg-blue-600 transition font-semibold">Subscribe</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3"><span className="text-red-500">Pooja</span>Store4u</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Your one-stop shop for Pujan Samagri, Fashion, Electronics, Gifts and more.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-700">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {["Pujan Samagri", "Fashion", "Electronics", "Gifting Products", "Jewellery"].map(c => (
                <li key={c}><Link to={`/category/${encodeURIComponent(c)}`} className="hover:text-red-500 transition">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-700">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>About Us</li><li>Contact</li>
            </ul>
            {/* Social icons */}
            <div className="flex gap-3 mt-5">
              {[
                { icon: "whatsapp", href: "https://whatsapp.com/channel/0029VajCR73IN9imWUvSMr46", bg: "#25D366" },
                { icon: "instagram", href: "https://instagram.com/poojastore4u?igsh=bTI0ZGp3a2g3c2s2", bg: "#E1306C" },
                { icon: "facebook", href: "https://facebook.com/poojastore4u", bg: "#1877F2" },
                { icon: "linkedin", href: "https://linkedin.com/company/poojastore4u", bg: "#0A66C2" },
            
              ].map(s => (
                <a key={s.icon} href={s.href} target="_blank" rel="noopener noreferrer"
                  style={{ background: s.bg }}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform duration-200 shadow-sm">
                  <SocialIcon name={s.icon} />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-700">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500"><li>Help Center</li><li>Returns</li><li>Privacy Policy</li></ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-400 mt-10 border-t border-gray-100 pt-6">
          © 2026 PoojaStore4u. All rights reserved.
        </div>
      </footer>
    </div>
  )
}