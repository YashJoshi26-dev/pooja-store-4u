import { useEffect, useState } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation } from "swiper/modules"
import { Link } from "react-router-dom"

import HeroBanner   from "../components/HeroBanner"
import CategoryGrid from "../components/CategoryGrid"
import ProductCard  from "../components/ProductCard"
import { getAllProducts } from "../api/productApi"

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl shadow-md overflow-hidden animate-pulse">
      <div className="h-52 bg-gray-200"/>
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 bg-gray-200 rounded w-1/3"/>
        <div className="h-4 bg-gray-200 rounded w-3/4"/>
        <div className="h-3 bg-gray-200 rounded w-1/2"/>
        <div className="h-4 bg-gray-200 rounded w-1/3"/>
        <div className="h-9 bg-gray-200 rounded-xl"/>
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
      <Link to="/admin/dashboard" className="mt-4 text-sm font-semibold text-red-500 hover:underline">
        Go to Admin →
      </Link>
    </div>
  )
}

function ProductSwiper({ products }) {
  return (
    <Swiper
      modules={[Navigation]}
      navigation
      spaceBetween={20}
      breakpoints={{
        320:  { slidesPerView: 1.5 },
        640:  { slidesPerView: 2   },
        768:  { slidesPerView: 3   },
        1024: { slidesPerView: 4   },
      }}
    >
      {products.map(p => (
        <SwiperSlide key={p._id || p.id}>
          <ProductCard product={p}/>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    getAllProducts()
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setError("Failed to load products."))
      .finally(() => setLoading(false))
  }, [])

  // ── Section helpers ──────────────────────────────────────────────────────────
  // Tagged products
  const tagged  = (tag)  => products.filter(p => p.tags?.includes(tag))
  // By category group
  const byCat   = (cats) => products.filter(p => cats.includes(p.category))
  // Fallback: just latest N products
  const latest  = (n)    => [...products].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, n)
  // ✅ Best Deals: 50%+ discount OR tagged "Sale"
  const onSale = products.filter(p => {
    const has50Off = p.oldPrice && p.price &&
      Math.round((1 - p.price / p.oldPrice) * 100) >= 50
    const isSaleTagged = p.tags?.includes("Sale")
    return has50Off || isSaleTagged
  })

  const pujanCats = ["Pujan Samagri","Laddu Gopal Shringar","Hanuman Ji Vastra","Radha Krishna Vastra","Ganesh Ji Vastra","Mata Chunri"]
  const pujanProducts = byCat(pujanCats)

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-red-500 font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-slate-900 text-white px-6 py-2 rounded-lg">Retry</button>
      </div>
    )
  }

  return (
    <div>
      <HeroBanner/>
      <CategoryGrid/>

      {/* ── ALL PRODUCTS / NEW ARRIVALS ── */}
      <section className="container-main py-16">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
            <p className="text-sm text-gray-400 mt-0.5">Latest products from our store</p>
          </div>
          <Link to="/products" className="text-sm font-semibold text-red-500 hover:underline">View All →</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({length:4}).map((_,i) => <SkeletonCard key={i}/>)}
          </div>
        ) : latest(20).length > 0 ? (
          <ProductSwiper products={latest(20)}/>
        ) : (
          <EmptyState/>
        )}
      </section>

      {/* ── FEATURED PRODUCTS ── show tagged ones OR all if none tagged ── */}
      {!loading && products.length > 0 && (
        <section className="container-main py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
              <p className="text-sm text-gray-400 mt-0.5">Handpicked for you</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-red-500 hover:underline">View All →</Link>
          </div>
          <ProductSwiper products={tagged("Featured").length > 0 ? tagged("Featured") : latest(12)}/>
        </section>
      )}

      {/* ── BEST DEALS / ON SALE ── products with discount ── */}
      {!loading && onSale.length > 0 && (
        <section className="container-main py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🔥 Best Deals</h2>
              <p className="text-sm text-gray-400 mt-0.5">Products with special discounts</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-red-500 hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {onSale.slice(0, 8).map(p => <ProductCard key={p._id||p.id} product={p}/>)}
          </div>
        </section>
      )}

      {/* ── BEST SELLERS ── tagged or all ── */}
      {!loading && products.length > 0 && (
        <section className="container-main py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">⭐ Best Sellers</h2>
              <p className="text-sm text-gray-400 mt-0.5">Most popular products</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-red-500 hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(tagged("Best Seller").length > 0 ? tagged("Best Seller") : latest(8)).map(p => (
              <ProductCard key={p._id||p.id} product={p}/>
            ))}
          </div>
        </section>
      )}

      {/* ── PUJAN SAMAGRI ── only if products exist in this category ── */}
      {!loading && pujanProducts.length > 0 && (
        <section className="container-main py-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">🪔 Pujan Samagri</h2>
              <p className="text-sm text-gray-400 mt-0.5">Devotional items & accessories</p>
            </div>
            <Link to="/category/Pujan%20Samagri" className="text-sm font-semibold text-red-500 hover:underline">View All →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pujanProducts.slice(0, 8).map(p => <ProductCard key={p._id||p.id} product={p}/>)}
          </div>
        </section>
      )}

      {/* ── EMPTY STATE ── no products at all ── */}
      {!loading && products.length === 0 && (
        <section className="container-main py-20">
          <div className="flex flex-col items-center justify-center text-center py-20">
            <div className="text-7xl mb-6">🛍️</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-3">No Products Listed Yet</h2>
            <p className="text-gray-400 mb-6 max-w-md">Your store is ready! Go to the admin panel and start listing your products.</p>
            <Link to="/admin/login" className="bg-red-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-red-600 transition">
              Go to Admin Panel
            </Link>
          </div>
        </section>
      )}

      {/* ── NEWSLETTER ── */}
      <section className="bg-slate-900 text-white py-16 mt-8">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-3">Join Our Newsletter</h2>
          <p className="text-gray-300 mb-6">Get the latest deals and product updates</p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <input type="email" placeholder="Enter your email"
              className="px-4 py-3 rounded-xl text-black w-full md:w-80 outline-none"/>
            <button className="bg-red-500 px-8 py-3 rounded-xl hover:bg-red-600 transition font-semibold">
              Subscribe
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-50 border-t border-gray-100 py-12 mt-0">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-3"><span className="text-red-500">Pooja</span>Store4u</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Your one-stop shop for Pujan Samagri, fashion, electronics, gifts and more.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-700">Shop</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              {["Pujan Samagri","Fashion","Electronics","Gifting Products","Jewellery"].map(c=>(
                <li key={c}><Link to={`/category/${encodeURIComponent(c)}`} className="hover:text-red-500 transition">{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-700">Company</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>About Us</li><li>Contact</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-700">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>Help Center</li><li>Returns</li><li>Privacy Policy</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-sm text-gray-400 mt-10 border-t border-gray-100 pt-6">
          © 2026 PoojaStore4u. All rights reserved.
        </div>
      </footer>
    </div>
  )
}